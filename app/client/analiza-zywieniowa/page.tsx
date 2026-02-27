export default function AnalizaZywieniowaPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Plan żywieniowy
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-50">
            Analiza żywieniowa
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            W tej sekcji w przyszłości pokażemy bilans kaloryczny, rozkład
            makroskładników oraz podsumowanie tego, jak Twój aktualny plan
            żywieniowy wspiera cel (redukcja, masa, rekompozycja).
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-[2fr_1.2fr]">
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Makroskładniki (demo)
            </p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-1/2 bg-emerald-500" />
            </div>
            <p className="text-slate-300">
              Tutaj pojawią się wykresy i paski postępu z gramaturą węglowodanów,
              białka i tłuszczy – podobnie jak na Twoim referencyjnym ekranie.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Podsumowanie celu (demo)
            </p>
            <p className="text-slate-300">
              W docelowej wersji pojawi się tutaj wskaźnik &quot;redukcja /
              nadwyżka&quot; z czytelną wizualizacją, o ile kcal jesteś poniżej lub
              powyżej zapotrzebowania.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

