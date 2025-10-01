import { eq } from 'drizzle-orm';
import { db, evaluationJobs } from '@/common/db';

type NewEvaluationJob = typeof evaluationJobs.$inferInsert;
type UpdateEvaluationJob = Partial<NewEvaluationJob>;

export class EvaluationJobRepository {
  async findById(id: string) {
    return db.query.evaluationJobs.findFirst({
      where: eq(evaluationJobs.id, id),
      with: {
        candidate: {
          with: {
            documents: true,
          },
        },
        jobVacancy: true,
      },
    });
  }

  async findByJobId(jobId: string) {
    return db.query.evaluationJobs.findFirst({
      where: eq(evaluationJobs.jobId, jobId),
      with: {
        // candidate: {
        //   with: {
        //     documents: true,
        //   },
        // },
        // jobVacancy: true,
        result: true,
      },
    });
  }

  public async create(payload: NewEvaluationJob) {
    const [newEvaluationJob] = await db
      .insert(evaluationJobs)
      .values(payload)
      .returning();
    return newEvaluationJob;
  }

  public async update(id: string, payload: UpdateEvaluationJob) {
    const [updatedEvaluationJob] = await db
      .update(evaluationJobs)
      .set(payload)
      .where(eq(evaluationJobs.id, id))
      .returning();
    return updatedEvaluationJob;
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
