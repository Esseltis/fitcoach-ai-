// Analiza zdjęcia posiłku: kcal + makro + rozpisany skład.
//
// - OPENAI_API_KEY ustawiony (np. w Vercel → Environment Variables)
//   → prawdziwe AI (gpt-4o-mini vision) czyta zdjęcie.
// - brak klucza → tryb demo: wycena z lokalnej bazy produktów na podstawie
//   nazwy dania podanej przez podopiecznego (etykieta "szacunek").
// W obu przypadkach odpowiedź ma kształt:
// { ok, source: "ai" | "demo", name, recipe: string[], kcal, protein, carbs, fat }

export const runtime = "nodejs";
export const maxDuration = 30;

type AnalyzeBody = {
  image?: string;
  category?: string;
  hint?: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  sniadanie: "Śniadanie",
  ii_sniadanie: "II śniadanie",
  obiad: "Obiad",
  podwieczorek: "Podwieczorek",
  kolacja: "Kolacja",
};

// ---- Tryb demo: baza produktów (wartości na typową porcję) ----

type DishDef = {
  label: string;
  keys: string[];
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

const DISH_DB: DishDef[] = [
  { label: "Pierś z kurczaka", keys: ["kurczak", "piers", "grillowan"], kcal: 330, protein: 62, carbs: 0, fat: 8 },
  { label: "Indyk", keys: ["indyk"], kcal: 300, protein: 55, carbs: 0, fat: 7 },
  { label: "Ryż", keys: ["ryz"], kcal: 250, protein: 5, carbs: 55, fat: 1 },
  { label: "Makaron", keys: ["makaron", "spaghetti"], kcal: 280, protein: 10, carbs: 55, fat: 2 },
  { label: "Ziemniaki", keys: ["ziemniak"], kcal: 220, protein: 5, carbs: 45, fat: 1 },
  { label: "Mięso mielone / kotlet", keys: ["mielony", "kotlet"], kcal: 400, protein: 25, carbs: 15, fat: 25 },
  { label: "Łosoś", keys: ["losos"], kcal: 350, protein: 34, carbs: 0, fat: 22 },
  { label: "Tuńczyk", keys: ["tunczyk"], kcal: 150, protein: 34, carbs: 0, fat: 1 },
  { label: "Wołowina / stek", keys: ["wolow", "stek"], kcal: 380, protein: 40, carbs: 0, fat: 24 },
  { label: "Wieprzowina / schabowy", keys: ["wieprzow", "schabow", "karkow"], kcal: 450, protein: 30, carbs: 20, fat: 30 },
  { label: "Ryba biała", keys: ["ryba", "dorsz"], kcal: 250, protein: 45, carbs: 0, fat: 6 },
  { label: "Pizza", keys: ["pizza"], kcal: 800, protein: 30, carbs: 90, fat: 35 },
  { label: "Burger", keys: ["burger", "hamburger"], kcal: 700, protein: 40, carbs: 50, fat: 40 },
  { label: "Pierogi", keys: ["pierog"], kcal: 500, protein: 15, carbs: 70, fat: 15 },
  { label: "Naleśniki", keys: ["nalesnik"], kcal: 450, protein: 15, carbs: 55, fat: 20 },
  { label: "Jajka / omlet / jajecznica", keys: ["omlet", "jajeczn", "jajka"], kcal: 270, protein: 20, carbs: 2, fat: 20 },
  { label: "Twaróg / serek", keys: ["twarog", "ser bialy", "serek"], kcal: 220, protein: 25, carbs: 8, fat: 10 },
  { label: "Ser żółty", keys: ["ser zolty"], kcal: 200, protein: 15, carbs: 2, fat: 15 },
  { label: "Owsianka", keys: ["owsiank"], kcal: 350, protein: 12, carbs: 55, fat: 8 },
  { label: "Musli / granola", keys: ["musli", "granola"], kcal: 350, protein: 10, carbs: 55, fat: 10 },
  { label: "Kanapka / chleb", keys: ["kanapk", "bulk", "chleb", "tost"], kcal: 350, protein: 15, carbs: 40, fat: 14 },
  { label: "Sałatka", keys: ["salatk"], kcal: 250, protein: 8, carbs: 15, fat: 15 },
  { label: "Surówka / warzywa", keys: ["surowk", "warzyw"], kcal: 110, protein: 3, carbs: 13, fat: 5 },
  { label: "Zupa", keys: ["zurek", "pomidorow", "krupnik", "zupa"], kcal: 250, protein: 10, carbs: 25, fat: 10 },
  { label: "Bigos", keys: ["bigos"], kcal: 350, protein: 15, carbs: 20, fat: 22 },
  { label: "Gołąbki / gulasz", keys: ["golabk", "gulasz"], kcal: 400, protein: 25, carbs: 30, fat: 22 },
  { label: "Kebab", keys: ["kebab"], kcal: 700, protein: 45, carbs: 60, fat: 30 },
  { label: "Sushi", keys: ["sushi"], kcal: 400, protein: 20, carbs: 55, fat: 10 },
  { label: "Frytki", keys: ["frytk"], kcal: 350, protein: 5, carbs: 45, fat: 18 },
  { label: "Placki / zapiekanka", keys: ["placek", "zapiekank", "gofry"], kcal: 450, protein: 12, carbs: 55, fat: 20 },
  { label: "Kluski / pyzy", keys: ["klusk", "pyz", "leniwe"], kcal: 400, protein: 12, carbs: 60, fat: 10 },
  { label: "Kasza", keys: ["kasz"], kcal: 250, protein: 7, carbs: 50, fat: 2 },
  { label: "Curry / pilaw", keys: ["curry", "pilaw", "biryani"], kcal: 550, protein: 30, carbs: 60, fat: 20 },
  { label: "Tortilla / wrap", keys: ["tortilla", "wrap"], kcal: 450, protein: 25, carbs: 45, fat: 18 },
  { label: "Koktajl / odżywka białkowa", keys: ["koktajl", "odzywk", "bialk", "protein shake"], kcal: 150, protein: 25, carbs: 8, fat: 2 },
  { label: "Jogurt / kefir", keys: ["jogurt", "kefir"], kcal: 150, protein: 10, carbs: 15, fat: 5 },
  { label: "Owoce", keys: ["banan", "owoc", "jablk", "gruszk"], kcal: 100, protein: 1, carbs: 23, fat: 0 },
  { label: "Ciasto / słodycze", keys: ["ciasto", "tort", "czekolad", "slodycz", "lody"], kcal: 350, protein: 5, carbs: 45, fat: 18 },
  { label: "Piwo", keys: ["piwo"], kcal: 200, protein: 1, carbs: 17, fat: 0 },
  { label: "Wino", keys: ["wino"], kcal: 150, protein: 0, carbs: 4, fat: 0 },
  { label: "Napoje słodzone", keys: ["napoj", "sok"], kcal: 120, protein: 1, carbs: 28, fat: 0 },
];

// Normalizacja bez diakrytyków (ł nie rozkłada się w NFD — wymaga osobnej podmiany)
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function demoEstimate(hint?: string) {
  const text = norm(hint ?? "");
  const matched = DISH_DB.filter((d) => d.keys.some((k) => text.includes(k))).slice(
    0,
    6
  );
  const base = matched.length
    ? matched.reduce(
        (acc, d) => ({
          kcal: acc.kcal + d.kcal,
          protein: acc.protein + d.protein,
          carbs: acc.carbs + d.carbs,
          fat: acc.fat + d.fat,
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      )
    : { kcal: 550, protein: 30, carbs: 55, fat: 22 };

  const name = hint?.trim() ? hint.trim() : "Posiłek spoza planu";
  const recipe = [
    `Porcja ok. 350 g: ${name}.`,
    matched.length
      ? `Wyceniono z bazy: ${matched.map((d) => d.label).join(", ")}.`
      : "Brak dopasowania w bazie — zastosowano średnią porcję (550 kcal).",
    "⚡ Wycena testowa (bez analizy zdjęcia). Dodaj klucz OPENAI_API_KEY, a AI będzie czytać samo zdjęcie.",
  ];

  return {
    ok: true as const,
    source: "demo" as const,
    name,
    recipe,
    kcal: Math.min(2500, Math.round(base.kcal)),
    protein: Math.round(base.protein),
    carbs: Math.round(base.carbs),
    fat: Math.round(base.fat),
  };
}

// ---- Prawdziwe AI (wymaga OPENAI_API_KEY) ----

async function analyzeWithOpenAI(
  image: string,
  hint: string | undefined,
  categoryLabel: string,
  key: string
) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "Jesteś dietetykiem sportowym. Oceniasz zdjęcie jednej porcji dania i zwracasz WYŁĄCZNIE JSON bez markdown w formacie: " +
            '{"name":"nazwa dania po polsku","recipe":["składnik – przybliżona ilość", ...],"kcal":0,"protein":0,"carbs":0,"fat":0}. ' +
            "Wszystkie wartości dotyczą CAŁEJ porcji ze zdjęcia: kcal i makroskładniki w gramach, liczby całkowite. " +
            "recipe to 3–8 składników z ilościami (np. \"pierś z kurczaka – 150 g\"). Odpowiadasz po polsku.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Posiłek w kategorii: ${categoryLabel}. ` +
                (hint ? `Podana przez użytkownika nazwa: ${hint}. ` : "") +
                "Oceń wszystko, co widać na talerzu/pojemniku.",
            },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(25000),
  });

  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Brak odpowiedzi AI");
  const parsed = JSON.parse(content);

  const num = (v: unknown, max: number) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0;
  };
  const recipe = Array.isArray(parsed.recipe)
    ? parsed.recipe.filter((r: unknown) => typeof r === "string").slice(0, 8)
    : [];

  return {
    ok: true as const,
    source: "ai" as const,
    name:
      typeof parsed.name === "string" && parsed.name.trim()
        ? parsed.name.trim().slice(0, 80)
        : "Posiłek",
    recipe: recipe as string[],
    kcal: num(parsed.kcal, 5000),
    protein: num(parsed.protein, 500),
    carbs: num(parsed.carbs, 500),
    fat: num(parsed.fat, 500),
  };
}

export async function POST(req: Request) {
  let body: AnalyzeBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Nieprawidłowe zapytanie." }, { status: 400 });
  }

  if (!body.image || !body.image.startsWith("data:image/")) {
    return Response.json(
      { ok: false, error: "Brak zdjęcia w zapytaniu." },
      { status: 400 }
    );
  }

  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      const result = await analyzeWithOpenAI(
        body.image,
        body.hint,
        CATEGORY_LABELS[body.category ?? ""] ?? "Posiłek",
        key
      );
      return Response.json(result);
    } catch (err) {
      // AI niedostępne — nie blokujemy użytkownika, schodzimy do trybu demo.
      console.error("analyze-meal: OpenAI error:", err);
      const fallback = demoEstimate(body.hint);
      fallback.recipe.push(
        "⚠️ AI chwilowo niedostępne — zwrócono wycenę z bazy produktów."
      );
      return Response.json(fallback);
    }
  }

  return Response.json(demoEstimate(body.hint));
}