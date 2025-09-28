import { Queue } from 'bullmq';
import { redisConnection } from './connection';

export const evaluationQueue = new Queue('evaluation-queue', {
  connection: redisConnection,
});
