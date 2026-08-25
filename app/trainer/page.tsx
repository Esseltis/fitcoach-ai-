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

  useEffect(() => {
    const id = getTrainerIdentity();
    if (!id) {
      router.replace("/trainer/login");
      return;
    }
    setIdentity(id);
    setClients(getClientsForTrainer(id.id));
    setReady(true);
  }, [router]);

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
        <header className="border-b border-slate-800 px-6 py-5">
          <h1 className="text-xl font-semibold text-slate-50">
            {trainer?.name ?? "Trener"}
          </h1>
          <p className="text-xs text-slate-400">{trainer?.title}</p>
        </header>

        <div className="p-6">
          <p className="mb-4 text-[11px] font-semibold uppercase text-slate-500">
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
                const plan = identity ? getPlan(identity.id, c.email) : null;
                return (
                  <Link
                    key={c.email}
                    href={`/trainer/client/${encodeURIComponent(c.email)}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 hover:border-emerald-400/60 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-sm font-bold">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      {plan ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
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
                    <p className="mt-2 text-[11px] text-slate-500">
                      {report ? "Raport: wysłany" : "Raport: brak"}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
