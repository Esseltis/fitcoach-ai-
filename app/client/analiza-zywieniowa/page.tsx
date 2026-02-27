'use client';

import Link from "next/link";

export default function AnalizaZywieniowaPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        {/* Nagłówek jak na screenie */}
        <header className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
            ANALIZA ŻYWIENIOWA
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Tutaj wyjaśnione są aspekty bilansu kalorycznego, który ustalam na
            obecny okres treningowy. Znajdziesz tutaj także krótkie uzasadnienie
            moich decyzji dotyczących tego tematu.
          </p>
        </header>

        {/* Górny blok: makro + „zegar” redukcji */}
        <section className="grid gap-6 md:grid-cols-[2.2fr_1.2fr]">
          {/* Lewa część – makroskładniki i suma kalorii */}
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-xs text-slate-200">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                MAKROSKŁADNIKI
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Węglowodany
                </p>
                <p className="text-lg font-semibold text-emerald-400">
                  282.5{" "}
                  <span className="text-[11px] font-normal text-slate-300">
                    g
                  </span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Białko
                </p>
                <p className="text-lg font-semibold text-sky-400">
                  162.8{" "}
                  <span className="text-[11px] font-normal text-slate-300">
                    g
                  </span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Tłuszcze
                </p>
                <p className="text-lg font-semibold text-rose-400">
                  73.2{" "}
                  <span className="text-[11px] font-normal text-slate-300">
                    g
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Suma kalorii
              </p>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500" />
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Węglowodany:{" "}
                  <span className="font-semibold text-emerald-300">
                    1129.8 kcal
                  </span>
                </span>
                <span>
                  Białko:{" "}
                  <span className="font-semibold text-sky-300">
                    651.2 kcal
                  </span>
                </span>
                <span>
                  Tłuszcze:{" "}
                  <span className="font-semibold text-rose-300">
                    658.7 kcal
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Prawa część – „zegar” redukcji – wersja uproszczona */}
          <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="relative h-40 w-40 md:h-48 md:w-48">
              <div className="absolute inset-0 rounded-full border-[10px] border-slate-800" />
              <div className="absolute inset-1 rounded-full border-[10px] border-emerald-500/60 border-r-transparent border-b-transparent rotate-[40deg]" />
              <div className="absolute inset-3 rounded-full border-[10px] border-rose-500/70 border-l-transparent border-t-transparent -rotate-[10deg]" />
              <div className="absolute inset-6 rounded-full bg-slate-950/90 flex flex-col items-center justify-center">
                <p className="text-[11px] uppercase tracking-wide text-rose-300">
                  Redukcja
                </p>
                <p className="mt-1 text-3xl font-semibold text-slate-50">
                  -15%
                </p>
                <p className="mt-1 text-[11px] text-slate-400 text-center px-4">
                  2433 kcal przyjęte vs. <br />
                  zapotrzebowanie
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dolna część – paski procentowe + makro / kg mc */}
        <section className="grid gap-6 md:grid-cols-[2.2fr_1.2fr] text-xs text-slate-200">
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Zawartość węglowodanów w diecie
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[46%] bg-emerald-400" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Zawartość białka w diecie
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[26%] bg-sky-400" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Zawartość tłuszczów w diecie
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[27%] bg-rose-400" />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Ilość makroskładników na 1 kg masy ciała
            </p>
            <div className="space-y-2">
              <p>
                Ilość węglowodanów:{" "}
                <span className="font-semibold text-emerald-300">3.5 g</span>
              </p>
              <p>
                Ilość białka:{" "}
                <span className="font-semibold text-sky-300">2.0 g</span>
              </p>
              <p>
                Ilość tłuszczów:{" "}
                <span className="font-semibold text-rose-300">0.9 g</span>
              </p>
            </div>
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

