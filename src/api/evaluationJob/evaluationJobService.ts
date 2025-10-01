import { StatusCodes } from 'http-status-codes';
import type { EvaluationResult } from '@/api/evaluation/evaluationModel';
import type { EvaluationJob } from '@/api/evaluationJob/evaluationJobModel';
import { EvaluationJobRepository } from '@/api/evaluationJob/evaluationJobRepository';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

type ParsedEvaluationJob = Omit<EvaluationJob, 'result'> & {
  result?:
    | (Omit<EvaluationResult, 'cvMatchRate' | 'projectScore'> & {
        cvMatchRate: number | null;
        projectScore: number | null;
      })
    | null;
};

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

  public async findByJobId(
    jobId: string
  ): Promise<ServiceResponse<ParsedEvaluationJob | null>> {
    try {
      const evaluationJob = await this.evaluationJobRepository.findByJobId(
        jobId
      );
      console.log('>>> EVALUATION JOB');
      console.log(evaluationJob);
      if (!evaluationJob) {
        return ServiceResponse.failure(
          'Evaluation job not found.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      // ✅ PARSING LOGIC HERE
      const parsedResult = evaluationJob.result
        ? {
            ...evaluationJob.result,
            cvMatchRate: evaluationJob.result.cvMatchRate
              ? parseFloat(evaluationJob.result.cvMatchRate)
              : null,
            projectScore: evaluationJob.result.projectScore
              ? parseFloat(evaluationJob.result.projectScore)
              : null,
          }
        : null;

      const parsedEvaluationJob = {
        ...evaluationJob,
        result: parsedResult,
      };
      return ServiceResponse.success(
        'Evaluation job found.',
        parsedEvaluationJob
      );
    } catch (ex) {
      const errorMessage = `Error finding evaluation job with id ${jobId}: ${
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
      'id' | 'createdAt' | 'errorMessage' | 'completedAt' | 'jobId'
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

  public async update(
    id: string,
    payload: Partial<EvaluationJob>
  ): Promise<ServiceResponse<EvaluationJob | null>> {
    try {
      const updatedEvaluationJob = await this.evaluationJobRepository.update(
        id,
        payload
      );
      if (!updatedEvaluationJob) {
        return ServiceResponse.failure(
          'Evaluation job not found for update.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success(
        'Evaluation job updated successfully.',
        updatedEvaluationJob
      );
    } catch (ex) {
      const errorMessage = `Error updating evaluation job with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while updating the evaluation job.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async updateByJobId(
    jobId: string,
    payload: Partial<EvaluationJob>
  ): Promise<ServiceResponse<EvaluationJob | null>> {
    try {
      const updatedCandidate = await this.evaluationJobRepository.updateByJobId(
        jobId,
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
      const errorMessage = `Error updating candidate with id ${jobId}: ${
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
