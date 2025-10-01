import type { Request, RequestHandler, Response } from 'express';
import { jobVacancyService } from '@/api/jobVacancy/jobVacancyService';

class JobVacancyController {
  public getAll: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await jobVacancyService.findAll();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public getById: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await jobVacancyService.findById(id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public create: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await jobVacancyService.create(req.body);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public update: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await jobVacancyService.update(id, req.body);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public delete: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await jobVacancyService.delete(id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const jobVacancyController = new JobVacancyController();
