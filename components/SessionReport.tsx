"use client";

import { useEffect, useState } from "react";
import {
  getSetLog,
  getTrainingLog,
  getDoneExerciseIds,
  getSubstitutions,
  type TrainerContent,
} from "@/lib/store";

// Raport treningowy (PDF) po zakończonym treningu — jak "Pobierz PDF"
// w CoachPro: podsumowanie dnia z seriami, ciężarami i RIR.
// Renderowany poza głównym kontenerem (ma print:hidden), więc okno
// druku pokazuje wyłącznie ten dokument.

type Row = {
  name: string;
  plan: string;
  sets: string;
  volume: number;
  done: boolean;
};

type ReportData = {
  rows: Row[];
  dayLabel: string;
  date: string;
  doneCount: number;
  totalCount: number;
  volume: number;
  setsDone: number;
  elapsedSec?: number;
};

function fmtSec(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function SessionReport({
  email,
  content,
  dayId,
  elapsedSec,
  onDone,
}: {
  email: string;
  content: TrainerContent;
  dayId: number;
  elapsedSec?: number;
  onDone: () => void;
}) {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    const t = content.training;
    const day = t.days[dayId - 1] ?? t.days[0];
    const exercises = t.dayExercises[dayId] ?? [];
    const sets = getSetLog(email, dayId);
    const log = getTrainingLog(email, dayId);
    const doneIds = getDoneExerciseIds(email, dayId);
    const subs = getSubstitutions(email)[String(dayId)] ?? {};

    const rows: Row[] = exercises.map((ex, i) => {
      const exId = String(i + 1);
      const done = doneIds.includes(exId);
      const doneSets = (sets[exId] ?? []).filter(
        (s) => s.done && (s.kg || s.reps)
      );
      const legacy = log[exId];
      let setsText = "—";
      let volume = 0;
      if (doneSets.length > 0) {
        setsText = doneSets
          .map((s) => {
            const kg = Number(s.kg) || 0;
            const reps = Number(s.reps) || 0;
            volume += kg * reps;
            const load = s.kg ? `${s.kg} kg` : "BW";
            const rir = s.rir !== "" && s.rir != null ? ` · RIR ${s.rir}` : "";
            return `${load} × ${s.reps || "—"}${rir}`;
          })
          .join("   |   ");
      } else if (legacy && (legacy.kg || legacy.reps)) {
        const kg = Number(legacy.kg) || 0;
        const reps = Number(legacy.reps) || 0;
        volume = kg * reps;
        setsText = `${legacy.kg || "BW"} kg × ${legacy.reps}`;
        if (legacy.effort) setsText += ` · wysiłek ${legacy.effort}`;
      }
      return {
        name: subs[exId] ?? ex.name,
        plan: `${ex.series} × ${ex.workTime}${ex.rest ? ` · przerwa ${ex.rest}` : ""}`,
        sets: setsText,
        volume,
        done,
      };
    });

    setData({
      rows,
      dayLabel: day?.label ?? `Dzień ${dayId}`,
      date: new Date().toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      doneCount: doneIds.length,
      totalCount: exercises.length,
      volume: rows.reduce((sum, r) => sum + r.volume, 0),
      setsDone: rows.filter((r) => r.done).length,
      elapsedSec,
    });
  }, [email, content, dayId, elapsedSec]);

  // Auto-drukuj po załadowaniu danych; afterprint (także po anulowaniu)
  // zamyka raport i wraca do panelu.
  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => window.print(), 150);
    const after = () => onDone();
    window.addEventListener("afterprint", after);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", after);
    };
  }, [data, onDone]);

  if (!data) return null;

  return (
    <div className="hidden print:block bg-white p-8 text-black">
      <div className="flex items-start justify-between border-b-2 border-black pb-3">
        <div>
          <p className="text-2xl font-extrabold tracking-widest">FITCOACH AI</p>
          <p className="text-sm">Raport treningowy — podsumowanie dnia</p>
        </div>
        <div className="text-right text-xs leading-5">
          <p>
            <strong>Data:</strong> {data.date}
          </p>
          <p>
            <strong>Dzień:</strong> {data.dayLabel}
          </p>
          <p>
            <strong>Klient:</strong> {email}
          </p>
          {data.elapsedSec != null && (
            <p>
              <strong>Czas treningu:</strong> {fmtSec(data.elapsedSec)}
            </p>
          )}
        </div>
      </div>

      <table className="mt-5 w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="border-r border-gray-400 px-2 py-1.5">#</th>
            <th className="border-r border-gray-400 px-2 py-1.5">
              Ćwiczenie
            </th>
            <th className="border-r border-gray-400 px-2 py-1.5">Plan</th>
            <th className="border-r border-gray-400 px-2 py-1.5">
              Wykonane serie
            </th>
            <th className="px-2 py-1.5">Objętość (kg)</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-300 align-top">
              <td className="border-r border-gray-400 px-2 py-1.5">
                {i + 1}.
              </td>
              <td className="border-r border-gray-400 px-2 py-1.5 font-semibold">
                {r.name}
                {!r.done && r.sets === "—" && (
                  <span className="ml-1 font-normal text-gray-500">
                    (nie wykonano)
                  </span>
                )}
              </td>
              <td className="border-r border-gray-400 px-2 py-1.5">
                {r.plan}
              </td>
              <td className="border-r border-gray-400 px-2 py-1.5">
                {r.sets}
              </td>
              <td className="px-2 py-1.5 text-right">
                {r.volume > 0 ? r.volume.toLocaleString("pl-PL") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-5 flex flex-wrap gap-6 border-t-2 border-black pt-3 text-xs font-semibold">
        <span>
          Ćwiczenia: {data.doneCount}/{data.totalCount}
        </span>
        <span>Serie zakończone: {data.setsDone}</span>
        <span>Objętość łącznie: {data.volume.toLocaleString("pl-PL")} kg</span>
        {data.elapsedSec != null && (
          <span>Czas: {fmtSec(data.elapsedSec)}</span>
        )}
      </div>

      <div className="mt-8 flex justify-between text-[10px] text-gray-600">
        <span>FitCoach AI — raport wygenerowany automatycznie</span>
        <span>Podpis trenera: ______________________</span>
      </div>
    </div>
  );
}