import type { Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { candidateService } from '@/api/candidate/candidateService';
import { documentService } from '@/api/document/documentService';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { upload } from '@/common/utils/upload';

const uploadFields = upload.fields([
  { name: 'cvFile', maxCount: 1 },
  { name: 'projectReportFile', maxCount: 1 },
]);

class DocumentController {
  public upload: RequestHandler = async (req: Request, res: Response) => {
    uploadFields(req, res, async (err) => {
      if (err) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send(ServiceResponse.failure(err.message, null));
      }

      const { candidateId } = req.body;

      const candidate = await candidateService.findById(candidateId);
      if (!candidate.data) {
        return res.status(candidate.statusCode).send(candidate);
      }

      const files = req.files as {
        [fieldname: string]: Express.MulterS3.File[];
      };
      const cvFile = files?.cvFile?.[0];
      const projectReportFile = files?.projectReportFile?.[0];

      const document = await documentService.processUpload(
        candidateId,
        cvFile,
        projectReportFile
      );

      res.status(document.statusCode).send(document);
    });
  };
}

export const documentController = new DocumentController();
