import { StatusCodes } from 'http-status-codes';
import type { JobVacancy } from '@/api/jobVacancy/jobVacancyModel';
import { JobVacancyRepository } from '@/api/jobVacancy/jobVacancyRepository';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

class JobVacancyService {
  private jobVacancyRepository: JobVacancyRepository;

  constructor(repository: JobVacancyRepository = new JobVacancyRepository()) {
    this.jobVacancyRepository = repository;
  }

  public async findById(
    id: string
  ): Promise<ServiceResponse<JobVacancy | null>> {
    try {
      const jobVacancy = await this.jobVacancyRepository.findById(id);
      if (!jobVacancy) {
        return ServiceResponse.failure(
          'Job vacancy not found.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success('Job vacancy found.', jobVacancy);
    } catch (ex) {
      const errorMessage = `Error finding job vacancy with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding the job vacancy.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const jobVacancyService = new JobVacancyService();
