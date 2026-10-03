"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, LineChart, Plus, Trash2, Ruler, Scale } from "lucide-react";
import {
  MEASUREMENT_METRICS,
  addMeasurement,
  getMeasurements,
  removeMeasurement,
  getMealsDoneByDate,
  getWaterAll,
  type Measurement,
} from "@/lib/store";

const width = 700;
const height = 260;
const paddingX = 40;
const paddingY = 30;

// poziomy intensywności heatmapy (skala slate jest odwrócona w jasnym motywie,
// więc jeden wystarcza: 700 = jasnoszare tło / w ciemnym motywie czytelne)
const HEAT_LEVELS = [
  "bg-slate-700",
  "bg-emerald-300/70",
  "bg-emerald-400",
  "bg-emerald-500",
];

const todayISO = () => new Date().toISOString().slice(0, 10);

function seedIfEmpty(email: string) {
  if (typeof window === "undefined") return;
  const existing = getMeasurements(email);
  if (existing.length > 0) return;
  const seeds: Measurement[] = [
    {
      id: "seed1",
      date: "2026-03-01",
      values: { weight: "87.2", pas: "88", brzuch: "86", biceps: "35", klatka: "100", uda: "60", lydki: "35" },
    },
    {
      id: "seed2",
      date: "2026-04-01",
      values: { weight: "86.0", pas: "86", brzuch: "84", biceps: "35.5", klatka: "101", uda: "59.5", lydki: "35" },
    },
    {
      id: "seed3",
      date: "2026-05-01",
      values: { weight: "85.1", pas: "85", brzuch: "82", biceps: "36", klatka: "102", uda: "59", lydki: "35" },
    },
    {
      id: "seed4",
      date: "2026-06-01",
      values: { weight: "84.3", pas: "83", brzuch: "80", biceps: "36.5", klatka: "103", uda: "58.5", lydki: "35.5" },
    },
    {
      id: "seed5",
      date: "2026-07-01",
      values: { weight: "83.5", pas: "82", brzuch: "79", biceps: "37", klatka: "104", uda: "58", lydki: "35.5" },
    },
  ];
  window.localStorage.setItem(
    `fitcoach_measurements_${email}`,
    JSON.stringify(seeds)
  );
}

export default function ClientStatsPage() {
  const [email, setEmail] = useState<string>("demo@fitcoach.ai");
  const [ready, setReady] = useState(false);
  const [list, setList] = useState<Measurement[]>([]);
  const [metricKey, setMetricKey] = useState<string>("weight");
  // Heatmapa aktywności (rok) — posiłki + woda z localStorage
  const [heat, setHeat] = useState<{ date: string; level: number }[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const meals = getMealsDoneByDate(email);
    const water = getWaterAll(email);
    const isoLocal = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
    const levelFor = (iso: string) => {
      const m = meals[iso]?.length ?? 0;
      const w = water[iso] ?? 0;
      if (m <= 0 && w <= 0) return 0;
      if (m >= 5 || (m >= 3 && w > 0)) return 3;
      if (m >= 3 || (m > 0 && w > 0)) return 2;
      return 1;
    };
    const now = new Date();
    // siatka 53 tygodni wyrównana do niedzieli
    const back = 52 * 7 + now.getDay();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - back
    );
    const cells: { date: string; level: number }[] = [];
    for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
      const iso = isoLocal(d);
      cells.push({ date: iso, level: levelFor(iso) });
    }
    setHeat(cells);
    // aktualna seria kolejnych aktywnych dni
    let s = 0;
    const cur = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (levelFor(isoLocal(cur)) === 0) cur.setDate(cur.getDate() - 1);
    while (levelFor(isoLocal(cur)) > 0 && s < 365) {
      s++;
      cur.setDate(cur.getDate() - 1);
    }
    setStreak(s);
  }, [email]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<Record<string, string>>({});
  const [formDate, setFormDate] = useState(todayISO());

  useEffect(() => {
    const storedEmail = window.localStorage.getItem("fitcoach_client_email") ?? "demo@fitcoach.ai";
    setEmail(storedEmail);
    seedIfEmpty(storedEmail);
    setList(getMeasurements(storedEmail));
    setReady(true);
  }, []);

  const metric = MEASUREMENT_METRICS.find((m) => m.key === metricKey) ?? MEASUREMENT_METRICS[0];

  const series = useMemo(() => {
    return list
      .map((m) => ({
        date: m.date,
        value: parseFloat(m.values[metricKey] ?? "0") || 0,
      }))
      .filter((p) => !Number.isNaN(p.value) && p.value > 0);
  }, [list, metricKey]);

  const handleAdd = () => {
    if (!formDate || !email) return;
    const values: Record<string, string> = {};
    let hasValue = false;
    for (const m of MEASUREMENT_METRICS) {
      const raw = form[m.key]?.trim();
      values[m.key] = raw ?? "";
      if (raw) hasValue = true;
    }
    if (!hasValue) return;
    addMeasurement(email, { date: formDate, values });
    setList(getMeasurements(email));
    setForm({});
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (!email) return;
    removeMeasurement(email, id);
    setList(getMeasurements(email));
  };

  const allValues = series.map((s) => s.value);
  const min = allValues.length ? Math.min(...allValues) - 2 : 0;
  const max = allValues.length ? Math.max(...allValues) + 2 : 10;

  const scaleX = (i: number) =>
    allValues.length > 1
      ? paddingX + (i * (width - 2 * paddingX)) / (allValues.length - 1)
      : width / 2;
  const scaleY = (v: number) =>
    height - paddingY - ((v - min) * (height - 2 * paddingY)) / (max - min);

  // Średnia krocząca 7-dniowa (punkt = średnia pomiarów z ostatnich 7 dni)
  const avg7 =
    series.length >= 3
      ? series.map((p, i) => {
          const from = new Date(Date.parse(p.date) - 6 * 86400000)
            .toISOString()
            .slice(0, 10);
          const win = series.slice(0, i + 1).filter((s) => s.date >= from);
          if (win.length < 2) return null;
          return win.reduce((a, b) => a + b.value, 0) / win.length;
        })
      : null;
  const avgPath = (avg7 ?? [])
    .map((v, i) => (v == null ? null : { x: scaleX(i), y: scaleY(v) }))
    .filter((p): p is { x: number; y: number } => p !== null)
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  const fmtDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y}`;
  };

  if (!ready) return null;

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
            Pomiary ciała
          </div>
        </div>

        <p className="text-xs lg:text-sm text-slate-400 mb-6 max-w-2xl">
          Dodawaj regularne pomiary, a wykres pokaże Ci zmianę w czasie.
          Wybierz metrykę, aby przełączyć wykres.
        </p>

        {/* Pasek wyboru metryki + dodawanie */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-2 text-xs">
            {MEASUREMENT_METRICS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMetricKey(m.key)}
                className={`rounded-lg px-3 py-1.5 ${
                  metricKey === m.key
                    ? "bg-emerald-500 text-slate-950 font-semibold"
                    : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
                }`}
              >
                {m.label} ({m.unit})
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 hover:bg-emerald-400"
          >
            <Plus className="h-3 w-3" />
            Nowy pomiar
          </button>
        </div>

        {/* Formularz dodawania */}
        {showForm && (
          <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-slate-900/90 p-4 text-xs text-slate-200">
            <div className="mb-3 flex items-center gap-2">
              <Ruler className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold">Dodaj nowy pomiar</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1">
                <span className="text-slate-400">Data</span>
                <input
                  type="date"
                  value={formDate}
                  max={todayISO()}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                />
              </label>
              {MEASUREMENT_METRICS.map((m) => (
                <label key={m.key} className="flex flex-col gap-1">
                  <span className="text-slate-400">
                    {m.label} ({m.unit})
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    value={form[m.key] ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [m.key]: e.target.value }))
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                className="rounded-full bg-emerald-500 px-5 py-2 font-semibold uppercase tracking-wide text-slate-950 hover:bg-emerald-400"
              >
                Zapisz pomiar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] items-start">
          <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-4 lg:px-6 lg:py-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-300">
                {metric.label} ({metric.unit})
              </p>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300">
                {series.length} pomiarów
              </span>
            </div>

            {series.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 py-16 text-center text-xs text-slate-400">
                <Scale className="h-8 w-8 text-slate-600" />
                Brak pomiarów dla tej metryki.
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="text-emerald-400 hover:underline"
                >
                  Dodaj pierwszy pomiar
                </button>
              </div>
            ) : (
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

                  <path
                    d={series
                      .map((p, i) => {
                        const x = scaleX(i);
                        const y = scaleY(p.value);
                        return `${i === 0 ? "M" : "L"}${x},${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                  {avgPath && (
                    <path
                      d={avgPath}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                      strokeDasharray="5 4"
                    />
                  )}
                  {series.map((p, i) => {
                    const x = scaleX(i);
                    const y = scaleY(p.value);
                    return (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r={4}
                          fill="#10b981"
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
                          {p.value}
                        </text>
                      </g>
                    );
                  })}

                  {series.map((p, i) => {
                    const x = scaleX(i);
                    return (
                      <text
                        key={p.date}
                        x={x}
                        y={height - 8}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#94a3b8"
                      >
                        {fmtDate(p.date)}
                      </text>
                    );
                  })}
                </svg>
                {avgPath && (
                  <div className="flex flex-wrap items-center gap-4 border-t border-slate-800 px-3 py-2 text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-0.5 w-4 rounded bg-emerald-500" />
                      pomiar
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-4 border-t-2 border-dashed border-sky-400" />
                      średnia 7-dniowa
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-4 text-xs text-slate-200">
              <p className="text-[11px] uppercase text-slate-400 font-semibold mb-3">
                Historia pomiarów
              </p>
              {list.length === 0 ? (
                <p className="text-slate-500">Brak zapisanych pomiarów.</p>
              ) : (
                <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {[...list].reverse().map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2"
                    >
                      <div>
                        <p className="font-semibold text-slate-100">
                          {fmtDate(m.date)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {MEASUREMENT_METRICS.filter(
                            (mm) => m.values[mm.key] && parseFloat(m.values[mm.key]) > 0
                          )
                            .map((mm) => `${mm.label}: ${m.values[mm.key]} ${mm.unit}`)
                            .join(" · ") || "—"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        className="rounded-full p-1.5 text-slate-500 hover:bg-slate-800 hover:text-red-400"
                        aria-label="Usuń pomiar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>

        {/* 🔥 Heatmapa aktywności — ostatnie 53 tygodnie */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4 lg:px-6 lg:py-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-300">
              🔥 Aktywność w minionym roku
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>
                Seria:{" "}
                <span className="font-semibold text-emerald-400">
                  {streak} {streak === 1 ? "dzień" : "dni"}
                </span>
              </span>
              <span>
                Aktywnych:{" "}
                <span className="font-semibold text-slate-200">
                  {heat.filter((c) => c.level > 0).length}{" "}
                  {heat.filter((c) => c.level > 0).length === 1
                    ? "dzień"
                    : "dni"}
                </span>
              </span>
            </div>
          </div>
          {heat.length === 0 ? (
            <p className="text-xs text-slate-500">Brak danych aktywności.</p>
          ) : (
            <>
              <div className="overflow-x-auto pb-2">
                <div className="grid w-max grid-flow-col grid-rows-[repeat(7,minmax(0,1fr))] gap-1">
                  {heat.map((c) => (
                    <div
                      key={c.date}
                      title={`${c.date}`}
                      className={`h-3 w-3 rounded-[3px] ${HEAT_LEVELS[c.level]}`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-slate-500">
                <span className="mr-1">mniej</span>
                {HEAT_LEVELS.map((cls) => (
                  <span
                    key={cls}
                    className={`h-2.5 w-2.5 rounded-[3px] ${cls}`}
                  />
                ))}
                <span className="ml-1">więcej</span>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
