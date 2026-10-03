'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cloudEnabled, cloudAddMembership, schedulePush } from "@/lib/cloud";

const DEMO_TRAINERS = [
  {
    id: "t1",
    name: "Michał Kowalski",
    title: "Trener sylwetki i redukcji",
    focus: "Redukcja tkanki tłuszczowej, budowa sylwetki",
  },
  {
    id: "t2",
    name: "Anna Nowak",
    title: "Trenerka kobiecej sylwetki",
    focus: "Pośladki, brzuch, zdrowy kręgosłup",
  },
];

const CLOUD = cloudEnabled();

export default function TrainersPage() {
  const router = useRouter();
  const [trainerEmail, setTrainerEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSelectTrainer = (trainerId: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("fitcoach_client_has_trainer", "true");
      window.localStorage.setItem("fitcoach_client_trainer_id", trainerId);
      schedulePush("fitcoach_client_has_trainer", "true");
      schedulePush("fitcoach_client_trainer_id", trainerId);
    }
    router.push("/client");
  };

  const handleCloudConnect = async () => {
    setError("");
    const t = trainerEmail.trim().toLowerCase();
    if (!t.includes("@") || !t.includes(".")) {
      setError("Podaj poprawny adres e-mail trenera.");
      return;
    }
    setBusy(true);
    try {
      const res = await cloudAddMembership(t);
      if (!res.ok) {
        setError(res.error ?? "Nie udało się połączyć z trenerem.");
        return;
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem("fitcoach_client_has_trainer", "true");
        window.localStorage.setItem("fitcoach_client_trainer_id", t);
        schedulePush("fitcoach_client_has_trainer", "true");
        schedulePush("fitcoach_client_trainer_id", t);
      }
      router.push("/client");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Wybierz trenera</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {CLOUD ? (
          <>
            <p className="text-sm text-gray-600 max-w-2xl">
              Połącz się ze swoim trenerem — wpisz adres e-mail, pod którym
              zarejestrował się w FitCoach. Od tego momentu Twój trener widzi
              raporty, plany i postępy, niezależnie od tego, z jakiego urządzenia
              korzystasz.
            </p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 max-w-lg space-y-3">
              <label className="block text-sm font-medium text-gray-900">
                E-mail trenera
              </label>
              <input
                type="email"
                value={trainerEmail}
                onChange={(e) => setTrainerEmail(e.target.value)}
                placeholder="trener@przyklad.pl"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={handleCloudConnect}
                disabled={busy}
                className="inline-flex justify-center items-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {busy ? "Łączenie…" : "Połącz z trenerem"}
              </button>
              <p className="text-xs text-gray-500">
                Nie znasz adresu? Zapytaj trenera — powinien podać ten, którym
                loguje się do panelu.
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 max-w-2xl">
              To jest wersja demonstracyjna. Wybierz przykładowego trenera – po
              wyborze przy kolejnych logowaniach będziesz od razu przechodzić do
              swojego panelu, bez tego ekranu.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {DEMO_TRAINERS.map((trainer) => (
                <article
                  key={trainer.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold text-gray-900">
                      {trainer.name}
                    </h2>
                    <p className="text-xs text-emerald-600 font-medium">
                      {trainer.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{trainer.focus}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectTrainer(trainer.id)}
                    className="mt-4 inline-flex justify-center items-center rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition"
                  >
                    Wybierz tego trenera
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}