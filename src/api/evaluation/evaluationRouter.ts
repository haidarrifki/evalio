import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Router } from 'express';
import { z } from 'zod';
import { EvaluationSchema, GetUserSchema } from '@/api/user/userModel';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { validateRequest } from '@/common/utils/httpHandlers';
import { upload } from '@/common/utils/upload';
import { evaluation } from './evaluationController';

export const evaluationRegistry = new OpenAPIRegistry();
export const evaluationRouter: Router = express.Router();

evaluationRegistry.register('Evaluation', EvaluationSchema);

evaluationRegistry.registerPath({
  method: 'get',
  path: '/evaluations',
  tags: ['Evaluation'],
  responses: createApiResponse(z.array(EvaluationSchema), 'Success'),
});

// evaluationRouter.get("/", evaluation.getUsers);

evaluationRouter.post(
  '/upload',
  upload.fields([
    { name: 'cvFile', maxCount: 1 },
    { name: 'projectReportFile', maxCount: 1 },
  ]),
  evaluationController.uploadAndExtract
);

// evaluationRegistry.registerPath({
// 	method: "get",
// 	path: "/users/{id}",
// 	tags: ["User"],
// 	request: { params: GetEvaluationSchema.shape.params },
// 	responses: createApiResponse(EvaluationSchema, "Success"),
// });

// evaluationRouter.get("/:id", validateRequest(GetEvaluationSchema), evaluation.getUser);
