// Analiza AI a reclamatiilor -- ruleaza STRICT server-side (foloseste
// GROQ_API_KEY, nu trebuie sa ajunga niciodata in browser).
//
// Foloseste Groq (endpoint compatibil OpenAI) in loc de Anthropic direct --
// mai ieftin, viteza foarte buna. Daca vreodata calitatea nu multumeste,
// schimbarea inapoi la alt provider inseamna doar rescrierea acestui fisier,
// restul aplicatiei (route.ts, actions.ts) nu stie si nu-i pasa care e
// provider-ul din spate.
//
// Design deliberat: AI-ul NU trimite nimic automat catre client. Produce
// doar un rezumat + o sugestie de raspuns, pe care proprietarul le vede in
// panou si le aproba/editeaza manual inainte de trimitere.

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
- Maxim 4-5 propozitii scurte, in romana.
- Nu semna cu niciun nume -- restaurantul adauga semnatura separat.

Reguli pentru "sensitive" -- seteaza true daca mesajul mentioneaza ORICARE din:
- posibila intoxicatie alimentara, alergii, sau alte probleme de sanatate
- amenintari legale, denuntare publica, shaming pe retele sociale
- discriminare, hartuire, sau comportament inadecvat al personalului catre client
- orice altceva ce necesita mai mult decat o scuza simpla si un raspuns standard

Cand esti nesigur, seteaza sensitive true -- e mai sigur sa marchezi in plus un caz obisnuit decat sa ratezi unul important.`;

export async function analyzeComplaint(message: string): Promise<ComplaintAnalysis | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY lipseste -- analiza AI e sarita, reclamatia se salveaza oricum.");
    return null;
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        response_format: { type: "json_object" },
        max_tokens: 500,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
      }),
    });

    if (!res.ok) {
      console.error("Groq API a raspuns cu eroare:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const rawText: string = data?.choices?.[0]?.message?.content ?? "";
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
