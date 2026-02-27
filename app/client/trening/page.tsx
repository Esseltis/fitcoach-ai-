export default function TreningPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Plan treningowy
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-50">
            Plan treningowy – widok szczegółowy
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Ekran pod rozpisanie ćwiczeń na dany dzień: serie, powtórzenia,
            przerwy, cardio itd. – inspirowany Twoimi screenami z planu
            treningowego.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
          <p>
            Na razie to tylko placeholder. W przyszłości możemy tu przenieść
            kartę z ćwiczeniami z głównego panelu (lub stworzyć nową), tak aby
            ten ekran stał się pełnym widokiem planu treningowego.
          </p>
        </section>
      </main>
    </div>
  );
}

