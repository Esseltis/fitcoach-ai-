'use client';

import Link from "next/link";

export default function PoradyZywieniowePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Plan żywieniowy
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-50">
            Porady żywieniowe
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Sekcja na ogólne wskazówki: woda, ważenie produktów, przerwy między
            posiłkami, czego unikać, ostatni posiłek, przyprawy itd. – inspirowana
            ekranem z Twoich screenów.
          </p>
        </header>

        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-200">
          <p>
            Na razie to tylko miejsce na treść. W przyszłości można tu dodać
            kafelki z ikonami dla każdej porady (Woda, Ważenie posiłków, Czego
            unikać, Ostatni posiłek, Shake, Przyprawy, itp.), tak jak na
            referencyjnym widoku.
          </p>
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

