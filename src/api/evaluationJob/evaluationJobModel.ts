import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// Represents the state of an evaluation job in the queue
export const EvaluationJobSchema = z.object({
  id: z.string().uuid(),
  candidateId: z.string().uuid(),
  jobVacancyId: z.string().uuid(),
  jobId: z.string().nullable(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  errorMessage: z.string().nullable(),
  createdAt: z.date(),
  completedAt: z.date().nullable(),
});
export type EvaluationJob = z.infer<typeof EvaluationJobSchema>;

// Represents the state of an evaluation job in the queue
export const EvaluationJobCreateSchema = z.object({
  candidateId: z.string().uuid(),
  jobVacancyId: z.string().uuid(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
});
export type EvaluationJobCreate = z.infer<typeof EvaluationJobCreateSchema>;
