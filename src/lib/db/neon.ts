import { neon } from '@neondatabase/serverless';

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

// Helper to generate UUID (for use in inserts)
export function generateId(): string {
  return crypto.randomUUID();
}
