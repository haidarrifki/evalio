import { eq } from 'drizzle-orm';
import { db, evaluationJobs } from '@/common/db';

type NewEvaluationJob = typeof evaluationJobs.$inferInsert;
type UpdateEvaluationJob = Partial<NewEvaluationJob>;

export class EvaluationJobRepository {
  async findById(id: string) {
    return db.query.evaluationJobs.findFirst({
      where: eq(evaluationJobs.id, id),
    });
  }

  public async create(payload: NewEvaluationJob) {
    const [newEvaluationJob] = await db
      .insert(evaluationJobs)
      .values(payload)
      .returning();
    return newEvaluationJob;
  }

  public async updateByJobId(jobId: string, payload: UpdateEvaluationJob) {
    const [updatedEvaluationJob] = await db
      .update(evaluationJobs)
      .set(payload)
      .where(eq(evaluationJobs.jobId, jobId))
      .returning();
    return updatedEvaluationJob;
  }
}
