'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Minus, Droplets, RotateCcw } from "lucide-react";
import { getWaterForDate, setWaterForDate } from "@/lib/store";

const GOAL_GLASSES = 8;

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function HydrationPage() {
  const [email, setEmail] = useState<string>("demo@fitcoach.ai");
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const storedEmail = window.localStorage.getItem("fitcoach_client_email") ?? "demo@fitcoach.ai";
    setEmail(storedEmail);
    setCount(getWaterForDate(storedEmail, todayISO()));
    setReady(true);
  }, []);

  const update = (next: number) => {
    setCount(next);
    setWaterForDate(email, todayISO(), next);
  };

  const addGlass = () => update(Math.min(count + 1, 20));
  const removeGlass = () => update(Math.max(count - 1, 0));

  const liters = (count * 0.25).toFixed(2).replace(".", ",");
  const percent = Math.min(100, Math.round((count / GOAL_GLASSES) * 100));
  const done = count >= GOAL_GLASSES;

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
            NAWODNIENIE ORGANIZMU
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Dodawaj wypite szklanki w trakcie dnia, a poniżej zobaczysz postęp
            do dziennego celu. Twój postęp zapisuje się automatycznie.
          </p>
        </header>

        {/* Tracker wody */}
        <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-xs text-slate-200">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                DZIŚ WYPITE
              </p>
              <p className="text-3xl font-extrabold text-slate-50">
                {count}
                <span className="ml-1 text-sm font-semibold text-slate-400">
                  / {GOAL_GLASSES} szklanek
                </span>
              </p>
              <p className="text-[11px] text-slate-400">
                ≈ {liters} l wody
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={removeGlass}
                disabled={count === 0}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-950/70 text-slate-200 hover:bg-slate-800 disabled:opacity-40"
                aria-label="Cofnij szklankę"
              >
                <Minus className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={addGlass}
                className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.5)] hover:bg-sky-400"
                aria-label="Dodaj szklankę"
              >
                <Plus className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => update(0)}
                disabled={count === 0}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-950/70 text-slate-200 hover:bg-slate-800 disabled:opacity-40"
                aria-label="Wyzeruj"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Pasek postępu */}
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Postęp dnia</span>
              <span className={done ? "font-semibold text-emerald-400" : "text-sky-300"}>
                {done ? "Cel osiągnięty!" : `${percent}%`}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-950/80">
              <div
                className={`h-full rounded-full transition-all ${
                  done ? "bg-emerald-500" : "bg-sky-500"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Szklanki */}
          <div className="flex items-end gap-2">
            {Array.from({ length: GOAL_GLASSES }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => update(idx + 1)}
                className={`flex-1 rounded-t-md border transition ${
                  idx < count
                    ? "bg-gradient-to-t from-sky-500/70 to-sky-300/40 border-sky-400/80"
                    : "bg-slate-950/60 border-slate-800"
                }`}
                style={{ height: `${18 + idx * 1.2}px` }}
                aria-label={`Ustaw ${idx + 1} szklanek`}
              />
            ))}
          </div>
          <p className="text-center text-[11px] text-slate-400">
            Kliknij na szklanki, aby szybko ustawić ich liczbę. Cel to{" "}
            {GOAL_GLASSES} szklanek (ok. 2 l) dziennie.
          </p>
        </section>

        {/* Uwagi ogólne */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-sm text-slate-200">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-0.5 w-8 bg-emerald-500" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                UWAGI OGÓLNE DO TWOJEGO NAWODNIENIA
              </p>
            </div>
            <p>
              Pij przede wszystkim wodę mineralną – nawadnia i jest źródłem
              cennych składników. Nawodnienie jest drugim po diecie
              najważniejszym obszarem, którego pilnujesz na co dzień.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              POZOSTAŁE NAPOJE
            </p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-slate-200">
              <li>
                Kawa: bez cukru; mleko max 100 ml dziennie (do wszystkich kaw
                łącznie).
              </li>
              <li>
                Herbata: bez cukru; można dodać cytrynę – 1–2 filiżanki dziennie.
              </li>
              <li>
                Napoje zero/cola light – okazjonalnie, nie jako główne źródło
                płynów.
              </li>
              <li>
                Soki owocowe – traktuj raczej jako dodatek smakowy niż osobny
                napój.
              </li>
            </ul>
          </div>
        </section>

        <div>
          <Link
            href="/client"
            className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            ← Wróć do panelu
          </Link>
        </div>
      </main>
    </div>
  );
}
