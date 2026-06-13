// POST /api/auth/forgot  { email }
// Erzeugt ein Reset-Token und versendet den Reset-Link per E-Mail.
// Antwortet immer generisch (keine Auskunft, ob die E-Mail existiert).
import { sql } from '../_lib/db.js';
import { createResetToken, readJsonBody } from '../_lib/auth.js';
import { sendResetEmail } from '../_lib/mail.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Methode nicht erlaubt' });
  }

  const { email } = await readJsonBody(req);
  const mail = (email || '').trim().toLowerCase();
  const generic = { ok: true, message: 'Falls ein Konto existiert, wurde eine E-Mail mit Reset-Link versendet.' };

  if (!mail) return res.status(400).json({ error: 'E-Mail erforderlich.' });

  try {
    const users = await sql`SELECT id, email FROM users WHERE email = ${mail}`;
    const user = users[0];
    // Existiert die E-Mail nicht: trotzdem generische Antwort (kein User-Enumeration).
    if (!user) return res.status(200).json(generic);

    const { token, tokenHash } = createResetToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 Stunde

    // Alte, noch offene Tokens des Nutzers entwerten.
    await sql`UPDATE password_resets SET used = true WHERE user_id = ${user.id} AND used = false`;
    await sql`
      INSERT INTO password_resets (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${tokenHash}, ${expires.toISOString()})
    `;

    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const resetUrl = `${proto}://${host}/?reset=${token}`;

    await sendResetEmail(user.email, resetUrl);
    return res.status(200).json(generic);
  } catch (err) {
    console.error('forgot error:', err.message);
    return res.status(500).json({ error: 'Anfrage fehlgeschlagen.' });
  }
}
