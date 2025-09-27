import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
// import { evaluationService } from './evaluationService';

class EvaluationController {
  public uploadAndExtract = async (req: Request, res: Response) => {
    // Multer places file info in req.files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.cvFile?.[0] || !files?.projectReportFile?.[0]) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: 'Both cvFile and projectReportFile are required.' });
    }

    const cvFile = files.cvFile[0];
    const projectReportFile = files.projectReportFile[0];

    console.log(cvFile);
    console.log(projectReportFile);

    // const serviceResponse = await evaluationService.processUploads(
    //   cvFile,
    //   projectReportFile
    // );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const evaluationController = new EvaluationController();
