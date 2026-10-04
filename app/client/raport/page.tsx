"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getReport,
  saveReport,
  saveDailyLog,
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
  getDoneExerciseIds,
  type ReportConfigField,
  type DailyLogEntry,
  type ProgressPhoto,
} from "@/lib/store";

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

type PanelSummary = {
  mealsDone: number;
  mealsTotal: number;
  glasses: number;
  waterGoal: number;
  moodSatiety: number;
  moodMotivation: number;
  weight: number;
  actCount: number;
  actKcal: number;
  actMinutes: number;
  trainDone: number;
  trainTotal: number;
};

export default function ClientReportPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<null | "daily" | "weekly">(null);
  const [tab, setTab] = useState<"daily" | "weekly">("daily");
  const [fields, setFields] = useState<ReportConfigField[]>([]);
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});
  const [summary, setSummary] = useState<PanelSummary | null>(null);
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
  const [weekNotes, setWeekNotes] = useState("");
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [photoErr, setPhotoErr] = useState("");
  const [weeklyErr, setWeeklyErr] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

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
    const defs = trainerId
      ? getTrainerReportFields(trainerId)
      : [];
    setFields(defs);

    // zakładka z deep-linka (?tab=weekly — z bannera w panelu)
    const wanted = new URLSearchParams(window.location.search).get("tab");
    setTab(wanted === "weekly" ? "weekly" : "daily");

    // --- Dane z panelu: podsumowanie dnia + auto-uzupełnienie raportu ---
    const content = getClientContent(storedEmail);
    const today = todayISO();
    const cats: string[] = content.diet.meals.map((m) => m.category ?? "").filter((c) => c !== "");
    const doneMeals = getDoneMeals(storedEmail, today).filter((c) => cats.includes(c));
    const mealsTotal = new Set(cats).size;
    const glasses = getWaterForDate(storedEmail, today);
    const kg = getBodyWeightKg(storedEmail, content.nutrition.weight);
    const override = Number(content.guidelines?.waterGlasses);
    const waterGoal =
      Number.isFinite(override) && override > 0
        ? Math.min(20, Math.round(override))
        : kg
        ? Math.max(4, Math.min(15, Math.round((kg * 31) / 250)))
        : 8;
    const mood = getMoodByDate(storedEmail)[today];
    const ms = getMeasurements(storedEmail);
    let weight = 0;
    for (let i = ms.length - 1; i >= 0; i--) {
      const w = parseFloat(String(ms[i].values?.weight ?? "").replace(",", "."));
      if (Number.isFinite(w) && w > 0) {
        weight = w;
        break;
      }
    }
    if (!weight) weight = kg;
    const acts = getActivities(storedEmail, today);
    const actKcal = acts.reduce((s, a) => s + (a.kcal || 0), 0);
    const actMinutes = acts.reduce((s, a) => s + (a.minutes || 0), 0);
    let trainDone = 0;
    let trainTotal = 0;
    content.training.days.forEach((_, i) => {
      const dayId = i + 1;
      const total = (content.training.dayExercises[dayId] ?? []).length;
      trainTotal += total;
      trainDone += getDoneExerciseIds(storedEmail, dayId).filter(
        (id) => Number(id) >= 1 && Number(id) <= total
      ).length;
    });
    setSummary({
      mealsDone: doneMeals.length,
      mealsTotal,
      glasses,
      waterGoal,
      moodSatiety: mood?.satiety ?? 0,
      moodMotivation: mood?.motivation ?? 0,
      weight,
      actCount: acts.length,
      actKcal,
      actMinutes,
      trainDone,
      trainTotal,
    });
    setFeedback(content.feedback ?? { text: "", at: "" });

    // status raportu tygodniowego + zdjęcia sylwetki
    const st = getWeeklyReportStatus(storedEmail);
    setWeeklyDue(st.due);
    setOverdueDays(st.overdueDays);
    setNextDueAt(st.nextDueAt);
    setLastWeeklyAt(st.last?.submittedAt ?? null);
    setPhotos(getProgressPhotos(storedEmail));

    const init: Record<string, string | number | boolean> = {};
    for (const f of defs) init[f.key] = f.defaultValue;

    // Fakty z panelu zawsze wygrywają ze starym raportem
    const autoKeys = new Set(["waterIntake", "mealsDone", "activeMinutes"]);
    init.waterIntake = Number((glasses * 0.25).toFixed(2));
    if (mealsTotal > 0) init.mealsDone = doneMeals.length >= mealsTotal;
    if (weight > 0) {
      init.weight = weight;
      autoKeys.add("weight");
    }
    if (actMinutes > 0) init.activeMinutes = actMinutes;
    if (mood && (mood.satiety > 0 || mood.motivation > 0)) {
      init.wellbeing = Math.max(
        1,
        Math.min(5, Math.round((mood.satiety + mood.motivation) / 2) || 3)
      );
      autoKeys.add("wellbeing");
    }

    const existing = getReport(storedEmail);
    if (existing?.values) {
      for (const k of Object.keys(existing.values)) {
        if (k in init && !autoKeys.has(k)) init[k] = existing.values[k];
      }
    }
    setValues(init);
    setReady(true);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const iso = new Date().toISOString();
    // historia po dniach — zasila podsumowanie tygodniowe
    saveDailyLog(email, todayISO(), values);
    // ostatni wpis — coaching i panel trenera czytają go co dzień
    saveReport(email, {
      values,
      submittedAt: iso,
    });
    setSaved("daily");
  };

  const weekDates = lastNDates(7);
  const logs = email ? getDailyLogs(email) : {};
  const weekEntries: DailyLogEntry[] = weekDates
    .map((d) => logs[d])
    .filter((e): e is DailyLogEntry => Boolean(e));
  const weekTrainings = weekEntries.filter(
    (e) => e.values.trainingDone === true
  ).length;
  const wellbeingList = weekEntries
    .map((e) => Number(e.values.wellbeing))
    .filter((n) => Number.isFinite(n) && n > 0);
  const weekWellbeing = wellbeingList.length
    ? Math.round(
        (wellbeingList.reduce((a, b) => a + b, 0) / wellbeingList.length) * 10
      ) / 10
    : 0;
  const adherenceList = weekEntries
    .map((e) => Number(e.values.adherence))
    .filter((n) => Number.isFinite(n));
  const weekAdherence = adherenceList.length
    ? Math.round(
        adherenceList.reduce((a, b) => a + b, 0) / adherenceList.length
      )
    : 0;
  const weekStart = weekDates[0];
  const photosThisWeek = photos.filter((p) => p.date >= weekStart);
  const weightNow = summary?.weight ?? 0;

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
    if (!email) return;
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
    saveWeeklyReport(email, {
      values: {
        daysLogged: weekEntries.length,
        trainings: weekTrainings,
        avgWellbeing: weekWellbeing,
        avgAdherence: weekAdherence,
        weight: w,
        measurements: MEASUREMENT_METRICS.map(
          (m) => `${m.label}: ${mValues[m.key] ? `${mValues[m.key]} ${m.unit}` : "—"}`
        ).join(", "),
        notes: weekNotes,
      },
      photoIds: photosThisWeek.map((p) => p.id),
    });
    setLastWeeklyAt(new Date().toISOString());
    setNextDueAt(new Date(Date.now() + 7 * DAY_MS).toISOString());
    setWeeklyDue(false);
    setOverdueDays(0);
    setSaved("weekly");
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

  const renderField = (f: ReportConfigField) => {
    const v = values[f.key] ?? f.defaultValue;
    const set = (val: string | number | boolean) =>
      setValues((s) => ({ ...s, [f.key]: val }));

    if (f.type === "range") {
      return (
        <div className="space-y-1">
          <label className={labelText}>{f.label}</label>
          <input
            type="range"
            min={f.min}
            max={f.max}
            value={Number(v)}
            onChange={(e) => set(Number(e.target.value))}
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
            onChange={(e) => set(e.target.checked)}
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
            onChange={(e) => set(e.target.value)}
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
            onChange={(e) => set(e.target.value)}
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
          onChange={(e) => set(e.target.value)}
          placeholder={f.placeholder}
        />
      </label>
    );
  };

  if (saved === "daily") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md space-y-5 rounded-2xl border border-emerald-500/40 bg-slate-900/80 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl">
            ✓
          </div>
          <h1 className="text-lg font-semibold text-slate-50">Wpis dnia zapisany!</h1>
          <p className="text-sm text-slate-400">
            Samopoczucie, jedzenie i trening zapisane w historii. Możesz
            uzupełnić wpis ponownie w ciągu dnia — zawsze nadpisuje dzisiejszy.
          </p>
          <p className="text-xs text-emerald-300">
            Co 7 dni wyślij raport tygodniowy z pomiarami i zdjęciami sylwetki.
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
              onClick={() => setSaved(null)}
              className="rounded-full border border-slate-700 px-6 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Edytuj dzisiejszy wpis
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (saved === "weekly") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md space-y-5 rounded-2xl border border-emerald-500/40 bg-slate-900/80 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl">
            📋
          </div>
          <h1 className="text-lg font-semibold text-slate-50">Raport tygodniowy wysłany!</h1>
          <p className="text-sm text-slate-400">
            Pomiary trafiły do wykresów, zdjęcia do dokumentacji sylwetki, a
            trener dostał kompletne podsumowanie tygodnia.
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
              onClick={() => setSaved(null)}
              className="rounded-full border border-slate-700 px-6 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Wróć do raportów
            </button>
          </div>
        </div>
      </div>
    );
  }

  const report = email ? getReport(email) : null;
  const awaitingReply =
    !!report && (!feedback.at || feedback.at < report.submittedAt);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Krok 2 · Raporty
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
            Raporty do trenera
          </h1>
          <p className="mx-auto max-w-md text-sm text-slate-400">
            Samopoczucie, jedzenie i trening wpisuj codziennie. Raz na 7 dni
            wyślij raport tygodniowy z pomiarami sylwetki i zdjęciami.
          </p>
        </header>

        {/* ===== Nakaz: raport tygodniowy ===== */}
        {weeklyDue ? (
          <section className="space-y-2 rounded-2xl border border-red-500/50 bg-red-500/10 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-red-400">
              ⚠️ Raport tygodniowy {overdueDays > 1 ? `— zaległy od ${overdueDays} dni` : "do wysłania"}
            </p>
            <p className="text-sm text-slate-200">
              Co tydzień prześlij trenerowi <b>pomiary sylwetki</b> i{" "}
              <b>zdjęcia</b>.{" "}
              {lastWeeklyAt
                ? `Ostatni raport: ${new Date(lastWeeklyAt).toLocaleDateString("pl-PL")} —`
                : "Pierwszy raport jeszcze nie był wysłany —"}{" "}
              uzupełnij go teraz.
            </p>
            <button
              type="button"
              onClick={() => setTab("weekly")}
              className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-400 transition"
            >
              Otwórz raport tygodniowy →
            </button>
          </section>
        ) : nextDueAt ? (
          <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-center text-xs text-emerald-200">
            ✓ Raport tygodniowy wysłany — następny termin:{" "}
            <b>{new Date(nextDueAt).toLocaleDateString("pl-PL")}</b>
          </p>
        ) : null}

        {/* ===== Zakładki ===== */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTab("daily")}
            className={`relative rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === "daily"
                ? "bg-slate-800 text-slate-50 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]"
                : "text-slate-400 hover:bg-slate-900"
            }`}
          >
            📝 Codzienny wpis
          </button>
          <button
            type="button"
            onClick={() => setTab("weekly")}
            className={`relative rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === "weekly"
                ? "bg-slate-800 text-slate-50 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]"
                : "text-slate-400 hover:bg-slate-900"
            }`}
          >
            📋 Raport tygodniowy
            {weeklyDue && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                !
              </span>
            )}
          </button>
        </div>

        {tab === "daily" ? (
          <>
            {/* Dane z panelu — uzupełnione automatycznie */}
            {summary && (
              <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                    Dane z Twojego panelu
                  </p>
                  <p className="text-xs text-slate-400">
                    Uzupełnione automatycznie na dziś — trafią do raportu bez
                    przepisywania.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                  <SummaryChip
                    label="Posiłki"
                    value={`${summary.mealsDone}/${summary.mealsTotal}`}
                  />
                  <SummaryChip
                    label="Woda"
                    value={`${summary.glasses}/${summary.waterGoal} szkl.`}
                  />
                  <SummaryChip
                    label="Waga"
                    value={summary.weight > 0 ? `${summary.weight} kg` : "—"}
                  />
                  <SummaryChip
                    label="Samopoczucie"
                    value={
                      summary.moodSatiety > 0
                        ? `S ${summary.moodSatiety}/5 · M ${summary.moodMotivation}/5`
                        : "—"
                    }
                  />
                  <SummaryChip
                    label="Aktywności"
                    value={
                      summary.actCount > 0
                        ? `${summary.actCount} · ${summary.actKcal} kcal`
                        : "0"
                    }
                  />
                  <SummaryChip
                    label="Trening (plan)"
                    value={
                      summary.trainTotal > 0
                        ? `${summary.trainDone}/${summary.trainTotal} ćw.`
                        : "—"
                    }
                  />
                </div>
              </section>
            )}

            {/* Odpowiedź trenera */}
            <section className="space-y-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                💬 Odpowiedź trenera
              </p>
              {feedback.text ? (
                <>
                  <p className="whitespace-pre-line text-sm text-slate-200">
                    {feedback.text}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {feedback.at &&
                      new Date(feedback.at).toLocaleString("pl-PL")}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-400">
                  {report
                    ? "Trener widzi Twój raport — konkretne wytyczne pojawią się tutaj."
                    : "Wyślij wpis, a trener odpowie z konkretnymi wskazówkami."}
                </p>
              )}
              {awaitingReply && (
                <p className="rounded-xl border border-amber-500/40 bg-amber-900/30 px-3 py-2 text-[11px] text-amber-200">
                  ⏳ Trener jeszcze nie odpowiedział na raport
                  {report ? ` z ${new Date(report.submittedAt).toLocaleString("pl-PL")}` : ""}.
                </p>
              )}
            </section>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
            >
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Wpis z dnia {new Date().toLocaleDateString("pl-PL")}
                </p>
                <p className="text-xs text-slate-400">
                  Uzupełniaj codziennie: samopoczucie, co zjadłeś oraz trening i
                  ciężary. Wpisy zbierają się w raport tygodniowy.
                </p>
              </div>
              {fields.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Trener nie skonfigurował jeszcze pól raportu. Zostaw notatkę lub
                  wróć do panelu.
                </p>
              ) : (
                fields.map((f) => (
                  <div key={f.key}>{renderField(f)}</div>
                ))
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="submit"
                  className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Zapisz wpis dnia
                </button>
                <Link
                  href="/client"
                  className="rounded-full border border-slate-700 px-6 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Wróć do panelu
                </Link>
              </div>
            </form>
          </>
        ) : (
          /* ================= RAPORT TYGODNIOWY ================= */
          <form
            onSubmit={handleWeeklySubmit}
            className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
          >
            {/* Auto-podsumowanie tygodnia */}
            <section className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                Podsumowanie tygodnia (automatyczne)
              </p>
              <p className="text-xs text-slate-400">
                Zbrane z Twoich codziennych wpisów i panelu —{" "}
                {new Date(weekStart).toLocaleDateString("pl-PL")} – dziś.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <SummaryChip
                  label="Dni z wpisem"
                  value={`${weekEntries.length}/7`}
                />
                <SummaryChip
                  label="Treningi wykonane"
                  value={`${weekTrainings}`}
                />
                <SummaryChip
                  label="Śr. samopoczucie"
                  value={weekWellbeing > 0 ? `${weekWellbeing}/5` : "—"}
                />
                <SummaryChip
                  label="Przestrzeganie planu"
                  value={weekAdherence > 0 ? `${weekAdherence}%` : "—"}
                />
                <SummaryChip
                  label="Trening (ćwiczenia)"
                  value={
                    summary && summary.trainTotal > 0
                      ? `${summary.trainDone}/${summary.trainTotal}`
                      : "—"
                  }
                />
                <SummaryChip
                  label="Waga"
                  value={weightNow > 0 ? `${weightNow} kg` : "—"}
                />
              </div>
            </section>

            {/* Pomiary sylwetki */}
            <section className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                Pomiary sylwetki *{" "}
                <span className="normal-case text-slate-500">
                  (waga wymagana)
                </span>
              </p>
              <p className="text-xs text-slate-400">
                Raz w tygodniu zmierz obwody — trafią do wykresów i trendu wagi.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {MEASUREMENT_METRICS.map((m) => (
                  <label key={m.key} className="block space-y-1">
                    <span className={labelText}>
                      {m.label} {m.unit}
                      {m.key === "weight" && (
                        <span className="text-red-400"> *</span>
                      )}
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

            {/* Zdjęcia sylwetki */}
            <section className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                Zdjęcia sylwetki ({photosThisWeek.length} w tym tygodniu)
              </p>
              <p className="text-xs text-slate-400">
                Dodaj aktualne zdjęcie — trener porównuje je z poprzednimi
                tygodniami (max {15} zdjęć w dokumentacji).
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
                        p.date >= weekStart
                          ? "ring-2 ring-emerald-400"
                          : "opacity-70"
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
              {photosThisWeek.length === 0 && (
                <p className="rounded-xl border border-amber-500/40 bg-amber-900/30 px-3 py-2 text-[11px] text-amber-200">
                  ⚠️ Nie masz zdjęcia z ostatnich 7 dni — dołącz je, żeby raport
                  był kompletny.
                </p>
              )}
              {photoErr && (
                <p className="text-[11px] text-red-400">{photoErr}</p>
              )}
            </section>

            {/* Uwagi tygodniowe */}
            <label className="block space-y-1">
              <span className={labelText}>
                Uwagi i pytania do trenera (tydzień w skrócie)
              </span>
              <textarea
                className={inputCls}
                rows={3}
                value={weekNotes}
                onChange={(e) => setWeekNotes(e.target.value)}
                placeholder="np. Tydzień trudny dietetycznie, brak snu w czwartek — czy zmniejszyć kalorie?"
              />
            </label>

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
              <button
                type="button"
                onClick={() => setTab("daily")}
                className="rounded-full border border-slate-700 px-6 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Codzienny wpis
              </button>
            </div>
          </form>
        )}
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