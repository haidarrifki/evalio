import { eq } from 'drizzle-orm';
import { db, documentChunks } from '@/common/db';

// Define types for create and update payloads
type NewDocumentChunk = typeof documentChunks.$inferInsert;

export class DocumentChunkRepository {
  public async findById(id: string) {
    return db.query.documentChunks.findFirst({
      where: eq(documentChunks.id, id),
    });
  }

  public async create(payload: NewDocumentChunk) {
    const [newDocumentChunk] = await db
      .insert(documentChunks)
      .values(payload)
      .returning();
    return newDocumentChunk;
  }

  public async createMany(payloads: NewDocumentChunk[]) {
    const result = await db.insert(documentChunks).values(payloads);
    return result.rowCount;
  }
}
