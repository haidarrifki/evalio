import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { type Router } from 'express';
import { z } from 'zod';
import { documentController } from '@/api/document/documentController';
import {
  DocumentSchema,
  DocumentUploadSchema,
} from '@/api/document/documentModel';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';

export const documentRegistry = new OpenAPIRegistry();
export const documentRouter: Router = express.Router();

documentRegistry.register('Document', DocumentSchema);
documentRegistry.registerPath({
  method: 'post',
  path: '/documents/upload',
  tags: ['Document'],
  summary: 'Upload documents for a candidate.',
  request: {
    // Specify that the request is multipart/form-data
    body: {
      content: {
        'multipart/form-data': {
          schema: DocumentUploadSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      cv: DocumentSchema,
      projectReport: DocumentSchema,
    }),
    'Success'
  ),
});

// Update the route path for clarity, e.g., /documents/upload
documentRouter.post('/upload', documentController.upload);
