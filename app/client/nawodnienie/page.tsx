'use client';

import Link from "next/link";

export default function NawodnieniePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Plan żywieniowy
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-50">
            Nawodnienie organizmu
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Tutaj w przyszłości pojawi się opis zasad picia wody, przykładowy
            plan nawodnienia oraz grafika z ilością płynów – podobnie jak na
            referencyjnym widoku.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
          <p>
            Ten ekran jest na razie uproszczony. Możemy go później rozbudować o
            graficzne przedstawienie liczby szklanek/butelek wody dziennie oraz
            dodatkowe uwagi trenera.
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

