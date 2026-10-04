"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getGoalRequest,
  saveGoalRequest,
  getClientContent,
  type GoalRequest,
} from "@/lib/store";
import {
  buildWeeklyReview,
  getCalorieSuggestion,
  type WeeklyReview,
  type CalorieSuggestion,
} from "@/lib/coach";

type AiCache = { text: string; sig: string; at: string };

function aiKey(email: string) {
  return `fitcoach_coach_ai_${email}`;
}

const toneIcon: Record<string, string> = {
  good: "✅",
  warn: "⚠️",
  bad: "🚨",
};

export default function CoachingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [suggestion, setSuggestion] = useState<CalorieSuggestion | null>(null);
  const [goalReq, setGoalReq] = useState<GoalRequest | null>(null);
  const [currentKcal, setCurrentKcal] = useState(0);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDemoNote, setAiDemoNote] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = window.localStorage.getItem("fitcoach_client_logged_in");
    const stored = window.localStorage.getItem("fitcoach_client_email");
    if (loggedIn !== "true" || !stored) {
      router.replace("/login");
      return;
    }
    const r = buildWeeklyReview(stored);
    const s = getCalorieSuggestion(stored);
    const req = getGoalRequest(stored);
    const content = getClientContent(stored);
    setEmail(stored);
    setReview(r);
    setSuggestion(s);
    setGoalReq(req);
    setCurrentKcal(
      parseInt(content.diet.targetCalories, 10) ||
        parseInt(content.nutrition.calories, 10) ||
        0
    );
    // skomentarz AI z cache, jeśli pasuje do tego tygodnia
    try {
      const raw = window.localStorage.getItem(aiKey(stored));
      if (raw) {
        const cache = JSON.parse(raw) as AiCache;
        if (cache.sig === `${r.score}|${r.period.to}`) {
          setAiText(cache.text);
          setAiDemoNote(cache.text.startsWith("[heurystyka]"));
        }
      }
    } catch {
      /* brak cache */
    }
    setReady(true);
  }, [router]);

  const generateAiText = async () => {
    if (!review || !email) return;
    setAiLoading(true);
    setAiDemoNote(false);
    try {
      const res = await fetch("/api/coach-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: review.score,
          good: review.good.map((g) => g.text),
          improve: review.improve.map((g) => g.text),
          tips: review.tips,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        source?: string;
        text?: string;
      };
      const sig = `${review.score}|${review.period.to}`;
      let text = "";
      let demo = false;
      if (data.source === "ai" && data.text) {
        text = data.text;
      } else {
        // heurystyka: sklejamy oceny systemu w spójny akapit
        const sentences = [
          ...review.good.map((g) => g.text),
          ...review.improve.map((g) => g.text),
        ].slice(0, 5);
        text = `[heurystyka] Tydzień ${review.period.from} → ${review.period.to}, wynik ${review.score}/100. ${sentences.join(" ")} Zadania na nowy tydzień: ${review.tips.join(" | ")}`;
        demo = true;
      }
      setAiText(text);
      setAiDemoNote(demo);
      try {
        window.localStorage.setItem(
          aiKey(email),
          JSON.stringify({ text, sig, at: new Date().toISOString() } satisfies AiCache)
        );
      } catch {
        /* ignore */
      }
    } catch {
      setAiDemoNote(true);
      setAiText("[heurystyka] Nie udało się skontaktować z AI — podsumowanie poniżej wystarczy na dziś.");
    } finally {
      setAiLoading(false);
    }
  };

  const proposeGoal = () => {
    if (!email || !suggestion) return;
    const req: GoalRequest = {
      current: suggestion.current,
      suggested: suggestion.suggested,
      reason: suggestion.reason,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    saveGoalRequest(email, req);
    setGoalReq(req);
  };

  if (!ready || !review || !suggestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-200">Ładowanie...</p>
      </div>
    );
  }

  const scoreColor =
    review.score >= 80
      ? "bg-emerald-500"
      : review.score >= 60
        ? "bg-amber-500"
        : "bg-rose-500";
  const scoreText =
    review.score >= 80 ? "text-emerald-400" : review.score >= 60 ? "text-amber-400" : "text-rose-400";

  const cardCls = "rounded-2xl border border-slate-800 bg-slate-900/60 p-5";
  const eyebrow = "text-[11px] font-semibold uppercase tracking-wide text-emerald-400";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2">
          <Link
            href="/client"
            className="inline-block text-xs text-slate-400 hover:text-slate-200"
          >
            ← Wróć do panelu
          </Link>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
            🧠 Coaching AI
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
            Twój tygodniowy przegląd
          </h1>
          <p className="max-w-md text-sm text-slate-400">
            Podsumowanie ostatnich 7 dni: dieta, woda, sen, trening i trend
            wagi — plus konkretne zadania na nowy tydzień.
          </p>
        </header>

        {/* ---- Wynik tygodnia ---- */}
        <section className={cardCls}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={eyebrow}>
                Wynik tygodnia · {review.period.from} → {review.period.to}
              </p>
              <p className="mt-1 text-4xl font-bold tracking-tight text-slate-50">
                {review.score}
                <span className="text-lg font-medium text-slate-400">/100</span>
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-slate-950/60 px-3 py-2">
                <p className="text-slate-400">Posiłki</p>
                <p className="mt-0.5 font-semibold text-slate-100">
                  {review.meals.pct}%
                </p>
                <p className="text-[10px] text-slate-500">
                  {review.meals.done}/{review.meals.possible}
                </p>
              </div>
              <div className="rounded-xl bg-slate-950/60 px-3 py-2">
                <p className="text-slate-400">Woda</p>
                <p className="mt-0.5 font-semibold text-slate-100">
                  {review.water.avg}/{review.water.goal}
                </p>
                <p className="text-[10px] text-slate-500">szkl. średnio</p>
              </div>
              <div className="rounded-xl bg-slate-950/60 px-3 py-2">
                <p className="text-slate-400">Trend wagi</p>
                <p className="mt-0.5 font-semibold text-slate-100">
                  {review.weight.verdict === "brak danych"
                    ? "—"
                    : `${review.weight.perWeek > 0 ? "+" : ""}${review.weight.perWeek} kg`}
                </p>
                <p className="text-[10px] text-slate-500">na tydzień</p>
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-950">
            <div
              className={`h-full rounded-full transition-all ${scoreColor}`}
              style={{ width: `${review.score}%` }}
            />
          </div>

          {review.empty && (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              Brak śladów aktywności w tym tygodniu — odhacz posiłki, dopisz wodę
              i zmierz się, a tutaj pojawi się pełna analiza.
            </p>
          )}
          {!review.empty && review.activeDays < 3 && !review.hasTrace && (
            <p className="mt-3 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-300">
              Tydzień dopiero się rozkręca ({review.activeDays}{" "}
              {review.activeDays === 1 ? "aktywny dzień" : "aktywne dni"}) —
              punktacja nabiera mocy od 3 aktywnych dni i codziennego śladu w
              panelu.
            </p>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                ✅ Co poszło dobrze
              </p>
              {review.good.map((g, i) => (
                <p key={i} className="text-xs leading-relaxed text-slate-300">
                  {toneIcon[g.tone]} {g.text}
                </p>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-400">
                ⚠️ Nad czym popracować
              </p>
              {review.improve.map((g, i) => (
                <p key={i} className="text-xs leading-relaxed text-slate-300">
                  {toneIcon[g.tone]} {g.text}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Zadania na nowy tydzień + komentarz AI ---- */}
        <section className={cardCls}>
          <p className={eyebrow}>🎯 Zadania na nowy tydzień</p>
          <ol className="mt-2 space-y-1.5">
            {review.tips.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-200">
                <span className="font-semibold text-emerald-400">{i + 1}.</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>

          <div className="mt-4 border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                ✍️ Komentarz trenera (AI)
              </p>
              <button
                type="button"
                onClick={generateAiText}
                disabled={aiLoading}
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-60"
              >
                {aiLoading
                  ? "Piszę…"
                  : aiText
                    ? "Odśwież komentarz"
                    : "✍️ Wygeneruj komentarz AI"}
              </button>
            </div>
            {aiText ? (
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-200">
                {aiText.replace("[heurystyka] ", "")}
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Jedno kliknięcie — AI podsumuje Twój tydzień własnymi słowami.
              </p>
            )}
            {aiDemoNote && (
              <p className="mt-2 text-[11px] text-slate-500">
                Wersja heurystyczna (bez AI). Pełna moc po dodaniu klucza
                <span className="mx-1 font-mono">OPENAI_API_KEY</span> w Vercel →
                redeploy.
              </p>
            )}
          </div>
        </section>

        {/* ---- Adaptacyjny cel ---- */}
        <section className={cardCls}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={eyebrow}>⚖️ Adaptacyjny cel kaloryczny</p>
              <p className="mt-1 text-sm text-slate-300">
                Cel teraz:{" "}
                <span className="font-semibold text-slate-50">
                  {suggestion.current} kcal
                </span>{" "}
                · kierunek: {suggestion.goalLabel}
              </p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>
                Trend 14 dni:{" "}
                <span className="font-semibold text-slate-200">
                  {review.weight.verdict === "brak danych"
                    ? "brak danych"
                    : `${review.weight.perWeek > 0 ? "+" : ""}${review.weight.perWeek} kg/tydz.`}
                </span>
              </p>
            </div>
          </div>

          <div
            className={`mt-3 rounded-xl border px-4 py-3 text-sm ${
              suggestion.needsChange
                ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            <p className="font-semibold">
              {suggestion.needsChange
                ? `Podpowiedź: ${suggestion.current} → ${suggestion.suggested} kcal (${
                    suggestion.delta > 0 ? "+" : ""
                  }${suggestion.delta})`
                : "Cel bez zmian"}
            </p>
            <p className="mt-1 leading-relaxed">{suggestion.reason}</p>
            {suggestion.needsChange && suggestion.alternative && (
              <p className="mt-1 text-xs opacity-80">{suggestion.alternative}</p>
            )}
          </div>

          {/* Status propozycji / akcja */}
          {goalReq?.status === "pending" && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
              <span>
                🕒 Wysłano do trenera: {goalReq.current} → {goalReq.suggested}{" "}
                kcal — czeka na decyzję.
              </span>
            </div>
          )}
          {goalReq?.status === "accepted" && (
            <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              ✅ Trener zaakceptował: nowy cel{" "}
              <span className="font-semibold">{goalReq.suggested} kcal</span>{" "}
              (obowiązuje w Twoim planie żywieniowym).
            </div>
          )}
          {goalReq?.status === "rejected" && (
            <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
              ✗ Trener zostawił dotychczasowy cel ({goalReq.current} kcal).
            </div>
          )}
          {suggestion.needsChange &&
            (!goalReq || goalReq.status !== "pending") && (
              <button
                type="button"
                onClick={proposeGoal}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition"
              >
                📤 {goalReq ? "Zaproponuj ponownie" : "Zaproponuj trenerowi"}
              </button>
            )}
          <p className="mt-2 text-[11px] text-slate-500">
            {currentKcal > 0
              ? "Decyzję podejmuje trener — jedno kliknięcie po jego stronie i cel w Twoim planie się zmienia."
              : "Podpowiedź działa od 2 pomiarów wagi w odstępie min. 8 dni."}
          </p>
        </section>
      </main>
    </div>
  );
}