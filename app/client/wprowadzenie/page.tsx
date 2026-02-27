'use client';

import Link from "next/link";

export default function WprowadzeniePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        {/* Górny pasek jak „START PLANU” */}
        <header className="space-y-4">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Plan współpracy
            </p>
            <h1 className="text-3xl font-extrabold tracking-[0.15em] text-slate-50 md:text-4xl">
              START PLANU
            </h1>
          </div>

          <div className="mt-2 flex flex-col items-center gap-1 text-xs text-slate-300">
            <span className="rounded-full border border-emerald-500/50 bg-slate-900/70 px-4 py-1 text-emerald-300">
              AKTUALIZACJA • wersja demo
            </span>
            <span className="text-[11px] text-slate-500">
              Tutaj w przyszłości trener będzie wpisywał numer aktualizacji planu
              i datę.
            </span>
          </div>

          <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </header>

        {/* Blok „WSTĘP” inspirowany screenem */}
        <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-sm leading-relaxed text-slate-200">
          <div className="mb-1 flex items-center gap-3">
            <div className="h-0.5 w-10 bg-sky-500" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
              WSTĘP
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-emerald-300">Siema Mateusz!</p>
            <p>
              Tutaj trener wprowadzi Cię w aktualną wersję planu – napisze, co
              zostało zmienione, na co masz zwracać uwagę w raportach i jak
              podchodzić do kolejnych tygodni współpracy.
            </p>
            <p>
              Ten tekst jest na razie przykładowy. Możesz go śmiało zastąpić
              dowolną treścią, którą normalnie dostajesz od trenera na ekranie
              „Start planu”.
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-slate-100">W aktualizacji planu:</p>
            <ul className="list-disc space-y-1 pl-5 text-slate-200">
              <li>kaloryczność planu utrzymana na podobnym poziomie,</li>
              <li>lekko zwiększona liczba posiłków w ciągu dnia,</li>
              <li>odświeżone menu i nowe propozycje posiłków,</li>
              <li>zmodyfikowany plan treningowy pod aktualny etap,</li>
              <li>ustalenia dotyczące suplementacji i nawodnienia bez zmian.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-red-400">Ogień! 🔥</p>
            <p>
              Poniżej możesz dodać szczegółowe wskazówki dotyczące pomiarów,
              raportów tygodniowych i wszystkiego, co jest ważne z perspektywy
              Twojego trenera. Struktura jest przygotowana tak, żeby łatwo było
              ją czytać na telefonie i komputerze.
            </p>
          </div>
        </section>

        <div className="mt-1">
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

