import { S3Client } from '@aws-sdk/client-s3';
import type { Request } from 'express';
import multer, { type FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { candidateService } from '@/api/candidate/candidateService';
import { env } from '@/common/utils/envConfig';

interface RequestWithValidation extends Request {
  candidateValidated?: boolean;
}

const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } =
  env;

/**
 * A filter function to ensure only allowed file types are uploaded.
 * @param file The file object from Multer.
 * @param cb The callback to signal if the file is accepted or rejected.
 */
async function sanitizeFile(
  req: RequestWithValidation,
  file: Express.Multer.File,
  callback: FileFilterCallback
) {
  // Step 1: Check the file type first
  const allowedExts = ['.pdf', '.txt', '.docx'];
  const isExtAllowed = allowedExts.includes(
    path.extname(file.originalname.toLowerCase())
  );
  if (!isExtAllowed) {
    return callback(new Error('Error: File type not allowed!'));
  }

  // Step 2: Check if we have already validated the candidate in this request
  if (req.candidateValidated) {
    return callback(null, true); // Candidate is valid, accept file
  }

  // Step 3: Perform the database check
  try {
    const { candidateId } = req.body;
    if (!candidateId) {
      return callback(new Error('Candidate ID is missing.'));
    }

    const serviceResponse = await candidateService.findById(candidateId);
    if (serviceResponse.data) {
      // ✅ Candidate found! Mark as validated and accept the file.
      req.candidateValidated = true;
      callback(null, true);
    } else {
      // ❌ Candidate not found. Reject the file.
      callback(new Error('Candidate not found. Upload rejected.'));
    }
  } catch (error) {
    // Handle any unexpected errors during the check
    callback(new Error('An error occurred during candidate validation.'));
  }
}

// --- Configure the S3 client for Cloudflare R2 ---
const s3 = new S3Client({
  region: 'auto', // R2 is region-less
  endpoint: R2_ENDPOINT!, // e.g., 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com'
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: R2_BUCKET_NAME!, // Your R2 bucket name
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req: Request, file, cb) => {
      // 1. Get the candidateId from the request body.
      const candidateId = (req.body as { candidateId: string }).candidateId;

      // It's good practice to have a fallback if candidateId is not provided.
      if (!candidateId) {
        cb(new Error('Candidate ID is missing from the request body.'));
        return;
      }

      // 2. Sanitize the original filename to prevent issues.
      const sanitizedFilename = file.originalname.replace(/\s+/g, '_');

      // 3. Create a unique filename to avoid overwriting files.
      const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;

      // 4. Construct the full key with the prefix.
      const fullPath = `${candidateId}/${uniqueFilename}`;

      // 5. Pass the full path as the key.
      cb(null, fullPath);
    },
  }),
  fileFilter: (req, file, callback) => {
    sanitizeFile(req, file, callback);
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5mb file size
  },
});
