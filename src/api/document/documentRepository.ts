import { eq } from 'drizzle-orm';
import { db, documents } from '@/common/db';
import type { Document } from './documentModel';

type NewDocument = typeof documents.$inferInsert;
type UpdateDocument = Partial<NewDocument>;

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

  public async update(id: string, payload: UpdateDocument) {
    const [updatedDocument] = await db
      .update(documents)
      .set(payload)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }
}
