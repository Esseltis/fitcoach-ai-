"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DEMO_TRAINERS,
  trainerLogin,
} from "@/lib/store";
import {
  cloudEnabled,
  cloudSignIn,
  cloudSignUp,
  cloudBootstrap,
} from "@/lib/cloud";

const CLOUD = cloudEnabled();

export default function TrainerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);

  const finishCloudLogin = async (usedEmail: string) => {
    const normalized = usedEmail.trim().toLowerCase();
    if (typeof window !== "undefined") {
      window.localStorage.setItem("fitcoach_trainer_logged_in", "true");
      window.localStorage.setItem("fitcoach_trainer_id", normalized);
      window.localStorage.setItem("fitcoach_trainer_email", normalized);
    }
    await cloudBootstrap();
    router.push("/trainer");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (CLOUD) {
      setBusy(true);
      try {
        const res =
          mode === "login"
            ? await cloudSignIn(email, password)
            : await cloudSignUp(email, password);
        if (!res.ok) {
          setError(res.error ?? "Nie udało się zalogować.");
          return;
        }
        if (res.needsConfirm) {
          setInfo(
            "Wyślemy link potwierdzający na podany e-mail. Kliknij go i zaloguj się ponownie."
          );
          return;
        }
        await finishCloudLogin(email);
      } finally {
        setBusy(false);
      }
      return;
    }

    // ---- Demo (bez chmury) ----
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
          <h1 className="text-lg font-semibold text-slate-50">
            {mode === "login" ? "Logowanie trenera" : "Konto trenera"}
          </h1>
          <p className="text-xs text-slate-400">
            {CLOUD
              ? mode === "login"
                ? "Zaloguj się, by zarządzać planami swoich podopiecznych."
                : "Podaj e-mail i hasło — utworzymy konto trenera."
              : "Zaloguj się, by zarządzać planami swoich podopiecznych."}
          </p>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={CLOUD ? "twoj@email.pl" : "trener.michal@fitcoach.ai"}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={CLOUD ? "min. 6 znaków" : "••••••••"}
              minLength={CLOUD ? 6 : undefined}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {info && <p className="text-xs text-emerald-400">{info}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {busy
              ? "Chwila…"
              : mode === "login"
                ? "Zaloguj się"
                : "Załóż konto"}
          </button>

          {CLOUD ? (
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setInfo("");
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200"
            >
              {mode === "login"
                ? "Nie masz konta? Załóż konto trenera"
                : "Masz już konto? Zaloguj się"}
            </button>
          ) : (
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
          )}

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