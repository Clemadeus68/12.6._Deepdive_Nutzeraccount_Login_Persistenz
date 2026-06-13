// Initialisiert das Datenbankschema in Neon.
// Aufruf: DATABASE_URL=... node db/init.js
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error('Fehler: Umgebungsvariable DATABASE_URL ist nicht gesetzt.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

// Schema in einzelne Statements zerlegen und nacheinander ausführen.
const statements = schema
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith('--'));

try {
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log('✓ Datenbankschema erfolgreich angelegt/aktualisiert.');
} catch (err) {
  console.error('✗ Fehler beim Anlegen des Schemas:', err.message);
  process.exit(1);
}
