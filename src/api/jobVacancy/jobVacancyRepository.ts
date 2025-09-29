import { eq } from 'drizzle-orm';
import { db, jobVacancies } from '@/common/db';

export class JobVacancyRepository {
  public async findById(id: string) {
    return db.query.jobVacancies.findFirst({
      where: eq(jobVacancies.id, id),
    });
  }
}
