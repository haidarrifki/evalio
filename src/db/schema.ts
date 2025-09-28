import { relations } from 'drizzle-orm';
import {
  decimal,
  pgEnum,
  pgTable,
  // primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Enums for status and document types
export const documentTypeEnum = pgEnum('document_type', [
  'cv',
  'project_report',
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
});

export const jobVacancies = pgTable('job_vacancies', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const evaluationResults = pgTable('evaluation_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  candidateId: uuid('candidate_id')
    .notNull()
    .references(() => candidates.id),
  jobVacancyId: uuid('job_vacancy_id')
    .notNull()
    .references(() => jobVacancies.id),
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
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  candidate: one(candidates, {
    fields: [documents.candidateId],
    references: [candidates.id],
  }),
}));

export const evaluationResultsRelations = relations(
  evaluationResults,
  ({ one, many }) => ({
    candidate: one(candidates, {
      fields: [evaluationResults.candidateId],
      references: [candidates.id],
    }),
    jobVacancy: one(jobVacancies, {
      fields: [evaluationResults.candidateId],
      references: [jobVacancies.id],
    }),
    detailedScores: many(detailedScores),
  })
);
