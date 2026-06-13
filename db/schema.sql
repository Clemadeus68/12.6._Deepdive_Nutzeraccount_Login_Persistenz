-- Alchimedus Navigator – Datenbankschema (Neon / PostgreSQL)
-- Anlegen: psql "$DATABASE_URL" -f db/schema.sql   (oder: npm run db:init)

-- Nutzeraccounts ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login    TIMESTAMPTZ
);

-- Gespeicherte Analysen (Persistenz der Finder-Ergebnisse je Nutzer) -----------
CREATE TABLE IF NOT EXISTS saved_analyses (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kunde       TEXT,
  doktyp      TEXT,
  situation   TEXT,
  foerderung  TEXT,
  payload     JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_analyses_user ON saved_analyses(user_id, created_at DESC);

-- Passwort-Zurücksetzen (Token wird nur als Hash gespeichert) -------------------
CREATE TABLE IF NOT EXISTS password_resets (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);
