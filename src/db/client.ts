import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '@/common/utils/envConfig';
import * as schema from './schema';

const { DATABASE_URL } = env;

// Create a connection pool to your PostgreSQL database
const pool = new Pool({
  connectionString: DATABASE_URL!,
});

// Create and export the Drizzle instance, providing the pool and the full schema
// This enables Drizzle's relational queries (db.query)
export const db = drizzle(pool, { schema });
