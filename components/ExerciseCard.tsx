"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type {
  ExerciseLogEntry,
  SetLogEntry,
  TrainingExercise,
} from "@/lib/store";
import { getExerciseInfo } from "@/lib/exerciseLibrary";

// Karta ćwiczenia w trybie sesji treningowej — wzorowana na myfitcoach:
// tabela serii (# / Powt. / KG / RIR / ✓), kolorowy RIR, panele
// „Zastąp", „Historia" i „Jak to zrobić".

type HistoryItem = { day: number; entry: ExerciseLogEntry };

const RIR_CLS: Record<string, string> = {
  "0": "border-red-500/70 bg-red-500/15 font-bold text-red-400",
  "1": "border-amber-500/70 bg-amber-500/15 font-bold text-amber-400",
  "2": "border-amber-500/70 bg-amber-500/15 font-bold text-amber-400",
  "3": "border-emerald-500/60 bg-emerald-500/15 font-semibold text-emerald-400",
  "4": "border-emerald-500/60 bg-emerald-500/15 font-semibold text-emerald-400",
  "5": "border-emerald-500/60 bg-emerald-500/15 font-semibold text-emerald-400",
};

export default function ExerciseCard({
  ex,
  exId,
  idx,
  displayName,
  isDone,
  sets,
  history,
  sub,
  restSec,
  onToggle,
  onSets,
  onSub,
  onRest,
}: {
  ex: TrainingExercise;
  exId: string;
  idx: number;
  displayName: string;
  isDone: boolean;
  sets: SetLogEntry[];
  history: HistoryItem[];
  sub: string | null;
  restSec: number;
  onToggle: () => void;
  onSets: (sets: SetLogEntry[]) => void;
  onSub: (name: string | null) => void;
  onRest: (sec: number) => void;
}) {
  const [panel, setPanel] = useState<"sub" | "hist" | "tips" | null>(null);
  const [custom, setCustom] = useState("");
  const info = getExerciseInfo(displayName);

  const doneSets = sets.filter((s) => s.done).length;
  const prev = history[0] ?? null;

  const updateSet = (i: number, field: keyof SetLogEntry, value: string) => {
    onSets(sets.map((s, j) => (j === i ? { ...s, [field]: value } : s)));
  };

  const toggleSet = (i: number) => {
    const next = sets.map((s, j) =>
      j === i ? { ...s, done: !s.done } : s
    );
    onSets(next);
    if (!sets[i].done) onRest(restSec); // odhaczona seria = start przerwy
  };

  const addSet = () => {
    const last = sets[sets.length - 1];
    onSets([
      ...sets,
      { reps: last?.reps ?? "", kg: last?.kg ?? "", rir: "", done: false },
    ]);
  };

  const removeSet = (i: number) => {
    if (sets.length <= 1) return;
    onSets(sets.filter((_, j) => j !== i));
  };

  const panelBtn = (key: "sub" | "hist" | "tips", label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setPanel(panel === key ? null : key)}
      className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
        panel === key
          ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
          : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <article
      onClick={onToggle}
      className={`flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition md:flex-row md:items-start md:justify-between ${
        isDone
          ? "border-emerald-500/50 bg-emerald-500/10"
          : "border-slate-800 bg-slate-950/80 hover:border-slate-600"
      }`}
    >
      <div className="flex flex-1 items-start gap-3">
        <span
          className={`mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border transition ${
            isDone
              ? "border-emerald-400 bg-emerald-500 text-slate-950"
              : "border-slate-600 text-slate-700"
          }`}
          aria-hidden
        >
          <CheckCircle2 className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Ćwiczenie {idx + 1}
            </p>
            {doneSets > 0 && (
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/40">
                serie {doneSets}/{sets.length}
              </span>
            )}
          </div>

          <h2
            className={`text-sm font-semibold ${
              isDone ? "text-slate-400 line-through" : "text-slate-50"
            }`}
          >
            {displayName}
          </h2>

          {sub && (
            <p className="text-[10px] text-slate-500">
              🔁 zamiast: {ex.name}{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSub(null);
                }}
                className="ml-1 underline hover:text-emerald-400"
              >
                przywróć
              </button>
            </p>
          )}

          {/* Przyciski paneli — nie wyłączają kliknięcia karty */}
          <div
            className="flex flex-wrap gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {panelBtn("sub", "🔁 Zastąp")}
            {panelBtn("hist", `📜 Historia (${history.length})`)}
            {panelBtn("tips", "💡 Jak to zrobić")}
          </div>

          {panel === "sub" && (
            <div
              className="space-y-2 rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-[11px]"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-slate-300">
                Podmień ćwiczenie na inne z tej samej grupy mięśniowej (plan
                trenera zostaje bez zmian — widzisz tylko inną nazwę):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {info.alternatives.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => onSub(a)}
                    className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300 transition hover:bg-emerald-500/25"
                  >
                    {a}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && custom.trim()) {
                      onSub(custom.trim());
                      setCustom("");
                    }
                  }}
                  placeholder="…albo wpisz własne ćwiczenie"
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-[11px] text-slate-100 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!custom.trim()) return;
                    onSub(custom.trim());
                    setCustom("");
                  }}
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Zastąp
                </button>
              </div>
            </div>
          )}

          {panel === "hist" && (
            <div
              className="space-y-1 rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-[11px]"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-slate-400">
                Wcześniejsze wpisy {info.label.toLowerCase()} w tym planie:
              </p>
              {history.length === 0 ? (
                <p className="text-slate-500">
                  Brak wpisów — to Twoje pierwsze podejście do tego ćwiczenia.
                </p>
              ) : (
                <ul className="space-y-1">
                  {history.slice(0, 8).map((h, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 border-b border-slate-800/70 pb-1"
                    >
                      <span className="text-slate-400">dzień {h.day}</span>
                      <span className="font-medium text-slate-200">
                        {h.entry.kg ? `${h.entry.kg} kg` : "—"}
                        {h.entry.reps ? ` × ${h.entry.reps}` : ""}
                        {h.entry.effort && (
                          <span className="ml-2 text-amber-400">
                            {h.entry.effort === "meczacy"
                              ? "męczący"
                              : h.entry.effort === "sredni"
                                ? "średni"
                                : "łatwy"}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {panel === "tips" && (
            <div
              className="space-y-1.5 rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-[11px] leading-relaxed text-slate-300"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-semibold text-emerald-400">
                {info.label} — technika
              </p>
              <p>{info.tips}</p>
              <p className="text-slate-500">
                Przerwa z planu: {ex.rest || "90 sek."} — kliknij „Przerwa"
                niżej, żeby odpalić licznik.
              </p>
            </div>
          )}

          {/* Tabela serii — jądro trybu sesji */}
          <div
            className="mt-1 space-y-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-[1.6rem_1fr_1fr_4.2rem_2rem] items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-500">
              <span>#</span>
              <span>Powt.</span>
              <span>KG</span>
              <span className="text-center">RIR</span>
              <span className="text-center">✓</span>
            </div>

            {sets.map((s, i) => (
              <div
                key={i}
                className={`grid grid-cols-[1.6rem_1fr_1fr_4.2rem_2rem] items-center gap-1.5 rounded-lg px-1 py-1 transition ${
                  s.done ? "bg-emerald-500/10" : "bg-slate-900/60"
                }`}
              >
                <span
                  className={`text-center text-[11px] font-semibold ${
                    s.done ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  {i + 1}
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="powt."
                  aria-label={`Powtórzenia seria ${i + 1} ćwiczenia ${idx + 1}`}
                  value={s.reps}
                  onChange={(e) => updateSet(i, "reps", e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-center text-[11px] text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="kg"
                  aria-label={`Waga seria ${i + 1} ćwiczenia ${idx + 1}`}
                  value={s.kg}
                  onChange={(e) => updateSet(i, "kg", e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-center text-[11px] text-slate-100 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
                />
                <select
                  aria-label={`RIR seria ${i + 1} ćwiczenia ${idx + 1}`}
                  value={s.rir}
                  onChange={(e) => updateSet(i, "rir", e.target.value)}
                  className={`w-full cursor-pointer rounded-lg border bg-slate-950/80 px-1 py-1.5 text-center text-[11px] focus:outline-none ${
                    RIR_CLS[s.rir] ??
                    "border-slate-700 text-slate-500 focus:border-emerald-500"
                  }`}
                >
                  <option value="">RIR</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleSet(i)}
                    aria-label={`Odhacz serię ${i + 1} ćwiczenia ${idx + 1}`}
                    className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs transition ${
                      s.done
                        ? "border-emerald-400 bg-emerald-500 text-slate-950"
                        : "border-slate-600 text-slate-600 hover:border-emerald-500 hover:text-emerald-400"
                    }`}
                  >
                    ✓
                  </button>
                  {sets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSet(i)}
                      aria-label={`Usuń serię ${i + 1}`}
                      className="text-slate-600 transition hover:text-red-400"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={addSet}
                className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
              >
                + Dodaj serię
              </button>
              {sets.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onSets(sets.map((s) => ({ ...s, done: true })))
                  }
                  className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300 transition hover:bg-emerald-500/25"
                >
                  ✓ Odhacz wszystkie serie
                </button>
              )}
            </div>

            {/* Progresja względem ostatniego podejścia */}
            {prev && (
              <p className="pt-0.5 text-[10px] text-slate-500">
                Poprzednio (dzień {prev.day}):{" "}
                {prev.entry.kg ? `${prev.entry.kg} kg` : "—"}
                {prev.entry.reps ? ` × ${prev.entry.reps}` : ""}
                {(() => {
                  const kgNow = parseFloat(sets[0]?.kg.replace(",", ".") ?? "");
                  const kgPrev = parseFloat(
                    String(prev.entry.kg).replace(",", ".")
                  );
                  if (!Number.isFinite(kgNow) || !Number.isFinite(kgPrev))
                    return null;
                  const delta = Math.round((kgNow - kgPrev) * 10) / 10;
                  if (!delta) return null;
                  return (
                    <span
                      className={`ml-1 font-semibold ${
                        delta > 0 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {delta > 0 ? "▲" : "▼"} {Math.abs(delta)} kg
                    </span>
                  );
                })()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-2 text-[11px] text-slate-200 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-center">
          <p className="text-slate-400">Serie</p>
          <p className="mt-1 text-sm font-semibold text-slate-50">
            {ex.series}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-center">
          <p className="text-slate-400">Czas pracy</p>
          <p className="mt-1 text-sm font-semibold text-slate-50">
            {ex.workTime}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRest(restSec);
          }}
          className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-center transition hover:border-emerald-500/50 hover:bg-slate-900"
          title="Odpal timer przerwy"
        >
          <p className="text-slate-400">Przerwa</p>
          <p className="mt-1 text-sm font-semibold text-slate-50">
            ⏱ {ex.rest}
          </p>
        </button>
      </div>
    </article>
  );
}