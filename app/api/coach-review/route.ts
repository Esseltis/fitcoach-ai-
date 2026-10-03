// 🧠 Tygodniowy przegląd: komentarz AI pisany na podstawie struktury
// z lib/coach (punktacja, mocne strony, problemy, rekomendacje).
//
// - OPENAI_API_KEY ustawiony (np. w Vercel → Environment Variables)
//   → gpt-4o-mini pisze motywujący komentarz po polsku.
// - brak klucza → { source: "demo" } i panel renderuje własne,
//   heurystyczne podsumowanie (żaden błąd, po prostu bez AI).
//
// Odpowiedź: { ok: true, source: "ai" | "demo", text?: string }

export const runtime = "nodejs";
export const maxDuration = 30;

type ReviewBody = {
  score?: number;
  name?: string;
  good?: string[];
  improve?: string[];
  tips?: string[];
};

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ ok: true, source: "demo" });

  let body: ReviewBody = {};
  try {
    body = await req.json();
  } catch {
    /* pusty payload → demo */
  }

  const good = (body.good ?? []).slice(0, 6);
  const improve = (body.improve ?? []).slice(0, 6);
  const tips = (body.tips ?? []).slice(0, 5);
  if (good.length === 0 && improve.length === 0) {
    return Response.json({ ok: true, source: "demo" });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        max_tokens: 450,
        messages: [
          {
            role: "system",
            content:
              "Jesteś trenerem przygotowania motorycznego i dietetykiem. Piszesz krótki, tygodniowy komentarz dla podopiecznego (po polsku, 90–130 słów). " +
              "Zwracasz WYŁĄCZNIE zwykły tekst (bez markdown, bez nagłówków, bez list bullet). " +
              "Struktura: (1) jedno zdanie otwierające z oceną tygodnia, odniesienie do punktacji, " +
              "(2) dwa zdania o mocnych stronach i jedno-dwa o problemach, dokładnie wg podanych danych, " +
              "(3) zakończenie: trzy krótkie, konkretne zadania na nowy tydzień, każde w osobnej linii, z emoji 🎯 na początku. " +
              "Ton: konkretny, wspierający, zero korpomowy i zero wodoleczenia.",
          },
          {
            role: "user",
            content:
              `Wynik tygodnia: ${Number(body.score) || 0}/100. ` +
              (body.name ? `Podopieczny: ${body.name}. ` : "") +
              `Mocne strony: ${good.join(" | ")}. ` +
              `Problemy: ${improve.join(" | ")}. ` +
              `Sugerowane rekomendacje systemu: ${tips.join(" | ")}.`,
          },
        ],
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    const data = await res.json();
    const text = String(data.choices?.[0]?.message?.content ?? "").trim();
    if (!text) return Response.json({ ok: true, source: "demo" });
    return Response.json({ ok: true, source: "ai", text });
  } catch {
    // cichy fallback — panel pokaże wersję heurystyczną
    return Response.json({ ok: true, source: "demo" });
  }
}