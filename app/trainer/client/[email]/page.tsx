"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getTrainerIdentity,
  getClientByEmail,
  getReport,
  getPlan,
  savePlan,
  trainerLogout,
  type ClientReport,
  type TrainerPlan,
} from "@/lib/store";

const FIELDS: { key: keyof TrainerPlan; label: string; icon: string }[] = [
  { key: "diet", label: "Dieta", icon: "🥗" },
  { key: "training", label: "Trening", icon: "🏋️" },
  { key: "hydration", label: "Nawodnienie", icon: "💧" },
  { key: "supplementation", label: "Suplementacja", icon: "💊" },
];

export default function TrainerClientPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const router = useRouter();
  const { email: rawEmail } = use(params);
  const email = decodeURIComponent(rawEmail);

  const [ready, setReady] = useState(false);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [clientName, setClientName] = useState(email);
  const [report, setReport] = useState<ClientReport | null>(null);
  const [plan, setPlan] = useState<TrainerPlan>({
    diet: "",
    training: "",
    hydration: "",
    supplementation: "",
    notes: "",
    updatedAt: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const id = getTrainerIdentity();
    if (!id) {
      router.replace("/trainer/login");
      return;
    }
    setTrainerId(id.id);
    const client = getClientByEmail(email);
    if (client) setClientName(client.name);
    setReport(getReport(email));
    const existing = getPlan(id.id, email);
    if (existing) setPlan(existing);
    setReady(true);
  }, [email, router]);

  const handleSave = () => {
    if (!trainerId) return;
    savePlan(trainerId, email, { ...plan, updatedAt: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-200">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/trainer"
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            ← Moi podopieczni
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-slate-50">{clientName}</h1>
            <p className="text-[11px] text-slate-400">{email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            trainerLogout();
            router.push("/trainer/login");
          }}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
        >
          Wyloguj się
        </button>
      </header>

      <main className="mx-auto max-w-5xl p-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Raport klienta */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            Raport klienta
          </h2>
          {!report ? (
            <p className="text-sm text-slate-400">
              Klient jeszcze nie wysłał raportu.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              <Row label="Samopoczucie" value={`${report.wellbeing} / 5`} />
              <Row
                label="Zrealizowany trening"
                value={report.trainingDone ? "Tak" : "Nie"}
              />
              <Row
                label="Zrealizowane posiłki"
                value={report.mealsDone ? "Tak" : "Nie"}
              />
              <Row label="Sen" value={`${report.sleepHours} h`} />
              <Row label="Waga" value={`${report.weight} kg`} />
              <div>
                <p className="text-xs text-slate-400">Notatka:</p>
                <p className="mt-1 rounded-lg bg-slate-900 p-2 text-slate-200">
                  {report.notes || "—"}
                </p>
              </div>
              <p className="text-[11px] text-slate-500">
                Wysłano: {new Date(report.submittedAt).toLocaleString("pl-PL")}
              </p>
            </div>
          )}
        </section>

        {/* Edytor planu */}
        <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
              Plan od trenera
            </h2>
            {saved && (
              <span className="text-xs text-emerald-300">Zapisano ✓</span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  {f.icon} {f.label}
                </label>
                <textarea
                  value={plan[f.key]}
                  onChange={(e) =>
                    setPlan((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  rows={4}
                  placeholder={`Wpisz ${f.label.toLowerCase()} dla tego klienta...`}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Dodatkowe uwagi
            </label>
            <textarea
              value={plan.notes}
              onChange={(e) => setPlan((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
              placeholder="Ogólne wskazówki, uwagi do raportu..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Zapisz plan
          </button>
          {plan.updatedAt && (
            <p className="text-[11px] text-slate-500">
              Ostatnia zmiana: {new Date(plan.updatedAt).toLocaleString("pl-PL")}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-100">{value}</span>
    </div>
  );
}
