import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// Main schema representing the Candidate entity in the database
export const JobVacancySchema = z.object({
  id: z.string().uuid(),
  title: z.string().nullable(),
  description: z.string().email(),
  createdAt: z.date(),
});

export type JobVacancy = z.infer<typeof JobVacancySchema>;
