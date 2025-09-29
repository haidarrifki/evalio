import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { env } from './src/common/utils/envConfig';

const { DATABASE_URL } = env;

export default defineConfig({
  out: './drizzle',
  schema: './src/common/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL!,
  },
});
