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

  public async findAll(): Promise<ServiceResponse<JobVacancy[]>> {
    try {
      const vacancies = await this.jobVacancyRepository.findAll();
      if (vacancies.length === 0) {
        return ServiceResponse.failure('No job vacancies found.', []);
      }
      return ServiceResponse.success('Job vacancies found.', vacancies);
    } catch (ex) {
      const errorMessage = `Error finding all job vacancies: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while retrieving job vacancies.',
        [],
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async findById(
    id: string
  ): Promise<ServiceResponse<JobVacancy | null>> {
    try {
      const vacancy = await this.jobVacancyRepository.findById(id);
      if (!vacancy) {
        return ServiceResponse.failure(
          'Job vacancy not found.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success('Job vacancy found.', vacancy);
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

  public async create(
    payload: Omit<JobVacancy, 'id' | 'createdAt'>
  ): Promise<ServiceResponse<JobVacancy | null>> {
    try {
      const newVacancy = await this.jobVacancyRepository.create(payload);
      return ServiceResponse.success(
        'Job vacancy created successfully.',
        newVacancy,
        StatusCodes.CREATED
      );
    } catch (ex) {
      const errorMessage = `Error creating job vacancy: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while creating the job vacancy.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async update(
    id: string,
    payload: Partial<JobVacancy>
  ): Promise<ServiceResponse<JobVacancy | null>> {
    try {
      const updatedVacancy = await this.jobVacancyRepository.update(
        id,
        payload
      );
      if (!updatedVacancy) {
        return ServiceResponse.failure(
          'Job vacancy not found for update.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success(
        'Job vacancy updated successfully.',
        updatedVacancy
      );
    } catch (ex) {
      const errorMessage = `Error updating job vacancy with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while updating the job vacancy.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async delete(id: string): Promise<ServiceResponse<JobVacancy | null>> {
    try {
      const deletedVacancy = await this.jobVacancyRepository.delete(id);
      if (!deletedVacancy) {
        return ServiceResponse.failure(
          'Job vacancy not found for deletion.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success(
        'Job vacancy deleted successfully.',
        deletedVacancy
      );
    } catch (ex) {
      const errorMessage = `Error deleting job vacancy with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while deleting the job vacancy.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const jobVacancyService = new JobVacancyService();
