import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const DocumentChunkSchema = z.object({
  id: z.string().uuid(),
  documentId: z.string().uuid(),
  chunkText: z.string(),
  embeddings: z.array(z.number()),
  createdAt: z.date(),
});

export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;
