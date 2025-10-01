import { relations } from 'drizzle-orm';
import {
  decimal,
  json,
  pgEnum,
  pgTable,
  // primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  vector,
} from 'drizzle-orm/pg-core';

// Enums for status and document types
export const documentTypeEnum = pgEnum('document_type', [
  'cv',
  'project_report',
]);
export const jobStatusEnum = pgEnum('job_status', [
  'queued',
  'processing',
  'completed',
  'failed',
]);
export const scoreCategoryEnum = pgEnum('score_category', [
  'cv_match',
  'project_deliverable',
]);

// Table Definitions
export const candidates = pgTable(
  'candidates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    fullName: varchar('full_name', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex('email_idx').on(table.email),
    };
  }
);

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id')
    .notNull()
    .references(() => candidates.id),
  name: text('name'),
  documentType: documentTypeEnum('document_type').notNull(),
  fileKey: varchar('file_key', { length: 1024 }).notNull(),
  extractedText: text('extracted_text'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  metadata: json(),
});

export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id')
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }), // Link back to the parent document
  metadata: json(), // Optional: store page number, chunk index, etc.
  chunkText: text('chunk_text').notNull(),
  embeddings: vector('embeddings', { dimensions: 1024 }).notNull(), // Embedding for THIS CHUNK
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const jobVacancies = pgTable('job_vacancies', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const evaluationJobs = pgTable('evaluation_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id')
    .notNull()
    .references(() => candidates.id),
  jobVacancyId: uuid('job_vacancy_id')
    .notNull()
    .references(() => jobVacancies.id),
  jobId: text('job_id'),
  status: jobStatusEnum('status').default('queued').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const evaluationResults = pgTable('evaluation_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  evaluationJobId: uuid('evaluation_job_id')
    .notNull()
    .references(() => evaluationJobs.id),
  cvMatchRate: decimal('cv_match_rate', { precision: 5, scale: 2 }),
  cvFeedback: text('cv_feedback'),
  projectScore: decimal('project_score', { precision: 3, scale: 1 }),
  projectFeedback: text('project_feedback'),
  overallSummary: text('overall_summary'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const detailedScores = pgTable('detailed_scores', {
  id: uuid('id').defaultRandom().primaryKey(),
  evaluationResultId: uuid('evaluation_result_id')
    .notNull()
    .references(() => evaluationResults.id),
  category: scoreCategoryEnum('category').notNull(),
  parameter: varchar('parameter', { length: 255 }).notNull(),
  score: smallint('score').notNull(),
  weight: decimal('weight', { precision: 3, scale: 2 }).notNull(),
  justification: text('justification'),
});

// Drizzle Relations for JOINs
export const candidatesRelations = relations(candidates, ({ many }) => ({
  documents: many(documents),
  evaluationJobs: many(evaluationJobs),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  candidate: one(candidates, {
    fields: [documents.candidateId],
    references: [candidates.id],
  }),
  chunks: many(documentChunks),
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id],
  }),
}));

export const evaluationJobsRelations = relations(evaluationJobs, ({ one }) => ({
  candidate: one(candidates, {
    fields: [evaluationJobs.candidateId],
    references: [candidates.id],
  }),
  jobVacancy: one(jobVacancies, {
    fields: [evaluationJobs.jobVacancyId],
    references: [jobVacancies.id],
  }),
  result: one(evaluationResults, {
    fields: [evaluationJobs.id],
    references: [evaluationResults.evaluationJobId],
  }),
}));

export const evaluationResultsRelations = relations(
  evaluationResults,
  ({ many, one }) => ({
    evaluationJob: one(evaluationJobs, {
      fields: [evaluationResults.evaluationJobId],
      references: [evaluationJobs.id],
    }),
    detailedScores: many(detailedScores),
  })
);
