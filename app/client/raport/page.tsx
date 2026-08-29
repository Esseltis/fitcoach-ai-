"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getReport,
  saveReport,
  getTrainerReportFields,
  getClientTrainerId,
  type ReportConfigField,
} from "@/lib/store";

export default function ClientReportPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fields, setFields] = useState<ReportConfigField[]>([]);
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = window.localStorage.getItem("fitcoach_client_logged_in");
    const storedEmail = window.localStorage.getItem("fitcoach_client_email");
    if (loggedIn !== "true" || !storedEmail) {
      router.replace("/login");
      return;
    }
    setEmail(storedEmail);
    const trainerId = getClientTrainerId();
    const defs = trainerId
      ? getTrainerReportFields(trainerId)
      : [];
    setFields(defs);
    const init: Record<string, string | number | boolean> = {};
    for (const f of defs) init[f.key] = f.defaultValue;
    const existing = getReport(storedEmail);
    if (existing) {
      for (const k of Object.keys(existing.values)) {
        if (k in init) init[k] = existing.values[k];
      }
    }
    setValues(init);
    setReady(true);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    saveReport(email, {
      values,
      submittedAt: new Date().toISOString(),
    });
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
  const labelText = "text-[11px] font-medium text-slate-300";

  const renderField = (f: ReportConfigField) => {
    const v = values[f.key] ?? f.defaultValue;
    const set = (val: string | number | boolean) =>
      setValues((s) => ({ ...s, [f.key]: val }));

    if (f.type === "range") {
      return (
        <div className="space-y-1">
          <label className={labelText}>{f.label}</label>
          <input
            type="range"
            min={f.min}
            max={f.max}
            value={Number(v)}
            onChange={(e) => set(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="text-center text-sm text-slate-100">{v} / {f.max}</div>
        </div>
      );
    }
    if (f.type === "boolean") {
      return (
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={Boolean(v)}
            onChange={(e) => set(e.target.checked)}
            className="accent-emerald-500"
          />
          {f.label}
        </label>
      );
    }
    if (f.type === "select") {
      return (
        <label className="block space-y-1">
          <span className={labelText}>{f.label}</span>
          <select
            className={inputCls}
            value={String(v)}
            onChange={(e) => set(e.target.value)}
          >
            {(f.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      );
    }
    if (f.type === "number") {
      return (
        <label className="block space-y-1">
          <span className={labelText}>{f.label}</span>
          <input
            className={inputCls}
            type="number"
            step={f.step}
            value={String(v)}
            onChange={(e) => set(e.target.value)}
            placeholder={f.placeholder}
          />
        </label>
      );
    }
    return (
      <label className="block space-y-1">
        <span className={labelText}>{f.label}</span>
        <textarea
          className={inputCls}
          rows={3}
          value={String(v)}
          onChange={(e) => set(e.target.value)}
          placeholder={f.placeholder}
        />
      </label>
    );
  };

  if (saved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md space-y-5 rounded-2xl border border-emerald-500/40 bg-slate-900/80 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl">
            ✓
          </div>
          <h1 className="text-lg font-semibold text-slate-50">Raport wysłany!</h1>
          <p className="text-sm text-slate-400">
            Twój trener otrzymał raport. Możesz wysłać kolejny w dowolnym momencie.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/client"
              className="inline-block rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Wróć do panelu
            </Link>
            <button
              type="button"
              onClick={() => setSaved(false)}
              className="rounded-full border border-slate-700 px-6 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Wyślij kolejny raport
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Krok 2 · Raport
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
            Wyślij raport do trenera
          </h1>
          <p className="mx-auto max-w-md text-sm text-slate-400">
            Uzupełnij pola wymagane przez Twojego trenera.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          {fields.length === 0 ? (
            <p className="text-sm text-slate-400">
              Trener nie skonfigurował jeszcze pól raportu. Zostaw notatkę lub
              wróć do panelu.
            </p>
          ) : (
            fields.map((f) => (
              <div key={f.key}>{renderField(f)}</div>
            ))
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Wyślij raport
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
