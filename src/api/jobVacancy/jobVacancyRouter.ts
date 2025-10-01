import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Router } from 'express';
import { z } from 'zod';
import { jobVacancyController } from '@/api/jobVacancy/jobVacancyController';
import {
  CreateJobVacancySchema,
  JobVacancyIdSchema,
  JobVacancySchema,
  UpdateJobVacancySchema,
} from '@/api/jobVacancy/jobVacancyModel';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { validateRequest } from '@/common/utils/httpHandlers';

export const jobVacancyRegistry = new OpenAPIRegistry();
export const jobVacancyRouter: Router = express.Router();

jobVacancyRegistry.register('JobVacancy', JobVacancySchema);

// GET /job-vacancies
jobVacancyRegistry.registerPath({
  method: 'get',
  path: '/job-vacancies',
  tags: ['Job Vacancy'],
  responses: createApiResponse(z.array(JobVacancySchema), 'Success'),
});
jobVacancyRouter.get('/', jobVacancyController.getAll);

// GET /job-vacancies/{id}
jobVacancyRegistry.registerPath({
  method: 'get',
  path: '/job-vacancies/{id}',
  tags: ['Job Vacancy'],
  request: { params: JobVacancyIdSchema.shape.params },
  responses: createApiResponse(JobVacancySchema, 'Success'),
});
jobVacancyRouter.get(
  '/:id',
  validateRequest(JobVacancyIdSchema),
  jobVacancyController.getById
);

// POST /job-vacancies
jobVacancyRegistry.registerPath({
  method: 'post',
  path: '/job-vacancies',
  tags: ['Job Vacancy'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateJobVacancySchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(JobVacancySchema, 'Success'),
});
jobVacancyRouter.post(
  '/',
  validateRequest(CreateJobVacancySchema),
  jobVacancyController.create
);

// PATCH /job-vacancies/{id}
jobVacancyRegistry.registerPath({
  method: 'patch',
  path: '/job-vacancies/{id}',
  tags: ['Job Vacancy'],
  request: {
    params: UpdateJobVacancySchema.shape.params,
    body: {
      content: {
        'application/json': {
          schema: UpdateJobVacancySchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(JobVacancySchema, 'Success'),
});
jobVacancyRouter.patch(
  '/:id',
  validateRequest(UpdateJobVacancySchema),
  jobVacancyController.update
);

// DELETE /job-vacancies/{id}
jobVacancyRegistry.registerPath({
  method: 'delete',
  path: '/job-vacancies/{id}',
  tags: ['Job Vacancy'],
  request: { params: JobVacancyIdSchema.shape.params },
  responses: createApiResponse(JobVacancySchema, 'Success'),
});
jobVacancyRouter.delete(
  '/:id',
  validateRequest(JobVacancyIdSchema),
  jobVacancyController.delete
);
