import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { DocumentSchema } from '../document/documentModel';

extendZodWithOpenApi(z);

// Main schema representing the Candidate entity in the database
export const CandidateSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().nullable(),
  email: z.string().email(),
  documents: z.array(DocumentSchema).optional(),
  createdAt: z.date(),
});
export type Candidate = z.infer<typeof CandidateSchema>;

// Schema for the payload when creating a new candidate
export const CreateCandidateSchema = z.object({
  body: z.object({
    fullName: z.string(),
    email: z.string().email(),
  }),
});

// Schema for the payload when updating a candidate (all fields are optional)
export const UpdateCandidateSchema = z.object({
  body: z.object({
    fullName: z.string().optional(),
    email: z.string().email().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Schema for validating the ID parameter in GET and DELETE requests
export const CandidateIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
