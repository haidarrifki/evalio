import { eq } from 'drizzle-orm';
import { db, evaluationResults } from '@/common/db';
import { EvaluationResultSchema } from './evaluationModel';

type NewEvaluationResult = typeof evaluationResults.$inferInsert;
type UpdateEvaluationResult = Partial<typeof evaluationResults.$inferSelect>;

export class EvaluationRepository {
  async findResultById(id: string) {
    const evaluationResult = db.query.evaluationResults.findFirst({
      where: eq(evaluationResults.id, id),
    });
    return EvaluationResultSchema.parse(evaluationResult);
  }

  public async create(payload: NewEvaluationResult) {
    const [newEvaluationResult] = await db
      .insert(evaluationResults)
      .values(payload)
      .returning();
    return newEvaluationResult;
  }

  public async update(id: string, payload: UpdateEvaluationResult) {
    const [updatedEvaluationResult] = await db
      .update(evaluationResults)
      .set(payload)
      .where(eq(evaluationResults.id, id))
      .returning();
    return updatedEvaluationResult;
  }
}
