'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Utensils } from "lucide-react";
import { getDoneMeals, toggleMealDone } from "@/lib/store";

const mealTabs = [
  { id: "sniadanie", label: "Śniadanie" },
  { id: "ii_sniadanie", label: "II śniadanie" },
  { id: "obiad", label: "Obiad" },
  { id: "przekaska", label: "Przekąska" },
  { id: "podwieczorek", label: "Podwieczorek" },
  { id: "kolacja", label: "Kolacja" },
];

const variants = ["Jajka sadzone", "Placki białkowe", "Łosoś pieczony", "Jajecznica"];

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function DietaPage() {
  const [email, setEmail] = useState<string>("demo@fitcoach.ai");
  const [ready, setReady] = useState(false);
  const [activeMeal, setActiveMeal] = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);
  const [doneMeals, setDoneMeals] = useState<string[]>([]);

  useEffect(() => {
    const storedEmail = window.localStorage.getItem("fitcoach_client_email") ?? "demo@fitcoach.ai";
    setEmail(storedEmail);
    setDoneMeals(getDoneMeals(storedEmail, todayISO()));
    setReady(true);
  }, []);

  const toggleMeal = (mealId: string) => {
    const next = toggleMealDone(email, todayISO(), mealId);
    setDoneMeals(next);
  };

  const doneCount = mealTabs.filter((m) => doneMeals.includes(m.id)).length;

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
            POSIŁKI I WARIANTY
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Wybierz posiłki i wariant przygotowania, a zjedzone odhacz jako
            zrealizowane. Twój dzienny postęp zapisuje się automatycznie.
          </p>
        </header>

        {/* Pasek z posiłkami */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200">
          <div className="flex flex-wrap gap-2">
            {mealTabs.map((meal, idx) => {
              const done = doneMeals.includes(meal.id);
              return (
                <button
                  key={meal.id}
                  type="button"
                  onClick={() => setActiveMeal(idx)}
                  className={`flex-1 min-w-[90px] rounded-lg px-4 py-2 text-center uppercase tracking-wide ${
                    activeMeal === idx
                      ? "bg-sky-500 text-slate-950 font-semibold shadow-[0_0_18px_rgba(56,189,248,0.6)]"
                      : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : null}
                    {meal.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Pasek postępu dnia */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5 text-sky-400" />
              Zrealizowane posiłki dziś
            </span>
            <span className="font-semibold text-sky-300">
              {doneCount}/{mealTabs.length}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-950/80">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{ width: `${(doneCount / mealTabs.length) * 100}%` }}
            />
          </div>
        </section>

        {/* Główny panel: warianty + zdjęcie + wartości odżywcze */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {variants.map((v, idx) => (
              <button
                key={v}
                type="button"
                onClick={() => setActiveVariant(idx)}
                className={`rounded-full px-4 py-1.5 text-[11px] ${
                  activeVariant === idx
                    ? "bg-sky-500 text-slate-950 font-semibold"
                    : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-[1.7fr_1.3fr]">
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80">
              <div className="h-56 w-full bg-[url('https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center" />
            </div>

            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="self-start text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                WARTOŚCI ODŻYWCZE
              </p>
              <div className="relative h-40 w-40">
                <div className="absolute inset-0 rounded-full border-[10px] border-slate-800" />
                <div className="absolute inset-1 rounded-full border-[10px] border-emerald-500/80 border-r-transparent border-b-transparent rotate-[30deg]" />
                <div className="absolute inset-3 rounded-full border-[10px] border-sky-500/80 border-l-transparent border-b-transparent -rotate-[20deg]" />
                <div className="absolute inset-5 rounded-full border-[10px] border-amber-400/80 border-t-transparent border-r-transparent rotate-[15deg]" />
                <div className="absolute inset-10 flex flex-col items-center justify-center rounded-full bg-slate-950">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    375 kcal
                  </p>
                  <p className="mt-1 text-[11px] text-slate-300">
                    Węglowodany / Białko / Tłuszcze
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Odhaczanie posiłku */}
          <button
            type="button"
            onClick={() => toggleMeal(mealTabs[activeMeal].id)}
            className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide transition ${
              doneMeals.includes(mealTabs[activeMeal].id)
                ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                : "border-slate-700 bg-slate-950/70 text-slate-200 hover:bg-slate-800"
            }`}
          >
            {doneMeals.includes(mealTabs[activeMeal].id) ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Posiłek zrealizowany
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" />
                Oznacz jako zjedzony
              </>
            )}
          </button>

          <div className="mt-2 space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400">
              OPIS
            </p>
            <p>
              Tutaj trener opisze szczegóły przygotowania dania – ilości składników,
              sposób przygotowania, ewentualne zamienniki produktów oraz dodatkowe
              wskazówki (np. kiedy najlepiej zjeść ten posiłek w ciągu dnia).
            </p>
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
