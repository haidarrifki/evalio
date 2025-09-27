import { eq } from 'drizzle-orm';
import { db, documents } from '@/db';
import type { Document } from './documentModel';

type NewDocument = typeof documents.$inferInsert;

export class DocumentRepository {
  public async findAll() {
    return db.query.documents.findMany();
  }

  public async findById(id: string) {
    return db.query.documents.findFirst({
      where: eq(documents.id, id),
    });
  }

  public async create(payload: NewDocument): Promise<Document | null> {
    const [newDocument] = await db
      .insert(documents)
      .values(payload)
      .returning();
    return newDocument;
  }
}
