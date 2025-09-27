import type { Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { candidateService } from '@/api/candidate/candidateService';
import { documentService } from '@/api/document/documentService';

class DocumentController {
  public upload: RequestHandler = async (req: Request, res: Response) => {
    const { candidateId } = req.body;
    if (!candidateId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: 'candidateId is required in the request body.' });
    }

    const candidate = await candidateService.findById(candidateId);
    if (!candidate.data) {
      return res.status(StatusCodes.NOT_FOUND).send(candidate);
    }

    const files = req.files as { [fieldname: string]: Express.MulterS3.File[] };
    const cvFile = files?.cvFile?.[0];
    const projectReportFile = files?.projectReportFile?.[0];

    if (!cvFile || !projectReportFile) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: 'Both cvFile and projectReportFile are required.' });
    }

    const serviceResponse = await documentService.upload(
      candidateId,
      cvFile,
      projectReportFile
    );

    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const documentController = new DocumentController();
