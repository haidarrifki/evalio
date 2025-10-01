import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// Main schema representing the Candidate entity in the database
export const JobVacancySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  // NOTE: This validates the description as an email.
  // You probably want to change this to z.string().nullable()
  description: z.string().email(),
  createdAt: z.date(),
});
export type JobVacancy = z.infer<typeof JobVacancySchema>;

// Schema for the payload when creating a new job vacancy
export const CreateJobVacancySchema = z.object({
  body: z.object({
    title: z.string(),
    description: z.string().email(),
  }),
});

// Schema for the payload when updating a job vacancy
export const UpdateJobVacancySchema = z.object({
  body: z.object({
    title: z.string().nullable().optional(),
    description: z.string().email().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Schema for validating the ID parameter in GET and DELETE requests
export const JobVacancyIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
