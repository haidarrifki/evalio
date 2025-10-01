import type { Job } from 'bullmq';
import { StatusCodes } from 'http-status-codes';
import { candidateService } from '@/api/candidate/candidateService';
import { jobVacancyService } from '@/api/jobVacancy/jobVacancyService';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { evaluationQueue } from '@/jobs/evaluationQueue';
import { logger } from '@/server';
import { evaluationJobService } from '../evaluationJob/evaluationJobService';
import type {
  EvaluationResult,
  EvaluationResultResponse,
} from './evaluationModel';
import { EvaluationRepository } from './evaluationRepository';

class EvaluationService {
  private evaluationRepository: EvaluationRepository;

  constructor(repository: EvaluationRepository = new EvaluationRepository()) {
    this.evaluationRepository = repository;
  }

  public async create(
    payload: Omit<
      EvaluationResult,
      | 'id'
      | 'createdAt'
      | 'cvMatchRate'
      | 'cvFeedback'
      | 'projectScore'
      | 'projectFeedback'
      | 'overallSummary'
    >
  ): Promise<ServiceResponse<EvaluationResult | null>> {
    try {
      const newEvaluationResult = await this.evaluationRepository.create(
        payload
      );
      return ServiceResponse.success(
        'Evaluation result created successfully.',
        newEvaluationResult,
        StatusCodes.CREATED
      );
    } catch (ex) {
      const errorMessage = `Error creating evaluation result: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while creating the evaluation result.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async update(
    id: string,
    payload: Partial<EvaluationResult>
  ): Promise<ServiceResponse<EvaluationResult | null>> {
    try {
      const updatedEvaluationResult = await this.evaluationRepository.update(
        id,
        payload
      );
      if (!updatedEvaluationResult) {
        return ServiceResponse.failure(
          'Evaluation result not found for update.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success(
        'Evaluation result updated successfully.',
        updatedEvaluationResult
      );
    } catch (ex) {
      const errorMessage = `Error updating evaluation result with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while updating the evaluation result.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async processEvaluate(
    candidateId: string,
    jobVacancyId: string
  ): Promise<ServiceResponse<EvaluationResultResponse | null>> {
    try {
      const candidate = await candidateService.findById(candidateId);
      if (!candidate.data) {
        return ServiceResponse.failure(
          'Candidate not found.',
          null,
          candidate.statusCode
        );
      }

      const jobVacancy = await jobVacancyService.findById(jobVacancyId);
      if (!jobVacancy.data) {
        return ServiceResponse.failure(
          'Job vacancy not found.',
          null,
          jobVacancy.statusCode
        );
      }

      const candidateDocuments = candidate.data.documents;

      if (!candidateDocuments || candidateDocuments.length === 0) {
        return ServiceResponse.failure(
          'Candidate documents not found.',
          null,
          candidate.statusCode
        );
      }

      const evaluationJob = await evaluationJobService.create({
        candidateId,
        jobVacancyId,
        status: 'queued',
      });

      const job: Job = await evaluationQueue.add('evaluate-candidate', {
        evaluationJobId: evaluationJob.data?.id,
      });

      await evaluationJobService.update(evaluationJob.data?.id || '', {
        jobId: job.id,
      });

      const data = {
        id: job.id || '',
        status: 'queued',
      };

      // Step 1 & 2: Extract text and candidate info (no changes here)
      return ServiceResponse.success(
        'Documents processed successfully.',
        data,
        StatusCodes.CREATED
      );
    } catch (ex) {
      const errorMessage = `Error processing uploads: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred during file processing.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async findResultById(
    evaluationResultId: string
  ): Promise<ServiceResponse<EvaluationResultResponse | null>> {
    try {
      const evaluationResult = await this.evaluationRepository.findResultById(
        evaluationResultId
      );

      if (!evaluationResult) {
        return ServiceResponse.failure(
          'Evaluation Result not found.',
          null,
          StatusCodes.NOT_FOUND
        );
      }

      const servicePayloadResponse = {
        id: '1',
        status: 'completed',
        result: evaluationResult,
      };

      return ServiceResponse.success(
        'Evaluation result found.',
        servicePayloadResponse
      );
    } catch (ex) {
      const errorMessage = `Error processing uploads: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred during file processing.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const evaluationService = new EvaluationService();
