'use client';

import Link from "next/link";

export default function NawodnieniePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        {/* Nagłówek jak NAWODNIENIE ORGANIZMU */}
        <header className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
            NAWODNIENIE ORGANIZMU
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Opis zasad związanych z gospodarką wodno–elektrolitową. Oprócz diety
            jest to drugi najważniejszy obszar, którego codziennie pilnujesz.
          </p>
        </header>

        {/* Uwagi ogólne + pozostałe napoje */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-sm text-slate-200">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="h-0.5 w-8 bg-emerald-500" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                UWAGI OGÓLNE DO TWOJEGO NAWODNIENIA
              </p>
            </div>
            <p>
              Pij przede wszystkim wodę mineralną – nawodnia i jest źródłem
              cennych składników. W dalszej części planu trener może dopisać
              konkretne zalecenia co do ilości i rodzaju wody.
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

        {/* Legenda – prosty blok z ikonami/tekstami */}
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-xs text-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
            LEGENDA (PRZYKŁAD)
          </p>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-md bg-sky-500/40 border border-sky-400" />
              <p className="text-[11px] text-slate-300 text-center">
                1 szklanka wody
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-md bg-sky-400/30 border border-sky-300" />
              <p className="text-[11px] text-slate-300 text-center">
                250 ml napoju
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-12 w-8 rounded-md bg-sky-500/50 border border-sky-400" />
              <p className="text-[11px] text-slate-300 text-center">
                0.5 l butelka
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-14 w-10 rounded-md bg-sky-500/60 border border-sky-400" />
              <p className="text-[11px] text-slate-300 text-center">
                1 l butelka
              </p>
            </div>
          </div>
        </section>

        {/* Plan nawodnienia – prosty układ z „szklankami” */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-xs text-slate-200">
          <p className="text-center text-sm font-semibold text-slate-50">
            PLAN TWOJEGO NAWODNIENIA (PRZYKŁAD)
          </p>
          <p className="text-center text-[11px] text-slate-400">
            1–28 DNI: Docelowo min. 2–2.5 litra płynów dziennie (woda + napoje
            bez kalorii).
          </p>

          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="flex items-end gap-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-10 w-4 rounded-b-md bg-gradient-to-t from-sky-500/70 to-sky-300/40 border border-sky-400/80"
                />
              ))}
            </div>
            <p className="text-[11px] text-slate-300">
              Odpowiada to mniej więcej 8 szklankom wody w ciągu dnia.
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


