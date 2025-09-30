import type { Job } from 'bullmq';
import { StatusCodes } from 'http-status-codes';
import { candidateService } from '@/api/candidate/candidateService';
import { jobVacancyService } from '@/api/jobVacancy/jobVacancyService';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { evaluationQueue } from '@/jobs/evaluationQueue';
import { logger } from '@/server';
import type { EvaluationResultResponse } from './evaluationModel';
import { EvaluationRepository } from './evaluationRepository';

class EvaluationService {
  private evaluationRepository: EvaluationRepository;

  constructor(repository: EvaluationRepository = new EvaluationRepository()) {
    this.evaluationRepository = repository;
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

      const job: Job = await evaluationQueue.add('evaluate-candidate', {
        documents: candidateDocuments,
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
