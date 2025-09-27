import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Router } from 'express';
import { z } from 'zod';
import { candidateController } from '@/api/candidate/candidateController';
import {
  CandidateIdSchema,
  CandidateSchema,
  CreateCandidateSchema,
  UpdateCandidateSchema,
} from '@/api/candidate/candidateModel';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { validateRequest } from '@/common/utils/httpHandlers';

export const candidateRegistry = new OpenAPIRegistry();
export const candidateRouter: Router = express.Router();

candidateRegistry.register('Candidate', CandidateSchema);

// GET /candidates
candidateRegistry.registerPath({
  method: 'get',
  path: '/candidates',
  tags: ['Candidate'],
  responses: createApiResponse(z.array(CandidateSchema), 'Success'),
});
candidateRouter.get('/', candidateController.getAll);

// GET /candidates/{id}
candidateRegistry.registerPath({
  method: 'get',
  path: '/candidates/{id}',
  tags: ['Candidate'],
  request: { params: CandidateIdSchema.shape.params },
  responses: createApiResponse(CandidateSchema, 'Success'),
});
candidateRouter.get(
  '/:id',
  validateRequest(CandidateIdSchema),
  candidateController.getById
);

// POST /candidates
candidateRegistry.registerPath({
  method: 'post',
  path: '/candidates',
  tags: ['Candidate'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateCandidateSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(CandidateSchema, 'Success'),
});
candidateRouter.post(
  '/',
  validateRequest(CreateCandidateSchema),
  candidateController.create
);

// PATCH /candidates/{id}
candidateRegistry.registerPath({
  method: 'patch',
  path: '/candidates/{id}',
  tags: ['Candidate'],
  request: {
    params: UpdateCandidateSchema.shape.params,
    body: {
      content: {
        'application/json': {
          schema: UpdateCandidateSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(CandidateSchema, 'Success'),
});
candidateRouter.patch(
  '/:id',
  validateRequest(UpdateCandidateSchema),
  candidateController.update
);

// DELETE /candidates/{id}
candidateRegistry.registerPath({
  method: 'delete',
  path: '/candidates/{id}',
  tags: ['Candidate'],
  request: { params: CandidateIdSchema.shape.params },
  responses: createApiResponse(CandidateSchema, 'Success'),
});
candidateRouter.delete(
  '/:id',
  validateRequest(CandidateIdSchema),
  candidateController.delete
);
