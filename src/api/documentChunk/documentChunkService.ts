import { StatusCodes } from 'http-status-codes';
import type { Document } from '@/api/document/documentModel';
import type { DocumentChunk } from '@/api/documentChunk/documentChunkModel';
import { DocumentChunkRepository } from '@/api/documentChunk/documentChunkRepository';
import { JinaEmbeddings } from '@/common/ai/embeddings/jina-embeddings';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

class DocumentChunkService {
  private documentChunkRepository: DocumentChunkRepository;
  private embeddingsClient: JinaEmbeddings;

  constructor(
    repository: DocumentChunkRepository = new DocumentChunkRepository(),
    jinaEmbeddings: JinaEmbeddings = new JinaEmbeddings()
  ) {
    this.documentChunkRepository = repository;
    this.embeddingsClient = jinaEmbeddings;
  }

  public async create(
    payload: Omit<DocumentChunk, 'id' | 'createdAt'>
  ): Promise<ServiceResponse<DocumentChunk | null>> {
    try {
      const newDocumentChunk = await this.documentChunkRepository.create(
        payload
      );
      return ServiceResponse.success(
        'Document chunk created successfully.',
        newDocumentChunk,
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

  /**
   * Orchestrates the process of embedding a document and storing its chunks.
   * @param documentId The ID of the document to process.
   */
  public async storeEmbeddings(
    document: Document
  ): Promise<ServiceResponse<{ chunksCreated: number } | null>> {
    try {
      const { id: documentId, name, extractedText } = document;
      // console.log('>>> STORE EMBEDDINGS');
      // console.log(document);
      // 1. Fetch the source document
      if (!extractedText) {
        return ServiceResponse.failure(
          `Document with ID ${documentId} has no extracted text.`,
          null,
          StatusCodes.NOT_FOUND
        );
      }

      // 2. Generate chunks with vector payloads
      logger.info(`Generating embeddings for document: ${name}`);
      const chunksToInsert =
        await this.embeddingsClient.createEmbeddedGFMSemanticChunks(
          documentId,
          extractedText || '',
          document.name ?? 'Untitled'
        );

      if (chunksToInsert.length === 0) {
        logger.warn('No chunks were generated for this document.');
        return ServiceResponse.success(
          'Processing complete, but no chunks were generated.',
          { chunksCreated: 0 },
          StatusCodes.OK
        );
      }

      // 3. Use the repository to perform a bulk insert
      logger.info(`Storing ${chunksToInsert.length} chunks...`);
      const chunksCreated = await this.documentChunkRepository.createMany(
        chunksToInsert
      );

      return ServiceResponse.success(
        'Successfully embedded and stored document chunks.',
        { chunksCreated: chunksCreated ?? 0 },
        StatusCodes.CREATED
      );
    } catch (ex) {
      const errorMessage = `Error processing document ${document.id}: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        'An error occurred during document processing.',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const documentChunkService = new DocumentChunkService();
