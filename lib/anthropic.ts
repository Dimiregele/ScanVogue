// Analiza AI a reclamatiilor -- ruleaza STRICT server-side (foloseste
// ANTHROPIC_API_KEY, nu trebuie sa ajunga niciodata in browser).
//
// Design deliberat: AI-ul NU trimite nimic automat catre client. Produce
// doar un rezumat + o sugestie de raspuns, pe care proprietarul le vede in
// panou si le aproba/editeaza manual inainte de trimitere. Vezi actions.ts
// (sendComplaintReply) pentru pasul de trimitere efectiva.

type ComplaintAnalysis = {
  summary: string;
  suggestedReply: string;
  sensitive: boolean;
};

const SYSTEM_PROMPT = `Esti un asistent care ajuta proprietarii de restaurante din Romania sa raspunda profesionist la reclamatii primite de la clienti nemultumiti.

Primesti textul unei reclamatii. Raspunde STRICT cu un obiect JSON, fara niciun alt text in jur, cu exact aceste chei:
{"summary": "...", "suggested_reply": "...", "sensitive": true sau false}

Reguli pentru "summary": maxim 12 cuvinte, in romana, rezumand problema reala mentionata.

Reguli stricte pentru "suggested_reply":
- NU promite niciodata rambursari, compensatii, reduceri, concedieri de personal sau orice actiune concreta pe care restaurantul nu te-a autorizat explicit sa o promiti.
- Recunoaste problema mentionata explicit in mesaj, cu empatie reala, nu formule generice de tip "va multumim pentru feedback".
- Suna ca un proprietar care chiar a citit mesajul, nu ca un raspuns automat.
- Maxim 4-5 propozitii scurte.
- Nu semna cu niciun nume -- restaurantul adauga semnatura separat.

Reguli pentru "sensitive" -- seteaza true daca mesajul mentioneaza ORICARE din:
- posibila intoxicatie alimentara, alergii, sau alte probleme de sanatate
- amenintari legale, denuntare publica, shaming pe retele sociale
- discriminare, hartuire, sau comportament inadecvat al personalului catre client
- orice altceva ce necesita mai mult decat o scuza simpla si un raspuns standard

Cand esti nesigur, seteaza sensitive true -- e mai sigur sa marchezi in plus un caz obisnuit decat sa ratezi unul important.`;

export async function analyzeComplaint(message: string): Promise<ComplaintAnalysis | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY lipseste -- analiza AI e sarita, reclamatia se salveaza oricum.");
    return null;
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!res.ok) {
      console.error("Anthropic API a raspuns cu eroare:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const rawText: string = data?.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (typeof parsed.summary !== "string" || typeof parsed.suggested_reply !== "string") {
      console.error("Raspuns AI cu forma neasteptata:", parsed);
      return null;
    }

    return {
      summary: parsed.summary,
      suggestedReply: parsed.suggested_reply,
      sensitive: Boolean(parsed.sensitive),
    };
  } catch (err) {
    console.error("Analiza AI a reclamatiei a esuat:", err);
    return null;
  }
}
