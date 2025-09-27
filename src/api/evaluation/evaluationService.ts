import { StatusCodes } from 'http-status-codes';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { aiExtractorService } from '@/services/aiExtractorService';

// Mocked external services
import { textExtractorService } from '@/services/textExtractorService';
import { evaluationRepository } from './evaluationRepository';

class EvaluationService {
  public async processUploads(
    cvFile: Express.Multer.File & { location: string }, // multer-s3 adds 'location'
    projectReportFile: Express.Multer.File & { location: string }
  ): Promise<ServiceResponse<any>> {
    try {
      // Step 1 & 2: Extract text and candidate info (no changes here)
      const cvText = await textExtractorService.extractTextFromUrl(
        cvFile.location
      );
      if (!cvText) {
        return ServiceResponse.failure(
          'Failed to extract text from CV.',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      const candidateInfo = await aiExtractorService.extractCandidateInfo(
        cvText
      );
      if (!candidateInfo?.email || !candidateInfo?.fullName) {
        return ServiceResponse.failure(
          'Could not extract candidate name and email from CV.',
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      // Step 3: Save to the database (no changes here)
      const repoResult =
        await evaluationRepository.upsertCandidateWithDocuments({
          email: candidateInfo.email,
          fullName: candidateInfo.fullName,
          cvPath: cvFile.location, // Note: We save the URL in the DB now
          projectReportPath: projectReportFile.location,
        });

      // --- CHANGE IS HERE ---
      // Construct the new, simpler response payload
      const responsePayload = {
        candidateId: repoResult.candidateId,
        urls: {
          cv: cvFile.location,
          projectReport: projectReportFile.location,
        },
      };

      return ServiceResponse.success(
        'Files processed successfully.',
        responsePayload,
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
}

export const evaluationService = new EvaluationService();
