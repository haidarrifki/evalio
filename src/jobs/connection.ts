import type { ConnectionOptions } from 'bullmq';
import { env } from '@/common/utils/envConfig';

export const redisConnection: ConnectionOptions = {
  host: new URL(env.REDIS_URL).hostname,
  port: Number(new URL(env.REDIS_URL).port),
};
