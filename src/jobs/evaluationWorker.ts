import { GetObjectCommand } from '@aws-sdk/client-s3';
import { type Job, Worker } from 'bullmq';
import { detailedScoreService } from '@/api/detailedScore/detailedScoreService';
import { documentService } from '@/api/document/documentService';
import { documentChunkService } from '@/api/documentChunk/documentChunkService';
import { evaluationService } from '@/api/evaluation/evaluationService';
import { evaluationJobService } from '@/api/evaluationJob/evaluationJobService';
import { Evaluator } from '@/common/ai/evaluators/evaluator';
import {
  CV_MATCH_RUBRIC,
  PROJECT_DELIVERABLE_RUBRIC,
} from '@/common/ai/evaluators/scoringRubric';
import {
  GotenbergClient,
  PdfToMarkdownConverter,
  SUPPORTED_OFFICE_FORMATS,
} from '@/common/ai/file-converters';
import { env } from '@/common/utils/envConfig';
import { s3 } from '@/common/utils/s3Client';
import { redisConnection } from './connection';

interface EvaluationJobData {
  evaluationJobId: string;
}

// The actual task logic
const processEvaluationJob = async (job: Job<EvaluationJobData>) => {
  const { evaluationJobId } = job.data;

  try {
    const evaluationJob = (await evaluationJobService.findById(evaluationJobId))
      .data;
    if (!evaluationJob?.candidate?.documents || !evaluationJob.jobVacancy) {
      throw new Error('Evaluation job data is incomplete.');
    }

    const { documents } = evaluationJob.candidate;
    const { jobVacancy } = evaluationJob;

    const evaluator = new Evaluator();
    const allDetailedScores: any[] = [];

    let cvText: string | null = null;
    let projectReportText: string | null = null;

    for (const document of documents) {
      const { id, name, fileKey, metadata } = document;
      const { mimeType } = metadata as {
        size: number;
        mimeType: string;
      };

      const command = new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME!,
        Key: fileKey,
      });
      const { Body } = await s3.send(command);
      const fileBuffer = Buffer.from(await Body!.transformToByteArray());

      const pdfToMdConverter = new PdfToMarkdownConverter();
      let pdfBlob: Blob;

      // If the file is a supported Office format, convert it to PDF first.
      if (SUPPORTED_OFFICE_FORMATS.includes(mimeType)) {
        console.log(`Converting ${mimeType} to PDF via Gotenberg...`);
        const pdfBuffer = await GotenbergClient.convertOfficeToPdf(
          fileBuffer,
          mimeType
        );
        pdfBlob = new Blob([new Uint8Array(pdfBuffer)], {
          type: 'application/pdf',
        });
      }
      // If the file is already a PDF, just create a Blob from its buffer.
      else if (mimeType.includes('pdf')) {
        pdfBlob = new Blob([fileBuffer], { type: mimeType });
      }
      // If the file type is not supported by the pipeline, throw an error.
      else {
        throw new Error(`Unsupported file MIME type: ${mimeType}`);
      }

      // Finally, convert the PDF blob (either original or from Gotenberg) to Markdown.
      console.log(`Converting ${name} to Markdown via AI...`);
      const markdown = await pdfToMdConverter.convert(pdfBlob);

      const updatedDocument = await documentService.update(id, {
        extractedText: markdown,
      });

      if (!updatedDocument.data) {
        throw new Error(`Document ${id} not updated.`);
      }

      console.log(`Embedding ${name} Markdown...`);

      const embeddedChunks = await documentChunkService.storeEmbeddings(
        document
      );

      console.log(embeddedChunks);

      if (document.documentType === 'cv') {
        cvText = markdown;
      } else if (document.documentType === 'project_report') {
        projectReportText = markdown;
      }

      console.log(`Document ${name} extracted and embedded...`);
    }

    const evaluationResult = (
      await evaluationService.create({ evaluationJobId })
    ).data;
    if (!evaluationResult)
      throw new Error('Cannot create the evaluation result.');
    const evaluationResultId = evaluationResult.id;

    // ====================================================================
    // STAGE 2: CV Scoring (if a CV document was found)
    // ====================================================================
    let cvMatchRate = 0;
    if (cvText) {
      console.log('Scoring CV...');
      const cvScores = [];
      for (const [parameter, details] of Object.entries(CV_MATCH_RUBRIC)) {
        const { score, justification } = await evaluator.evaluateCv(
          parameter,
          details,
          cvText,
          jobVacancy.description
        );
        cvScores.push({
          score,
          justification,
          parameter,
          weight: details.weight,
          category: 'cv_match' as const,
        });
      }
      const totalWeightedScore = cvScores.reduce(
        (acc, item) => acc + item.score * item.weight,
        0
      );
      cvMatchRate = totalWeightedScore * 20; // Convert to percentage
      allDetailedScores.push(...cvScores);
    }

    // ====================================================================
    // STAGE 3: Project Scoring (if a project report was found)
    // ====================================================================
    let projectScore = 0;
    if (projectReportText) {
      console.log('Scoring Project Report...');
      const projectScores = [];
      for (const [parameter, details] of Object.entries(
        PROJECT_DELIVERABLE_RUBRIC
      )) {
        const { score, justification } = await evaluator.evaluateProject(
          parameter,
          details,
          projectReportText,
          jobVacancy.description
        );
        projectScores.push({
          score,
          justification,
          parameter,
          weight: details.weight,
          category: 'project_deliverable' as const,
        });
      }
      projectScore = projectScores.reduce(
        (acc, item) => acc + item.score * item.weight,
        0
      ); // Keep as 1-5 scale
      allDetailedScores.push(...projectScores);
    }

    // ====================================================================
    // STAGE 4: Finalization
    // ====================================================================
    // Save all detailed scores (both CV and Project) in one go
    await detailedScoreService.createMany(
      allDetailedScores.map((s) => ({ ...s, evaluationResultId }))
    );

    console.log('Generating final summary...');
    const overallSummary = await evaluator.summarizeEvaluation(
      allDetailedScores
    );

    const cvDetailedScores = allDetailedScores.filter(
      (s) => s.category === 'cv_match'
    );
    const projectDetailedScores = allDetailedScores.filter(
      (s) => s.category === 'project_deliverable'
    );
    const [cvFeedback, projectFeedback] = await Promise.all([
      evaluator.summarizeFeedback(cvDetailedScores, 'CV'),
      evaluator.summarizeFeedback(projectDetailedScores, 'Project'),
    ]);

    // Update the result with BOTH scores
    await evaluationService.update(evaluationResultId, {
      cvMatchRate: cvMatchRate.toFixed(2),
      cvFeedback,
      projectScore: projectScore.toFixed(2),
      projectFeedback,
      overallSummary,
    });

    await evaluationJobService.update(evaluationJobId, {
      status: 'completed',
      completedAt: new Date(),
    });

    // Simulate evaluator
    await new Promise((resolve) => setTimeout(resolve, 3000));
  } catch (error) {
    console.error(`❌ Error processing job ${job.id}:`, error);
    throw error;
  }
};

const evaluationWorker = new Worker('evaluation-queue', processEvaluationJob, {
  connection: redisConnection,
  concurrency: 5,
});

evaluationWorker.on('active', async (job: Job) => {
  await evaluationJobService.updateByJobId(job.id || '', {
    status: 'processing',
  });
  console.log(`Job ${job.id} has completed!`);
});

// Event listeners for logging
evaluationWorker.on('completed', async (job: Job) => {
  await evaluationJobService.updateByJobId(job.id || '', {
    status: 'completed',
    completedAt: new Date(),
  });
  console.log(`Job ${job.id} has completed!`);
});

evaluationWorker.on('failed', async (job: Job | undefined, err: Error) => {
  if (job) {
    await evaluationJobService.updateByJobId(job.id || '', {
      errorMessage: err.message,
      status: 'failed',
    });
    console.error(`Job ${job.id} has failed with ${err.message}`);
  } else {
    console.error(`A job has failed with ${err.message}`);
  }
});

evaluationWorker.on('error', (err) => {
  // A connection error or other internal worker error.
  console.error('Worker encountered an error:', err);
});

export default evaluationWorker;
