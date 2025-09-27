import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// =================================================================================
// 1. API Input Schemas (for request validation)
// =================================================================================

// Schema for the `POST /evaluate` request body
export const EvaluatePayloadSchema = z.object({
  body: z.object({
    candidateEmail: z
      .string()
      .email('A valid email for the candidate is required.'),
    jobVacancyId: z.string().uuid('A valid jobVacancyId is required.'),
  }),
});

// Schema for the `GET /result/{id}` request parameters
export const GetResultParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('A valid evaluation job ID is required.'),
  }),
});

// =================================================================================
// 2. Database Entity Schemas (mirrors the database tables)
// =================================================================================

// Represents the detailed score for a single evaluation parameter
export const DetailedScoreSchema = z.object({
  id: z.string().uuid(),
  category: z.enum(['cv_match', 'project_deliverable']),
  parameter: z.string(),
  score: z.number().min(1).max(5),
  weight: z.number(),
  justification: z.string().optional(),
});
export type DetailedScore = z.infer<typeof DetailedScoreSchema>;

// Represents the final results of a completed evaluation
export const EvaluationResultSchema = z.object({
  id: z.string().uuid(),
  cvMatchRate: z.number(),
  cvFeedback: z.string(),
  projectScore: z.number(),
  projectFeedback: z.string(),
  overallSummary: z.string(),
  detailedScores: z.array(DetailedScoreSchema).optional(), // Can be included in detailed responses
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

// =================================================================================
// 3. API Response Schemas (for OpenAPI documentation and type safety)
// =================================================================================

// The response for a job that is 'queued' or 'processing'
export const InProgressResponseSchema = EvaluationJobSchema.pick({
  id: true,
  status: true,
});

// The response for a job that is 'completed'
export const CompletedResponseSchema = EvaluationJobSchema.pick({
  id: true,
  status: true,
}).extend({
  result: EvaluationResultSchema.omit({ id: true, detailedScores: true }), // Omitting fields as per the brief
});
