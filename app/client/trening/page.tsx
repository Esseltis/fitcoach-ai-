'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { getDoneExerciseIds, toggleExerciseDone } from "@/lib/store";

type Exercise = {
  id: number;
  name: string;
  series: string;
  workTime: string;
  rest: string;
};

const EXERCISES: Exercise[] = [
  {
    id: 1,
    name: "Pompki w wąskim podparciu",
    series: "4 x 8–12",
    workTime: "Seria do upadku mięśniowego",
    rest: "90 sek.",
  },
  {
    id: 2,
    name: "Przysiad bułgarski ze sztangielkami",
    series: "3 x 10–12",
    workTime: "Noga po nodze",
    rest: "90 sek.",
  },
  {
    id: 3,
    name: "Martwy ciąg na prostych nogach",
    series: "3 x 8–10",
    workTime: "Kontrola zejścia",
    rest: "120 sek.",
  },
  {
    id: 4,
    name: "Wiosłowanie hantlą w opadzie",
    series: "3 x 10–12",
    workTime: "Na stronę",
    rest: "90 sek.",
  },
  {
    id: 5,
    name: "Plank",
    series: "2 serie",
    workTime: "max",
    rest: "90 sek.",
  },
  {
    id: 6,
    name: "Aeroby / Cardio",
    series: "1 seria",
    workTime: "20 min",
    rest: "-",
  },
];

const trainingDays = [
  { id: 1, label: "Dzień 1", status: "Treningowy" },
  { id: 2, label: "Dzień 2", status: "Treningowy" },
  { id: 3, label: "Dzień 3", status: "Aktywny" },
  { id: 4, label: "Dzień 4", status: "Treningowy" },
  { id: 5, label: "Dzień 5", status: "Treningowy" },
  { id: 6, label: "Dzień 6", status: "Aktywny" },
  { id: 7, label: "Dzień 7", status: "Odpoczynek" },
];

export default function TreningPage() {
  const [email, setEmail] = useState<string>("demo@fitcoach.ai");
  const [ready, setReady] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [doneIds, setDoneIds] = useState<string[]>([]);

  useEffect(() => {
    const storedEmail = window.localStorage.getItem("fitcoach_client_email") ?? "demo@fitcoach.ai";
    setEmail(storedEmail);
    setDoneIds(getDoneExerciseIds(storedEmail, activeDay));
    setReady(true);
  }, []);

  const switchDay = (day: number) => {
    setActiveDay(day);
    setDoneIds(getDoneExerciseIds(email, day));
  };

  const toggle = (exerciseId: number) => {
    const next = toggleExerciseDone(email, activeDay, String(exerciseId));
    setDoneIds(next);
  };

  const doneCount = EXERCISES.filter((ex) => doneIds.includes(String(ex.id))).length;

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl text-center md:text-left">
            PLAN TRENINGOWY
          </h1>
          <p className="max-w-3xl text-sm text-slate-300">
            Kliknij ćwiczenie, aby oznaczyć je jako wykonane. Postęp zapisuje
            się osobno dla każdego dnia treningowego.
          </p>

          <div className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-2 text-xs text-slate-200">
            {trainingDays.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={() => switchDay(day.id)}
                className={`flex-1 min-w-[110px] rounded-lg px-4 py-2 text-left uppercase tracking-wide ${
                  activeDay === day.id
                    ? "bg-emerald-500 text-slate-950 font-semibold shadow-[0_0_18px_rgba(16,185,129,0.6)]"
                    : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div className="flex flex-col leading-tight">
                  <span>{day.label}</span>
                  <span className="text-[10px] normal-case opacity-80">
                    {day.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </header>

        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              DZIEŃ TRENINGOWY
            </p>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300">
              Wykonane:{" "}
              <span className="font-semibold text-emerald-400">
                {doneCount}/{EXERCISES.length}
              </span>
            </span>
          </div>

          <div className="space-y-3">
            {EXERCISES.map((ex) => {
              const isDone = doneIds.includes(String(ex.id));
              return (
                <article
                  key={ex.id}
                  className={`flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between transition ${
                    isDone
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-slate-800 bg-slate-950/80"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(ex.id)}
                    className="flex flex-1 items-start gap-3 text-left"
                  >
                    {isDone ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                    )}
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Ćwiczenie {ex.id}
                      </p>
                      <h2
                        className={`text-sm font-semibold ${
                          isDone
                            ? "text-emerald-200 line-through opacity-80"
                            : "text-slate-50"
                        }`}
                      >
                        {ex.name}
                      </h2>
                    </div>
                  </button>

                  <div className="grid flex-1 gap-2 text-[11px] text-slate-200 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-center">
                      <p className="text-slate-400">Serie</p>
                      <p className="mt-1 text-sm font-semibold text-slate-50">
                        {ex.series}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-center">
                      <p className="text-slate-400">Czas pracy</p>
                      <p className="mt-1 text-sm font-semibold text-slate-50">
                        {ex.workTime}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-center">
                      <p className="text-slate-400">Przerwa</p>
                      <p className="mt-1 text-sm font-semibold text-slate-50">
                        {ex.rest}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => activeDay > 1 && switchDay(activeDay - 1)}
            className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white disabled:opacity-40"
            disabled={activeDay === 1}
          >
            Wstecz
          </button>
          <button
            type="button"
            onClick={() => activeDay < trainingDays.length && switchDay(activeDay + 1)}
            className="rounded-full bg-sky-500 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 hover:bg-sky-400 disabled:opacity-40"
            disabled={activeDay === trainingDays.length}
          >
            Przejdź dalej
          </button>
        </div>

        <div className="mt-2">
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
