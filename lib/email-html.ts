// Helper pentru emailuri HTML, in acelasi stil vizual (auriu pe fundal inchis)
// ca restul platformei. Respecta regulile de compatibilitate pentru clienti
// de email (layout pe tabele, stiluri inline, fara flexbox/grid, fonturi cu
// fallback) -- Gmail, Outlook, Apple Mail nu randeaza CSS modern corect.

// Scapa textul introdus de utilizatori (mesaj reclamatie, nume) inainte sa-l
// bagam in HTML -- altfel cineva ar putea trimite <script> sau taguri HTML
// printr-un formular public si le-ar vedea randate in inbox-ul restaurantului.
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Newline -> <br> DUPA escapare (nu inainte -- altfel escapeHtml ar strica tagurile <br>)
export function nl2br(escapedStr: string): string {
  return escapedStr.replace(/\n/g, "<br>");
}

const COLORS = {
  bg: "#0B0A08",
  card: "#151310",
  cardBorder: "#3A2E1E",
  gold: "#C6A15B",
  textPrimary: "#F5F0E6",
  textMuted: "#9C9382",
  textFaint: "#6B6355",
  warnBg: "#2A1414",
  warnBorder: "#7A3030",
  warnText: "#E0A88C",
};

const FONT = "Arial, Helvetica, sans-serif";
const FONT_SERIF = "Georgia, 'Times New Roman', serif";

export function wrapEmailHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bg};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.bg}" style="background-color:${COLORS.bg};">
<tr>
<td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.card}" style="max-width:560px;background-color:${COLORS.card};border:1px solid ${COLORS.cardBorder};border-radius:16px;">
<tr>
<td style="padding:32px 28px;">
${bodyHtml}
</td>
</tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr>
<td align="center" style="padding:18px 8px 0 8px;">
<p style="margin:0;font-family:${FONT};font-size:11px;line-height:16px;color:${COLORS.textFaint};">
Trimis prin ScanVogue &middot; <a href="https://scanvogue.ro/confidentialitate" style="color:${COLORS.textFaint};">Confidențialitate</a>
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
}

export function restaurantHeaderHtml(name: string): string {
  return `<p style="margin:0 0 22px 0;font-family:${FONT_SERIF};font-size:20px;line-height:1.3;color:${COLORS.gold};">${escapeHtml(name)}</p>`;
}

export function paragraphHtml(text: string, color: string = COLORS.textPrimary): string {
  return `<p style="margin:0 0 18px 0;font-family:${FONT};font-size:15px;line-height:24px;color:${color};">${nl2br(escapeHtml(text))}</p>`;
}

export function warningBoxHtml(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.warnBg}" style="background-color:${COLORS.warnBg};border:1px solid ${COLORS.warnBorder};border-radius:8px;margin:0 0 20px 0;">
<tr><td style="padding:12px 16px;">
<p style="margin:0;font-family:${FONT};font-size:13px;line-height:20px;color:${COLORS.warnText};">⚠️ ${escapeHtml(text)}</p>
</td></tr>
</table>`;
}

export function quoteBoxHtml(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#1D1A15" style="background-color:#1D1A15;border-left:3px solid ${COLORS.gold};margin:0 0 20px 0;">
<tr><td style="padding:14px 16px;">
<p style="margin:0;font-family:${FONT};font-size:14px;line-height:22px;color:${COLORS.textPrimary};">${nl2br(escapeHtml(text))}</p>
</td></tr>
</table>`;
}

export function aiReplyBoxHtml(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.card}" style="background-color:${COLORS.card};border:1px solid rgba(198,161,91,0.35);border-radius:8px;margin:0 0 22px 0;">
<tr><td style="padding:16px;">
<p style="margin:0 0 8px 0;font-family:${FONT};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${COLORS.gold};">Răspuns sugerat de AI</p>
<p style="margin:0;font-family:${FONT};font-size:14px;line-height:22px;color:${COLORS.textPrimary};">${nl2br(escapeHtml(text))}</p>
</td></tr>
</table>`;
}

export function ctaButtonHtml(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 0 0;">
<tr><td bgcolor="${COLORS.gold}" style="border-radius:999px;">
<a href="${url}" style="display:inline-block;padding:11px 22px;font-family:${FONT};font-size:13px;font-weight:bold;color:#100F0D;text-decoration:none;">${escapeHtml(label)}</a>
</td></tr>
</table>`;
}

export function mutedTextHtml(text: string): string {
  return `<p style="margin:0 0 18px 0;font-family:${FONT};font-size:13px;line-height:20px;color:${COLORS.textMuted};">${nl2br(escapeHtml(text))}</p>`;
}

export function signatureHtml(name: string): string {
  return `<p style="margin:0;font-family:${FONT};font-size:14px;line-height:22px;color:${COLORS.textMuted};">— ${escapeHtml(name)}</p>`;
}

export function themeListHtml(themes: { theme: string; count: number; timePattern: string | null; outcomeLabel?: string | null }[]): string {
  const rows = themes
    .map(
      (t) => `<tr>
<td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
<p style="margin:0;font-family:${FONT};font-size:14px;line-height:20px;color:${COLORS.textPrimary};font-weight:600;">${escapeHtml(t.theme)}</p>
${t.timePattern ? `<p style="margin:2px 0 0 0;font-family:${FONT};font-size:12.5px;line-height:18px;color:${COLORS.gold};">${escapeHtml(t.timePattern)}</p>` : ""}
${t.outcomeLabel ? `<p style="margin:2px 0 0 0;font-family:${FONT};font-size:12px;line-height:17px;color:${COLORS.textMuted};">${escapeHtml(t.outcomeLabel)}</p>` : ""}
</td>
<td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;vertical-align:top;">
<p style="margin:0;font-family:${FONT};font-size:14px;line-height:20px;color:${COLORS.textMuted};">${t.count}×</p>
</td>
</tr>`
    )
    .join("\n");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px 0;">
${rows}
</table>`;
}

export function statsRowHtml(items: { label: string; value: string }[]): string {
  const cells = items
    .map(
      (it) => `<td align="center" style="padding:14px 8px;">
<p style="margin:0 0 4px 0;font-family:${FONT_SERIF};font-size:22px;color:${COLORS.gold};">${escapeHtml(it.value)}</p>
<p style="margin:0;font-family:${FONT};font-size:11px;letter-spacing:0.04em;color:${COLORS.textMuted};">${escapeHtml(it.label)}</p>
</td>`
    )
    .join("\n");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#1D1A15" style="background-color:#1D1A15;border-radius:10px;margin:0 0 22px 0;">
<tr>${cells}</tr>
</table>`;
}
