// POST /api/auth/register  { email, password, name? }
import { sql } from '../_lib/db.js';
import { hashPassword, createSessionToken, setSessionCookie, readJsonBody } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Methode nicht erlaubt' });
  }

  const { email, password, name } = await readJsonBody(req);
  const mail = (email || '').trim().toLowerCase();

  if (!mail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) {
    return res.status(400).json({ error: 'Bitte eine gültige E-Mail angeben.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' });
  }

  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${mail}`;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Diese E-Mail ist bereits registriert.' });
    }

    const hash = await hashPassword(password);
    const rows = await sql`
      INSERT INTO users (email, password_hash, name, last_login)
      VALUES (${mail}, ${hash}, ${name?.trim() || null}, now())
      RETURNING id, email, name
    `;
    const user = rows[0];

    setSessionCookie(res, createSessionToken(user));
    return res.status(201).json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('register error:', err.message);
    return res.status(500).json({ error: 'Registrierung fehlgeschlagen.' });
  }
}
