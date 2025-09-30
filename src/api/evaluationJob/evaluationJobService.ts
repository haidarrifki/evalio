import { StatusCodes } from 'http-status-codes';
import type { EvaluationJob } from '@/api/evaluationJob/evaluationJobModel';
import { EvaluationJobRepository } from '@/api/evaluationJob/evaluationJobRepository';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

class EvaluationJobService {
  private evaluationJobRepository: EvaluationJobRepository;

  constructor(
    repository: EvaluationJobRepository = new EvaluationJobRepository()
  ) {
    this.evaluationJobRepository = repository;
  }

  public async findById(
    id: string
  ): Promise<ServiceResponse<EvaluationJob | null>> {
    try {
      const evaluationJob = await this.evaluationJobRepository.findById(id);
      if (!evaluationJob) {
        return ServiceResponse.failure(
          'Evaluation job not found.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success('Evaluation job found.', evaluationJob);
    } catch (ex) {
      const errorMessage = `Error finding evaluation job with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding the evaluation job.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async create(
    payload: Omit<
      EvaluationJob,
      'id' | 'createdAt' | 'errorMessage' | 'completedAt'
    >
  ): Promise<ServiceResponse<EvaluationJob | null>> {
    try {
      const newCandidate = await this.evaluationJobRepository.create(payload);
      return ServiceResponse.success(
        'Candidate created successfully.',
        newCandidate,
        StatusCodes.CREATED
      );
    } catch (ex) {
      const errorMessage = `Error creating candidate: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while creating the candidate.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async updateByJobId(
    id: string,
    payload: Partial<EvaluationJob>
  ): Promise<ServiceResponse<EvaluationJob | null>> {
    try {
      const updatedCandidate = await this.evaluationJobRepository.updateByJobId(
        id,
        payload
      );
      if (!updatedCandidate) {
        return ServiceResponse.failure(
          'Candidate not found for update.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success(
        'Candidate updated successfully.',
        updatedCandidate
      );
    } catch (ex) {
      const errorMessage = `Error updating candidate with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while updating the candidate.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const evaluationJobService = new EvaluationJobService();
