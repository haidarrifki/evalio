import type { Request, RequestHandler, Response } from 'express';
import { evaluationService } from './evaluationService';

// import { evaluationService } from './evaluationService';

class EvaluationController {
  public evaluate: RequestHandler = async (req: Request, res: Response) => {
    const { candidateId, jobVacancyId } = req.body;

    const evaluation = await evaluationService.processEvaluate(
      candidateId,
      jobVacancyId
    );

    res.status(evaluation.statusCode).send(evaluation);
  };
}

export const evaluationController = new EvaluationController();
