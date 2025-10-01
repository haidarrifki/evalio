import { StatusCodes } from 'http-status-codes';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import type { DetailedScoreCreate } from './detailedScoreModel';
import { DetailedScoreRepository } from './detailedScoreRepository';

class DetailedScoreService {
  private detailedScoreRepository: DetailedScoreRepository;

  constructor(
    repository: DetailedScoreRepository = new DetailedScoreRepository()
  ) {
    this.detailedScoreRepository = repository;
  }

  public async createMany(
    scores: DetailedScoreCreate[]
  ): Promise<ServiceResponse<DetailedScoreCreate[] | null>> {
    try {
      const newDetailedScores = await this.detailedScoreRepository.createMany(
        scores
      );
      return ServiceResponse.success(
        'Document chunk created successfully.',
        newDetailedScores,
        StatusCodes.CREATED
      );
    } catch (ex) {
      const errorMessage = `Error creating document chunk: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while creating the document chunk.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const detailedScoreService = new DetailedScoreService();
