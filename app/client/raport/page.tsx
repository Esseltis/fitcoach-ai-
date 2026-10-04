"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getDailyLogs,
  getWeeklyReportStatus,
  saveWeeklyReport,
  addMeasurement,
  MEASUREMENT_METRICS,
  getProgressPhotos,
  addProgressPhoto,
  getTrainerReportFields,
  getClientTrainerId,
  getClientContent,
  getDoneMeals,
  getWaterForDate,
  getMoodByDate,
  getMeasurements,
  getBodyWeightKg,
  getActivities,
  type ReportConfigField,
  type ProgressPhoto,
} from "@/lib/store";

// Raport TYGODNIOWY — jedyny formularz raportowy.
// Codzienny ślad klienta zbiera panel (posiłki, woda, samopoczucie, sen,
// kroki, aktywności, trening) i sam przechodzi do trenera; tutaj klient
// raz na 7 dni składa rozbudowany raport: auto-podsumowanie tygodnia,
// pomiary sylwetki, zdjęcia, rubryki wymagane przez trenera i uwagi.

const todayISO = () => new Date().toISOString().slice(0, 10);
const DAY_MS = 86_400_000;

function lastNDates(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10));
  }
  return out;
}

// Zmniejsz zdjęcie (max 900 px) — jak na stronie zdjęć
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Nie udało się odczytać pliku."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Nie udało się wczytać obrazu."));
      img.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Przeglądarka nie obsługuje przetwarzania obrazu."));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

// Statystyki tygodnia liczone z codziennego śladu w panelu
type WeekStats = {
  daysLogged: number; // dni z czymkolwiek w panelu
  mealsDays: number; // dni z odhaczonymi posiłkami
  avgWater: number; // śr. szklanek / dzień
  avgSleep: number; // śr. godzin snu
  avgSteps: number; // śr. kroków
  avgWellbeing: number; // śr. samopoczucia 1–5
  kcalWeek: number; // kcal z aktywności w tygodniu
  weight: number; // ostatnia waga (kg)
  weightDelta: number | null; // różnica vs sprzed ~7 dni
};

const avg = (nums: number[]) =>
  nums.length
    ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
    : 0;

export default function ClientReportPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fields, setFields] = useState<ReportConfigField[]>([]);
  const [fValues, setFValues] = useState<Record<string, string | number | boolean>>({});
  const [stats, setStats] = useState<WeekStats | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; at: string }>({
    text: "",
    at: "",
  });

  // ---- Raport tygodniowy ----
  const [weeklyDue, setWeeklyDue] = useState(false);
  const [overdueDays, setOverdueDays] = useState(0);
  const [nextDueAt, setNextDueAt] = useState<string | null>(null);
  const [lastWeeklyAt, setLastWeeklyAt] = useState<string | null>(null);
  const [mValues, setMValues] = useState<Record<string, string>>({});
  const [weekGood, setWeekGood] = useState("");
  const [weekImproved, setWeekImproved] = useState("");
  const [weekQuestions, setWeekQuestions] = useState("");
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [photoErr, setPhotoErr] = useState("");
  const [weeklyErr, setWeeklyErr] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const weekDates = lastNDates(7);
  const weekStart = weekDates[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = window.localStorage.getItem("fitcoach_client_logged_in");
    const storedEmail = window.localStorage.getItem("fitcoach_client_email");
    if (loggedIn !== "true" || !storedEmail) {
      router.replace("/login");
      return;
    }
    setEmail(storedEmail);
    const trainerId = getClientTrainerId();
    const defs = trainerId ? getTrainerReportFields(trainerId) : [];
    setFields(defs);

    const content = getClientContent(storedEmail);
    const cats: string[] = content.diet.meals.map((m) => m.category ?? "").filter((c) => c !== "");
    const logs = getDailyLogs(storedEmail);
    const moods = getMoodByDate(storedEmail);

    // --- Codzienny ślad z panelu → statystyki tygodnia ---
    let mealsDays = 0;
    let activeDays = 0;
    const waters: number[] = [];
    const sleeps: number[] = [];
    const steps: number[] = [];
    const wellbeings: number[] = [];
    let kcalWeek = 0;
    let logged = 0;
    for (const d of weekDates) {
      const done = getDoneMeals(storedEmail, d).filter((c) => cats.includes(c));
      const w = getWaterForDate(storedEmail, d);
      const mood = moods[d];
      const log = logs[d];
      const acts = getActivities(storedEmail, d);
      const kcal = acts.reduce((s, a) => s + (a.kcal || 0), 0);
      kcalWeek += kcal;
      if (done.length > 0) mealsDays++;
      if (w > 0) waters.push(w);
      if (log || done.length > 0 || w > 0 || mood || acts.length > 0) logged++;
      if (done.length > 0 || w > 0 || mood || acts.length > 0 || log) activeDays++;
      const sl = Number(log?.values?.sleepHours);
      if (Number.isFinite(sl) && sl > 0) sleeps.push(sl);
      const st = Number(log?.values?.steps);
      if (Number.isFinite(st) && st > 0) steps.push(st);
      if (mood && (mood.satiety > 0 || mood.motivation > 0)) {
        wellbeings.push(
          Math.max(1, Math.min(5, Math.round((mood.satiety + mood.motivation) / 2) || 3))
        );
      }
    }

    // Waga: ostatni pomiar + pomiar sprzed tygodnia (delta)
    const ms = getMeasurements(storedEmail);
    let weight = 0;
    let prev = 0;
    for (let i = ms.length - 1; i >= 0; i--) {
      const w = parseFloat(String(ms[i].values?.weight ?? "").replace(",", "."));
      if (!Number.isFinite(w) || w <= 0) continue;
      if (!weight) weight = w;
      if (ms[i].date < weekStart) {
        prev = w;
        break;
      }
    }
    if (!weight) weight = getBodyWeightKg(storedEmail, content.nutrition.weight);

    setStats({
      daysLogged: logged,
      mealsDays,
      avgWater: avg(waters),
      avgSleep: avg(sleeps),
      avgSteps: avg(steps),
      avgWellbeing: avg(wellbeings),
      kcalWeek,
      weight,
      weightDelta: weight && prev ? Math.round((weight - prev) * 10) / 10 : null,
    });

    setFeedback(content.feedback ?? { text: "", at: "" });

    // status raportu tygodniowego + zdjęcia sylwetki
    const st = getWeeklyReportStatus(storedEmail);
    setWeeklyDue(st.due);
    setOverdueDays(st.overdueDays);
    setNextDueAt(st.nextDueAt);
    setLastWeeklyAt(st.last?.submittedAt ?? null);
    setPhotos(getProgressPhotos(storedEmail));

    // Rubryki trenera — domyślne wartości + dane z ostatniego raportu
    const init: Record<string, string | number | boolean> = {};
    for (const f of defs) init[f.key] = f.defaultValue;
    const last = st.last;
    if (last?.values) {
      for (const f of defs) {
        if (f.key in last.values && typeof last.values[f.key] !== "undefined") {
          init[f.key] = last.values[f.key];
        }
      }
      setWeekGood(String(last.values.weekGood ?? ""));
      setWeekImproved(String(last.values.weekImproved ?? ""));
      setWeekQuestions(String(last.values.weekQuestions ?? ""));
    }
    setFValues(init);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const weekEntries = email
    ? weekDates.filter((d) => Boolean(getDailyLogs(email)[d]))
    : [];

  const handlePhoto = async (file: File) => {
    if (!email) return;
    setPhotoErr("");
    try {
      const dataUrl = await resizeImage(file);
      const res = addProgressPhoto(email, { date: todayISO(), dataUrl });
      if (res.error) {
        setPhotoErr(res.error);
        return;
      }
      setPhotos(res.photos);
    } catch (err) {
      setPhotoErr(err instanceof Error ? err.message : "Nie udało się dodać zdjęcia.");
    }
  };

  const handleWeeklySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !stats) return;
    const w = parseFloat(String(mValues.weight ?? "").replace(",", "."));
    if (!Number.isFinite(w) || w <= 0) {
      setWeeklyErr("Podaj wagę — pomiary są obowiązkową częścią raportu tygodniowego.");
      return;
    }
    setWeeklyErr("");
    // pomiary → wykresy i trend wagi coacha
    const mv: Record<string, string> = {};
    for (const m of MEASUREMENT_METRICS) {
      const v = String(mValues[m.key] ?? "").trim();
      if (v) mv[m.key] = v;
    }
    if (Object.keys(mv).length > 0) {
      addMeasurement(email, { date: todayISO(), values: mv });
    }
    const photosThisWeek = photos.filter((p) => p.date >= weekStart);
    saveWeeklyReport(email, {
      values: {
        // rubryki wymagane przez trenera (pod spodem — ich klucze nie
        // kolidują z auto-danymi, ale pomiary zawsze wygrywają)
        ...fValues,
        // auto-podsumowanie z codziennego śladu w panelu
        daysLogged: stats.daysLogged,
        mealsDays: stats.mealsDays,
        avgWater: stats.avgWater,
        avgSleep: stats.avgSleep,
        avgSteps: stats.avgSteps,
        avgWellbeing: stats.avgWellbeing,
        kcalWeek: stats.kcalWeek,
        weight: w,
        weightDelta: stats.weightDelta ?? "",
        measurements: MEASUREMENT_METRICS.map(
          (m) => `${m.label}: ${mValues[m.key] ? `${mValues[m.key]} ${m.unit}` : "—"}`
        ).join(", "),
        // rozbudowane uwagi klienta
        weekGood: weekGood.trim(),
        weekImproved: weekImproved.trim(),
        weekQuestions: weekQuestions.trim(),
      },
      photoIds: photosThisWeek.map((p) => p.id),
    });
    setLastWeeklyAt(new Date().toISOString());
    setNextDueAt(new Date(Date.now() + 7 * DAY_MS).toISOString());
    setWeeklyDue(false);
    setOverdueDays(0);
    setSaved(true);
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-200">Ładowanie...</p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400";
  const labelText = "text-[11px] font-medium text-slate-300";
  const secTitle = "text-[11px] font-semibold uppercase tracking-wide text-emerald-400";

  const setF = (key: string, val: string | number | boolean) =>
    setFValues((s) => ({ ...s, [key]: val }));

  const renderField = (f: ReportConfigField) => {
    const v = fValues[f.key] ?? f.defaultValue;

    if (f.type === "range") {
      return (
        <div className="space-y-1">
          <label className={labelText}>{f.label}</label>
          <input
            type="range"
            min={f.min}
            max={f.max}
            value={Number(v)}
            onChange={(e) => setF(f.key, Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="text-center text-sm text-slate-100">{v} / {f.max}</div>
        </div>
      );
    }
    if (f.type === "boolean") {
      return (
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={Boolean(v)}
            onChange={(e) => setF(f.key, e.target.checked)}
            className="accent-emerald-500"
          />
          {f.label}
        </label>
      );
    }
    if (f.type === "select") {
      return (
        <label className="block space-y-1">
          <span className={labelText}>{f.label}</span>
          <select
            className={inputCls}
            value={String(v)}
            onChange={(e) => setF(f.key, e.target.value)}
          >
            {(f.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      );
    }
    if (f.type === "number") {
      return (
        <label className="block space-y-1">
          <span className={labelText}>{f.label}</span>
          <input
            className={inputCls}
            type="number"
            step={f.step}
            value={String(v)}
            onChange={(e) => setF(f.key, e.target.value)}
            placeholder={f.placeholder}
          />
        </label>
      );
    }
    return (
      <label className="block space-y-1">
        <span className={labelText}>{f.label}</span>
        <textarea
          className={inputCls}
          rows={3}
          value={String(v)}
          onChange={(e) => setF(f.key, e.target.value)}
          placeholder={f.placeholder}
        />
      </label>
    );
  };

  if (saved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md space-y-5 rounded-2xl border border-emerald-500/40 bg-slate-900/80 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl">
            📋
          </div>
          <h1 className="text-lg font-semibold text-slate-50">
            Raport tygodniowy wysłany!
          </h1>
          <p className="text-sm text-slate-400">
            Pomiary trafiły do wykresów, zdjęcia do dokumentacji sylwetki, a
            trener dostał kompletne podsumowanie tygodnia wraz z Twoimi
            rubrykami i uwagami.
          </p>
          <p className="text-xs text-emerald-300">
            {nextDueAt
              ? `Następny obowiązkowy raport: ${new Date(
                  nextDueAt
                ).toLocaleDateString("pl-PL")}`
              : "Kolejny raport za 7 dni."}
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/client"
              className="inline-block rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Wróć do panelu
            </Link>
            <button
              type="button"
              onClick={() => setSaved(false)}
              className="rounded-full border border-slate-700 px-6 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Wróć do raportu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const awaitingReply =
    lastWeeklyAt && (!feedback.at || feedback.at < lastWeeklyAt);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Krok 2 · Raport tygodniowy
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
            Raport tygodniowy do trenera
          </h1>
          <p className="mx-auto max-w-md text-sm text-slate-400">
            Codziennie zapisuj w panelu, co zrobiłeś — posiłki, wodę,
            samopoczucie, sen i trening. Raz na 7 dni złóż tutaj raport:
            pomiary sylwetki, zdjęcia i rubryki wymagane przez trenera.
          </p>
        </header>

        {/* ===== Nakaz: raport tygodniowy ===== */}
        {weeklyDue ? (
          <section className="space-y-2 rounded-2xl border border-red-500/50 bg-red-500/10 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-red-400">
              ⚠️ Raport tygodniowy {overdueDays > 1 ? `— zaległy od ${overdueDays} dni` : "do wysłania"}
            </p>
            <p className="text-sm text-slate-200">
              Co tydzień prześlij trenerowi <b>pomiary sylwetki</b>,{" "}
              <b>zdjęcia</b> i <b>rubryki</b>.{" "}
              {lastWeeklyAt
                ? `Ostatni raport: ${new Date(lastWeeklyAt).toLocaleDateString("pl-PL")} —`
                : "Pierwszy raport jeszcze nie był wysłany —"}{" "}
              uzupełnij go teraz.
            </p>
          </section>
        ) : nextDueAt ? (
          <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-center text-xs text-emerald-200">
            ✓ Raport tygodniowy wysłany — następny termin:{" "}
            <b>{new Date(nextDueAt).toLocaleDateString("pl-PL")}</b>
          </p>
        ) : null}

        {/* ===== Codzienny ślad w panelu ===== */}
        <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={secTitle}>Twój codzienny ślad w panelu</p>
              <p className="text-xs text-slate-400">
                Zbierane automatycznie każdego dnia — trener widzi je na
                bieżąco, bez czekania na raport.
              </p>
            </div>
            <Link
              href="/client"
              className="shrink-0 rounded-full border border-slate-700 px-3 py-1.5 text-[11px] text-slate-300 hover:bg-slate-800"
            >
              Panel →
            </Link>
          </div>
          {stats && (
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <SummaryChip label="Dni z aktywnością" value={`${stats.daysLogged}/7`} />
              <SummaryChip label="Dni z posiłkami" value={`${stats.mealsDays}/7`} />
              <SummaryChip label="Woda (śr.)" value={`${stats.avgWater} szkl.`} />
              <SummaryChip label="Sen (śr.)" value={stats.avgSleep > 0 ? `${stats.avgSleep} h` : "—"} />
              <SummaryChip label="Kroki (śr.)" value={stats.avgSteps > 0 ? `${Math.round(stats.avgSteps)}` : "—"} />
              <SummaryChip label="Samopoczucie" value={stats.avgWellbeing > 0 ? `${stats.avgWellbeing}/5` : "—"} />
              <SummaryChip label="Aktywności" value={`${stats.kcalWeek} kcal`} />
              <SummaryChip
                label="Waga"
                value={
                  stats.weight > 0
                    ? `${stats.weight} kg${
                        stats.weightDelta !== null
                          ? ` (${stats.weightDelta > 0 ? "+" : ""}${stats.weightDelta})`
                          : ""
                      }`
                    : "—"
                }
              />
            </div>
          )}
          <p className="text-[11px] text-slate-500">
            Zakres: {new Date(weekStart).toLocaleDateString("pl-PL")} – dziś ·
            wpisów w dzienniku: {weekEntries.length}/7
          </p>
        </section>

        {/* Odpowiedź trenera */}
        <section className="space-y-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-5">
          <p className={secTitle}>💬 Odpowiedź trenera</p>
          {feedback.text ? (
            <>
              <p className="whitespace-pre-line text-sm text-slate-200">
                {feedback.text}
              </p>
              <p className="text-[11px] text-slate-500">
                {feedback.at && new Date(feedback.at).toLocaleString("pl-PL")}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">
              {lastWeeklyAt
                ? "Trener widzi Twój raport — konkretne wytyczne pojawią się tutaj."
                : "Wyślij raport tygodniowy, a trener odpowie z konkretnymi wskazówkami."}
            </p>
          )}
          {awaitingReply && (
            <p className="rounded-xl border border-amber-500/40 bg-amber-900/30 px-3 py-2 text-[11px] text-amber-200">
              ⏳ Trener jeszcze nie odpowiedział na raport z{" "}
              {new Date(lastWeeklyAt as string).toLocaleString("pl-PL")}.
            </p>
          )}
        </section>

        {/* ================= FORMULARZ RAPORTU TYGODNIOWEGO ================= */}
        <form
          onSubmit={handleWeeklySubmit}
          className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <div>
            <p className="text-sm font-semibold text-slate-100">
              Raport za tydzień {new Date(weekStart).toLocaleDateString("pl-PL")} –{" "}
              {new Date().toLocaleDateString("pl-PL")}
            </p>
            <p className="text-xs text-slate-400">
              Kompletny raport: pomiary, zdjęcia, rubryki trenera i podsumowanie
              tygodnia.
            </p>
          </div>

          {/* 1. Pomiary sylwetki */}
          <section className="space-y-2">
            <p className={secTitle}>
              1 · Pomiary sylwetki *{" "}
              <span className="normal-case text-slate-500">(waga wymagana)</span>
            </p>
            <p className="text-xs text-slate-400">
              Raz w tygodniu zmierz obwody — trafią do wykresów i trendu wagi.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {MEASUREMENT_METRICS.map((m) => (
                <label key={m.key} className="block space-y-1">
                  <span className={labelText}>
                    {m.label} {m.unit}
                    {m.key === "weight" && <span className="text-red-400"> *</span>}
                  </span>
                  <input
                    className={inputCls}
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={mValues[m.key] ?? ""}
                    onChange={(e) =>
                      setMValues((s) => ({ ...s, [m.key]: e.target.value }))
                    }
                    placeholder={m.key === "weight" ? "np. 78.5" : "—"}
                  />
                </label>
              ))}
            </div>
          </section>

          {/* 2. Zdjęcia sylwetki */}
          <section className="space-y-2">
            <p className={secTitle}>
              2 · Zdjęcia sylwetki ({photos.filter((p) => p.date >= weekStart).length} w tym tygodniu)
            </p>
            <p className="text-xs text-slate-400">
              Dodaj aktualne zdjęcie — trener porównuje je z poprzednimi
              tygodniami (max 15 zdjęć w dokumentacji).
            </p>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photos.slice(0, 4).map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.id}
                    src={p.dataUrl}
                    alt={`Sylwetka ${p.date}`}
                    className={`h-20 w-16 rounded-lg object-cover ${
                      p.date >= weekStart ? "ring-2 ring-emerald-400" : "opacity-70"
                    }`}
                  />
                ))}
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handlePhoto(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl border border-dashed border-slate-600 px-4 py-3 text-sm text-slate-300 hover:border-emerald-400 hover:text-emerald-300 transition"
            >
              📷 Dodaj zdjęcie sylwetki
            </button>
            {!photos.some((p) => p.date >= weekStart) && (
              <p className="rounded-xl border border-amber-500/40 bg-amber-900/30 px-3 py-2 text-[11px] text-amber-200">
                ⚠️ Nie masz zdjęcia z ostatnich 7 dni — dołącz je, żeby raport
                był kompletny.
              </p>
            )}
            {photoErr && <p className="text-[11px] text-red-400">{photoErr}</p>}
          </section>

          {/* 3. Rubryki wymagane przez trenera */}
          <section className="space-y-3">
            <p className={secTitle}>3 · Wymagane przez trenera</p>
            {fields.length === 0 ? (
              <p className="text-sm text-slate-400">
                Trener nie skonfigurował jeszcze rubryk raportu — uzupełnij
                pomiary i uwagi poniżej.
              </p>
            ) : (
              <>
                <p className="text-xs text-slate-400">
                  Rubryki ustalone przez trenera — wypełnij je za cały tydzień.
                </p>
                <div className="space-y-4">
                  {/* waga jest już w pomiarach (sekcja 1) — nie dublujemy */}
                  {fields
                    .filter((f) => f.key !== "weight")
                    .map((f) => (
                      <div key={f.key}>{renderField(f)}</div>
                    ))}
                </div>
              </>
            )}
          </section>

          {/* 4. Rozbudowane uwagi */}
          <section className="space-y-3">
            <p className={secTitle}>4 · Podsumowanie tygodnia od siebie</p>
            <label className="block space-y-1">
              <span className={labelText}>✅ Co poszło dobrze?</span>
              <textarea
                className={inputCls}
                rows={2}
                value={weekGood}
                onChange={(e) => setWeekGood(e.target.value)}
                placeholder="np. 4/4 treningi, trzymałem dietę, lepszy sen od środy…"
              />
            </label>
            <label className="block space-y-1">
              <span className={labelText}>⚠️ Co wymaga poprawy / z czym było trudno?</span>
              <textarea
                className={inputCls}
                rows={2}
                value={weekImproved}
                onChange={(e) => setWeekImproved(e.target.value)}
                placeholder="np. dwa wieczory z jedzeniem na mieście, mało snu w piątek…"
              />
            </label>
            <label className="block space-y-1">
              <span className={labelText}>❓ Pytania do trenera</span>
              <textarea
                className={inputCls}
                rows={2}
                value={weekQuestions}
                onChange={(e) => setWeekQuestions(e.target.value)}
                placeholder="np. czy zwiększyć kardio w przyszłym tygodniu? co z zamianą ćwiczenia na kolano?"
              />
            </label>
          </section>

          {weeklyErr && (
            <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {weeklyErr}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              📋 Wyślij raport tygodniowy
            </button>
            <Link
              href="/client"
              className="rounded-full border border-slate-700 px-6 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Wróć do panelu
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 font-semibold text-slate-100">{value}</p>
    </div>
  );
}