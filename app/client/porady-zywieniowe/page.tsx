'use client';

import Link from "next/link";

export default function PoradyZywieniowePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
            PORADY ŻYWIENIOWE
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Ogólne porady pomocne w realizacji planu żywieniowego. Tutaj
            dowiesz się na czym smażyć, jakich przypraw używać i na co w trakcie
            biegu po wymarzoną sylwetkę zwrócić szczególną uwagę.
          </p>
        </header>

        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-sm text-slate-200">
          {[
            {
              title: "Woda",
              desc: "Pamiętaj o podstawowej ilości wody, wypijanej przy nawodnieniu organizmu.",
            },
            {
              title: "Ważenie posiłków",
              desc: "Produkty waż przed obróbką termiczną, zawsze w tej samej formie, aby łatwiej było kontrolować ilości.",
            },
            {
              title: "Przyrządzanie posiłków",
              desc: "Do smażenia używaj tłuszczy, które masz wpisane w planie. Unikaj przypadkowego dodawania dodatkowych kalorii.",
            },
            {
              title: "Czego unikać",
              desc: "Słodycze, alkohol i podjadanie między posiłkami potrafią bardzo szybko zepsuć deficyt kaloryczny.",
            },
            {
              title: "Ostatni posiłek",
              desc: "Nie musisz jeść bardzo wcześnie – ważniejsze jest to, aby nie robić wielogodzinnych przerw od ostatniego posiłku do snu.",
            },
            {
              title: "Shake",
              desc: "Do każdego shake’a dodawaj mleko lub napój roślinny zgodnie z planem – traktuj go jako pełnoprawny posiłek.",
            },
            {
              title: "Przyprawy",
              desc: "Używaj dowolnych przypraw, unikając tylko nadmiaru cukru i tłuszczu. Ostre przyprawy mogą wspierać termogenezę.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-950/80 p-3"
            >
              <p className="text-sm font-semibold text-sky-300">
                {item.title.toUpperCase()}
              </p>
              <p className="text-xs text-slate-300">{item.desc}</p>
            </div>
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

