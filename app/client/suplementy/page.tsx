export default function SuplementyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Plan żywieniowy
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-50">
            Suplementacja
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Ekran inspirowany Twoją zakładką &quot;SUPLEMENTACJA&quot; – tutaj
            pojawi się lista produktów, dawek i godzin przyjmowania.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
          <p>
            Na razie to tylko miejsce na treść. W kolejnych krokach możemy dodać
            listę suplementów z rozwijanymi szczegółami (tak jak na Twoim
            screenie), np. odżywka białkowa, kreatyna, witaminy, omega-3 itd.
          </p>
        </section>
      </main>
    </div>
  );
}

