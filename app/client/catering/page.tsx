'use client';

import Link from "next/link";

export default function CateringPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Plan żywieniowy
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-50">
            Catering dietetyczny
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Miejsce na integrację z cateringiem dietetycznym: informacje o
            wybranej firmie, wariancie diety oraz wskazówki od trenera, jak z
            niego korzystać.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
          <p>
            Na ten moment to widok poglądowy. Możemy go później rozbudować o
            szczegóły współpracy z cateringiem, linki do zamówień czy informację,
            jak dopasować gotowe posiłki do planu.
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

