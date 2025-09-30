import { eq } from 'drizzle-orm';
import { db, evaluationResults } from '@/common/db';
import { EvaluationResultSchema } from './evaluationModel';

export class EvaluationRepository {
  async findResultById(id: string) {
    const evaluationResult = db.query.evaluationResults.findFirst({
      where: eq(evaluationResults.id, id),
    });
    return EvaluationResultSchema.parse(evaluationResult);
  }
}
