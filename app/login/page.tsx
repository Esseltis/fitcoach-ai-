"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DEMO_EMAIL = "podopieczny@fitcoach.ai";
const DEMO_PASSWORD = "demo123";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = window.localStorage.getItem("fitcoach_client_logged_in");
    const hasTrainerFlag =
      window.localStorage.getItem("fitcoach_client_has_trainer") === "true";
    const trainerId = window.localStorage.getItem(
      "fitcoach_client_trainer_id",
    );

    if (loggedIn === "true") {
      const hasTrainer = hasTrainerFlag || Boolean(trainerId);
      router.replace(hasTrainer ? "/client" : "/trainers");
    }
  }, [router]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("fitcoach_client_logged_in", "true");
        window.localStorage.setItem("fitcoach_client_email", email);
      }

      let hasTrainer = false;
      if (typeof window !== "undefined") {
        const hasTrainerFlag =
          window.localStorage.getItem("fitcoach_client_has_trainer") ===
          "true";
        const trainerId = window.localStorage.getItem(
          "fitcoach_client_trainer_id",
        );
        hasTrainer = hasTrainerFlag || Boolean(trainerId);
      }

      router.push(hasTrainer ? "/client" : "/trainers");
    } else {
      setError("Nieprawidłowy e-mail lub hasło.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Logowanie podopiecznego
        </h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Użyj konta demo: <br />
          <span className="font-mono text-xs">
            {DEMO_EMAIL} / {DEMO_PASSWORD}
          </span>
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
              placeholder="hasło"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full inline-flex justify-center items-center px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition"
          >
            Zaloguj się
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Nie masz jeszcze konta? Na razie to wersja demo – wybierz trenera z
          ekranu głównego.
        </p>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-primary-600 hover:text-primary-700">
            ← Wróć na stronę główną
          </Link>
        </div>
      </div>
    </div>
  );
}

