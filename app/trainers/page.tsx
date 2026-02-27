\"use client\";

import { useRouter } from \"next/navigation\";

const DEMO_TRAINERS = [
  {
    id: \"t1\",
    name: \"Michał Kowalski\",
    title: \"Trener sylwetki i redukcji\",
    focus: \"Redukcja tkanki tłuszczowej, budowa sylwetki\",
  },
  {
    id: \"t2\",
    name: \"Anna Nowak\",
    title: \"Trenerka kobiecej sylwetki\",
    focus: \"Pośladki, brzuch, zdrowy kręgosłup\",
  },
];

export default function TrainersPage() {
  const router = useRouter();

  const handleSelectTrainer = (trainerId: string) => {
    if (typeof window !== \"undefined\") {
      window.localStorage.setItem(\"fitcoach_client_has_trainer\", \"true\");
      window.localStorage.setItem(\"fitcoach_client_trainer_id\", trainerId);
    }
    router.push(\"/client\");
  };

  return (
    <div className=\"min-h-screen bg-gray-50\">
      <header className=\"bg-white border-b border-gray-100\">
        <div className=\"max-w-4xl mx-auto px-4 py-4 flex items-center justify-between\">
          <h1 className=\"text-lg font-semibold text-gray-900\">Wybierz trenera</h1>
        </div>
      </header>

      <main className=\"max-w-4xl mx-auto px-4 py-8 space-y-6\">
        <p className=\"text-sm text-gray-600 max-w-2xl\">
          To jest wersja demonstracyjna. Wybierz przykładowego trenera – po
          wyborze przy kolejnych logowaniach będziesz od razu przechodzić do
          swojego panelu, bez tego ekranu.
        </p>

        <div className=\"grid gap-4 sm:grid-cols-2\">
          {DEMO_TRAINERS.map((trainer) => (
            <article
              key={trainer.id}
              className=\"bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between\"
            >
              <div className=\"space-y-1\">
                <h2 className=\"text-sm font-semibold text-gray-900\">
                  {trainer.name}
                </h2>
                <p className=\"text-xs text-emerald-600 font-medium\">
                  {trainer.title}
                </p>
                <p className=\"text-xs text-gray-600 mt-1\">{trainer.focus}</p>
              </div>
              <button
                type=\"button\"
                onClick={() => handleSelectTrainer(trainer.id)}
                className=\"mt-4 inline-flex justify-center items-center rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition\"
              >
                Wybierz tego trenera
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

