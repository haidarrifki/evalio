import { eq } from 'drizzle-orm';
import { candidates, db } from '@/db';

// Define types for create and update payloads
type NewCandidate = typeof candidates.$inferInsert;
type UpdateCandidate = Partial<NewCandidate>;

export class CandidateRepository {
  public async findAll() {
    return db.query.candidates.findMany({ with: { documents: true } });
  }

  public async findById(id: string) {
    return db.query.candidates.findFirst({
      where: eq(candidates.id, id),
      with: {
        documents: true,
      },
    });
  }

  public async create(payload: NewCandidate) {
    const [newCandidate] = await db
      .insert(candidates)
      .values(payload)
      .returning();
    return newCandidate;
  }

  public async update(id: string, payload: UpdateCandidate) {
    const [updatedCandidate] = await db
      .update(candidates)
      .set(payload)
      .where(eq(candidates.id, id))
      .returning();
    return updatedCandidate;
  }

  public async delete(id: string) {
    const [deletedCandidate] = await db
      .delete(candidates)
      .where(eq(candidates.id, id))
      .returning();
    return deletedCandidate;
  }
}
