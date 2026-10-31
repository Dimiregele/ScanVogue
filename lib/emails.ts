// alert_email din tabelul restaurants poate contine MAI MULTE adrese, separate
// prin virgula (ex. "proprietar@x.ro, manager@x.ro"). Ramane o singura
// coloana text, ca sa nu fie nevoie de migratie -- un restaurant cu o singura
// adresa functioneaza exact ca inainte.

const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

// Accepta separatori: virgula, punct si virgula, spatiu sau rand nou.
// Adresele sunt aduse la litere mici si deduplicate.
export function parseEmailList(raw: string | null | undefined): { emails: string[]; invalid: string[] } {
  const emails: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  for (const part of (raw ?? "").split(/[,;\s]+/)) {
    const email = part.trim().toLowerCase();
    if (!email) continue;
    if (!EMAIL_RE.test(email)) {
      invalid.push(part.trim());
      continue;
    }
    if (seen.has(email)) continue;
    seen.add(email);
    emails.push(email);
  }

  return { emails, invalid };
}

// Doar adresele valide din alert_email -- pentru trimiterea emailurilor.
// Intoarce o lista goala daca nu exista nicio adresa utilizabila.
export function alertRecipients(raw: string | null | undefined): string[] {
  return parseEmailList(raw).emails;
}
