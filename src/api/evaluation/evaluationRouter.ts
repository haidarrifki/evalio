import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Router } from 'express';
import { z } from 'zod';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { validateRequest } from '@/common/utils/httpHandlers';
import { evaluationController } from './evaluationController';
import {
  EvaluatePayloadSchema,
  EvaluationResultSchema,
} from './evaluationModel';

export const evaluationRegistry = new OpenAPIRegistry();
export const evaluationRouter: Router = express.Router();

evaluationRegistry.register('Evaluation', EvaluationResultSchema);

evaluationRegistry.registerPath({
  method: 'post',
  path: '/evaluations/evaluate',
  tags: ['Evaluation'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: EvaluatePayloadSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(z.array(EvaluationResultSchema), 'Success'),
});

evaluationRouter.post(
  '/evaluate',
  validateRequest(EvaluatePayloadSchema),
  evaluationController.evaluate
);
