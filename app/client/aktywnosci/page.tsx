"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flame, Plus, Trash2 } from "lucide-react";
import {
  getClientContent,
  getDoneMeals,
  getMealChoices,
  getActivities,
  getActivitiesByDate,
  addActivity,
  removeActivity,
  ACTIVITY_PRESETS,
  estimateActivityKcal,
  getBodyWeightKg,
  type ActivityEntry,
} from "@/lib/store";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function AktywnosciPage() {
  const [email, setEmail] = useState<string>("demo@fitcoach.ai");
  const [ready, setReady] = useState(false);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [presetId, setPresetId] = useState("spacer");
  const [minutes, setMinutes] = useState("30");
  const [ownKcal, setOwnKcal] = useState("");
  const [weight, setWeight] = useState(0);
  const [eaten, setEaten] = useState(0);
  const [target, setTarget] = useState(0);
  const [week, setWeek] = useState<
    { key: string; label: string; kcal: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored =
      window.localStorage.getItem("fitcoach_client_email") ??
      "demo@fitcoach.ai";
    setEmail(stored);
    setActivities(getActivities(stored, todayISO()));

    const content = getClientContent(stored);
    setWeight(getBodyWeightKg(stored, content.nutrition.weight));
    setTarget(parseInt(content.diet.targetCalories) || 0);

    // Zjedzone = suma odhaczonych posiłków (wg wybranych wariantów)
    const done = getDoneMeals(stored, todayISO());
    const choices = getMealChoices(stored, todayISO());
    const meals = content.diet.meals;
    const cats = Array.from(
      new Set(meals.map((m) => m.category ?? "").filter(Boolean))
    );
    let kcal = 0;
    for (const cat of cats) {
      if (!done.includes(cat)) continue;
      const variants = meals.filter((m) => (m.category ?? "") === cat);
      const v = variants[choices[cat] ?? 0] ?? variants[0];
      kcal += parseInt(v.calories) || 0;
    }
    setEaten(kcal);

    // Spalone w ostatnich 7 dniach
    const byDate = getActivitiesByDate(stored);
    const now = new Date();
    const days: { key: string; label: string; kcal: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const mid = new Date(d);
      mid.setHours(12, 0, 0, 0);
      const k =
        i === 0 ? todayISO() : mid.toISOString().slice(0, 10);
      days.push({
        key: k,
        label: d.toLocaleDateString("pl-PL", { weekday: "short" }).slice(0, 2),
        kcal: (byDate[k] ?? []).reduce((s, a) => s + a.kcal, 0),
      });
    }
    setWeek(days);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preset = ACTIVITY_PRESETS.find((p) => p.id === presetId) ??
    ACTIVITY_PRESETS[0];
  const parsedMinutes = Math.max(0, parseInt(minutes) || 0);
  const previewKcal =
    preset.met > 0
      ? estimateActivityKcal(preset.met, weight, parsedMinutes)
      : Math.max(0, parseInt(ownKcal) || 0);

  const burned = activities.reduce((s, a) => s + a.kcal, 0);
  const allowance = Math.max(0, target - eaten + burned);
  const maxWeek = Math.max(1, ...week.map((d) => d.kcal));

  const onAdd = () => {
    if (previewKcal <= 0) {
      setError(
        preset.met > 0
          ? "Podaj liczbę minut (min. 1)."
          : "Podaj spalone kalorie."
      );
      return;
    }
    setError(null);
    setActivities(
      addActivity(email, todayISO(), {
        name: preset.name,
        minutes: preset.met > 0 ? parsedMinutes : 0,
        kcal: previewKcal,
      })
    );
    setOwnKcal("");
    if (preset.met > 0) setMinutes("30");
  };

  const onDelete = (id: string) => {
    setActivities(removeActivity(email, todayISO(), id));
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
            AKTYWNOŚCI I BILANS
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Każdy ruch się liczy — dopisz aktywność spoza planu, a policzymy
            spalone kalorie i uzupełnimy bilans energetyczny dnia.
          </p>
        </header>

        {/* Bilans energetyczny */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">
            Bilans energetyczny dzisiaj
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-slate-400">Zjedzone</p>
              <p className="mt-1 text-xl font-semibold text-slate-50">
                {eaten}{" "}
                <span className="text-xs font-normal text-slate-500">
                  / {target} kcal
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <p className="text-slate-400">Spalone (aktywności)</p>
              <p className="mt-1 text-xl font-semibold text-orange-400">
                {burned}{" "}
                <span className="text-xs font-normal text-slate-500">kcal</span>
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3">
              <p className="text-emerald-300/90">Możesz jeszcze zjeść</p>
              <p className="mt-1 text-xl font-semibold text-emerald-400">
                {allowance}{" "}
                <span className="text-xs font-normal text-slate-500">kcal</span>
              </p>
            </div>
          </div>

          {/* Spalone w 7 dni */}
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">
              Spalone w ostatnich 7 dniach
            </p>
            <div className="mt-2 flex items-end justify-between gap-2">
              {week.map((d) => (
                <div
                  key={d.key}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-[9px] text-slate-400">
                    {d.kcal > 0 ? d.kcal : ""}
                  </span>
                  <div
                    className="w-full max-w-[26px] rounded-t bg-gradient-to-t from-orange-600 to-amber-400"
                    style={{ height: `${Math.max(2, (d.kcal / maxWeek) * 44)}px` }}
                  />
                  <span className="text-[9px] text-slate-500">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dodawanie aktywności */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
            Dodaj aktywność
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-slate-400">
                Aktywność
              </span>
              <select
                value={presetId}
                onChange={(e) => setPresetId(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {ACTIVITY_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            {preset.met > 0 ? (
              <label className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wide text-slate-400">
                  Czas (min)
                </span>
                <input
                  type="number"
                  min="1"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-24 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </label>
            ) : (
              <label className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wide text-slate-400">
                  Spalone kcal
                </span>
                <input
                  type="number"
                  min="1"
                  placeholder="np. 250"
                  value={ownKcal}
                  onChange={(e) => setOwnKcal(e.target.value)}
                  className="w-28 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </label>
            )}

            <div className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2">
              <span className="text-slate-400">Szacunek: </span>
              <span className="font-semibold text-orange-400">
                {previewKcal} kcal
              </span>
            </div>

            <button
              type="button"
              onClick={onAdd}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" />
              Dodaj
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Szacunek liczony wg Twojej wagi ({weight || "—"} kg) i MET
            aktywności.
          </p>
          {error && (
            <p className="mt-3 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-rose-300">
              {error}
            </p>
          )}
        </section>

        {/* Lista dzisiejszych aktywności */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Dzisiaj
            </p>
            <p className="text-slate-400">
              {activities.length} aktywności ·{" "}
              <span className="font-semibold text-orange-400">{burned} kcal</span>
            </p>
          </div>

          {activities.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center text-slate-400">
              Brak aktywności — dodaj pierwszą, np. wieczorny spacer.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {activities.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <div>
                      <p className="font-semibold text-slate-100">{a.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {a.minutes > 0 ? `${a.minutes} min · ` : ""}
                        {a.kcal} kcal
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Usuń aktywność"
                    onClick={() => onDelete(a.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="text-center">
          <Link
            href="/client"
            className="inline-block rounded-full border border-slate-700 bg-slate-900/70 px-5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Wróć do panelu
          </Link>
        </div>
      </main>
    </div>
  );
}