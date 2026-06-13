// GET /api/auth/me  – aktuelle Session prüfen
import { getSession } from '../_lib/auth.js';

export default function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ user: null });
  return res.status(200).json({
    user: { id: session.uid, email: session.email, name: session.name },
  });
}
