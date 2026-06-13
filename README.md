# Alchimedus Navigator – mit Login & Neon-Persistenz

Erweiterte Version des Alchimedus Navigator (Berichtswahl-Tool von *be nice Organisationsberatung*).
Das Tool ist jetzt durch einen **Nutzeraccount mit Passwort** geschützt und speichert
Analysen dauerhaft in einer **Neon-PostgreSQL-Datenbank**.

## Funktionen

- **Berichts-Finder, Alle Berichte, NIS2-Info** – unverändert aus dem Original
- **Login & Registrierung** mit E-Mail + Passwort (Passwörter via bcrypt gehasht)
- **Session** über signiertes, httpOnly-Cookie (JWT)
- **Meine Analysen** – Finder-Ergebnisse je Nutzer speichern, wieder laden und löschen
- **Passwort vergessen** – Reset-Link per E-Mail (Resend), Token nur als Hash gespeichert, 1 Std. gültig

## Architektur

| Schicht        | Technologie                              |
|----------------|------------------------------------------|
| Frontend       | Statisches `index.html` (Vanilla JS)     |
| Backend        | Vercel Serverless Functions (`/api`)     |
| Datenbank      | Neon (PostgreSQL), `@neondatabase/serverless` |
| Auth           | `bcryptjs` (Hashing) + `jsonwebtoken` (Session-Cookie) |

### API-Endpunkte

| Methode | Pfad                  | Zweck                          |
|---------|-----------------------|--------------------------------|
| POST    | `/api/auth/register`  | Konto anlegen                  |
| POST    | `/api/auth/login`     | Anmelden                       |
| POST    | `/api/auth/logout`    | Abmelden                       |
| GET     | `/api/auth/me`        | Aktuelle Session prüfen        |
| POST    | `/api/auth/forgot`    | Reset-Link anfordern           |
| POST    | `/api/auth/reset`     | Neues Passwort per Token setzen|
| GET     | `/api/analyses`       | Gespeicherte Analysen listen   |
| POST    | `/api/analyses`       | Analyse speichern              |
| DELETE  | `/api/analyses/:id`   | Analyse löschen                |

## Einrichtung

### 1. Neon-Datenbank anlegen
1. Bei [neon.tech](https://neon.tech) ein kostenloses Projekt erstellen.
2. Den **Connection String** kopieren (Format `postgresql://…?sslmode=require`).

### 2. Schema einspielen
```bash
npm install
DATABASE_URL="postgresql://…" npm run db:init
```
Alternativ direkt: `psql "$DATABASE_URL" -f db/schema.sql`

### 3. Umgebungsvariablen setzen
`.env.example` nach `.env` kopieren und ausfüllen:
- `DATABASE_URL` – Neon Connection String
- `SESSION_SECRET` – langer Zufallswert, z. B. `openssl rand -base64 32`

### 4. Lokal starten
```bash
npm run dev      # vercel dev – Frontend + API unter http://localhost:3000
```

### 5. Deployment (Vercel)
1. Repo in Vercel importieren.
2. Unter **Settings → Environment Variables** `DATABASE_URL` und `SESSION_SECRET` eintragen.
3. Deploy. Schema-Init einmalig ausführen (Schritt 2) gegen dieselbe Neon-DB.

## Hinweise zur Datenbasis

Die Berichtsdatenbank liegt weiterhin als `const DB = [...]` im `<script>`-Block von
`index.html` (siehe `CLAUDE.md`). Login und Persistenz ändern daran nichts.
