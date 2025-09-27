import type { Request, RequestHandler, Response } from 'express';
import { candidateService } from '@/api/candidate/candidateService';

class CandidateController {
  public getAll: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await candidateService.findAll();

    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getById: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await candidateService.findById(id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public create: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await candidateService.create(req.body);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public update: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await candidateService.update(id, req.body);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public delete: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await candidateService.delete(id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const candidateController = new CandidateController();
