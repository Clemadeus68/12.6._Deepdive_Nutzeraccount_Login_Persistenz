// DELETE /api/analyses/:id  – gespeicherte Analyse löschen
import { sql } from '../_lib/db.js';
import { getSession } from '../_lib/auth.js';

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Nicht angemeldet.' });

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Methode nicht erlaubt' });
  }

  const id = parseInt(req.query.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Ungültige ID.' });
  }

  try {
    const rows = await sql`
      DELETE FROM saved_analyses
      WHERE id = ${id} AND user_id = ${session.uid}
      RETURNING id
    `;
    if (rows.length === 0) return res.status(404).json({ error: 'Nicht gefunden.' });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('delete analysis error:', err.message);
    return res.status(500).json({ error: 'Datenbankfehler.' });
  }
}
