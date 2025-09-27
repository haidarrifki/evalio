import { StatusCodes } from 'http-status-codes';
import { DocumentRepository } from '@/api/document/documentRepository';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import type { Document } from './documentModel';

export class DocumentService {
  private documentRepository: DocumentRepository;

  constructor(repository: DocumentRepository = new DocumentRepository()) {
    this.documentRepository = repository;
  }

  public async findAll(): Promise<ServiceResponse<Document[]>> {
    try {
      const documents = await this.documentRepository.findAll();
      if (documents.length === 0) {
        return ServiceResponse.failure(
          'No documents found.',
          [],
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success('Documents found.', documents);
    } catch (ex) {
      const errorMessage = `Error finding all documents: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while retrieving documents.',
        [],
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async findById(id: string): Promise<ServiceResponse<Document | null>> {
    try {
      const document = await this.documentRepository.findById(id);
      if (!document) {
        return ServiceResponse.failure(
          'Document not found.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return ServiceResponse.success('Document found.', document);
    } catch (ex) {
      const errorMessage = `Error finding document with id ${id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while finding the document.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async upload(
    candidateId: string,
    cvFile: Express.MulterS3.File,
    projectReportFile: Express.MulterS3.File
  ): Promise<
    ServiceResponse<{ cv: Document; projectReport: Document } | null>
  > {
    try {
      const cvDocumentPayload = {
        candidateId,
        name: cvFile.originalname,
        documentType: 'cv' as const,
        fileKey: cvFile.key,
      };

      const projectReportPayload = {
        candidateId,
        name: projectReportFile.originalname,
        documentType: 'project_report' as const,
        fileKey: projectReportFile.key,
      };

      const [newCv, newProjectReport] = await Promise.all([
        this.documentRepository.create(cvDocumentPayload),
        this.documentRepository.create(projectReportPayload),
      ]);

      if (!newCv || !newProjectReport) {
        throw new Error('One or more documents could not be created.');
      }

      const createdDocuments = { cv: newCv, projectReport: newProjectReport };

      return ServiceResponse.success(
        'Documents uploaded successfully.',
        createdDocuments,
        StatusCodes.CREATED
      );
    } catch (ex) {
      const errorMessage = `Error uploading documents: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred while uploading the documents.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const documentService = new DocumentService();
