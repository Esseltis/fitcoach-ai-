'use client';

import Link from "next/link";

export default function PlanZywieniowyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        {/* Nagłówek jak PLAN DIETETYCZNY */}
        <header className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
            PLAN DIETETYCZNY
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Poniżej znajdziesz w uproszczony sposób podział węglowodanów, białka
            i tłuszczu na każdy posiłek w Twoim planie dietetycznym, ustalony
            przez trenera dla Ciebie cel sylwetkowy.
          </p>
        </header>

        {/* Tabela makro na posiłki – wersja statyczna jak na screenie */}
        <section className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
          <div className="min-w-[640px]">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-0.5 w-8 bg-sky-500" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                MAKROSKŁADNIKI NA POSIŁKI
              </p>
            </div>

            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="border-b border-slate-800 py-2"></th>
                  <th className="border-b border-slate-800 py-2">Śniadanie</th>
                  <th className="border-b border-slate-800 py-2">
                    II śniadanie
                  </th>
                  <th className="border-b border-slate-800 py-2">Obiad</th>
                  <th className="border-b border-slate-800 py-2">Przekąska</th>
                  <th className="border-b border-slate-800 py-2">
                    Podwieczorek
                  </th>
                  <th className="border-b border-slate-800 py-2">Kolacja</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-[11px]">
                  <td className="border-b border-slate-800 py-2 text-left pl-2 text-sky-400">
                    Węglowodany
                  </td>
                  <td className="border-b border-slate-800 py-2">40</td>
                  <td className="border-b border-slate-800 py-2">40</td>
                  <td className="border-b border-slate-800 py-2">50</td>
                  <td className="border-b border-slate-800 py-2">50</td>
                  <td className="border-b border-slate-800 py-2">60</td>
                  <td className="border-b border-slate-800 py-2">40</td>
                </tr>
                <tr className="text-[11px]">
                  <td className="border-b border-slate-800 py-2 text-left pl-2 text-emerald-400">
                    Białko
                  </td>
                  <td className="border-b border-slate-800 py-2">20</td>
                  <td className="border-b border-slate-800 py-2">20</td>
                  <td className="border-b border-slate-800 py-2">30</td>
                  <td className="border-b border-slate-800 py-2">30</td>
                  <td className="border-b border-slate-800 py-2">20</td>
                  <td className="border-b border-slate-800 py-2">20</td>
                </tr>
                <tr className="text-[11px]">
                  <td className="py-2 text-left pl-2 text-amber-400">
                    Tłuszcze
                  </td>
                  <td className="py-2">15</td>
                  <td className="py-2">15</td>
                  <td className="py-2">10</td>
                  <td className="py-2">10</td>
                  <td className="py-2">15</td>
                  <td className="py-2">10</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Tekstowy opis planu – zbliżony do oryginału */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-sm leading-relaxed text-slate-200">
          <p>
            Twój nowy plan dietetyczny składa się z 4 posiłków stałych i jednego
            płynnego. Poniższy opis możesz w przyszłości zastąpić realnym tekstem
            od trenera – struktura jest przygotowana tak, aby wygodnie się go
            czytało.
          </p>

          <p>
            Organizm potrzebuje regularnego dostarczania składników odżywczych,
            które są niezbędne do produkowania energii na co dzień. Dlatego
            jedzenie częstszych, mniejszych porcji często jest dobrym rozwiązaniem
            podczas redukcji tkanki tłuszczowej.
          </p>

          <div className="space-y-1">
            <p className="font-semibold text-slate-100">Stosując się do planu:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                białko to głównie budowa i odbudowa tkanek, wspiera regenerację,
              </li>
              <li>
                węglowodany to główne źródło energii dla Twojego organizmu,
              </li>
              <li>
                tłuszcze są niezbędne do pracy układu hormonalnego i nerwowego.
              </li>
            </ul>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-slate-100">
              Kilka ważnych zasad stosowania planu:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                staraj się trzymać podobnych godzin posiłków w ciągu dnia (dopuszczalne
                są przesunięcia 1–2h),
              </li>
              <li>
                jeśli zmieniasz kolejność posiłków, pilnuj, aby zjeść wszystkie w
                ciągu dnia,
              </li>
              <li>
                raportuj trenerowi, gdy często pomijasz któryś z posiłków – to
                sygnał, że plan wymaga korekty.
              </li>
            </ul>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-slate-100">
              Podstawy Twojego schematu posiłków:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Każdy stały posiłek zawiera źródło białka, węglowodanów złożonych
                oraz porcję warzyw lub owoców.
              </li>
              <li>
                Posiłek płynny (np. shake) możesz wkomponować po treningu lub w
                dowolnym momencie dnia, gdy jest Ci wygodniej.
              </li>
              <li>
                Jeżeli masz gorszy dzień i nie zrealizujesz planu w 100%, nie
                traktuj tego jako porażki – ważne, abyś wracał do schematu przy
                kolejnych dniach.
              </li>
            </ul>
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

