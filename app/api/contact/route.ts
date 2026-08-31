import { NextRequest, NextResponse } from "next/server";

const TO_EMAIL = "scanvogue@gmail.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "ScanVogue <contact@scanvogue.ro>";

type Payload = {
  name?: unknown;
  email?: unknown;
  restaurant?: unknown;
  message?: unknown;
  company?: unknown; // honeypot
};

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

const escapeHtml = (v: string) =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function POST(request: NextRequest) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success, send nothing.
  if (str(payload.company, 200)) return NextResponse.json({ ok: true }, { status: 200 });

  const name = str(payload.name, 120);
  const email = str(payload.email, 200);
  const restaurant = str(payload.restaurant, 160) || "local nespecificat";
  const message = str(payload.message, 4000);

  if (!name) return NextResponse.json({ error: "Te rugăm să completezi numele." }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Adresa de email nu pare validă." }, { status: 400 });
  if (message.length < 5) return NextResponse.json({ error: "Te rugăm să scrii un mesaj." }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured");
    return NextResponse.json({ error: "Serviciul de email nu este configurat momentan." }, { status: 503 });
  }

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#111">
      <h2 style="margin:0 0 12px">Cerere ofertă ScanVogue</h2>
      <p><strong>Nume:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Local:</strong> ${escapeHtml(restaurant)}</p>
      <p><strong>Mesaj:</strong></p>
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    </div>`;

  const text = `Cerere ofertă ScanVogue\n\nNume: ${name}\nEmail: ${email}\nLocal: ${restaurant}\n\nMesaj:\n${message}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject: `Cerere ofertă ScanVogue — ${restaurant}`,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`Resend request failed [${response.status}]: ${body}`);
      return NextResponse.json({ error: "Emailul nu a putut fi trimis. Încearcă WhatsApp." }, { status: 502 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Emailul nu a putut fi trimis. Încearcă WhatsApp." }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
