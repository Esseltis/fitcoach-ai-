'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = window.localStorage.getItem("fitcoach_client_logged_in");
    const hasTrainerFlag =
      window.localStorage.getItem("fitcoach_client_has_trainer") === "true";
    const trainerId = window.localStorage.getItem(
      "fitcoach_client_trainer_id",
    );
    const hasTrainer = hasTrainerFlag || Boolean(trainerId);

    if (loggedIn === "true" && hasTrainer) {
      router.replace("/client");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-white">
              FC
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-gray-900">
                FitCoach AI
              </span>
              <span className="text-[11px] text-gray-500">
                Wybierz trenera, osiągaj cele
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-full px-4 py-1.5 font-medium text-gray-700 hover:bg-gray-100"
            >
              Zaloguj się
            </Link>
            <Link
              href="/trainers"
              className="rounded-full bg-emerald-500 px-4 py-1.5 font-medium text-white shadow-sm hover:bg-emerald-600"
            >
              Znajdź trenera
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-16 md:flex-row md:items-center">
        <section className="max-w-xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Platforma dla podopiecznych i trenerów
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Wybierz swojego trenera
            <span className="block bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
              i osiągaj cele w jednym miejscu
            </span>
          </h1>
          <p className="text-base text-gray-600 md:text-lg">
            Znajdź trenera, wykup współpracę i korzystaj z planów treningowych,
            diety, statystyk i czatu w jednym panelu. AI wspiera Ciebie i
            trenera na co dzień.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/trainers"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
            >
              Znajdź trenera
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Mam konto – zaloguj mnie
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 text-sm text-gray-700 md:grid-cols-4">
            <div>
              <p className="text-xl font-semibold text-emerald-600">500+</p>
              <p className="text-xs text-gray-500">trenerów do wyboru</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-emerald-600">10k+</p>
              <p className="text-xs text-gray-500">
                podopiecznych na platformie
              </p>
            </div>
            <div>
              <p className="text-xl font-semibold text-emerald-600">50k+</p>
              <p className="text-xs text-gray-500">planów treningowych</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-emerald-600">98%</p>
              <p className="text-xs text-gray-500">zadowolonych podopiecznych</p>
            </div>
          </div>
        </section>

        <section className="flex-1 space-y-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Jak to działa?
          </p>
          <ol className="space-y-4 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                1
              </span>
              <div>
                <p className="font-semibold">Załóż lub użyj konta</p>
                <p className="text-xs text-gray-500">
                  Zaloguj się jako podopieczny i uzupełnij podstawowe informacje
                  o sobie.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                2
              </span>
              <div>
                <p className="font-semibold">Wybierz trenera</p>
                <p className="text-xs text-gray-500">
                  Przeglądaj profile trenerów, porównaj specjalizacje i ceny i
                  wybierz swojego.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                3
              </span>
              <div>
                <p className="font-semibold">Korzystaj z panelu</p>
                <p className="text-xs text-gray-500">
                  Otrzymuj plany treningowe i dietę, śledź postępy i pisz do
                  trenera w jednym miejscu.
                </p>
              </div>
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
