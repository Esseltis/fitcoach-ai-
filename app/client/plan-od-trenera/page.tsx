"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getPlan,
  getTrainerById,
  type TrainerPlan,
} from "@/lib/store";

export default function PlanOdTreneraPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [plan, setPlan] = useState<TrainerPlan | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = window.localStorage.getItem("fitcoach_client_logged_in");
    if (loggedIn !== "true") {
      router.replace("/login");
      return;
    }
    const e = window.localStorage.getItem("fitcoach_client_email") ?? "";
    const tId = window.localStorage.getItem("fitcoach_client_trainer_id");
    setEmail(e);
    setTrainerId(tId);
    if (tId) setPlan(getPlan(tId, e));
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-200">Ładowanie...</p>
      </div>
    );
  }

  const trainer = trainerId ? getTrainerById(trainerId) : undefined;

  const sections: { key: keyof TrainerPlan; label: string; icon: string }[] = [
    { key: "diet", label: "Dieta", icon: "🥗" },
    { key: "training", label: "Trening", icon: "🏋️" },
    { key: "hydration", label: "Nawodnienie", icon: "💧" },
    { key: "supplementation", label: "Suplementacja", icon: "💊" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="hidden md:flex w-64 bg-slate-950/95 border-r border-slate-800 flex-col">
        <div className="h-16 px-5 flex items-center border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-900 text-sm font-bold shadow-lg">
              FC
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">
                FitCoach AI
              </span>
              <span className="text-[11px] text-slate-400">Panel podopiecznego</span>
            </div>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <Link
            href="/client"
            className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] text-slate-300 hover:bg-slate-800/60 hover:text-slate-50"
          >
            <span className="h-7 w-1 rounded-full bg-emerald-400" />
            ← Panel główny
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-slate-800 px-6 py-5">
          <h1 className="text-xl font-semibold text-slate-50">Plan od trenera</h1>
          <p className="text-xs text-slate-400">
            {trainer
              ? `Ułożony przez: ${trainer.name}`
              : "Nie wybrano jeszcze trenera"}
          </p>
        </header>

        <div className="p-6 space-y-4">
          {!trainerId ? (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-900/30 p-4 text-sm text-amber-100">
              Nie masz jeszcze przypisanego trenera. Wybierz trenera, by otrzymać
              spersonalizowany plan.
            </div>
          ) : !plan ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-400">
              Trener jeszcze nie przypisał Ci planu. Wypełnij raport, a trener
              ustali dietę, trening, nawodnienie i suplementację.
            </div>
          ) : (
            <>
              {sections.map((s) => (
                <section
                  key={s.key}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5"
                >
                  <h2 className="mb-2 text-sm font-semibold text-emerald-400">
                    {s.icon} {s.label}
                  </h2>
                  <p className="whitespace-pre-wrap text-sm text-slate-200">
                    {plan[s.key] || "—"}
                  </p>
                </section>
              ))}
              {plan.notes && (
                <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                  <h2 className="mb-2 text-sm font-semibold text-emerald-400">
                    Dodatkowe uwagi
                  </h2>
                  <p className="whitespace-pre-wrap text-sm text-slate-200">
                    {plan.notes}
                  </p>
                </section>
              )}
              {plan.updatedAt && (
                <p className="text-[11px] text-slate-500">
                  Ostatnia aktualizacja:{" "}
                  {new Date(plan.updatedAt).toLocaleString("pl-PL")}
                </p>
              )}
            </>
          )}
          <p className="text-[11px] text-slate-500">
            Zalogowano jako: {email}
          </p>
        </div>
      </main>
    </div>
  );
}
