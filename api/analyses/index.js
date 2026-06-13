// GET  /api/analyses        – Liste der gespeicherten Analysen des Nutzers
// POST /api/analyses         – neue Analyse speichern
import { sql } from '../_lib/db.js';
import { getSession, readJsonBody } from '../_lib/auth.js';

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Nicht angemeldet.' });

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, kunde, doktyp, situation, foerderung, payload, created_at
        FROM saved_analyses
        WHERE user_id = ${session.uid}
        ORDER BY created_at DESC
      `;
      return res.status(200).json({ analyses: rows });
    }

    if (req.method === 'POST') {
      const { kunde, doktyp, situation, foerderung, payload } = await readJsonBody(req);
      if (!payload || !Array.isArray(payload) || payload.length === 0) {
        return res.status(400).json({ error: 'Keine Berichte zum Speichern vorhanden.' });
      }
      const rows = await sql`
        INSERT INTO saved_analyses (user_id, kunde, doktyp, situation, foerderung, payload)
        VALUES (
          ${session.uid},
          ${kunde || null},
          ${doktyp || null},
          ${situation || null},
          ${foerderung || null},
          ${JSON.stringify(payload)}
        )
        RETURNING id, kunde, doktyp, situation, foerderung, payload, created_at
      `;
      return res.status(201).json({ analysis: rows[0] });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Methode nicht erlaubt' });
  } catch (err) {
    console.error('analyses error:', err.message);
    return res.status(500).json({ error: 'Datenbankfehler.' });
  }
}
