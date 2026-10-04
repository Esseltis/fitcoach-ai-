// ============================================================
// 🧠 Inteligentny trener — warstwa heurystyczna (bez klucza AI).
//
// Cała logika działa w 100% lokalnie na danych z localStorage:
//   - trend wagi (regresja liniowa z ostatnich 21 dni),
//   - tygodniowy przegląd (posiłki / woda / sen / trening / raport),
//   - adaptacyjny cel kaloryczny (sugestia korekty),
//   - czerwone flagi podopiecznych dla trenera.
//
// Z OPENAI_API_KEY: /api/coach-review opakowuje te same dane
// w komentarz pisany przez AI (z cichym fallbackiem do heurystyki).
// ============================================================

import {
  getMeasurements,
  getReport,
  getDailyLogs,
  getWeeklyReport,
  getMoodByDate,
  getClientContent,
  getClientProfile,
  getDoneMeals,
  getWaterForDate,
  getBodyWeightKg,
  getClientsForTrainer,
  getGoalRequest,
  type ClientReport,
  type GoalRequest,
} from "./store";

const DAY_MS = 86_400_000;

const todayISO = () => new Date().toISOString().slice(0, 10);

function lastNDates(n: number): string[] {
  const now = Date.now();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(new Date(now - i * DAY_MS).toISOString().slice(0, 10));
  }
  return out;
}

// ---- Dzienny ślad klienta (panel) + raport tygodniowy ----
// Klient codziennie zapisuje w panelu sen/kroki (dziennik dnia), posiłki,
// wodę i samopoczucie — to jego „raport dzienny". A raz na 7 dni składa
// rozbudowany raport tygodniowy z rubrykami trenera. Ten agregat zastępuje
// stary ClientReport jako źródło prawdy dla coachingu.

export type DayTrace = {
  hasTrace: boolean; // czy w ostatnich 7 dniach został jakikolwiek ślad
  ageH: number | null; // godziny od najnowszego śladu
  sleepAvg: number | null; // śr. sen z dziennika (h)
  wellbeingAvg: number | null; // śr. samopoczucie 1–5 (z check-inu)
  stress: number | null; // stres 1–5 z rubryk raportu
  trainingDone: boolean | null; // czy trening zaliczony (rubryki/raport)
  adherence: number | null; // przestrzeganie planu 0–100 (%)
};

const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function getDayTrace(email: string): DayTrace {
  const dates = lastNDates(7);
  const logs = getDailyLogs(email);
  const moods = getMoodByDate(email);
  const weekly = getWeeklyReport(email);
  const legacy = getReport(email); // stary raport dzienny (archiwum)

  // --- najnowszy ślad (wpisy w dzienniku mają tylko datę → koniec dnia) ---
  let lastAt = -Infinity;
  const sleeps: number[] = [];
  const wellbeing: number[] = [];
  for (const d of dates) {
    const log = logs[d];
    if (log) {
      lastAt = Math.max(lastAt, Date.parse(`${d}T23:00:00`));
      const s = Number(log.values.sleepHours);
      if (Number.isFinite(s) && s > 0) sleeps.push(s);
    }
    const mood = moods[d];
    if (mood && (mood.satiety > 0 || mood.motivation > 0)) {
      wellbeing.push(
        Math.max(
          1,
          Math.min(5, Math.round((mood.satiety + mood.motivation) / 2) || 3)
        )
      );
    }
  }
  if (weekly) lastAt = Math.max(lastAt, Date.parse(weekly.submittedAt));
  if (legacy) lastAt = Math.max(lastAt, Date.parse(legacy.submittedAt));

  const hasTrace = Number.isFinite(lastAt);
  const ageH = hasTrace
    ? Math.max(0, Math.round((Date.now() - lastAt) / 3_600_000))
    : null;

  const num = (v: unknown): number | null =>
    v !== "" && v !== null && typeof v !== "undefined" && Number.isFinite(Number(v))
      ? Number(v)
      : null;

  // rubryki trenera żyją w raporcie tygodniowym (starszy zapis: raport dzienny)
  const stress = num(weekly?.values.stress) ?? num(legacy?.values.stress);
  const adherence = num(weekly?.values.adherence) ?? num(legacy?.values.adherence);
  const tDone =
    typeof weekly?.values.trainingDone === "boolean"
      ? weekly.values.trainingDone
      : typeof legacy?.values.trainingDone === "boolean"
      ? legacy.values.trainingDone
      : null;

  const avgOf = (arr: number[]) =>
    arr.length
      ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
      : null;

  return {
    hasTrace,
    ageH,
    sleepAvg: avgOf(sleeps),
    wellbeingAvg: avgOf(wellbeing),
    stress,
    trainingDone: tDone,
    adherence: adherence !== null ? clamp100(adherence) : null,
  };
}

// ---- Nawodnienie: cel (jak na raporcie: wytyczne lub wzrost z masy) ----

export function getWaterGoal(email: string): number {
  const content = getClientContent(email);
  const override = Number(content.guidelines?.waterGlasses);
  if (Number.isFinite(override) && override > 0) {
    return Math.min(20, Math.round(override));
  }
  const kg = getBodyWeightKg(email, content.nutrition.weight);
  return kg ? Math.max(4, Math.min(15, Math.round((kg * 31) / 250))) : 8;
}

// ---- Trend wagi ----

export type WeightPoint = { date: string; kg: number };

export type WeightTrend = {
  points: WeightPoint[];
  delta: number; // ostatni − pierwszy w oknie
  perWeek: number; // nachylenie regresji liniowej [kg/tydz.]
  days: number; // rozpiętość okna w dniach
  verdict: "spada" | "stoi" | "rośnie" | "brak danych";
};

export function getWeightSeries(email: string, days = 21): WeightPoint[] {
  const cutoff = new Date(Date.now() - days * DAY_MS)
    .toISOString()
    .slice(0, 10);
  return getMeasurements(email)
    .filter((m) => m.date >= cutoff)
    .map((m) => ({
      date: m.date,
      kg: parseFloat(String(m.values?.weight ?? "").replace(",", ".")),
    }))
    .filter((p) => Number.isFinite(p.kg) && p.kg > 0)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function getWeightTrend(email: string): WeightTrend {
  const points = getWeightSeries(email, 21);
  if (points.length < 2) {
    return { points, delta: 0, perWeek: 0, days: 0, verdict: "brak danych" };
  }
  const t0 = Date.parse(points[0].date);
  const xs = points.map((p) => (Date.parse(p.date) - t0) / DAY_MS);
  const ys = points.map((p) => p.kg);
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) * (xs[i] - mx);
  }
  const slope = den > 0 ? num / den : 0; // kg/dzień
  const perWeek = Math.round(slope * 7 * 10) / 10;
  const delta = Math.round((ys[n - 1] - ys[0]) * 10) / 10;
  const days = Math.round(xs[n - 1]);
  const verdict =
    Math.abs(perWeek) < 0.15 ? "stoi" : perWeek < 0 ? "spada" : "rośnie";
  return { points, delta, perWeek, days, verdict };
}

// ---- Tygodniowy przegląd ----

export type ReviewItem = { tone: "good" | "warn" | "bad"; text: string };

export type WeeklyReview = {
  score: number; // 0–100
  empty: boolean; // brak jakichkolwiek śladów aktywności w tygodniu
  activeDays: number; // dni z jakimkolwiek śladem (posiłek lub woda)
  period: { from: string; to: string };
  meals: { done: number; possible: number; pct: number };
  water: { avg: number; goal: number; pct: number };
  weight: WeightTrend;
  report: ClientReport | null;
  hasTrace: boolean; // czy w tygodniu został dzienny ślad w panelu / raport
  reportAgeH: number | null;
  adherence: number | null;
  good: ReviewItem[];
  improve: ReviewItem[];
  tips: string[];
};

export function buildWeeklyReview(email: string): WeeklyReview {
  const content = getClientContent(email);
  const dates = lastNDates(7);
  const expected = Math.max(1, content.diet.meals.length);
  const goal = getWaterGoal(email);

  let mealsDone = 0;
  let waterSum = 0;
  let waterDays = 0;
  const activeDates = new Set<string>();
  for (const d of dates) {
    const m = getDoneMeals(email, d).length;
    mealsDone += Math.min(m, expected);
    if (m > 0) activeDates.add(d);
    const w = getWaterForDate(email, d);
    if (w > 0) {
      waterSum += w;
      waterDays++;
      activeDates.add(d);
    }
  }
  const activeDays = activeDates.size;
  const possible = expected * 7;
  const mealsPct = Math.min(100, Math.round((mealsDone / possible) * 100));
  const avgWater = waterDays ? Math.round((waterSum / waterDays) * 10) / 10 : 0;
  const waterPct = Math.min(100, Math.round((avgWater / goal) * 100));

  const report = getReport(email); // archiwalny raport dzienny
  const trace = getDayTrace(email);
  const reportAgeH = trace.ageH;
  const adherence = trace.adherence;
  const weight = getWeightTrend(email);

  const empty = activeDays === 0 && !trace.hasTrace;

  // ---- Punktacja (0–100) ----
  let score = 0;
  score += Math.round(mealsPct * 0.35); // 35
  score += Math.round(Math.min(1, avgWater / goal) * 15); // 15
  score += trace.hasTrace
    ? reportAgeH !== null && reportAgeH <= 48
      ? 15
      : 6
    : 0; // 15
  score += trace.trainingDone === true ? 20 : trace.hasTrace ? 8 : 0; // 20
  if (trace.sleepAvg !== null)
    score += trace.sleepAvg >= 7 ? 5 : trace.sleepAvg >= 6 ? 3 : 1; // 5
  if (trace.stress !== null)
    score += trace.stress <= 2 ? 5 : trace.stress === 3 ? 3 : trace.stress >= 4 ? 1 : 0; // 5
  if (trace.wellbeingAvg !== null)
    score +=
      trace.wellbeingAvg >= 4
        ? 5
        : trace.wellbeingAvg === 3
        ? 3
        : trace.wellbeingAvg > 0 && trace.wellbeingAvg <= 2
        ? 1
        : 0; // 5
  score = Math.max(0, Math.min(100, score));

  // ---- Bloki: co poszło dobrze / do poprawy ----
  const good: ReviewItem[] = [];
  const improve: ReviewItem[] = [];

  if (mealsPct >= 80)
    good.push({ tone: "good", text: `Posiłki: ${mealsPct}% planu w tym tygodniu.` });
  else if (mealsPct < 60)
    improve.push({
      tone: "bad",
      text: `Posiłki: tylko ${mealsPct}% planu — reszta dnia „ucieka".`,
    });
  else if (mealsPct < 80)
    improve.push({ tone: "warn", text: `Posiłki: ${mealsPct}% planu — bliżej niż dalej.` });

  if (waterPct >= 90)
    good.push({ tone: "good", text: `Nawodnienie: śr. ${avgWater} szkl. przy celu ${goal}.` });
  else if (waterPct < 70)
    improve.push({
      tone: "warn",
      text: `Woda: średnio ${avgWater} z ${goal} szkl. dziennie.`,
    });

  if (trace.hasTrace && reportAgeH !== null && reportAgeH <= 24)
    good.push({
      tone: "good",
      text: "Dzienny ślad na bieżąco — trener ma pełny obraz tygodnia.",
    });
  else if (!trace.hasTrace || (reportAgeH !== null && reportAgeH > 48))
    improve.push({
      tone: "bad",
      text: "Brak świeżego śladu w panelu — regeneracja i stres bez echa.",
    });

  if (trace.trainingDone === true)
    good.push({ tone: "good", text: "Trening zaliczony zgodnie z planem." });
  else if (trace.trainingDone === false)
    improve.push({ tone: "warn", text: "Pominięty trening — odrobienie go to priorytet." });

  if (adherence !== null) {
    if (adherence >= 85) good.push({ tone: "good", text: `Dyscyplina: ${adherence}% realizacji planu.` });
    else if (adherence < 70) improve.push({ tone: "bad", text: `Realizacja planu spadła do ${adherence}%.` });
    else if (adherence < 85) improve.push({ tone: "warn", text: `Realizacja planu ${adherence}% — jest nad czym pracować.` });
  }

  if (trace.sleepAvg !== null) {
    if (trace.sleepAvg < 6.5)
      improve.push({
        tone: "warn",
        text: `Sen: śr. ${trace.sleepAvg} h — poniżej minimum regeneracji.`,
      });
    else if (trace.sleepAvg >= 7)
      good.push({ tone: "good", text: `Sen ${trace.sleepAvg} h — trzymasz regenerację.` });
  }
  if (trace.stress !== null && trace.stress >= 4)
    improve.push({ tone: "warn", text: `Stres ${trace.stress}/5 — wrzuć 10 min oddechu lub spaceru.` });
  if (report?.values.alcoholSweets === true)
    improve.push({ tone: "warn", text: "Alkohol/słodycze w dniu raportu — jednorazowo, bez paniki." });

  if (weight.verdict === "stoi" && weight.days >= 8)
    improve.push({ tone: "warn", text: `Waga stoi (${weight.days} dni) — rozważ korektę celu.` });
  else if (weight.verdict === "spada" && weight.perWeek < -0.8)
    improve.push({ tone: "warn", text: `Waga spada szybko (${weight.perWeek} kg/tydz.) — pilnuj białka.` });
  else if (weight.verdict === "spada")
    good.push({ tone: "good", text: `Trend wagi: ${weight.perWeek} kg/tydz. — jedziesz zgodnie z celem.` });
  else if (weight.verdict === "rośnie" && weight.perWeek > 0.5)
    improve.push({ tone: "warn", text: `Waga rośnie ${weight.perWeek} kg/tydz. — zwolnij tempo.` });

  if (good.length === 0)
    good.push({ tone: "good", text: "Zaczynasz — pierwszy ślad w danych to już krok do przodu." });
  if (improve.length === 0)
    improve.push({ tone: "good", text: "Brak zastrzeżeń — tydzień bez potknięć." });

  // ---- 3 konkretne rekomendacje (priorytet: raport → dieta → woda → sen → cel) ----
  const tips: string[] = [];
  const addTip = (t: string) => {
    if (tips.length < 3 && !tips.includes(t)) tips.push(t);
  };
  if (!trace.hasTrace || (reportAgeH !== null && reportAgeH > 48))
    addTip("Zapisuj dzień w panelu (sen, woda, samopoczucie) — bez tego nie widzę regeneracji.");
  if (mealsPct < 70)
    addTip("Ustal 2 posiłki na stałe (np. śniadanie i obiad) — resztę dokładasz po fakcie.");
  if (waterPct < 70) addTip(`Postaw butelkę 1 l przy biurku — cel to ${goal} szkl. wody dziennie.`);
  if (trace.sleepAvg !== null && trace.sleepAvg < 6.5)
    addTip("Sen: godzina snu do przodu przez 3 noce — regeneracja wraca najpierw.");
  if (trace.stress !== null && trace.stress >= 4)
    addTip("10 minut oddechu albo spacer bez telefonu — stres 4+ zjada apetyt i sen.");
  if (weight.verdict === "stoi" && weight.days >= 8)
    addTip("Waga stoi 8+ dni — zaproponuj trenerowi korektę celu w sekcji „Adaptacyjny cel”.");
  if (trace.trainingDone === false) addTip("Odrobienie pominiętego treningu — wpisz je w kalendarz na najbliższe 48 h.");
  if (tips.length === 0) addTip("Utrzymaj tempo: ten sam plan, ta sama pora, zero kombinowania.");
  if (tips.length < 2) addTip("Zmierz się i zważ jutro rano — dane bez pomiarów nie robią roboty.");

  return {
    score,
    empty,
    activeDays,
    period: { from: dates[0], to: dates[dates.length - 1] },
    meals: { done: mealsDone, possible, pct: mealsPct },
    water: { avg: avgWater, goal, pct: waterPct },
    weight,
    report,
    hasTrace: trace.hasTrace,
    reportAgeH,
    adherence,
    good: good.slice(0, 4),
    improve: improve.slice(0, 4),
    tips: tips.slice(0, 3),
  };
}

// ---- Adaptacyjny cel kaloryczny ----

export type CalorieSuggestion = {
  current: number;
  suggested: number;
  delta: number;
  needsChange: boolean;
  reason: string;
  alternative: string;
  goalLabel: string;
};

export function getCalorieSuggestion(email: string): CalorieSuggestion {
  const content = getClientContent(email);
  // źródło prawdy bilansu dnia ("Pozostało do zjedzenia") = diet.targetCalories;
  // nutrition.calories towarzyszy mu przy podziale makro.
  const current =
    parseInt(content.diet.targetCalories, 10) ||
    parseInt(content.nutrition.calories, 10) ||
    0;
  const profile = getClientProfile(email);
  const goalRaw = `${profile?.goal ?? ""} ${content.nutrition.balanceType ?? ""}`.toLowerCase();
  const isCut = /redukc|chudn|utrat|zbie|redukcj/.test(goalRaw);
  const isBulk = /masa|przyrost|budow|nabier/.test(goalRaw);
  const goalLabel = isCut ? "Redukcja" : isBulk ? "Przyrost masy" : "Utrzymanie";

  const base: CalorieSuggestion = {
    current,
    suggested: current,
    delta: 0,
    needsChange: false,
    reason: "",
    alternative: "",
    goalLabel,
  };

  const adherence = getDayTrace(email).adherence ?? 100;
  const trend = getWeightTrend(email);

  if (trend.points.length < 3 || trend.days < 8) {
    return {
      ...base,
      reason:
        "Za mało pomiarów — waż się codziennie rano przez ~10 dni, wtedy podpowiedź będzie pewna.",
    };
  }
  if (adherence < 70) {
    return {
      ...base,
      reason: `Realizacja planu to ${adherence}% — najpierw ustabilizuj nawyki, korekta kalorii ma sens przy ≥80%.`,
    };
  }

  const make = (delta: number, reason: string, alternative = ""): CalorieSuggestion => ({
    current,
    suggested: Math.max(1200, current + delta),
    delta,
    needsChange: true,
    reason,
    alternative,
    goalLabel,
  });

  if (isCut) {
    if (trend.perWeek < -0.6)
      return make(
        150,
        `Spadasz ${Math.abs(trend.perWeek)} kg/tydz. — za szybko jak na redukcję, dokładamy kalorie, żeby nie zjeść masy mięśniowej.`
      );
    if (Math.abs(trend.perWeek) < 0.15)
      return make(
        150,
        `Waga stoi od ${trend.days} dni mimo trzymania planu — organizm się zaadaptował, czas na reset metaboliczny.`,
        "Alternatywnie: dopisz ~2000 kroków dziennie zamiast podbijać kalorie."
      );
    if (trend.perWeek > 0.4)
      return make(
        -150,
        `Przy redukcji waga rośnie ${trend.perWeek} kg/tydz. — lekko zejdziemy z kalorii i wróci tempo.`
      );
    return {
      ...base,
      reason: `Trend wagi (${trend.perWeek} kg/tydz.) mieści się w planie redukcji — cel bez zmian.`,
    };
  }

  if (isBulk) {
    if (trend.perWeek > 0.6)
      return make(
        -100,
        `Przyrost ${trend.perWeek} kg/tydz. to za dużo naraz — więcej idzie w tłuszcz niż w mięśnie.`
      );
    if (trend.perWeek < -0.15)
      return make(
        200,
        `Przy celu masowym waga spada ${trend.perWeek} kg/tydz. — dokładamy paliwa.`
      );
    return {
      ...base,
      reason: `Tempo przyrostu (${trend.perWeek} kg/tydz.) w punkt — pracuj dalej z tym samym celem.`,
    };
  }

  // Utrzymanie
  if (trend.perWeek > 0.6)
    return make(-100, `Waga rośnie ${trend.perWeek} kg/tydz. przy celu utrzymania — lekka korekta w dół.`);
  if (trend.perWeek < -0.6)
    return make(150, `Waga spada ${trend.perWeek} kg/tydz. przy celu utrzymania — dokładamy, żeby nie chudnąć bez potrzeby.`);
  return {
    ...base,
    reason: `Waga trzyma się w zakresie (${trend.perWeek} kg/tydz.) — cel bez zmian.`,
  };
}

// ---- Czerwone flagi (panel trenera) ----

export type RedFlag = { severity: "high" | "med" | "low"; text: string };

export function getClientRedFlags(email: string): RedFlag[] {
  const flags: RedFlag[] = [];
  const trace = getDayTrace(email);
  const report = getReport(email); // archiwalny raport dzienny

  if (!trace.hasTrace) {
    flags.push({
      severity: "high",
      text: "Brak śladów — podopieczny nic nie zapisuje w panelu ani nie raportuje.",
    });
  } else {
    const ageH = trace.ageH ?? 0;
    if (ageH > 72)
      flags.push({
        severity: "high",
        text: `Brak wpisów od ${Math.floor(ageH / 24)} dni.`,
      });
    else if (ageH > 36)
      flags.push({ severity: "med", text: "Dziś jeszcze nie zapisał dnia w panelu." });

    const adherence = trace.adherence;
    if (adherence !== null) {
      if (adherence < 60)
        flags.push({ severity: "high", text: `Realizacja planu ${adherence}% — pilna interwencja.` });
      else if (adherence < 80)
        flags.push({ severity: "med", text: `Realizacja planu ${adherence}%.` });
    }
    if (trace.trainingDone === false)
      flags.push({ severity: "med", text: "Zaznaczył pominięty trening w raporcie." });
    if (report?.values.alcoholSweets === true)
      flags.push({ severity: "low", text: "Alkohol / słodycze w dniu raportu." });

    const sleep = trace.sleepAvg;
    if (sleep !== null && sleep < 6)
      flags.push({ severity: "med", text: `Sen tylko ${sleep} h (średnia z tygodnia).` });
    const stress = trace.stress;
    if (stress !== null && stress >= 4)
      flags.push({ severity: "low", text: `Wysoki stres (${stress}/5).` });
    const wb = trace.wellbeingAvg;
    if (wb !== null && wb <= 2)
      flags.push({ severity: "med", text: `Słabe samopoczucie (${wb}/5).` });
  }

  const trend = getWeightTrend(email);
  if (trend.verdict === "spada" && trend.perWeek < -0.8)
    flags.push({ severity: "med", text: `Szybki spadek wagi (${trend.perWeek} kg/tydz.).` });
  else if (trend.verdict === "rośnie" && trend.perWeek > 0.6)
    flags.push({ severity: "low", text: `Waga rośnie ${trend.perWeek} kg/tydz.` });

  const req = getGoalRequest(email);
  if (req && req.status === "pending")
    flags.push({
      severity: "high",
      text: `Propozycja celu: ${req.current} → ${req.suggested} kcal — czeka na decyzję.`,
    });

  return flags;
}

export type AttentionEntry = {
  email: string;
  name: string;
  flags: RedFlag[];
  goalRequest: GoalRequest | null;
};

const SEVERITY_RANK = { high: 3, med: 2, low: 1 } as const;

/** Podopieczni „do uwagi" — posortowani od najpilniejszego. */
export function getAttentionList(trainerId: string): AttentionEntry[] {
  return getClientsForTrainer(trainerId)
    .map((c) => ({
      email: c.email,
      name: c.name,
      flags: getClientRedFlags(c.email),
      goalRequest: getGoalRequest(c.email),
    }))
    .filter((e) => e.flags.length > 0)
    .sort((a, b) => {
      const ra = Math.max(0, ...a.flags.map((f) => SEVERITY_RANK[f.severity]));
      const rb = Math.max(0, ...b.flags.map((f) => SEVERITY_RANK[f.severity]));
      if (rb !== ra) return rb - ra;
      return b.flags.length - a.flags.length;
    });
}