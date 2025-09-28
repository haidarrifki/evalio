import { StatusCodes } from 'http-status-codes';
import type { Candidate } from '@/api/candidate/candidateModel';
import { CandidateRepository } from '@/api/candidate/candidateRepository';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

class CandidateService {
  private candidateRepository: CandidateRepository;

  constructor(repository: CandidateRepository = new CandidateRepository()) {
    this.candidateRepository = repository;
  }

  public async findAll(): Promise<ServiceResponse<Candidate[]>> {
    try {
      const candidates = await this.candidateRepository.findAll();
      if (candidates.length === 0) {
        return ServiceResponse.failure('No candidates found.', []);
      }
      return ServiceResponse.success('Candidates found.', candidates);
    } catch (ex) {
      const errorMessage = `Error finding all candidates: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while retrieving candidates.',
        [],
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async findById(
    id: string
  ): Promise<ServiceResponse<Candidate | null>> {
    try {
      const candidate = await this.candidateRepository.findById(id);
      if (!candidate) {
        return ServiceResponse.failure(
          'Candidate not found.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success('Candidate found.', candidate);
    } catch (ex) {
      const errorMessage = `Error finding candidate with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding the candidate.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async create(
    payload: Omit<Candidate, 'id' | 'createdAt'>
  ): Promise<ServiceResponse<Candidate | null>> {
    try {
      const newCandidate = await this.candidateRepository.create(payload);
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
    payload: Partial<Candidate>
  ): Promise<ServiceResponse<Candidate | null>> {
    try {
      const updatedCandidate = await this.candidateRepository.update(
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

  public async delete(id: string): Promise<ServiceResponse<Candidate | null>> {
    try {
      const deletedCandidate = await this.candidateRepository.delete(id);
      if (!deletedCandidate) {
        return ServiceResponse.failure(
          'Candidate not found for deletion.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success(
        'Candidate deleted successfully.',
        deletedCandidate
      );
    } catch (ex) {
      const errorMessage = `Error deleting candidate with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while deleting the candidate.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const candidateService = new CandidateService();
