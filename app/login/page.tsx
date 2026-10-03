"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cloudEnabled, cloudSignIn, cloudSignUp, cloudBootstrap } from "@/lib/cloud";

const DEMO_EMAIL = "podopieczny@fitcoach.ai";
const DEMO_PASSWORD = "demo123";

const CLOUD = cloudEnabled();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = window.localStorage.getItem("fitcoach_client_logged_in");
    if (loggedIn === "true") {
      router.replace("/client");
    }
  }, [router]);

  const finishCloudLogin = async (usedEmail: string) => {
    if (typeof window !== "undefined") {
      const normalized = usedEmail.trim().toLowerCase();
      const prev = window.localStorage.getItem("fitcoach_client_email");
      // inny użytkownik na tym urządzeniu — skasuj pozostałości po poprzednim
      if (prev && prev !== normalized) {
        window.localStorage.removeItem("fitcoach_client_trainer_id");
        window.localStorage.removeItem("fitcoach_client_has_trainer");
      }
      window.localStorage.setItem("fitcoach_client_logged_in", "true");
      window.localStorage.setItem("fitcoach_client_email", normalized);
    }
    await cloudBootstrap();
    router.push("/client");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("fitcoach_client_logged_in", "true");
        window.localStorage.setItem("fitcoach_client_email", email);
        // Każde nowe logowanie zaczyna od wyboru trenera i czystej kartoteki
        window.localStorage.removeItem("fitcoach_client_trainer_id");
        window.localStorage.removeItem("fitcoach_client_has_trainer");
      }
      router.push("/client");
    } else {
      setError("Nieprawidłowy e-mail lub hasło.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          {mode === "login"
            ? "Logowanie podopiecznego"
            : "Konto podopiecznego"}
        </h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          {CLOUD ? (
            mode === "login" ? (
              "Zaloguj się adresem e-mail i hasłem."
            ) : (
              "Podaj e-mail i hasło — utworzymy Twoje konto."
            )
          ) : (
            <>
              Użyj konta demo: <br />
              <span className="font-mono text-xs">
                {DEMO_EMAIL} / {DEMO_PASSWORD}
              </span>
            </>
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasło
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={CLOUD ? "min. 6 znaków" : "hasło"}
              required
              minLength={CLOUD ? 6 : undefined}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {info && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {busy ? "Chwila…" : mode === "login" ? "Zaloguj się" : "Załóż konto"}
          </button>
        </form>

        {CLOUD ? (
          <p className="mt-4 text-xs text-gray-500 text-center">
            {mode === "login" ? (
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setInfo("");
                }}
                className="text-emerald-700 font-medium hover:text-emerald-800"
              >
                Nie masz konta? Załóż konto
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setInfo("");
                }}
                className="text-emerald-700 font-medium hover:text-emerald-800"
              >
                Masz już konto? Zaloguj się
              </button>
            )}
          </p>
        ) : (
          <p className="mt-4 text-xs text-gray-500 text-center">
            Nie masz jeszcze konta? Na razie to wersja demo – wybierz trenera z
            ekranu głównego.
          </p>
        )}

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-primary-600 hover:text-primary-700">
            ← Wróć na stronę główną
          </Link>
        </div>
      </div>
    </div>
  );
}