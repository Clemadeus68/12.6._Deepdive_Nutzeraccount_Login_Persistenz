// E-Mail-Versand über Resend (https://resend.com).
// Ist kein RESEND_API_KEY gesetzt, wird die Mail nur ins Server-Log geschrieben –
// praktisch für lokale Entwicklung, ohne dass der Flow bricht.

export async function sendResetEmail(toEmail, resetUrl) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESET_FROM_EMAIL || 'Alchimedus Navigator <onboarding@resend.dev>';

  const subject = 'Passwort zurücksetzen – Alchimedus Navigator';
  const html = `
    <div style="font-family:Calibri,'Segoe UI',sans-serif;color:#111;font-size:14px;line-height:1.6">
      <p>Hallo,</p>
      <p>für deinen Zugang zum <strong>Alchimedus Navigator</strong> wurde das Zurücksetzen
      des Passworts angefordert. Klicke auf den folgenden Link, um ein neues Passwort zu vergeben:</p>
      <p><a href="${resetUrl}" style="background:#8CC63E;color:#fff;padding:10px 18px;
        border-radius:4px;text-decoration:none;font-weight:700">Neues Passwort vergeben</a></p>
      <p style="color:#777;font-size:12px">Der Link ist 1 Stunde gültig. Falls du das nicht
      angefordert hast, ignoriere diese E-Mail einfach.</p>
      <p style="color:#777;font-size:12px">Link: ${resetUrl}</p>
    </div>`;

  if (!apiKey) {
    console.log(`[mail] Kein RESEND_API_KEY gesetzt. Reset-Link für ${toEmail}: ${resetUrl}`);
    return { delivered: false, logged: true };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: toEmail, subject, html }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[mail] Resend-Fehler:', res.status, text);
    return { delivered: false, logged: false };
  }
  return { delivered: true, logged: false };
}
