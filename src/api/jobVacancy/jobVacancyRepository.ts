import { eq } from 'drizzle-orm';
import { db, jobVacancies } from '@/common/db'; // Assuming 'jobVacancies' schema exists

// Define types for create and update payloads
type NewJobVacancy = typeof jobVacancies.$inferInsert;
type UpdateJobVacancy = Partial<NewJobVacancy>;

export class JobVacancyRepository {
  public async findAll() {
    return db.query.jobVacancies.findMany();
  }

  public async findById(id: string) {
    return db.query.jobVacancies.findFirst({
      where: eq(jobVacancies.id, id),
    });
  }

  public async create(payload: NewJobVacancy) {
    const [newJobVacancy] = await db
      .insert(jobVacancies)
      .values(payload)
      .returning();
    return newJobVacancy;
  }

  public async update(id: string, payload: UpdateJobVacancy) {
    const [updatedJobVacancy] = await db
      .update(jobVacancies)
      .set(payload)
      .where(eq(jobVacancies.id, id))
      .returning();
    return updatedJobVacancy;
  }

  public async delete(id: string) {
    const [deletedJobVacancy] = await db
      .delete(jobVacancies)
      .where(eq(jobVacancies.id, id))
      .returning();
    return deletedJobVacancy;
  }
}
