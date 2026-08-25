"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEMO_TRAINERS, trainerLogin } from "@/lib/store";

export default function TrainerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trainer = trainerLogin(email, password);
    if (!trainer) {
      setError("Nieprawidłowy e-mail lub hasło.");
      return;
    }
    router.push("/trainer");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-900 text-sm font-bold shadow-lg">
            FC
          </div>
          <span className="text-sm font-semibold tracking-tight">FitCoach AI</span>
          <span className="text-[11px] text-slate-400">Panel trenera</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-[0_18px_30px_rgba(15,23,42,0.9)]"
        >
          <h1 className="text-lg font-semibold text-slate-50">Logowanie trenera</h1>
          <p className="text-xs text-slate-400">
            Zaloguj się, by zarządzać planami swoich podopiecznych.
          </p>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trener.michal@fitcoach.ai"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Zaloguj się
          </button>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-300">Konta demo:</p>
            <ul className="mt-1 space-y-0.5">
              {DEMO_TRAINERS.map((t) => (
                <li key={t.id}>
                  {t.email} / demo123
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/"
            className="block text-center text-xs text-slate-500 hover:text-slate-300"
          >
            ← Wróć na stronę główną
          </Link>
        </form>
      </main>
    </div>
  );
}
