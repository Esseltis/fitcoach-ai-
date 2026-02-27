export default function WprowadzeniePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Plan żywieniowy
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-50">
            Wprowadzenie do planu
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Tutaj trener w kilku zdaniach wyjaśni główne założenia Twojego planu:
            priorytety żywieniowe, czas trwania, oczekiwane efekty oraz na co
            szczególnie masz zwrócić uwagę na początku współpracy.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm leading-relaxed text-slate-200">
          <p>
            To na razie wersja demonstracyjna. W docelowej aplikacji ten ekran
            będzie wypełniany treściami od Twojego trenera – tak, abyś od razu
            wiedział, jak korzystać z planu, jakie są najważniejsze zasady i czego
            możesz się spodziewać w kolejnych sekcjach.
          </p>
        </section>
      </main>
    </div>
  );
}

