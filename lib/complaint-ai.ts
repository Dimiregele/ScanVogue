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

// Compunerea emailului catre CLIENT cand un remediu e confirmat statistic.
// Diferit de SYSTEM_PROMPT de mai sus (ala e pentru raspunsul catre client
// dintr-o reclamatie individuala) -- aici scriem catre cineva care s-a plans
// candva de o tema, anuntandu-l ca s-a rezolvat cu adevarat, nu doar promis.
const RESOLUTION_EMAIL_SYSTEM_PROMPT = `Esti un asistent care ajuta restaurante din Romania sa scrie un email scurt, cald, catre un client care s-a plans anterior de o problema specifica, anuntandu-l ca problema a fost rezolvata si confirmata printr-o imbunatatire reala (masurata statistic, nu doar promisa).

Primesti tema reclamata, procentul de imbunatatire masurat, si, optional, o nota scrisa de manager despre ce anume s-a schimbat.

Raspunde STRICT cu un obiect JSON, fara alt text in jur, cu exact aceasta cheie:
{"message": "..."}

Reguli pentru "message":
- Romana, ton cald si direct, ca de la un proprietar care chiar a citit reclamatia, nu un comunicat oficial.
- Maxim 3-4 propozitii scurte.
- Daca ai primit o nota de la manager, integreaz-o natural in mesaj -- nu o cita mot-a-mot, reformuleaz-o cald.
- Daca NU ai primit nicio nota, nu inventa detalii specifice despre ce anume s-a schimbat -- ramai la nivel general (ex: "am facut cateva schimbari in bucatarie"), dar mentioneaza clar procentul de imbunatatire, care e real si masurat.
- NU promite niciodata rambursari, compensatii, reduceri sau alte beneficii concrete neautorizate explicit.
- Nu incepe cu "Buna" sau alt salut -- acela se adauga separat, inainte de mesajul tau.
- Nu semna cu niciun nume -- restaurantul adauga semnatura separat, dupa mesajul tau.`;

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
        max_tokens: 1000,
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
        // Generoasa deliberat -- daca modelul se opreste la mijlocul JSON-ului
        // inainte sa termine (ex: 500 tokeni s-a dovedit prea putin), Groq
        // respinge tot raspunsul ca invalid si pierdem rezumatul + raspunsul
        // sugerat + tema, desi reclamatia oricum se salveaza. Nu costa in plus
        // sa fie mare -- se factureaza doar ce genereaza efectiv modelul, nu
        // plafonul in sine.
        max_tokens: 1200,
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

// Compune mesajul catre client pentru bucla de notificare (client-loop).
// Nota managerului ramane OPTIONALA -- daca lipseste, AI-ul scrie un mesaj
// bun oricum, fara sa inventeze detalii specifice despre remediu.
// Intoarce null la orice esec (cheie lipsa, eroare API, JSON invalid) --
// apelantul foloseste in acel caz sablonul fix existent, niciodata nu pica
// trimiterea din cauza asta.
export async function composeResolutionEmail(params: {
  theme: string;
  deltaPct: number;
  note: string | null;
}): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY lipseste -- emailul de rezolvare foloseste sablonul fix.");
    return null;
  }

  const userContent = [
    `Tema reclamata: ${params.theme}`,
    `Imbunatatire masurata: ${Math.abs(params.deltaPct)}% mai putine cazuri`,
    params.note?.trim()
      ? `Nota managerului despre remediu: ${params.note.trim()}`
      : `Managerul nu a lasat nicio nota despre remediul specific.`,
  ].join("\n");

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
        max_tokens: 1200,
        messages: [
          { role: "system", content: RESOLUTION_EMAIL_SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!res.ok) {
      console.error("Groq API (email rezolvare) a raspuns cu eroare:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const rawText: string = data?.choices?.[0]?.message?.content ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (typeof parsed.message !== "string" || !parsed.message.trim()) {
      console.error("Raspuns AI cu forma neasteptata (email rezolvare):", parsed);
      return null;
    }

    return parsed.message.trim();
  } catch (err) {
    console.error("Compunerea emailului de rezolvare a esuat:", err);
    return null;
  }
}
