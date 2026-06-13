// Hilfsfunktionen für Authentifizierung: Passwort-Hashing, JWT-Session-Cookies.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'node:crypto';

const COOKIE_NAME = 'aln_session';
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 Tage

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET ist nicht gesetzt.');
  return secret;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(user) {
  return jwt.sign(
    { uid: user.id, email: user.email, name: user.name || null },
    getSecret(),
    { expiresIn: MAX_AGE_SEC }
  );
}

// Setzt das Session-Cookie (httpOnly, Secure, SameSite=Lax).
export function setSessionCookie(res, token) {
  const cookie = [
    `${COOKIE_NAME}=${token}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${MAX_AGE_SEC}`,
  ].join('; ');
  res.setHeader('Set-Cookie', cookie);
}

export function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
  );
}

// Liest und verifiziert die Session aus dem Cookie. Gibt das Token-Payload zurück oder null.
export function getSession(req) {
  const header = req.headers.cookie || '';
  const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const token = match.slice(COOKIE_NAME.length + 1);
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

// Erzeugt ein Reset-Token. Klartext geht per Mail an den Nutzer,
// in der DB wird nur der SHA-256-Hash gespeichert.
export function createResetToken() {
  const token = randomBytes(32).toString('hex');
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

// Liest einen JSON-Body unabhängig davon, ob Vercel ihn schon geparst hat.
export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return await new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}
