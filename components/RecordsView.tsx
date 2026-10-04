"use client";

import {
  getSetLog,
  getTrainingLog,
  getSubstitutions,
  type TrainerContent,
} from "@/lib/store";

// Rekordy życiowe podopiecznego — najlepsze serie z całej historii
// planu (setLog + starszy log), liczone po nazwie wykonywanego
// ćwiczenia (uwzględnia podmiany).

type Rec = {
  name: string;
  bestKg: number;
  bestKgReps: string;
  bestKgDay: number;
  bestReps: number;
  bestRepsKg: string;
};

export default function RecordsView({
  email,
  content,
}: {
  email: string;
  content: TrainerContent;
}) {
  const days = content.training.days;
  const map = new Map<string, Rec>();

  const touch = (name: string, kg: number, reps: number, day: number) => {
    if (!kg && !reps) return;
    let r = map.get(name);
    if (!r) {
      r = {
        name,
        bestKg: 0,
        bestKgReps: "",
        bestKgDay: day,
        bestReps: 0,
        bestRepsKg: "",
      };
      map.set(name, r);
    }
    if (kg > r.bestKg) {
      r.bestKg = kg;
      r.bestKgReps = reps ? String(reps) : "—";
      r.bestKgDay = day;
    }
    if (reps > r.bestReps) {
      r.bestReps = reps;
      r.bestRepsKg = kg ? `${kg} kg` : "BW";
    }
  };

  for (let d = 1; d <= days.length; d++) {
    const exs = content.training.dayExercises[d] ?? [];
    const sets = getSetLog(email, d);
    const log = getTrainingLog(email, d);
    const subs = getSubstitutions(email)[String(d)] ?? {};
    exs.forEach((ex, i) => {
      const exId = String(i + 1);
      const name = subs[exId] ?? ex.name;
      for (const s of sets[exId] ?? []) {
        if (s.kg || s.reps)
          touch(name, Number(s.kg) || 0, Number(s.reps) || 0, d);
      }
      const legacy = log[exId];
      if (legacy && (legacy.kg || legacy.reps)) {
        touch(name, Number(legacy.kg) || 0, Number(legacy.reps) || 0, d);
      }
    });
  }

  const records = [...map.values()].sort(
    (a, b) => b.bestKg - a.bestKg || b.bestReps - a.bestReps
  );

  const dayLabel = (d: number) => days[d - 1]?.label ?? `Dzień ${d}`;

  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
          🏆 Rekordy podopiecznego
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Najlepsze wyniki zebrane z całej historii treningów — ciężar,
          powtórzenia i dzień planu, w którym padł rekord.
        </p>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-slate-500">
          Brak danych — rekordy pojawią się po pierwszych zalogowanych seriach
          klienta.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((r) => (
            <div
              key={r.name}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-100">{r.name}</p>
                <span className="text-base leading-none">🏆</span>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-emerald-300">
                    {r.bestKg > 0 ? `${r.bestKg} kg` : "BW"}
                  </span>
                  <span className="text-xs text-slate-400">
                    × {r.bestKgReps} powt.
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Najwięcej powtórzeń:{" "}
                  <span className="font-semibold text-slate-300">
                    {r.bestReps}
                  </span>
                  {r.bestRepsKg && ` (${r.bestRepsKg})`}
                </p>
                <p className="text-[11px] text-slate-600">
                  Rekord z: {dayLabel(r.bestKgDay)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {records.length > 0 && (
        <p className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-[11px] text-slate-500">
          💡 Przebij wynik w {records[0]?.name}, a karta rekordu zaktualizuje
          się automatycznie po zakończeniu treningu.
        </p>
      )}
    </section>
  );
}