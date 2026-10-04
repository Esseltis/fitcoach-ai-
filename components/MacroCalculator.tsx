"use client";

import { useState } from "react";
import {
  saveClientContent,
  type ClientProfile,
  type TrainerContent,
} from "@/lib/store";

// Kalkulator kalorii i makro dla podopiecznego (Mifflin-St Jeor) —
// trener ustawia cel, jednym kliknięciem zapisuje go w analizie
// żywieniowej, którą klient widzi w Diecie / Analizie.

const ACTIVITY: { v: string; label: string }[] = [
  { v: "1.2", label: "Niska — głównie siedzący tryb" },
  { v: "1.375", label: "Lekka — 1–3 treningi / tydz." },
  { v: "1.55", label: "Umiarkowana — 3–5 treningów / tydz." },
  { v: "1.725", label: "Wysoka — 6–7 treningów / tydz." },
  { v: "1.9", label: "Bardzo wysoka — ciężka praca + trening" },
];

const GOALS: { v: string; label: string; factor: number; balance: string }[] =
  [
    { v: "reduce", label: "Redukcja (−15%)", factor: 0.85, balance: "−15%" },
    { v: "keep", label: "Utrzymanie", factor: 1, balance: "0%" },
    { v: "gain", label: "Masa (+10%)", factor: 1.1, balance: "+10%" },
  ];

const num = (s: string) => {
  const n = Number(String(s).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

export default function MacroCalculator({
  email,
  content,
  setContent,
  profile,
}: {
  email: string;
  content: TrainerContent;
  setContent: (c: TrainerContent) => void;
  profile: ClientProfile | null;
}) {
  const n = content.nutrition;
  const [weight, setWeight] = useState(profile?.weight || n.weight || "80");
  const [height, setHeight] = useState(profile?.height || n.height || "175");
  const [age, setAge] = useState(profile?.age || "30");
  const [gender, setGender] = useState(
    /^m/i.test(profile?.gender ?? "") ? "M" : "K"
  );
  const [activity, setActivity] = useState("1.55");
  const [goal, setGoal] = useState("keep");
  const [proteinPerKg, setProteinPerKg] = useState("2.0");
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const w = num(weight);
  const h = num(height);
  const a = num(age);
  const ok = w > 20 && w < 400 && h > 100 && h < 250 && a >= 13 && a <= 100;

  const g = GOALS.find((x) => x.v === goal) ?? GOALS[1];
  const act = Number(activity);

  // Mifflin-St Jeor → TDEE → cel
  const bmr = ok ? 10 * w + 6.25 * h - 5 * a + (gender === "M" ? -5 : 161) : 0;
  const tdee = Math.round(bmr * act);
  const kcal = Math.round((tdee * g.factor) / 10) * 10;
  const pPerKg = Math.min(3.5, Math.max(1.2, num(proteinPerKg) || 2));
  const protein = Math.round(pPerKg * w);
  const fat = Math.round(0.8 * w);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const pKcal = protein * 4;
  const cKcal = carbs * 4;
  const fKcal = fat * 9;
  const sum = Math.max(1, pKcal + cKcal + fKcal);
  const pct = (x: number) => Math.round((x / sum) * 100);

  const apply = () => {
    if (!ok) {
      setErr("Uzupełnij poprawnie wagę, wzrost i wiek.");
      return;
    }
    setErr("");
    const next: TrainerContent = {
      ...content,
      nutrition: {
        ...n,
        balanceText: `Bilans ustalony kalkulatorem trenera: ${g.label.toLowerCase()}.`,
        balanceType: g.label.split(" (")[0],
        balanceValue: g.balance,
        calories: String(kcal),
        proteinG: String(protein),
        carbsG: String(carbs),
        fatG: String(fat),
        proteinKcal: String(pKcal),
        carbsKcal: String(cKcal),
        fatKcal: String(fKcal),
        proteinPct: String(pct(pKcal)),
        carbsPct: String(pct(cKcal)),
        fatPct: String(pct(fKcal)),
        weight: String(w),
        height: String(h),
      },
    };
    setContent(next);
    saveClientContent(email, next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const field =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400";
  const lab = "text-xs font-medium text-slate-300";

  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            🧮 Kalkulator kalorii i makro
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Wprowadź dane — cel trafi do analizy żywieniowej klienta.
          </p>
        </div>
        {saved && <span className="text-xs text-emerald-300">Zapisano ✓</span>}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1">
          <span className={lab}>Waga (kg)</span>
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            inputMode="decimal"
            className={field}
          />
        </label>
        <label className="space-y-1">
          <span className={lab}>Wzrost (cm)</span>
          <input
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            inputMode="numeric"
            className={field}
          />
        </label>
        <label className="space-y-1">
          <span className={lab}>Wiek</span>
          <input
            value={age}
            onChange={(e) => setAge(e.target.value)}
            inputMode="numeric"
            className={field}
          />
        </label>
        <label className="space-y-1">
          <span className={lab}>Płeć</span>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={field}
          >
            <option value="K">Kobieta</option>
            <option value="M">Mężczyzna</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className={lab}>Aktywność</span>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className={field}
          >
            {ACTIVITY.map((x) => (
              <option key={x.v} value={x.v}>
                {x.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={lab}>Cel</span>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className={field}
          >
            {GOALS.map((x) => (
              <option key={x.v} value={x.v}>
                {x.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={lab}>Białko (g / kg)</span>
          <input
            value={proteinPerKg}
            onChange={(e) => setProteinPerKg(e.target.value)}
            inputMode="decimal"
            className={field}
          />
        </label>
      </div>

      {ok ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4">
          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-emerald-300">
                Cel kaloryczny
              </p>
              <p className="text-3xl font-extrabold text-slate-50">
                {kcal} <span className="text-base font-semibold">kcal</span>
              </p>
            </div>
            <div className="text-xs text-slate-400">
              <p>
                BMR {Math.round(bmr)} · TDEE {tdee} kcal
              </p>
              <p>
                {g.label} · białko {pPerKg.toFixed(1)} g/kg
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {[
              { l: "Białko", g: protein, k: pKcal, p: pct(pKcal), c: "text-sky-300" },
              { l: "Węgle", g: carbs, k: cKcal, p: pct(cKcal), c: "text-amber-300" },
              { l: "Tłuszcze", g: fat, k: fKcal, p: pct(fKcal), c: "text-rose-300" },
            ].map((m) => (
              <div
                key={m.l}
                className="rounded-lg border border-slate-800 bg-slate-950/70 p-3"
              >
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                  {m.l}
                </p>
                <p className={`text-lg font-bold ${m.c}`}>
                  {m.g} g
                  <span className="ml-1 text-xs font-medium text-slate-500">
                    {m.p}%
                  </span>
                </p>
                <p className="text-[11px] text-slate-500">{m.k} kcal</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={apply}
              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Zapisz w analizie klienta
            </button>
            <span className="text-[11px] text-slate-500">
              Zmieni pola kalorie / makro widoczne w Diecie i Analizie.
            </span>
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Uzupełnij wagę (20–400 kg), wzrost (100–250 cm) i wiek (13–100 lat),
          aby zobaczyć wyliczenie.
        </p>
      )}
      {err && <p className="text-xs text-red-400">{err}</p>}
    </section>
  );
}