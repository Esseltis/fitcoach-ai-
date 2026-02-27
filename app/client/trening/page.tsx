'use client';

import Link from "next/link";
import { useState } from "react";

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

const trainingTabs = [
  "Wstęp",
  "Rozgrzewka",
  "Trening główny",
  "Dodatkowe serie",
  "Cardio",
  "Rozciąganie",
  "Podsumowanie",
];

export default function TreningPage() {
  const [activeTab, setActiveTab] = useState(2); // "Trening główny"

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        {/* Pasek nawigacji nad planem */}
        <header className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl text-center md:text-left">
            PLAN TRENINGOWY
          </h1>
          <p className="max-w-3xl text-sm text-slate-300">
            Poniżej widzisz przykładowy dzień treningowy – kolejność ćwiczeń,
            ilość serii, czas pracy i przerwy. W przyszłości dane będą
            pochodziły z rzeczywistego planu od trenera.
          </p>

          <div className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-2 text-xs text-slate-200">
            {trainingTabs.map((label, idx) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex-1 min-w-[90px] rounded-lg px-4 py-2 text-center uppercase tracking-wide ${
                  activeTab === idx
                    ? "bg-emerald-500 text-slate-950 font-semibold shadow-[0_0_18px_rgba(16,185,129,0.6)]"
                    : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* Lista ćwiczeń */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              DZIEŃ TRENINGOWY – PRZYKŁAD
            </p>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300">
              Status:{" "}
              <span className="font-semibold text-emerald-400">Aktywny</span>
            </span>
          </div>

          <div className="space-y-3">
            {EXERCISES.map((ex) => (
              <article
                key={ex.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Ćwiczenie {ex.id}
                  </p>
                  <h2 className="text-sm font-semibold text-slate-50">
                    {ex.name}
                  </h2>
                </div>

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
            ))}
          </div>
        </section>

        {/* Komentarze / akordeony pod planem */}
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
            KOMENTARZ DO TRENINGU (DEMO)
          </p>
          <div className="space-y-2">
            {[
              "Serie rozgrzewkowe – co to jest?",
              "Superseria – co to jest?",
              "Seria łączona – co to jest?",
              "Gigantseria – co to jest?",
              "RPE – co to jest?",
              "MAX – co to jest?",
              "Tempo – co to jest?",
            ].map((label) => (
              <details
                key={label}
                className="group rounded-2xl border border-slate-800 bg-slate-950/80"
              >
                <summary className="flex cursor-pointer items-center justify-between px-4 py-2 text-[11px] font-semibold text-slate-200">
                  {label}
                  <span className="text-slate-500 group-open:rotate-180 transition">
                    ˅
                  </span>
                </summary>
                <div className="border-t border-slate-800 px-4 py-3 text-[11px] text-slate-300">
                  Tu możesz dodać opis pojęcia – w wersji produkcyjnej trener
                  wyjaśni dokładnie, jak wykonywać dane elementy planu.
                </div>
              </details>
            ))}
          </div>
        </section>

        <div className="flex justify-between">
          <button
            type="button"
            className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Wstecz
          </button>
          <button
            type="button"
            className="rounded-full bg-sky-500 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 hover:bg-sky-400"
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


