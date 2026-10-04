"use client";

import { useState } from "react";
import { getMeasurements, type Measurement } from "@/lib/store";

// Progres wagi w raporcie trenera — zakres 2 tyg. / 1 mies. / 3 mies.
// / od początku, wykres liniowy (SVG) i zmiana masy w okresie.

const RANGES: { v: string; label: string; days: number | null }[] = [
  { v: "14", label: "2 tyg.", days: 14 },
  { v: "30", label: "1 mies.", days: 30 },
  { v: "90", label: "3 mies.", days: 90 },
  { v: "all", label: "Od początku", days: null },
];

export default function WeightProgress({ email }: { email: string }) {
  const [range, setRange] = useState("30");
  const all = getMeasurements(email);
  const cfg = RANGES.find((r) => r.v === range) ?? RANGES[1];

  const cutoff = cfg.days
    ? new Date(Date.now() - cfg.days * 86_400_000)
        .toISOString()
        .slice(0, 10)
    : "0000-00-00";
  const rows = all.filter(
    (m) => m.date >= cutoff && Number(m.values.weight) > 0
  );

  const pts = rows.map((m: Measurement) => ({
    date: m.date,
    w: Number(m.values.weight),
  }));

  const first = pts[0]?.w;
  const last = pts[pts.length - 1]?.w;
  const delta =
    first != null && last != null ? Math.round((last - first) * 10) / 10 : null;
  const min = pts.length ? Math.min(...pts.map((p) => p.w)) : 0;
  const max = pts.length ? Math.max(...pts.map((p) => p.w)) : 1;

  // Wykres SVG (jak w panelu klienta, ale w wersji trenera)
  const W = 560;
  const H = 150;
  const PAD = 24;
  const span = Math.max(0.5, max - min);
  const xy = (i: number, w: number) => {
    const x =
      pts.length > 1
        ? PAD + (i / (pts.length - 1)) * (W - 2 * PAD)
        : W / 2;
    const y = H - PAD - ((w - min) / span) * (H - 2 * PAD);
    return { x, y };
  };
  const path = pts
    .map((p, i) => {
      const { x, y } = xy(i, p.w);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const trend =
    delta == null
      ? "—"
      : delta < 0
      ? `−${Math.abs(delta)} kg`
      : delta > 0
      ? `+${delta} kg`
      : "0 kg";
  const trendColor =
    delta == null ? "text-slate-400" : delta <= 0 ? "text-emerald-300" : "text-amber-300";

  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            📈 Progres wagi
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Wykres z pomiarów ciała podopiecznego — wybierz zakres.
          </p>
        </div>
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.v}
              type="button"
              onClick={() => setRange(r.v)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                range === r.v
                  ? "bg-emerald-500 text-slate-950"
                  : "border border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {pts.length < 2 ? (
        <p className="text-sm text-slate-500">
          Zbyt mało pomiarów w tym okresie — przynajmniej dwie wagi dadzą
          wykres.
          {pts.length === 1 && ` Ostatni pomiar: ${pts[0].w} kg (${pts[0].date}).`}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Ostatnia waga
              </p>
              <p className="text-2xl font-extrabold text-slate-50">
                {last} <span className="text-sm font-semibold">kg</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Zmiana w okresie
              </p>
              <p className={`text-2xl font-extrabold ${trendColor}`}>
                {trend}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Pomiarów
              </p>
              <p className="text-2xl font-extrabold text-slate-50">
                {pts.length}
              </p>
            </div>
            <div className="text-xs text-slate-500">
              <p>
                min {min} kg · max {max} kg
              </p>
              <p>
                {pts[0].date} → {pts[pts.length - 1].date}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-40 w-full"
              role="img"
              aria-label="Wykres wagi"
            >
              <line
                x1={PAD}
                y1={H - PAD}
                x2={W - PAD}
                y2={H - PAD}
                stroke="#334155"
                strokeWidth="1"
              />
              <line
                x1={PAD}
                y1={PAD / 2}
                x2={PAD}
                y2={H - PAD}
                stroke="#334155"
                strokeWidth="1"
              />
              <path d={path} fill="none" stroke="#34d399" strokeWidth="2.5" />
              {pts.map((p, i) => {
                const { x, y } = xy(i, p.w);
                return (
                  <circle
                    key={p.date}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#0f172a"
                    stroke="#34d399"
                    strokeWidth="2"
                  >
                    <title>{`${p.date}: ${p.w} kg`}</title>
                  </circle>
                );
              })}
            </svg>
            <div className="mt-1 flex justify-between text-[10px] text-slate-500">
              <span>
                {pts[0].w} kg · {pts[0].date}
              </span>
              <span>
                {pts[pts.length - 1].w} kg · {pts[pts.length - 1].date}
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}