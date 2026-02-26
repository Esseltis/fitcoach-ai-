"use client";

import Link from "next/link";
import { ArrowLeft, LineChart, CheckCircle2 } from "lucide-react";

// Dane przykładowe – w docelowej wersji przyjdą z bazy
const dates = [
  "13.06.2023",
  "11.07.2023",
  "06.08.2023",
  "03.09.2023",
  "26.02.2026",
];

const series = [
  {
    key: "waga",
    label: "Waga",
    color: "#ffffff",
    values: [78, 76, 75, 74.5, 74.5],
  },
  {
    key: "pas",
    label: "Pas",
    color: "#ff4d4d",
    values: [88, 86, 85, 83, 83],
  },
  {
    key: "brzuch",
    label: "Brzuch",
    color: "#ff9933",
    values: [86, 85, 84, 82, 81],
  },
  {
    key: "biceps",
    label: "Biceps",
    color: "#3366ff",
    values: [38, 38, 39, 40, 40],
  },
  {
    key: "klatka",
    label: "Klatka",
    color: "#33cc33",
    values: [104, 106, 107, 108, 108],
  },
  {
    key: "uda",
    label: "Uda",
    color: "#ffaa00",
    values: [55, 54, 53, 53, 53],
  },
  {
    key: "lydki",
    label: "Łydki",
    color: "#ffdd00",
    values: [36, 36, 36, 36, 36],
  },
];

const width = 700;
const height = 260;
const paddingX = 40;
const paddingY = 30;

export default function ClientStatsPage() {
  const allValues = series.flatMap((s) => s.values);
  const min = Math.min(...allValues) - 5;
  const max = Math.max(...allValues) + 5;

  const scaleX = (i: number) =>
    paddingX + (i * (width - 2 * paddingX)) / (dates.length - 1);
  const scaleY = (v: number) =>
    height - paddingY - ((v - min) * (height - 2 * paddingY)) / (max - min);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/client"
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-emerald-400 hover:text-emerald-300 transition"
          >
            <ArrowLeft className="h-3 w-3" />
            Wróć do panelu
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <LineChart className="h-4 w-4 text-emerald-400" />
            Statystyki wymiarów
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-start">
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-4 lg:px-6 lg:py-5">
            <div className="mb-3 flex flex-wrap gap-3 text-[11px] uppercase tracking-wide font-semibold text-slate-300">
              {series.map((s) => (
                <div key={s.key} className="flex items-center gap-1">
                  <span
                    className="h-2 w-4 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-[260px] text-slate-400"
              >
                <defs>
                  <pattern
                    id="grid"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="rgba(148,163,184,0.15)"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width={width}
                  height={height}
                  fill="url(#grid)"
                />

                {series.map((s) => {
                  const pathD = s.values
                    .map((v, i) => {
                      const x = scaleX(i);
                      const y = scaleY(v);
                      return `${i === 0 ? "M" : "L"}${x},${y}`;
                    })
                    .join(" ");

                  return (
                    <g key={s.key}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={2}
                      />
                      {s.values.map((v, i) => {
                        const x = scaleX(i);
                        const y = scaleY(v);
                        return (
                          <g key={i}>
                            <circle
                              cx={x}
                              cy={y}
                              r={4}
                              fill={s.color}
                              stroke="#020617"
                              strokeWidth={1}
                            />
                            <text
                              x={x}
                              y={y - 8}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#e5e7eb"
                            >
                              {v}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })}

                {dates.map((d, i) => {
                  const x = scaleX(i);
                  return (
                    <text
                      key={d}
                      x={x}
                      y={height - 8}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#94a3b8"
                    >
                      {d}
                    </text>
                  );
                })}
              </svg>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-4 text-xs text-slate-200">
              <p className="text-[11px] uppercase text-slate-400 font-semibold mb-2">
                Podsumowanie zmian (demo)
              </p>
              <ul className="space-y-1.5">
                {series.map((s) => {
                  const start = s.values[0];
                  const end = s.values[s.values.length - 1];
                  const diff = end - start;
                  const improved = diff < 0;
                  const diffText = `${improved ? "-" : "+"}${Math.abs(
                    diff
                  ).toFixed(1)}`;
                  const color = improved ? "text-emerald-400" : "text-amber-300";

                  return (
                    <li
                      key={s.key}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-4 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span>{s.label}</span>
                      </span>
                      <span className="text-slate-400">
                        <span className="mr-1 text-slate-500">od</span>
                        {start.toFixed(1)}
                        <span className="mx-1 text-slate-500">do</span>
                        {end.toFixed(1)}
                        <span className={`ml-2 font-semibold ${color}`}>
                          {diffText}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-4 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-slate-100 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Jak czytać ten wykres
              </div>
              <p>
                Linie pokazują, jak zmieniały się Twoje wymiary w czasie – od
                pierwszego raportu do dziś. Kolory odpowiadają poszczególnym
                partiom ciała.
              </p>
              <p>
                To tylko widok poglądowy. W docelowej wersji wartości będą
                pobierane z pomiarów wprowadzonych przez Ciebie i trenera.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

