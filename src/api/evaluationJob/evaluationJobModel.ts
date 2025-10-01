import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { CandidateSchema } from '@/api/candidate/candidateModel';
import { EvaluationResultSchema } from '@/api/evaluation/evaluationModel';
import { JobVacancySchema } from '@/api/jobVacancy/jobVacancyModel';

extendZodWithOpenApi(z);

const statusEnum = z.enum(['queued', 'processing', 'completed', 'failed']);

// Represents the state of an evaluation job in the queue
export const EvaluationJobSchema = z.object({
  id: z.string().uuid(),
  candidateId: z.string().uuid(),
  candidate: CandidateSchema.optional(),
  jobVacancyId: z.string().uuid(),
  jobVacancy: JobVacancySchema.optional(),
  jobId: z.string().nullable(),
  status: statusEnum,
  errorMessage: z.string().nullable(),
  createdAt: z.date(),
  completedAt: z.date().nullable(),
  result: EvaluationResultSchema.optional(),
});
export type EvaluationJob = z.infer<typeof EvaluationJobSchema>;

// Represents the state of an evaluation job in the queue
export const EvaluationJobCreateSchema = z.object({
  candidateId: z.string().uuid(),
  jobVacancyId: z.string().uuid(),
  status: statusEnum,
});
export type EvaluationJobCreate = z.infer<typeof EvaluationJobCreateSchema>;
