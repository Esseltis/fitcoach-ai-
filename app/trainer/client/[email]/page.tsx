"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getTrainerIdentity,
  getClientByEmail,
  getReport,
  getPlan,
  getClientProfile,
  getTrainerReportFields,
  savePlan,
  getClientContent,
  saveClientContent,
  trainerLogout,
  getTrainerRecipes,
  saveTrainerRecipe,
  getTrainerWorkouts,
  saveTrainerWorkout,
  GENERAL_RECIPES,
  GENERAL_WORKOUTS,
  type ClientReport,
  type ClientProfile,
  type TrainerPlan,
  type TrainerContent,
  type Recipe,
  type Workout,
} from "@/lib/store";
import TrainerQuickLibrary from "@/components/TrainerQuickLibrary";
import {
  IntroEditor,
  NutritionEditor,
  TipsEditor,
  DietEditor,
  SupplementsEditor,
  HydrationEditor,
  TrainingEditor,
  CateringEditor,
} from "@/components/TrainerContentEditors";

type TabKey =
  | "report"
  | "profile"
  | "intro"
  | "nutrition"
  | "tips"
  | "diet"
  | "supplements"
  | "hydration"
  | "training"
  | "catering"
  | "plan";

const TABS: { key: TabKey; label: string }[] = [
  { key: "report", label: "Raport" },
  { key: "profile", label: "Profil" },
  { key: "intro", label: "Wstęp" },
  { key: "nutrition", label: "Analiza" },
  { key: "tips", label: "Porady" },
  { key: "diet", label: "Dieta" },
  { key: "supplements", label: "Suplementy" },
  { key: "hydration", label: "Nawodnienie" },
  { key: "training", label: "Trening" },
  { key: "catering", label: "Catering" },
  { key: "plan", label: "Plan" },
];

const PLAN_FIELDS: { key: keyof TrainerPlan; label: string; icon: string }[] = [
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
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [tab, setTab] = useState<TabKey>("report");
  const [content, setContent] = useState<TrainerContent>(() =>
    getClientContent(email)
  );
  const [plan, setPlan] = useState<TrainerPlan>({
    diet: "",
    training: "",
    hydration: "",
    supplementation: "",
    notes: "",
    updatedAt: "",
  });
  const [saved, setSaved] = useState(false);
  const [ownRecipes, setOwnRecipes] = useState<Recipe[]>([]);
  const [ownWorkouts, setOwnWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    const id = getTrainerIdentity();
    if (!id) {
      router.replace("/trainer/login");
      return;
    }
    setTrainerId(id.id);
    setOwnRecipes(getTrainerRecipes(id.id));
    setOwnWorkouts(getTrainerWorkouts(id.id));
    const client = getClientByEmail(email);
    if (client) setClientName(client.name);
    setReport(getReport(email));
    setProfile(getClientProfile(email));
    setContent(getClientContent(email));
    const existing = getPlan(id.id, email);
    if (existing) setPlan(existing);
    setReady(true);
  }, [email, router]);

  const handleQuickPick = (
    key: keyof TrainerPlan,
    item: { name: string; detail: string }
  ) => {
    setPlan((p) => {
      const current = (p[key] as string) ?? "";
      const block = `${item.name}\n${item.detail}`;
      const sep = current.trim() ? "\n" : "";
      return { ...p, [key]: current + sep + block } as TrainerPlan;
    });
  };

  const handleSaveRecipe = (name: string, detail: string) => {
    if (!trainerId) return;
    setOwnRecipes(saveTrainerRecipe(trainerId, { name, detail }));
  };

  const handleSaveWorkout = (name: string, detail: string) => {
    if (!trainerId) return;
    setOwnWorkouts(saveTrainerWorkout(trainerId, { name, detail }));
  };

  const prefillFromProfile = () => {
    if (!profile) return;
    const w = Number(profile.weight) || 0;
    const h = Number(profile.height) || 0;
    const age = Number(profile.age) || 0;
    const bmr =
      10 * w +
      6.25 * h -
      5 * age +
      (profile.gender === "kobieta" ? -161 : 5);
    const act =
      profile.activity.startsWith("Brak")
        ? 1.2
        : profile.activity.startsWith("Niska")
        ? 1.375
        : profile.activity.startsWith("Umiarkowana")
        ? 1.55
        : profile.activity.startsWith("Wysoka")
        ? 1.725
        : 1.9;
    const adjust =
      profile.goal.startsWith("Redukcja")
        ? 0.85
        : profile.goal.startsWith("Masa")
        ? 1.1
        : 1;
    const target = Math.round(bmr * act * adjust);
    const balanceType = profile.goal.startsWith("Redukcja")
      ? "Redukcja"
      : profile.goal.startsWith("Masa")
      ? "Masa"
      : "Utrzymanie";
    const balanceValue = profile.goal.startsWith("Redukcja")
      ? "-15%"
      : profile.goal.startsWith("Masa")
      ? "+10%"
      : "0%";
    setContent((c) => ({
      ...c,
      nutrition: {
        ...c.nutrition,
        weight: profile.weight,
        height: profile.height,
        balanceType,
        balanceValue,
        calories: String(target),
      },
      diet: { ...c.diet, targetCalories: String(target) },
    }));
    flash();
  };

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const saveSection = () => {
    if (!trainerId) return;
    saveClientContent(email, content);
    flash();
  };

  const savePlanSection = () => {
    if (!trainerId) return;
    savePlan(trainerId, email, { ...plan, updatedAt: new Date().toISOString() });
    flash();
  };

  const reportFieldDefs = trainerId
    ? getTrainerReportFields(trainerId)
    : [];

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
          <Link href="/trainer" className="text-xs text-slate-400 hover:text-slate-200">
            ← Moi podopieczni
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-emerald-400">
              Edytor planu
            </p>
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

      <div className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-2 py-2 overflow-x-auto">
        <div className="mx-auto flex max-w-5xl gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                tab === t.key
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-4 flex items-center justify-end gap-3">
          {saved && <span className="text-xs text-emerald-300">Zapisano ✓</span>}
          {tab !== "report" && (
            <button
              type="button"
              onClick={tab === "plan" ? savePlanSection : saveSection}
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition"
            >
              Zapisz {tab === "plan" ? "plan" : "sekcję"}
            </button>
          )}
        </div>

        {tab === "report" && (
          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
              Raport klienta
            </h2>
            {!report ? (
              <p className="text-sm text-slate-400">
                Klient jeszcze nie wysłał raportu.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                {reportFieldDefs
                  .filter((f) => f.key in report.values)
                  .map((f) => (
                    <Row
                      key={f.key}
                      label={f.label}
                      value={formatReportValue(f.key, report.values[f.key])}
                    />
                  ))}
                <p className="text-[11px] text-slate-500">
                  Wysłano: {new Date(report.submittedAt).toLocaleString("pl-PL")}
                </p>
              </div>
            )}
          </section>
        )}

        {tab === "profile" && (
          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                Profil klienta (raport wstępny)
              </h2>
              {profile && (
                <button
                  type="button"
                  onClick={prefillFromProfile}
                  className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Uzupełnij plan na podstawie profilu
                </button>
              )}
            </div>
            {!profile ? (
              <p className="text-sm text-slate-400">
                Klient nie wypełnił jeszcze profilu wstępnego.
              </p>
            ) : (
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <Row label="Cel" value={profile.goal} />
                <Row label="Płeć" value={profile.gender} />
                <Row label="Wiek" value={`${profile.age} lat`} />
                <Row label="Waga" value={`${profile.weight} kg`} />
                <Row label="Wzrost" value={`${profile.height} cm`} />
                <Row label="Aktywność" value={profile.activity} />
                <Row label="Treningi / tydz." value={profile.trainingFrequency} />
                <Row label="Posiłki dziennie" value={profile.mealsPerDay} />
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-xs text-slate-400">Preferencje / uwagi:</p>
                  <p className="mt-1 rounded-lg bg-slate-900 p-2 text-slate-200">
                    {profile.preferences || "—"}
                  </p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-xs text-slate-400">Zdrowie / przeciwwskazania:</p>
                  <p className="mt-1 rounded-lg bg-slate-900 p-2 text-slate-200">
                    {profile.healthNotes || "—"}
                  </p>
                </div>
                <p className="col-span-1 text-[11px] text-slate-500 sm:col-span-2">
                  Wysłano: {new Date(profile.submittedAt).toLocaleString("pl-PL")}
                </p>
              </div>
            )}
          </section>
        )}

        {tab === "intro" && <IntroEditor c={content} set={setContent} />}
        {tab === "nutrition" && <NutritionEditor c={content} set={setContent} />}
        {tab === "tips" && <TipsEditor c={content} set={setContent} />}
        {tab === "diet" && trainerId && (
          <DietEditor c={content} set={setContent} trainerId={trainerId} />
        )}
        {tab === "supplements" && <SupplementsEditor c={content} set={setContent} />}
        {tab === "hydration" && <HydrationEditor c={content} set={setContent} />}
        {tab === "training" && trainerId && (
          <TrainingEditor c={content} set={setContent} trainerId={trainerId} />
        )}
        {tab === "catering" && <CateringEditor c={content} set={setContent} />}

        {tab === "plan" && (
          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                Plan od trenera
              </h2>
              {plan.updatedAt && (
                <span className="text-[11px] text-slate-500">
                  Ostatnia zmiana:{" "}
                  {new Date(plan.updatedAt).toLocaleString("pl-PL")}
                </span>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {PLAN_FIELDS.map((f) => (
                <div key={f.key} className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    {f.icon} {f.label}
                  </label>
                  <textarea
                    value={plan[f.key]}
                    onChange={(e) =>
                      setPlan((p) => ({ ...p, [f.key]: e.target.value } as TrainerPlan))
                    }
                    rows={4}
                    placeholder={`Wpisz ${f.label.toLowerCase()} dla tego klienta...`}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
                  />
                  {f.key === "diet" && (
                    <TrainerQuickLibrary
                      title="Przepisy"
                      icon="🍲"
                      saveLabel="Zapisz przepis"
                      general={GENERAL_RECIPES}
                      own={ownRecipes}
                      onPick={(it) => handleQuickPick("diet", it)}
                      onSave={handleSaveRecipe}
                    />
                  )}
                  {f.key === "training" && (
                    <TrainerQuickLibrary
                      title="Treningi"
                      icon="🏋️"
                      saveLabel="Zapisz trening"
                      general={GENERAL_WORKOUTS}
                      own={ownWorkouts}
                      onPick={(it) => handleQuickPick("training", it)}
                      onSave={handleSaveWorkout}
                    />
                  )}
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
          </section>
        )}
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

function formatReportValue(key: string, v: string | number | boolean): string {
  if (key === "trainingDone" || key === "mealsDone") return v ? "Tak" : "Nie";
  if (v === "" || v === null || v === undefined) return "—";
  if (key === "sleepHours") return `${v} h`;
  if (key === "weight") return `${v} kg`;
  if (key === "waterIntake") return `${v} l`;
  return String(v);
}
