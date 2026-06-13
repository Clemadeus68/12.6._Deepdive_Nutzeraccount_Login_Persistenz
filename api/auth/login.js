// POST /api/auth/login  { email, password }
import { sql } from '../_lib/db.js';
import { verifyPassword, createSessionToken, setSessionCookie, readJsonBody } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Methode nicht erlaubt' });
  }

  const { email, password } = await readJsonBody(req);
  const mail = (email || '').trim().toLowerCase();

  if (!mail || !password) {
    return res.status(400).json({ error: 'E-Mail und Passwort erforderlich.' });
  }

  try {
    const rows = await sql`
      SELECT id, email, name, password_hash FROM users WHERE email = ${mail}
    `;
    const user = rows[0];
    // Gleiche Fehlermeldung für unbekannte E-Mail und falsches Passwort.
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'E-Mail oder Passwort ist falsch.' });
    }

    await sql`UPDATE users SET last_login = now() WHERE id = ${user.id}`;
    setSessionCookie(res, createSessionToken(user));
    return res.status(200).json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('login error:', err.message);
    return res.status(500).json({ error: 'Anmeldung fehlgeschlagen.' });
  }
}
