# Alchimedus Navigator – Projektregeln für Claude

## ⚠️ Richtige Datei: immer `index.html`

Das **Live-Tool** ist ausschließlich `index.html`. Diese Datei wird von Beratern genutzt.

`Alchimedus_Navigator.html` ist eine veraltete Altdatei – **niemals bearbeiten**.

---

## Datenbasis aktualisieren

Die Masterdatenbank befindet sich im `<script>`-Block von `index.html` als JavaScript-Array `const DB = [...]`.

**Wenn neue Berichte/Fragebögen hinzukommen:**
1. Neuen Eintrag ans Ende des `DB`-Arrays anfügen
2. Tags aus der Spalte „Tags" der Excel-Mastertabelle übernehmen (als Array)
3. `bafa` und `inqa` als `"ja"` / `"bedingt"` / `"nein"` setzen
4. Kein Eingriff in `showRecs()` nötig – die Logik ist tag-basiert

**Situationen und ihre Tag-Schlüsselwörter (automatisches Matching):**

| Situation (Schritt 1) | Matching-Tags im Eintrag |
|---|---|
| Akquise / Erstkontakt | `akquise`, `erstgespraech`, `foerderung` |
| Kick-Off / Projektstart | `kickoff` |
| Laufendes Projekt | `fortschritt`, `qm`, `nachweis` |
| Konzeptabschluss | `abschluss` |
| Nachfolge / M&A | `nachfolge`, `m&a`, `exit`, `unternehmensbewertung` |
| KI / Digitalisierung | `ki`, `digital`, `digitalisierung`, `aiact`, `transformation` |
| Vertrieb / Marketing | `vertrieb`, `sales`, `leads`, `leadmanagement`, `marketing` |

**Förderfilter (Schritt 2):**
- BAFA → zeigt nur Einträge mit `bafa:"ja"`
- INQA → zeigt nur Einträge mit `inqa:"ja"`
- Kein / Offen → kein Zusatzfilter

---

## Excel-Mastertabelle

Die Excel-Datei `260609_Alchimedus_Navigator_Master.xlsx` ist die Single Source of Truth.
Beim Upload einer neuen Version: DB in `index.html` aktualisieren, dann `git push`.

Stand der DB: **ALN-001 bis ALN-035**, 09.06.2026.

---

## Login & Persistenz (ab Version 12.6)

Das Tool ist jetzt durch einen **Nutzeraccount mit Passwort** geschützt und speichert
Analysen in **Neon (PostgreSQL)**. Details siehe `README.md`.

- **Backend:** Vercel Serverless Functions unter `/api`
- **Auth:** `bcryptjs` (Passwort-Hash) + JWT-Session-Cookie (httpOnly)
- **DB-Schema:** `db/schema.sql` (Tabellen `users`, `saved_analyses`)
- **Secrets:** `DATABASE_URL`, `SESSION_SECRET` (siehe `.env.example`)

**Wichtig:** Die fachliche Datenbasis bleibt das `const DB = [...]`-Array in `index.html`.
Login/Persistenz sind davon unabhängig – DB-Pflege wie bisher.
