// Zentrale Neon-Datenbankverbindung (serverless).
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  // Wird beim ersten Request sichtbar, falls das Secret fehlt.
  console.warn('DATABASE_URL ist nicht gesetzt – Datenbankzugriffe schlagen fehl.');
}

export const sql = neon(process.env.DATABASE_URL);
