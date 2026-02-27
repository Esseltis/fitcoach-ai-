'use client';

import Link from "next/link";

export default function PlanZywieniowyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Plan żywieniowy
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-50">
            Plan żywieniowy
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Tutaj pojawi się tabela z rozkładem makroskładników na posiłki (jak
            na Twoim screenie &quot;PLAN DIETETYCZNY&quot;) oraz opis ogólnych
            zasad stosowania planu.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-200">
          <p>
            Na razie jest to widok przykładowy. W kolejnych krokach możemy
            odwzorować dokładniej tabelę posiłków, podział na śniadanie, II
            śniadanie, obiad, przekąskę, podwieczorek i kolację oraz dodać blok
            z ważnymi uwagami trenera.
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

