"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getReport, saveReport } from "@/lib/store";

export default function ClientReportPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);

  const [wellbeing, setWellbeing] = useState(3);
  const [trainingDone, setTrainingDone] = useState(false);
  const [mealsDone, setMealsDone] = useState(false);
  const [sleepHours, setSleepHours] = useState(7);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = window.localStorage.getItem("fitcoach_client_logged_in");
    const storedEmail = window.localStorage.getItem("fitcoach_client_email");
    if (loggedIn !== "true" || !storedEmail) {
      router.replace("/login");
      return;
    }
    setEmail(storedEmail);
    const existing = getReport(storedEmail);
    if (existing) {
      setWellbeing(existing.wellbeing);
      setTrainingDone(existing.trainingDone);
      setMealsDone(existing.mealsDone);
      setSleepHours(existing.sleepHours);
      setWeight(String(existing.weight));
      setNotes(existing.notes);
    }
    setReady(true);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    saveReport(email, {
      wellbeing,
      trainingDone,
      mealsDone,
      sleepHours,
      weight: Number(weight) || 0,
      notes,
      submittedAt: new Date().toISOString(),
    });
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
  const labelCls = "block space-y-1";
  const labelText = "text-[11px] font-medium text-slate-300";

  if (saved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md space-y-5 rounded-2xl border border-emerald-500/40 bg-slate-900/80 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl">
            ✓
          </div>
          <h1 className="text-lg font-semibold text-slate-50">Raport wysłany!</h1>
          <p className="text-sm text-slate-400">
            Twój trener otrzymał raport dzienny. Możesz wysłać kolejny w dowolnym
            momencie.
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
              Wyślij kolejny raport
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Krok 2 · Raport dzienny
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
            Wyślij raport do trenera
          </h1>
          <p className="mx-auto max-w-md text-sm text-slate-400">
            Podsumuj swój dzień: samopoczucie, wykonane treningi i posiłki.
            Trener zobaczy raport na swoim panelu.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <div className="space-y-1">
            <label className={labelText}>Samopoczucie (1–5)</label>
            <input
              type="range"
              min={1}
              max={5}
              value={wellbeing}
              onChange={(e) => setWellbeing(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="text-center text-sm text-slate-100">{wellbeing} / 5</div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={trainingDone}
              onChange={(e) => setTrainingDone(e.target.checked)}
              className="accent-emerald-500"
            />
            Zrealizowałem trening
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={mealsDone}
              onChange={(e) => setMealsDone(e.target.checked)}
              className="accent-emerald-500"
            />
            Zrealizowałem posiłki
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className={labelCls}>
              <span className={labelText}>Sen (h)</span>
              <input
                className={inputCls}
                type="number"
                step={0.5}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
              />
            </label>
            <label className={labelCls}>
              <span className={labelText}>Waga (kg)</span>
              <input
                className={inputCls}
                type="number"
                step={0.1}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="np. 78"
              />
            </label>
          </div>

          <label className={labelCls}>
            <span className={labelText}>Notatka dla trenera</span>
            <textarea
              className={inputCls}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jak się czułeś, co było trudne, co wymaga zmiany..."
            />
          </label>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Wyślij raport
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
