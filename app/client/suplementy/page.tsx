'use client';

import Link from "next/link";
import { useState } from "react";

type Supplement = {
  id: string;
  name: string;
  type: string;
  shortDesc: string;
};

const SUPPLEMENTS: Supplement[] = [
  {
    id: "whey",
    name: "Odżywka białkowa – Balance Wild Protein",
    type: "Odżywka białkowa",
    shortDesc: "Koncentrat białka serwatkowego najwyższej jakości.",
  },
  {
    id: "creatine",
    name: "Creatine Mono",
    type: "Monohydrat kreatyny",
    shortDesc: "Wsparcie siły i wydolności mięśniowej.",
  },
  {
    id: "vitamins",
    name: "Vitamin D3 + K2",
    type: "Witaminy",
    shortDesc: "Wsparcie układu odpornościowego i kostnego.",
  },
  {
    id: "omega3",
    name: "Omega 3",
    type: "Kwasy tłuszczowe",
    shortDesc: "Wsparcie pracy serca i układu nerwowego.",
  },
];

export default function SuplementyPage() {
  const [activeId, setActiveId] = useState<string>("whey");
  const active = SUPPLEMENTS.find((s) => s.id === activeId) ?? SUPPLEMENTS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
            SUPLEMENTACJA
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Dokładna rozpiska uzupełnienia diety – odżywek i suplementów. Dawki,
            pory stosowania, produkty – wszystko czarno na białym.
          </p>
        </header>

        {/* Pasek „Przepisane suplementy” */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
            PRZEPISANE SUPLEMENTY
          </p>
        </section>

        {/* Główny suplement – karta jak na screenie (uproszczona) */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-xs text-slate-200">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Lewa kolumna – obrazek + przycisk */}
            <div className="flex w-full flex-col items-center gap-3 md:w-56">
              <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80">
                <span className="text-[11px] text-slate-500">
                  Zdjęcie suplementu
                </span>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                {active.type}
              </p>
              <button className="w-full rounded-full bg-sky-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-950 hover:bg-sky-400">
                Zamów teraz
              </button>
            </div>

            {/* Prawa kolumna – opis dawkowania / suplementu */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-50">
                  {active.name}
                </h2>
                <p className="mt-1 text-[11px] text-slate-400">
                  {active.shortDesc}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                    DAWKOWANIE
                  </p>
                  <p className="text-[11px] text-slate-200">
                    Odżywkę stosuj zgodnie z ilościami podanymi w planie
                    dietetycznym. Zwykle 1–2 porcje dziennie po treningu lub jako
                    uzupełnienie brakującego białka.
                  </p>
                </div>
                <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                    INFORMACJE O SUPLEMENCIE
                  </p>
                  <p className="text-[11px] text-slate-200">
                    W docelowej wersji tutaj trener opisze, dlaczego wybrał ten
                    produkt, na co zwracać uwagę przy stosowaniu oraz ewentualne
                    przeciwwskazania.
                  </p>
                </div>
              </div>

              <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] text-slate-200">
                <p className="font-semibold text-slate-100">Opis suplementu:</p>
                <p>
                  Tekst przykładowy – w przyszłości trener wypełni go konkretnymi
                  informacjami o działaniu, składzie i korzyściach ze stosowania
                  suplementu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lista pozostałych suplementów – proste „accordiony” bez logiki otwierania */}
        <section className="space-y-2 text-xs text-slate-200">
          {SUPPLEMENTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                active.id === s.id
                  ? "border-sky-500 bg-slate-900/90"
                  : "border-slate-800 bg-slate-950/80 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-800" />
                <div>
                  <p className="text-sm font-semibold text-slate-50">
                    {s.name}
                  </p>
                  <p className="text-[11px] text-slate-400">{s.type}</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">
                {active.id === s.id ? "Wybrany" : "Zmień"}
              </span>
            </button>
          ))}
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


