// POST /api/auth/reset  { token, password }
// Setzt das Passwort, wenn das Token gültig, unbenutzt und nicht abgelaufen ist.
import { sql } from '../_lib/db.js';
import { hashToken, hashPassword, readJsonBody } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Methode nicht erlaubt' });
  }

  const { token, password } = await readJsonBody(req);
  if (!token) return res.status(400).json({ error: 'Token fehlt.' });
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' });
  }

  try {
    const tokenHash = hashToken(token);
    const rows = await sql`
      SELECT id, user_id FROM password_resets
      WHERE token_hash = ${tokenHash} AND used = false AND expires_at > now()
      LIMIT 1
    `;
    const reset = rows[0];
    if (!reset) {
      return res.status(400).json({ error: 'Der Link ist ungültig oder abgelaufen.' });
    }

    const newHash = await hashPassword(password);
    await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${reset.user_id}`;
    await sql`UPDATE password_resets SET used = true WHERE id = ${reset.id}`;

    return res.status(200).json({ ok: true, message: 'Passwort wurde aktualisiert. Du kannst dich jetzt anmelden.' });
  } catch (err) {
    console.error('reset error:', err.message);
    return res.status(500).json({ error: 'Zurücksetzen fehlgeschlagen.' });
  }
}
