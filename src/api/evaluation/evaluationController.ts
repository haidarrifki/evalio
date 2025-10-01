import type { Request, RequestHandler, Response } from 'express';
import { evaluationJobService } from '@/api/evaluationJob/evaluationJobService';
import { evaluationService } from './evaluationService';

class EvaluationController {
  public evaluate: RequestHandler = async (req: Request, res: Response) => {
    const { candidateId, jobVacancyId } = req.body;

    const evaluation = await evaluationService.processEvaluate(
      candidateId,
      jobVacancyId
    );

    res.status(evaluation.statusCode).send(evaluation);
  };

  public getResultByJobId: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const serviceResponse = await evaluationJobService.findByJobId(id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const evaluationController = new EvaluationController();
