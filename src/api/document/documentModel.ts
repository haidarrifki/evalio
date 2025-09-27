import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  candidateId: z.string().uuid(),
  name: z.string().nullable(),
  documentType: z.enum(['cv', 'project_report']),
  fileKey: z.string(),
  extractedText: z.string().nullable(),
  uploadedAt: z.date(),
});

export const DocumentUploadSchema = z.object({
  candidateId: z.string().uuid().openapi({
    description: 'The UUID of the candidate.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  }),
  cvFile: z.any().openapi({
    type: 'string',
    format: 'binary',
    description: 'The CV file to be uploaded.',
  }),
  projectReportFile: z.any().openapi({
    type: 'string',
    format: 'binary',
    description: 'The project report file to be uploaded.',
  }),
});

// You can also infer the TypeScript type directly from the schema
export type Document = z.infer<typeof DocumentSchema>;
