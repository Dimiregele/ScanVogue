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
  theme: string;
};

const SYSTEM_PROMPT = `Esti un asistent care ajuta proprietarii de restaurante din Romania sa raspunda profesionist la reclamatii primite de la clienti nemultumiti.

Primesti textul unei reclamatii. Raspunde STRICT cu un obiect JSON, fara niciun alt text in jur, cu exact aceste chei:
{"summary": "...", "suggested_reply": "...", "sensitive": true sau false, "theme": "..."}

Reguli pentru "summary": maxim 12 cuvinte, in romana, rezumand problema reala mentionata.

Reguli pentru "theme": alege categoria care se potrivește cel mai bine din lista de mai jos. Dacă niciuna nu se potrivește deloc, alege o categorie noua, scurta (maxim 4 cuvinte, in romana), dar foloseste asta doar ca ultima solutie -- prioritatea e sa refolosesti mereu aceeasi eticheta pentru aceeasi problema, ca reclamatiile similare sa poata fi grupate corect in timp.

Lista de categorii standard (alege exact aceasta formulare cand se potriveste):
"timp de așteptare mare", "mâncare rece", "porție mică", "gust nepotrivit", "personal nepoliticos", "personal lent", "curățenie", "zgomot / muzică prea tare", "temperatură în local", "preț perceput mare", "greșeală la comandă", "lipsă de disponibilitate produse", "problemă cu plata / nota de plată", "igienă alimentară"

Reguli stricte pentru "suggested_reply":
- NU promite niciodata rambursari, compensatii, reduceri, concedieri de personal sau orice actiune concreta pe care restaurantul nu te-a autorizat explicit sa o promiti.
- Recunoaste problema mentionata explicit in mesaj, cu empatie reala, nu formule generice de tip "va multumim pentru feedback" sau "intelegem dezamagirea cauzata".
- Scrie cum ai vorbi, nu cum ai scrie un comunicat oficial -- propozitii scurte, directe, fara cuvinte umflate ("dezamagire", "aducem la cunostinta", "va asiguram ca").
- Suna ca un proprietar care chiar a citit mesajul, nu ca un raspuns automat.
- Maxim 4-5 propozitii scurte, in romana.
- Nu semna cu niciun nume -- restaurantul adauga semnatura separat.

Reguli pentru "sensitive" -- seteaza true daca mesajul mentioneaza ORICARE din:
- posibila intoxicatie alimentara, alergii, sau alte probleme de sanatate
- amenintari legale, denuntare publica, shaming pe retele sociale
- discriminare, hartuire, sau comportament inadecvat al personalului catre client
- orice altceva ce necesita mai mult decat o scuza simpla si un raspuns standard

Cand esti nesigur, seteaza sensitive true -- e mai sigur sa marchezi in plus un caz obisnuit decat sa ratezi unul important.`;

const THEMES_SYSTEM_PROMPT = `Esti un analist care ajuta proprietari de restaurante sa identifice tipare recurente in reclamatiile primite de la clienti.

Primesti o lista numerotata de mesaje de reclamatie. Identifica cele mai frecvente 3-5 teme/probleme care apar in MAI MULTE mesaje diferite -- ignora problemele unice, mentionate o singura data.

Raspunde STRICT cu JSON, fara alt text in jur:
{"themes": [{"theme": "...", "count": N, "example": "..."}]}

- "theme": descriere scurta in romana, maxim 6 cuvinte (ex: "timp de așteptare mare", "muzică prea tare")
- "count": in cate mesaje diferite apare aceasta tema, aproximativ, dupa judecata ta
- "example": un citat scurt, maxim 15 cuvinte, dintr-un mesaj reprezentativ pentru acea tema

Sorteaza descrescator dupa count. Daca nu exista teme repetate clare (fiecare reclamatie e unica), intoarce {"themes": []}.`;

type Theme = { theme: string; count: number; example: string };

export async function analyzeThemes(messages: string[]): Promise<Theme[] | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || messages.length === 0) return null;

  const numbered = messages.map((m, i) => `${i + 1}. ${m}`).join("\n");

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
        max_tokens: 700,
        messages: [
          { role: "system", content: THEMES_SYSTEM_PROMPT },
          { role: "user", content: numbered },
        ],
      }),
    });

    if (!res.ok) {
      console.error("Groq API (teme) a raspuns cu eroare:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const rawText: string = data?.choices?.[0]?.message?.content ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.themes)) return null;
    return parsed.themes;
  } catch (err) {
    console.error("Analiza de teme a esuat:", err);
    return null;
  }
}
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
      theme: typeof parsed.theme === "string" && parsed.theme.trim() ? parsed.theme.trim() : "altele",
    };
  } catch (err) {
    console.error("Analiza AI a reclamatiei a esuat:", err);
    return null;
  }
}
