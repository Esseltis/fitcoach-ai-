"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getClientProfile, saveClientProfile, type ClientProfile } from "@/lib/store";

const GOALS = [
  { value: "Redukcja tkanki tłuszczowej", label: "Redukcja (spalenie tłuszczu)" },
  { value: "Utrzymanie sylwetki", label: "Utrzymanie sylwetki" },
  { value: "Budowa masy mięśniowej", label: "Masa / budowa mięśni" },
  { value: "Poprawa wydolności", label: "Poprawa wydolności" },
  { value: "Zdrowie i dobre samopoczucie", label: "Zdrowie i dobre samopoczucie" },
];

const ACTIVITY = [
  { value: "Brak (siedzący tryb)", label: "Brak / siedzący tryb" },
  { value: "Niska (1-2 treningi/tydz.)", label: "Niska (1-2 treningi/tydz.)" },
  { value: "Umiarkowana (3-4 treningi/tydz.)", label: "Umiarkowana (3-4 treningi/tydz.)" },
  { value: "Wysoka (5-6 treningi/tydz.)", label: "Wysoka (5-6 treningi/tydz.)" },
  { value: "Bardzo wysoka (praca fizyczna / codziennie)", label: "Bardzo wysoka (codziennie)" },
];

export default function ClientProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);

  const [goal, setGoal] = useState("");
  const [gender, setGender] = useState("mężczyzna");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState("");
  const [trainingFrequency, setTrainingFrequency] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState("");
  const [preferences, setPreferences] = useState("");
  const [healthNotes, setHealthNotes] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = window.localStorage.getItem("fitcoach_client_logged_in");
    const storedEmail = window.localStorage.getItem("fitcoach_client_email");
    const trainerId = window.localStorage.getItem("fitcoach_client_trainer_id");
    if (loggedIn !== "true" || !storedEmail || !trainerId) {
      router.replace("/login");
      return;
    }
    setEmail(storedEmail);
    const existing = getClientProfile(storedEmail);
    if (existing) {
      setGoal(existing.goal);
      setGender(existing.gender);
      setAge(existing.age);
      setWeight(existing.weight);
      setHeight(existing.height);
      setActivity(existing.activity);
      setTrainingFrequency(existing.trainingFrequency);
      setMealsPerDay(existing.mealsPerDay);
      setPreferences(existing.preferences);
      setHealthNotes(existing.healthNotes);
    }
    setReady(true);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const data: ClientProfile = {
      goal,
      gender,
      age,
      weight,
      height,
      activity,
      trainingFrequency,
      mealsPerDay,
      preferences,
      healthNotes,
      submittedAt: new Date().toISOString(),
    };
    saveClientProfile(email, data);
    setSaved(true);
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-200">Ładowanie...</p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400";
  const labelCls = "block space-y-1";
  const labelText = "text-[11px] font-medium text-slate-300";

  if (saved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md space-y-5 rounded-2xl border border-emerald-500/40 bg-slate-900/80 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl">
            ✓
          </div>
          <h1 className="text-lg font-semibold text-slate-50">
            Profil zapisany!
          </h1>
          <p className="text-sm text-slate-400">
            Twój trener zobaczy profil i przygotuje dla Ciebie plan.
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <Link
              href="/client/raport"
              className="inline-block rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Wyślij raport dzienny
            </Link>
            <Link
              href="/client"
              className="inline-block rounded-full border border-slate-700 px-6 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Przejdź do panelu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Krok 1 · Raport wstępny
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
            Powiedz nam o sobie
          </h1>
          <p className="mx-auto max-w-lg text-sm text-slate-400">
            Wypełnij krótki profil. Na jego podstawie Twój trener przygotuje
            dietę i trening dopasowane do Ciebie.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              <span className={labelText}>Twój cel</span>
              <select
                className={inputCls}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              >
                <option value="">— wybierz —</option>
                {GOALS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              <span className={labelText}>Płeć</span>
              <select
                className={inputCls}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="mężczyzna">Mężczyzna</option>
                <option value="kobieta">Kobieta</option>
              </select>
            </label>
            <label className={labelCls}>
              <span className={labelText}>Wiek (lata)</span>
              <input
                className={inputCls}
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="np. 32"
                required
              />
            </label>
            <label className={labelCls}>
              <span className={labelText}>Waga (kg)</span>
              <input
                className={inputCls}
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="np. 81"
                required
              />
            </label>
            <label className={labelCls}>
              <span className={labelText}>Wzrost (cm)</span>
              <input
                className={inputCls}
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="np. 173"
                required
              />
            </label>
            <label className={labelCls}>
              <span className={labelText}>Aktywność fizyczna</span>
              <select
                className={inputCls}
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                required
              >
                <option value="">— wybierz —</option>
                {ACTIVITY.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              <span className={labelText}>Treningi w tygodniu</span>
              <input
                className={inputCls}
                type="number"
                min="0"
                max="7"
                value={trainingFrequency}
                onChange={(e) => setTrainingFrequency(e.target.value)}
                placeholder="np. 4"
                required
              />
            </label>
            <label className={labelCls}>
              <span className={labelText}>Posiłki dziennie</span>
              <input
                className={inputCls}
                type="number"
                min="1"
                max="8"
                value={mealsPerDay}
                onChange={(e) => setMealsPerDay(e.target.value)}
                placeholder="np. 5"
                required
              />
            </label>
          </div>

          <label className={labelCls}>
            <span className={labelText}>Preferencje / uwagi żywieniowe (opcjonalnie)</span>
            <textarea
              className={inputCls}
              rows={2}
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="np. nie jem wieprzowiny, lubię ryby..."
            />
          </label>
          <label className={labelCls}>
            <span className={labelText}>Zdrowie / przeciwwskazania (opcjonalnie)</span>
            <textarea
              className={inputCls}
              rows={2}
              value={healthNotes}
              onChange={(e) => setHealthNotes(e.target.value)}
              placeholder="np. kontuzja kolana, cukrzyca..."
            />
          </label>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Zapisz profil
            </button>
            <Link
              href="/client"
              className="rounded-full border border-slate-700 px-6 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Wróć do panelu
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
