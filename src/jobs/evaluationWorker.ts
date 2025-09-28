import { type Job, Worker } from 'bullmq';
import { redisConnection } from './connection';

// The actual task logic
const processEvaluationJob = async (job: Job) => {
  const { email, name } = job.data;
  console.log(`📧 Sending welcome email to ${name} at ${email}...`);

  // Simulate sending an email
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log(`✅ Email sent to ${email}`);
};

// Instantiate the worker
const evaluationWorker = new Worker('email-queue', processEvaluationJob, {
  connection: redisConnection,
  concurrency: 5, // Process up to 5 jobs concurrently
});

// Event listeners for logging
evaluationWorker.on('completed', (job: Job) => {
  console.log(`Job ${job.id} has completed!`);
});

evaluationWorker.on('failed', (job: Job | undefined, err: Error) => {
  if (job) {
    console.error(`Job ${job.id} has failed with ${err.message}`);
  } else {
    console.error(`A job has failed with ${err.message}`);
  }
});

export default evaluationWorker;
