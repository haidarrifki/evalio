import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// Represents the detailed score for a single evaluation parameter
export const DetailedScoreSchema = z.object({
  id: z.string().uuid(),
  evaluationResultId: z.string().uuid(),
  category: z.enum(['cv_match', 'project_deliverable']),
  parameter: z.string(),
  score: z.number().min(1).max(5),
  weight: z.string(),
  justification: z.string().nullable(),
});
export type DetailedScore = z.infer<typeof DetailedScoreSchema>;

export const DetailedScoreCreateSchema = z.object({
  evaluationResultId: z.string().uuid(),
  category: z.enum(['cv_match', 'project_deliverable']),
  parameter: z.string(),
  score: z.number().min(1).max(5),
  weight: z.string(),
  justification: z.string().nullable(),
});
export type DetailedScoreCreate = z.infer<typeof DetailedScoreCreateSchema>;
