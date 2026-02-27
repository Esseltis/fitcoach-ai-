'use client';

import Link from "next/link";
import { useState } from "react";

const mealTabs = [
  "Śniadanie",
  "II śniadanie",
  "Obiad",
  "Przekąska",
  "Podwieczorek",
  "Kolacja",
];

const variants = ["Jajka sadzone", "Placki białkowe", "Łosoś pieczony", "Jajecznica"];

export default function DietaPage() {
  const [activeMeal, setActiveMeal] = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        {/* Nagłówek jak POSIŁKI I WARIANTY */}
        <header className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
            POSIŁKI I WARIANTY
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Wybierz dla siebie posiłki wraz z wariantem przygotowania, które
            chcesz jeść. W przyszłości trener wypełni ten ekran konkretnymi
            propozycjami dań dla każdego posiłku.
          </p>
        </header>

        {/* Pasek z posiłkami */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200">
          <div className="flex flex-wrap gap-2">
            {mealTabs.map((label, idx) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveMeal(idx)}
                className={`flex-1 min-w-[90px] rounded-lg px-4 py-2 text-center uppercase tracking-wide ${
                  activeMeal === idx
                    ? "bg-sky-500 text-slate-950 font-semibold shadow-[0_0_18px_rgba(56,189,248,0.6)]"
                    : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Główny panel: warianty + zdjęcie + wartości odżywcze */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
          {/* Warianty dania */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {variants.map((v, idx) => (
              <button
                key={v}
                type="button"
                onClick={() => setActiveVariant(idx)}
                className={`rounded-full px-4 py-1.5 text-[11px] ${
                  activeVariant === idx
                    ? "bg-sky-500 text-slate-950 font-semibold"
                    : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-[1.7fr_1.3fr]">
            {/* Zdjęcie potrawy – placeholder */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80">
              <div className="h-56 w-full bg-[url('https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center" />
            </div>

            {/* Wartości odżywcze – uproszczony „zegar” */}
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="self-start text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                WARTOŚCI ODŻYWCZE (DEMO)
              </p>
              <div className="relative h-40 w-40">
                <div className="absolute inset-0 rounded-full border-[10px] border-slate-800" />
                <div className="absolute inset-1 rounded-full border-[10px] border-emerald-500/80 border-r-transparent border-b-transparent rotate-[30deg]" />
                <div className="absolute inset-3 rounded-full border-[10px] border-sky-500/80 border-l-transparent border-b-transparent -rotate-[20deg]" />
                <div className="absolute inset-5 rounded-full border-[10px] border-amber-400/80 border-t-transparent border-r-transparent rotate-[15deg]" />
                <div className="absolute inset-10 flex flex-col items-center justify-center rounded-full bg-slate-950">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    375 kcal
                  </p>
                  <p className="mt-1 text-[11px] text-slate-300">
                    Węglowodany / Białko / Tłuszcze
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Opis dania */}
          <div className="mt-2 space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400">
              OPIS
            </p>
            <p>
              Tutaj trener opisze szczegóły przygotowania dania – ilości składników,
              sposób przygotowania, ewentualne zamienniki produktów oraz dodatkowe
              wskazówki (np. kiedy najlepiej zjeść ten posiłek w ciągu dnia).
            </p>
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


