import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { candidateRegistry } from '@/api/candidate/candidateRouter';
import { documentRegistry } from '@/api/document/documentRouter';
import { evaluationRegistry } from '@/api/evaluation/evaluationRouter';
import { healthCheckRegistry } from '@/api/healthCheck/healthCheckRouter';

export type OpenAPIDocument = ReturnType<
  OpenApiGeneratorV3['generateDocument']
>;

export function generateOpenAPIDocument(): OpenAPIDocument {
  const registry = new OpenAPIRegistry([
    healthCheckRegistry,
    candidateRegistry,
    documentRegistry,
    evaluationRegistry,
  ]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Swagger API',
    },
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/swagger.json',
    },
  });
}
