import { GetObjectCommand } from '@aws-sdk/client-s3';
import { type Job, Worker } from 'bullmq';
import type { InferSelectModel } from 'drizzle-orm';
import { documentService } from '@/api/document/documentService';
import {
  GotenbergClient,
  PdfToMarkdownConverter,
  SUPPORTED_OFFICE_FORMATS,
} from '@/common/ai/file-converters';
import type { documents } from '@/common/db';
import { env } from '@/common/utils/envConfig';
import { s3 } from '@/common/utils/s3Client';
import { redisConnection } from './connection';

type DocumentType = InferSelectModel<typeof documents>;
interface EvaluationJobData {
  documents: DocumentType[];
}

// The actual task logic
const processEvaluationJob = async (job: Job<EvaluationJobData>) => {
  const { documents } = job.data;

  try {
    for (const document of documents) {
      const { id, name, fileKey, metadata } = document;
      const { mimeType } = metadata as {
        size: string;
        mimeType: string;
      };

      const command = new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME!,
        Key: fileKey,
      });
      const { Body } = await s3.send(command);
      const fileBuffer = Buffer.from(await Body!.transformToByteArray());

      const pdfToMdConverter = new PdfToMarkdownConverter();
      let pdfBlob: Blob;

      // If the file is a supported Office format, convert it to PDF first.
      if (SUPPORTED_OFFICE_FORMATS.includes(mimeType)) {
        console.log(`Converting ${mimeType} to PDF via Gotenberg...`);
        const pdfBuffer = await GotenbergClient.convertOfficeToPdf(
          fileBuffer,
          mimeType
        );
        pdfBlob = new Blob([new Uint8Array(pdfBuffer)], {
          type: 'application/pdf',
        });
      }
      // If the file is already a PDF, just create a Blob from its buffer.
      else if (mimeType.includes('pdf')) {
        pdfBlob = new Blob([fileBuffer], { type: mimeType });
      }
      // If the file type is not supported by the pipeline, throw an error.
      else {
        throw new Error(`Unsupported file MIME type: ${mimeType}`);
      }

      // Finally, convert the PDF blob (either original or from Gotenberg) to Markdown.
      console.log(`Converting ${name} to Markdown via AI...`);
      const markdown = await pdfToMdConverter.convert(pdfBlob);

      await documentService.update(id, { extractedText: markdown });

      console.log(`Document ${name} extracted...`);
    }

    // Simulate evaluator
    await new Promise((resolve) => setTimeout(resolve, 3000));
  } catch (error) {
    console.error(`❌ Error processing job ${job.id}:`, error);
    throw error;
  }
};

const evaluationWorker = new Worker('evaluation-queue', processEvaluationJob, {
  connection: redisConnection,
  concurrency: 5,
});

// Event listeners for logging
evaluationWorker.on('completed', (job: Job) => {
  console.log(`Job ${job.id} has completed!`);
});

evaluationWorker.on('failed', (job: Job | undefined, err: Error) => {
  if (job) {
    console.error(`Job ${job.id} has failed with ${err.message}`);
  } else {
    console.error(`A job has failed with ${err.message}`);
  }
});

evaluationWorker.on('error', (err) => {
  // A connection error or other internal worker error.
  console.error('Worker encountered an error:', err);
});

export default evaluationWorker;
