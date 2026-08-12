import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Confidențialitate — ScanVogue",
  description: "Cum colectăm, folosim și protejăm datele tale personale.",
};

const COLORS = {
  bg: "#0B0A08",
  bgRadial: "#18140F",
  card: "rgba(22,19,15,0.78)",
  cardBorder: "rgba(198,161,91,0.16)",
  gold: "#C6A15B",
  textPrimary: "#F5F0E6",
  textMuted: "#9C9382",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 30 }}>
      <h2 style={{ color: COLORS.gold, fontSize: 16, fontWeight: 600, marginBottom: 10, letterSpacing: "0.01em" }}>
        {title}
      </h2>
      <div style={{ color: COLORS.textMuted, fontSize: 14.5, lineHeight: 1.75 }}>{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  const lastUpdated = "12 august 2026";

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        padding: "48px 20px",
        background: `radial-gradient(ellipse at 50% 0%, ${COLORS.bgRadial} 0%, ${COLORS.bg} 65%)`,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          background: COLORS.card,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 22,
          padding: "40px 28px",
        }}
      >
        <h1 style={{ color: COLORS.textPrimary, fontSize: 24, fontWeight: 600, marginBottom: 6 }}>
          Politica de Confidențialitate
        </h1>
        <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 34 }}>
          Ultima actualizare: {lastUpdated}
        </p>

        <Section title="1. Cine suntem">
          <p>
            Această pagină este operată de ScanVogue, furnizorul platformei tehnice folosite de restaurantul
            partener pentru a colecta feedback de la clienți. Pentru datele lăsate pe formularul de mai jos,
            restaurantul unde ai scanat plăcuța este operatorul de date (decide de ce se colectează datele),
            iar ScanVogue este împuternicitul — asigură infrastructura tehnică prin care aceste date sunt
            colectate, stocate și transmise restaurantului.
          </p>
        </Section>

        <Section title="2. Ce date colectăm">
          <p style={{ marginBottom: 10 }}>Atunci când scanezi plăcuța și completezi formularul, putem colecta:</p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Alegerea făcută (experiență pozitivă sau negativă) și data/ora scanării;</li>
            <li>Mesajul pe care îl scrii, dacă alegi să lași feedback despre o experiență negativă;</li>
            <li>Numele și adresa de email, doar dacă alegi tu să le lași — sunt întotdeauna opționale;</li>
          </ul>
          <p style={{ marginTop: 10 }}>
            Pagina de scanare nu folosește cookie-uri de urmărire (tracking) și nu colectează date de
            localizare sau de plată.
          </p>
        </Section>

        <Section title="3. De ce colectăm aceste date">
          <p>
            Scopul este exclusiv legat de feedback-ul lăsat de tine: rutarea mesajului către echipa
            restaurantului, și — dacă ai lăsat un contact — posibilitatea ca cineva din echipă să revină
            către tine pentru a rezolva problema semnalată. Temeiul legal este consimțământul tău, exprimat
            prin completarea și trimiterea formularului.
          </p>
        </Section>

        <Section title="4. Cât timp păstrăm datele">
          <p>
            Datele sunt păstrate atât timp cât este necesar pentru a soluționa feedback-ul trimis și pentru
            ca restaurantul să poată urmări problemele semnalate în timp. Poți oricând cere ștergerea lor mai
            devreme — vezi secțiunea „Drepturile tale" de mai jos.
          </p>
        </Section>

        <Section title="5. Cine are acces la datele tale">
          <p>
            Datele sunt vizibile doar echipei restaurantului unde ai lăsat feedback-ul și echipei tehnice
            ScanVogue, strict pentru mentenanța platformei. Nu vindem, nu închiriem și nu partajăm datele tale
            cu terți în scop de marketing.
          </p>
        </Section>

        <Section title="6. Drepturile tale">
          <p style={{ marginBottom: 10 }}>Conform Regulamentului General privind Protecția Datelor (GDPR), ai dreptul să:</p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Soliciți acces la datele pe care le deținem despre tine;</li>
            <li>Ceri corectarea datelor incorecte;</li>
            <li>Ceri ștergerea datelor tale;</li>
            <li>Te opui prelucrării sau ceri restricționarea ei;</li>
            <li>Ceri portabilitatea datelor;</li>
            <li>Depui o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), dacă consideri că drepturile tale nu au fost respectate.</li>
          </ul>
        </Section>

        <Section title="7. Securitate">
          <p>
            Datele sunt stocate prin infrastructură cloud securizată, cu acces restricționat astfel încât
            fiecare restaurant partener vede doar propriile date, nu și pe ale altor restaurante din platformă.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            Pentru orice întrebare legată de datele tale personale sau pentru a-ți exercita drepturile de mai
            sus, ne poți scrie la{" "}
            <a href="mailto:dimianic123@gmail.com" style={{ color: COLORS.gold }}>
              dimianic123@gmail.com
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}
