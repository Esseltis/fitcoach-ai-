"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getTrainerById,
  getTrainerIdentity,
  getClientsForTrainer,
  getReport,
  getPlan,
  getClientProfile,
  getTrainerReportFields,
  saveTrainerReportFields,
  REPORT_FIELDS,
  trainerLogout,
  type ClientRecord,
} from "@/lib/store";

export default function TrainerDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [identity, setIdentity] = useState<{ id: string; email: string } | null>(
    null
  );
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [reportFields, setReportFields] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const id = getTrainerIdentity();
    if (!id) {
      router.replace("/trainer/login");
      return;
    }
    setIdentity(id);
    setClients(getClientsForTrainer(id.id));
    setReportFields(getTrainerReportFields(id.id));
    setReady(true);
  }, [router]);

  const toggleReportField = (key: string) => {
    if (!identity) return;
    const next = reportFields.includes(key)
      ? reportFields.filter((k) => k !== key)
      : [...reportFields, key];
    setReportFields(next);
    saveTrainerReportFields(identity.id, next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleLogout = () => {
    trainerLogout();
    router.push("/trainer/login");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-200">Ładowanie panelu trenera...</p>
      </div>
    );
  }

  const trainer = identity ? getTrainerById(identity.id) : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="hidden md:flex w-64 bg-slate-950/95 border-r border-slate-800 flex-col">
        <div className="h-16 px-5 flex items-center border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-900 text-sm font-bold shadow-lg">
              FC
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">FitCoach AI</span>
              <span className="text-[11px] text-slate-400">Panel trenera</span>
            </div>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 rounded-xl bg-slate-800/90 px-2.5 py-2 text-[13px] font-medium text-slate-50">
              <span className="h-7 w-1 rounded-full bg-emerald-400" />
              <span className="truncate">Moi podopieczni</span>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
          >
            Wyloguj się
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-slate-800 px-6 py-6">
          <p className="text-xs uppercase tracking-wide text-emerald-400">
            Panel trenera
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-50">
            {trainer?.name ?? "Trener"}
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {trainer?.title}
            {trainer?.focus ? ` • ${trainer.focus}` : ""}
          </p>
        </header>

        <div className="p-6">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Podopieczni ({clients.length})
          </p>
          {clients.length === 0 ? (
            <p className="text-sm text-slate-400">
              Brak przypisanych podopiecznych.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clients.map((c) => {
                const report = getReport(c.email);
                const profile = getClientProfile(c.email);
                const plan = identity ? getPlan(identity.id, c.email) : null;
                return (
                  <Link
                    key={c.email}
                    href={`/trainer/client/${encodeURIComponent(c.email)}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-[0_18px_30px_rgba(15,23,42,0.9)] hover:border-emerald-400/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-slate-950 flex items-center justify-center text-sm font-bold shadow-lg">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      {plan ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                          Plan przypisany
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                          Brak planu
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-50">{c.name}</p>
                    <p className="text-[11px] text-slate-400">{c.email}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            profile ? "bg-emerald-400" : "bg-slate-600"
                          }`}
                        />
                        <p className="text-[11px] text-slate-500">
                          Profil: {profile ? "wypełniony" : "brak"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            report ? "bg-emerald-400" : "bg-slate-600"
                          }`}
                        />
                        <p className="text-[11px] text-slate-500">
                          Raport dzienny: {report ? "wysłany" : "brak"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                Konfiguracja raportu podopiecznych
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Zaznacz, które pola podopieczny ma wypełniać w raporcie dziennym.
                Działa dla wszystkich Twoich klientów.
              </p>
            </div>
            {saved && <span className="text-xs text-emerald-300">Zapisano ✓</span>}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {REPORT_FIELDS.map((f) => (
              <label
                key={f.key}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-200 hover:border-emerald-500/50"
              >
                <input
                  type="checkbox"
                  checked={reportFields.includes(f.key)}
                  onChange={() => toggleReportField(f.key)}
                  className="accent-emerald-500"
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
