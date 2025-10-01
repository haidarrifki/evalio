import { eq } from 'drizzle-orm';
import { db, detailedScores } from '@/common/db';
import { DetailedScoreSchema } from './detailedScoreModel';

type NewDetailedScore = typeof detailedScores.$inferInsert;
type UpdateDetailedScore = Partial<typeof detailedScores.$inferSelect>;

export class DetailedScoreRepository {
  async findResultById(id: string) {
    const evaluationResult = db.query.detailedScores.findFirst({
      where: eq(detailedScores.id, id),
    });
    return DetailedScoreSchema.parse(evaluationResult);
  }

  public async create(payload: NewDetailedScore) {
    const [newDetailedScore] = await db
      .insert(detailedScores)
      .values(payload)
      .returning();
    return newDetailedScore;
  }

  public async update(id: string, payload: UpdateDetailedScore) {
    const [updatedDetailedScore] = await db
      .update(detailedScores)
      .set(payload)
      .where(eq(detailedScores.id, id))
      .returning();
    return updatedDetailedScore;
  }

  public async createMany(payloads: NewDetailedScore[]) {
    const result = await db.insert(detailedScores).values(payloads).returning();
    return result;
  }
}
