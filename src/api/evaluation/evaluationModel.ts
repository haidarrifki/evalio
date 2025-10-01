import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// Schema for the `POST /evaluate` request body
export const EvaluatePayloadSchema = z.object({
  body: z.object({
    candidateId: z.string().uuid('A valid candidateId is required.'),
    jobVacancyId: z.string().uuid('A valid jobVacancyId is required.'),
  }),
});

// Represents the final results of a completed evaluation
export const EvaluationResultSchema = z.object({
  id: z.string().uuid(),
  evaluationJobId: z.string(),
  cvMatchRate: z.string().nullable(),
  cvFeedback: z.string().nullable(),
  projectScore: z.string().nullable(),
  projectFeedback: z.string().nullable(),
  overallSummary: z.string().nullable(),
  // detailedScores: z.array(DetailedScoreSchema).optional(),
});
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

// Represents the state of an evaluation job in the queue
export const EvaluationJobSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  errorMessage: z.string().nullable(),
  createdAt: z.date(),
  completedAt: z.date().nullable(),
});
export type EvaluationJob = z.infer<typeof EvaluationJobSchema>;

export const EvaluationResultResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  result: EvaluationResultSchema.optional(),
});
export type EvaluationResultResponse = z.infer<
  typeof EvaluationResultResponseSchema
>;
