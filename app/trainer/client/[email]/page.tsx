"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getTrainerIdentity,
  getClientByEmail,
  getReport,
  getWeeklyReport,
  getWeeklyReportStatus,
  getProgressPhotos,
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
  getMoodByDate,
  getDoneMeals,
  getWaterForDate,
  getDoneExerciseIds,
  getActivities,
  getTrainingLog,
  getMealsDoneByDate,
  getWaterAll,
  getBodyWeightKg,
  getTasksDone,
  getPhotoMeals,
  getDishLog,
  getDishLogByDate,
  getMeasurements,
  getClientsForTrainer,
  getChat,
  sendChatMessage,
  getSessionRequests,
  decideSessionRequest,
  GENERAL_RECIPES,
  GENERAL_WORKOUTS,
  type ClientReport,
  type WeeklyReport,
  type ClientProfile,
  type TrainerPlan,
  type TrainerContent,
  type Recipe,
  type Workout,
  type ChatMessage,
  type SessionRequest,
} from "@/lib/store";
import { resizeImage } from "@/components/ChatSection";
import MacroCalculator from "@/components/MacroCalculator";
import RecordsView from "@/components/RecordsView";
import WeightProgress from "@/components/WeightProgress";
import ClientIntakeReport from "@/components/ClientIntakeReport";
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
  GuidelinesEditor,
} from "@/components/TrainerContentEditors";

type TabKey =
  | "report"
  | "wykonanie"
  | "records"
  | "profile"
  | "intro"
  | "nutrition"
  | "tips"
  | "diet"
  | "supplements"
  | "hydration"
  | "training"
  | "catering"
  | "guidelines"
  | "plan"
  | "chat"
  | "calendar";

const TABS: { key: TabKey; label: string }[] = [
  { key: "report", label: "Raport" },
  { key: "wykonanie", label: "Wykonanie" },
  { key: "records", label: "Rekordy" },
  { key: "profile", label: "Profil" },
  { key: "intro", label: "Wstęp" },
  { key: "nutrition", label: "Analiza" },
  { key: "tips", label: "Porady" },
  { key: "diet", label: "Dieta" },
  { key: "supplements", label: "Suplementy" },
  { key: "hydration", label: "Nawodnienie" },
  { key: "training", label: "Trening" },
  { key: "catering", label: "Catering" },
  { key: "guidelines", label: "Wytyczne" },
  { key: "plan", label: "Plan" },
  { key: "chat", label: "Czat" },
  { key: "calendar", label: "Kalendarz" },
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
  const [weekly, setWeekly] = useState<WeeklyReport | null>(null);
  const [weeklyOverdue, setWeeklyOverdue] = useState(0);
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
  const [massMsg, setMassMsg] = useState<string | null>(null);
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
    setWeekly(getWeeklyReport(email));
    setWeeklyOverdue(getWeeklyReportStatus(email).overdueDays);
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

  const sendFeedback = () => {
    if (!trainerId) return;
    const next: TrainerContent = {
      ...content,
      feedback: { text: content.feedback.text, at: new Date().toISOString() },
    };
    setContent(next);
    saveClientContent(email, next);
    flash();
  };

  const reportFieldDefs = trainerId
    ? getTrainerReportFields(trainerId)
    : [];

  // 📊 Eksport CSV: pomiary ciała + dziennik żywienia (jeden plik, dwie sekcje)
  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines: string[] = [];
    lines.push(`FitCoach AI — eksport danych;${esc(email)};${esc(clientName)}`);
    lines.push("");
    lines.push("POMIARY CIAŁA");
    lines.push("data;waga;pas;brzuch;biceps;klatka;uda;lydki");
    for (const m of getMeasurements(email)) {
      lines.push(
        [
          m.date,
          m.values.weight ?? "",
          m.values.pas ?? "",
          m.values.brzuch ?? "",
          m.values.biceps ?? "",
          m.values.klatka ?? "",
          m.values.uda ?? "",
          m.values.lydki ?? "",
        ]
          .map(esc)
          .join(";")
      );
    }
    lines.push("");
    lines.push("DZIENNIK ŻYWIENIA");
    lines.push("data;kategoria;nazwa;kcal;białko;węgle;tłuszcze");
    const byDate = getDishLogByDate(email);
    for (const date of Object.keys(byDate).sort()) {
      for (const e of byDate[date]) {
        lines.push(
          [date, e.category, e.name, e.kcal, e.protein, e.carbs, e.fat]
            .map(esc)
            .join(";")
        );
      }
    }
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitcoach_${email.replace(/[@.]/g, "_")}_export.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // 📣 Masowe wytyczne: kopia bieżących wytycznych i zadań do wszystkich
  // podopiecznych trenera (poza tym otwartym)
  const applyGuidelinesToAll = () => {
    if (!trainerId) return;
    const others = getClientsForTrainer(trainerId).filter(
      (c) => c.email !== email
    );
    for (const c of others) {
      const target = getClientContent(c.email);
      saveClientContent(c.email, {
        ...target,
        guidelines: content.guidelines,
        tasks: content.tasks,
      });
    }
    setMassMsg(
      `✓ Zastosowano wytyczne i zadania u ${others.length} podopiecznych${
        others.length === 0 ? " (brak innych podopiecznych)" : ""
      }.`
    );
  };

  // Raport nowszy niż ostatnia odpowiedź trenera → wymaga reakcji
  const reportIsNew =
    !!report &&
    (!content.feedback?.at || report.submittedAt > content.feedback.at);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-200">Ładowanie...</p>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-slate-950 text-slate-100 print:hidden">
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
              {t.key === "report" && reportIsNew && (
                <span
                  title="Nowy raport — jeszcze nie odpowiedziałeś"
                  className="ml-1.5 inline-block h-2 w-2 rounded-full bg-red-400 align-middle shadow-[0_0_6px_rgba(248,113,113,0.9)]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-4 flex items-center justify-end gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              title="Pomiary ciała + dziennik żywienia (CSV)"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              📊 CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              title="Drukuj / zapisz podsumowanie jako PDF"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              🖨 PDF
            </button>
          </div>
          {saved && <span className="text-xs text-emerald-300">Zapisano ✓</span>}
          {tab !== "report" && tab !== "wykonanie" && (
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
          <>
          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                Raport klienta
              </h2>
              {reportIsNew ? (
                <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-semibold text-red-300">
                  NOWY — brak Twojej odpowiedzi
                </span>
              ) : report ? (
                <span className="text-[10px] text-slate-500">
                  Odpowiedź wysłana ✓
                </span>
              ) : null}
            </div>
            {!report?.values ? (
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

          {/* 📋 Raport tygodniowy — pomiary + zdjęcia sylwetki (co 7 dni) */}
          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                📋 Raport tygodniowy (pomiary + zdjęcia)
              </h2>
              {weeklyOverdue > 0 ? (
                <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-semibold text-red-300">
                  {weeklyOverdue > 1
                    ? `ZALEGŁY od ${weeklyOverdue} dni`
                    : "DO WYSŁANIA"}
                </span>
              ) : weekly ? (
                <span className="text-[10px] text-slate-500">
                  Aktualny ✓
                </span>
              ) : null}
            </div>
            {!weekly ? (
              <p className="text-sm text-slate-400">
                Klient jeszcze nie wysłał raportu tygodniowego — wymaga on
                pomiarów sylwetki i zdjęcia.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                <Row
                  label="Pomiary sylwetki"
                  value={String(weekly.values.measurements ?? "—")}
                />
                <Row
                  label="Dni z codziennym wpisem"
                  value={`${String(weekly.values.daysLogged ?? 0)}/7`}
                />
                <Row
                  label="Treningi (z wpisów)"
                  value={String(weekly.values.trainings ?? 0)}
                />
                <Row
                  label="Średnie samopoczucie"
                  value={
                    Number(weekly.values.avgWellbeing) > 0
                      ? `${String(weekly.values.avgWellbeing)}/5`
                      : "—"
                  }
                />
                {String(weekly.values.notes ?? "").trim() && (
                  <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">
                      Uwagi klienta
                    </p>
                    <p className="mt-1 whitespace-pre-line text-xs text-slate-200">
                      {String(weekly.values.notes)}
                    </p>
                  </div>
                )}
                {(() => {
                  const ids = new Set(weekly.photoIds);
                  const shots = getProgressPhotos(email).filter((p) =>
                    ids.has(p.id)
                  );
                  if (shots.length === 0) return null;
                  return (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">
                        Zdjęcia z tego raportu ({shots.length})
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {shots.map((p) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={p.id}
                            src={p.dataUrl}
                            alt={`Sylwetka ${p.date}`}
                            className="h-24 w-20 rounded-lg object-cover ring-1 ring-slate-700"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <p className="text-[11px] text-slate-500">
                  Wysłano: {new Date(weekly.submittedAt).toLocaleString("pl-PL")}
                </p>
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
              Sytość i motywacja (check-in 7 dni)
            </h2>
            {(() => {
              const moods = getMoodByDate(email);
              const rows: {
                key: string;
                label: string;
                satiety: number;
                motivation: number;
              }[] = [];
              for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const k =
                  i === 0
                    ? new Date().toISOString().slice(0, 10)
                    : (() => {
                        const mid = new Date(d);
                        mid.setHours(12, 0, 0, 0);
                        return mid.toISOString().slice(0, 10);
                      })();
                const e = moods[k];
                rows.push({
                  key: k,
                  label:
                    i === 0
                      ? "Dziś"
                      : d.toLocaleDateString("pl-PL", {
                          day: "2-digit",
                          month: "2-digit",
                        }),
                  satiety: e?.satiety ?? 0,
                  motivation: e?.motivation ?? 0,
                });
              }
              const any = rows.some((r) => r.satiety > 0 || r.motivation > 0);
              if (!any) {
                return (
                  <p className="text-sm text-slate-400">
                    Klient nie zrobił jeszcze check-inu samopoczucia.
                  </p>
                );
              }
              return (
                <div className="space-y-2 text-sm">
                  {rows.map((r) => (
                    <div
                      key={r.key}
                      className="flex items-center justify-between border-b border-slate-800/60 pb-2"
                    >
                      <span className="text-slate-400">{r.label}</span>
                      <span className="flex gap-4">
                        <span className="text-sky-300">
                          Sytość: {r.satiety > 0 ? `${r.satiety}/5` : "—"}
                        </span>
                        <span className="text-amber-300">
                          Motywacja: {r.motivation > 0 ? `${r.motivation}/5` : "—"}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
              Odpowiedź dla podopiecznego
            </h2>
            <p className="text-[11px] text-slate-400">
              Wiadomość pojawi się w jego panelu w karcie „Wiadomość od trenera"
              — to Twoja stała odpowiedź na raport i bieżące wskazówki.
            </p>
            <textarea
              value={content.feedback.text}
              onChange={(e) =>
                setContent({
                  ...content,
                  feedback: { ...content.feedback, text: e.target.value },
                })
              }
              rows={4}
              placeholder="np. Super robota z raportami — kalorie trzymamy, w tym tygodniu dokładamy 1 trening. Pamiętaj o zdjęciach w sobotę!"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                {content.feedback.at
                  ? `Ostatnia wiadomość: ${new Date(
                      content.feedback.at
                    ).toLocaleString("pl-PL")}`
                  : "Brak wiadomości — podopieczny zobaczy domyślne przypomnienie."}
              </span>
              <button
                type="button"
                onClick={sendFeedback}
                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Wyślij odpowiedź
              </button>
            </div>
          </section>

          <WeightProgress email={email} />
          </>
        )}

        {tab === "wykonanie" && (
          <WykonanieSection email={email} content={content} report={report} />
        )}

        {tab === "records" && <RecordsView email={email} content={content} />}

        {tab === "profile" && (
          <>
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
            {!profile && (
              <p className="text-sm text-slate-400">
                Klient nie wypełnił jeszcze ankiety wstępnej (intake).
              </p>
            )}
          </section>

          {profile && (
            <ClientIntakeReport
              profile={profile}
              clientName={clientName}
              email={email}
            />
          )}

          <MacroCalculator
            email={email}
            content={content}
            setContent={setContent}
            profile={profile}
          />
          </>
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
        {tab === "guidelines" && (
          <div className="space-y-4">
            {/* 📣 Masowe wytyczne — jednym kliknięciem do wszystkich */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-emerald-200">
                  📣 Masowe wytyczne
                </p>
                <p className="text-[11px] text-emerald-300/80">
                  Podmiej te zasady, cele i zadania u wszystkich swoich
                  podopiecznych naraz (po zapisaniu zmian w polach poniżej).
                </p>
              </div>
              <button
                type="button"
                onClick={applyGuidelinesToAll}
                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Zastosuj u wszystkich (
                {trainerId
                  ? getClientsForTrainer(trainerId).filter(
                      (c) => c.email !== email
                    ).length
                  : 0}
                )
              </button>
            </div>
            {massMsg && (
              <p className="text-xs font-medium text-emerald-300">{massMsg}</p>
            )}
            <GuidelinesEditor c={content} set={setContent} />
          </div>
        )}

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

        {tab === "chat" && <TrainerChat email={email} />}
        {tab === "calendar" && <TrainerCalendar email={email} />}
      </main>
    </div>

    {/* Wydruk / PDF — widoczne tylko przy drukowaniu (przycisk 🖨 PDF) */}
    <PrintSummary
      clientName={clientName}
      email={email}
      content={content}
      profile={profile}
      report={report}
      fields={reportFieldDefs}
    />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-800/60 pb-2">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="max-w-[65%] whitespace-pre-line text-right font-medium text-slate-100">
        {value}
      </span>
    </div>
  );
}

function formatReportValue(key: string, v: string | number | boolean): string {
  if (typeof v === "boolean") return v ? "Tak" : "Nie";
  if (v === "" || v === null || v === undefined) return "—";
  if (key === "sleepHours") return `${v} h`;
  if (key === "weight") return `${v} kg`;
  if (key === "waterIntake") return `${v} l`;
  if (key === "steps") return `${Number(v).toLocaleString("pl-PL")} kroków`;
  if (key === "activeMinutes") return `${v} min`;
  if (key === "adherence") return `${v}%`;
  return String(v);
}

function StatBar({
  label,
  value,
  sub,
  done,
  total,
}: {
  label: string;
  value: string;
  sub?: string;
  done?: number;
  total?: number;
}) {
  const pct =
    typeof done === "number" && typeof total === "number" && total > 0
      ? Math.min(100, Math.round((done / total) * 100))
      : null;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-50">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
      {pct !== null && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Poziomy aktywności w kalendarzu (skala slate jest odwrócona w jasnym
// motywie — jeden zestaw klas działa w obu motywach, jak na dashboardzie)
const CAL_LEVELS = [
  "bg-slate-700",
  "bg-emerald-300/70",
  "bg-emerald-400",
  "bg-emerald-500",
];

function WykonanieSection({
  email,
  content,
  report,
}: {
  email: string;
  content: TrainerContent;
  report: ClientReport | null;
}) {
  const today = new Date().toISOString().slice(0, 10);

  // 📅 Kalendarz: nawigacja po miesiącach + wybrany dzień
  const [monthOff, setMonthOff] = useState(0);
  const [calDay, setCalDay] = useState<string | null>(null);
  const calBase = new Date();
  calBase.setDate(1);
  calBase.setMonth(calBase.getMonth() + monthOff);
  const calYear = calBase.getFullYear();
  const calMonth = calBase.getMonth();
  const calLabel = calBase.toLocaleDateString("pl-PL", {
    month: "long",
    year: "numeric",
  });
  const calDays = new Date(calYear, calMonth + 1, 0).getDate();
  const calPad = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // pon=0
  const calCells: (number | null)[] = [
    ...Array.from({ length: calPad }, () => null),
    ...Array.from({ length: calDays }, (_, i) => i + 1),
  ];
  while (calCells.length % 7 !== 0) calCells.push(null);

  // Posiłki
  const mealCats: string[] = content.diet.meals.map((m) => m.category ?? "");
  const doneMeals = getDoneMeals(email, today).filter((c) =>
    mealCats.includes(c)
  );
  const mealTotal = Math.max(1, new Set(mealCats.filter(Boolean)).size);

  // Woda: cel trenera, inaczej auto z masy ciała
  const water = getWaterForDate(email, today);
  const kg = getBodyWeightKg(email, content.nutrition.weight);
  const autoGoal = kg
    ? Math.max(4, Math.min(15, Math.round((kg * 31) / 250)))
    : 8;
  const override = Number(content.guidelines?.waterGlasses);
  const waterGoal =
    Number.isFinite(override) && override > 0
      ? Math.min(20, Math.round(override))
      : autoGoal;

  // Trening: wykonane ćwiczenia per dzień planu
  const trainingRows = content.training.days
    .map((d, i) => {
      const dayId = i + 1;
      const total = (content.training.dayExercises[dayId] ?? []).length;
      const done = getDoneExerciseIds(email, dayId).filter(
        (id) => Number(id) >= 1 && Number(id) <= total
      ).length;
      return { dayId, label: d.label, status: d.status, total, done };
    })
    .filter((r) => r.total > 0);
  const trainingDone = trainingRows.reduce((s, r) => s + r.done, 0);
  const trainingTotal = trainingRows.reduce((s, r) => s + r.total, 0);

  // Zadania od trenera
  const tasks = content.tasks.filter((t) => t.trim());
  const tasksDone = getTasksDone(email, today);

  // Aktywności spoza planu
  const acts = getActivities(email, today);
  const actKcal = acts.reduce((s, a) => s + (a.kcal || 0), 0);

  // Posiłki spoza planu: zdjęcia (wycena AI) + dania własne (składniki/ręczne)
  const photoMeals = getPhotoMeals(email, today);
  const dishLogs = getDishLog(email, today);
  const outKcal =
    photoMeals.reduce((s, p) => s + (p.kcal || 0), 0) +
    dishLogs.reduce((s, l) => s + (l.kcal || 0), 0);
  const photoCatLabels: Record<string, string> = {
    sniadanie: "Śniadanie",
    ii_sniadanie: "II śniadanie",
    obiad: "Obiad",
    podwieczorek: "Podwieczorek",
    kolacja: "Kolacja",
  };

  // Seria dni (ta sama logika co na dashbordzie podopiecznego)
  const mealsAll = getMealsDoneByDate(email);
  const waterAll = getWaterAll(email);
  const now = new Date();
  const iso = (d: Date) => {
    if (d.toDateString() === now.toDateString()) return today;
    const mid = new Date(d);
    mid.setHours(12, 0, 0, 0);
    return mid.toISOString().slice(0, 10);
  };
  const isActive = (d: Date) => {
    const k = iso(d);
    return (mealsAll[k]?.length ?? 0) > 0 || (waterAll[k] ?? 0) > 0;
  };
  let streak = 0;
  const cursor = new Date(now);
  if (!isActive(cursor)) cursor.setDate(cursor.getDate() - 1);
  while (isActive(cursor) && streak < 365) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const mood = getMoodByDate(email)[today];
  const reportToday = report?.submittedAt?.slice(0, 10) === today;

  // Log treningowy (wpisy kg × powtórzenia)
  const logRows: {
    day: string;
    name: string;
    kg: string;
    reps: string;
    effort: string;
  }[] = [];
  for (const r of trainingRows) {
    const log = getTrainingLog(email, r.dayId);
    const exs = content.training.dayExercises[r.dayId] ?? [];
    exs.forEach((ex, i) => {
      const e = log[String(i + 1)];
      if (e && (e.kg || e.reps || e.effort)) {
        logRows.push({
          day: r.label,
          name: ex.name,
          kg: e.kg,
          reps: e.reps,
          effort: e.effort,
        });
      }
    });
  }

  return (
    <div className="space-y-4">
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            Wykonanie dzisiaj
          </h2>
          <span className="text-[11px] text-slate-500">
            {new Date().toLocaleDateString("pl-PL", {
              day: "2-digit",
              month: "long",
            })}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatBar
            label="Posiłki"
            value={`${doneMeals.length} / ${mealTotal}`}
            done={doneMeals.length}
            total={mealTotal}
          />
          <StatBar
            label="Woda"
            value={`${water} / ${waterGoal} szkl.`}
            sub={content.guidelines?.waterGlasses ? "cel od trenera" : "auto z wagi"}
            done={water}
            total={waterGoal}
          />
          <StatBar
            label="Trening (plan)"
            value={
              trainingTotal > 0
                ? `${trainingDone} / ${trainingTotal}`
                : "brak ćwiczeń"
            }
            done={trainingDone}
            total={trainingTotal}
          />
          <StatBar
            label="Zadania dnia"
            value={
              tasks.length > 0
                ? `${tasksDone.filter((t) => tasks.includes(t)).length} / ${tasks.length}`
                : "—"
            }
            done={tasksDone.filter((t) => tasks.includes(t)).length}
            total={tasks.length}
          />
          <StatBar
            label="Aktywności"
            value={acts.length > 0 ? `${acts.length} · ${actKcal} kcal` : "0"}
          />
          <StatBar
            label="Seria dni 🔥"
            value={`${streak} ${streak === 1 ? "dzień" : "dni"}`}
          />
          <StatBar
            label="Samopoczucie"
            value={
              mood
                ? `S ${mood.satiety}/5 · M ${mood.motivation}/5`
                : "brak oceny"
            }
          />
          <StatBar
            label="Raport dzienny"
            value={reportToday ? "Wysłany ✓" : "Nie wysłany"}
          />
        </div>

        {tasks.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Zadania od Ciebie
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {tasks.map((t, i) => {
                const done = tasksDone.includes(t);
                return (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                        done
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {done ? "✓" : ""}
                    </span>
                    <span className={done ? "text-slate-500 line-through" : "text-slate-200"}>
                      {t}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* 📅 Kalendarz aktywności — ostatnie miesiące podopiecznego */}
      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            📅 Kalendarz aktywności
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMonthOff((m) => m - 1);
                setCalDay(null);
              }}
              className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:border-emerald-500 hover:text-emerald-300"
              aria-label="Poprzedni miesiąc"
            >
              ←
            </button>
            <span className="min-w-[150px] text-center text-xs font-semibold text-slate-100">
              {calLabel}
            </span>
            <button
              type="button"
              onClick={() => {
                setMonthOff((m) => Math.min(0, m + 1));
                setCalDay(null);
              }}
              disabled={monthOff >= 0}
              className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-300 hover:border-emerald-500 hover:text-emerald-300 disabled:opacity-40"
              aria-label="Następny miesiąc"
            >
              →
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Kolor = odhaczone posiłki (im ciemniej, tym więcej), niebieska kropka
          = picie wody. Klik w dzień pokaże szczegóły.
        </p>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-slate-500">
          {["pon", "wt", "śr", "czw", "pt", "sob", "nd"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calCells.map((d, i) => {
            if (d === null) return <span key={`e${i}`} />;
            const isoDay = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const m = mealsAll[isoDay]?.length ?? 0;
            const w = waterAll[isoDay] ?? 0;
            const lvl = m === 0 && w === 0 ? 0 : m >= 5 || (m >= 3 && w > 0) ? 3 : m >= 3 || (m > 0 && w > 0) ? 2 : 1;
            const isToday = isoDay === today;
            const hasReport = report?.submittedAt?.slice(0, 10) === isoDay;
            return (
              <div
                key={isoDay}
                title={`${isoDay}: posiłki ${m}, woda ${w} szkl.${hasReport ? ", raport ✓" : ""}`}
                onClick={() => setCalDay(isoDay === calDay ? null : isoDay)}
                className={`relative flex h-9 cursor-pointer items-start justify-end rounded-md p-1 text-[10px] font-medium transition ${CAL_LEVELS[lvl]} ${
                  isToday ? "ring-2 ring-sky-400" : ""
                } ${calDay === isoDay ? "outline outline-2 outline-emerald-400" : ""} ${
                  lvl === 0 ? "text-slate-500" : "text-slate-950"
                }`}
              >
                {d}
                {w > 0 && (
                  <span className="absolute bottom-1 left-1 h-1.5 w-1.5 rounded-full bg-sky-600" />
                )}
                {hasReport && (
                  <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                )}
              </div>
            );
          })}
        </div>

        {calDay && (
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">{calDay}</p>
            <ul className="mt-1 space-y-0.5">
              <li>
                Posiłki odhaczone:{" "}
                <span className="font-semibold text-emerald-300">
                  {mealsAll[calDay]?.length ?? 0}
                </span>
                {(mealsAll[calDay]?.length ?? 0) > 0 && (
                  <span className="text-slate-500">
                    {" "}
                    ({(mealsAll[calDay] ?? []).join(", ")})
                  </span>
                )}
              </li>
              <li>
                Woda:{" "}
                <span className="font-semibold text-sky-300">
                  {waterAll[calDay] ?? 0} szkl.
                </span>
              </li>
              <li>
                Raport:{" "}
                {report?.submittedAt?.slice(0, 10) === calDay ? (
                  <span className="text-emerald-300">wysłany ✓</span>
                ) : (
                  <span className="text-slate-500">brak</span>
                )}
              </li>
            </ul>
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
          Log treningowy (kg × powtórzenia)
        </h2>
        {logRows.length === 0 ? (
          <p className="text-sm text-slate-400">
            Podopieczny nie uzupełnił jeszcze logu żadnego ćwiczenia.
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            {logRows.slice(0, 12).map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 border-b border-slate-800/60 pb-2"
              >
                <span className="min-w-0 truncate text-slate-300">
                  <span className="mr-2 text-[10px] uppercase text-slate-500">
                    {r.day}
                  </span>
                  {r.name}
                </span>
                <span className="shrink-0 text-slate-100">
                  {r.kg && `${r.kg} kg`}
                  {r.reps && ` × ${r.reps}`}
                  {r.effort && (
                    <span className="ml-2 text-[11px] text-amber-300">
                      RPE {r.effort}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
          Aktywności spoza planu (dzisiaj)
        </h2>
        {acts.length === 0 ? (
          <p className="text-sm text-slate-400">
            Brak dodatkowych aktywności — podopieczny dolicza je sam w zakładce
            „Aktywności".
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            {acts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between border-b border-slate-800/60 pb-2"
              >
                <span className="text-slate-300">
                  {a.name}
                  {a.minutes > 0 && (
                    <span className="ml-2 text-[11px] text-slate-500">
                      {a.minutes} min
                    </span>
                  )}
                </span>
                <span className="font-medium text-amber-300">{a.kcal} kcal</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {(photoMeals.length > 0 || dishLogs.length > 0) && (
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
              Posiłki spoza planu (zdjęcie / własne)
            </h2>
            <span className="text-[11px] text-slate-500">
              {photoMeals.length + dishLogs.length} szt. · {outKcal} kcal
            </span>
          </div>
          <div className="space-y-2 text-sm">
            {photoMeals.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 border-b border-slate-800/60 pb-2"
              >
                <span className="min-w-0">
                  <span className="mr-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">
                    {photoCatLabels[p.category] ?? p.category}
                  </span>
                  <span className="text-slate-300">{p.name}</span>
                  <span className="ml-2 text-[10px] text-sky-300">📷</span>
                  {p.source === "demo" && (
                    <span className="ml-2 text-[10px] text-amber-300">
                      wycena testowa
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-right text-[11px] text-slate-100">
                  <span className="font-semibold text-sky-300">{p.kcal} kcal</span>
                  <span className="ml-2 text-slate-400">
                    W {p.carbs} · B {p.protein} · T {p.fat}
                  </span>
                </span>
              </div>
            ))}
            {dishLogs.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 border-b border-slate-800/60 pb-2"
              >
                <span className="min-w-0">
                  <span className="mr-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">
                    {photoCatLabels[l.category] ?? l.category}
                  </span>
                  <span className="text-slate-300">{l.name}</span>
                  <span className="ml-2 text-[10px]">
                    {l.source === "skladniki" ? "🧩 składniki" : l.source === "zapisane" ? "⭐ moje dania" : "✏️ ręczny"}
                  </span>
                  <span
                    className={`ml-2 text-[10px] ${
                      l.replacePlan ? "text-emerald-400" : "text-amber-300"
                    }`}
                  >
                    {l.replacePlan ? "zamiast planu" : "dodatkowo"}
                  </span>
                </span>
                <span className="shrink-0 text-right text-[11px] text-slate-100">
                  <span className="font-semibold text-sky-300">{l.kcal} kcal</span>
                  <span className="ml-2 text-slate-400">
                    W {l.carbs} · B {l.protein} · T {l.fat}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Wpisy „zamiast planu" zastępują planowany wariant w bilansie dnia,
            „dodatkowo" są doliczane osobno.
          </p>
        </section>
      )}
    </div>
  );
}

/** Podsumowanie do druku / zapisu jako PDF (widoczne tylko w @media print
 *  — przycisk 🖨 PDF w pasku akcji wywołuje window.print()). */
function PrintSummary({
  clientName,
  email,
  content,
  profile,
  report,
  fields,
}: {
  clientName: string;
  email: string;
  content: TrainerContent;
  profile: ClientProfile | null;
  report: ClientReport | null;
  fields: { key: string; label: string }[];
}) {
  const ms = getMeasurements(email);
  const dateStr = new Date().toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const rules = content.guidelines.rules.filter((r) => r.trim());
  const labelOf = (k: string) => fields.find((f) => f.key === k)?.label ?? k;
  const cols = ["data", "waga", "pas", "brzuch", "biceps", "klatka", "uda", "lydki"];

  return (
    <div className="hidden print:block bg-white p-8 text-black">
      <div className="flex items-baseline justify-between border-b-2 border-black pb-2">
        <h1 className="text-xl font-bold">FitCoach AI — {clientName}</h1>
        <p className="text-xs">
          {dateStr} · {email}
        </p>
      </div>

      <section className="mt-4">
        <h2 className="text-sm font-bold uppercase tracking-wide">Wytyczne</h2>
        <p className="mt-1 text-xs">
          <b>Cel okresu:</b> {content.guidelines.periodGoal || "—"} ·{" "}
          <b>Priorytet tygodnia:</b> {content.guidelines.weeklyFocus || "—"}
        </p>
        {rules.length > 0 && (
          <ul className="mt-1 list-disc pl-5 text-xs">
            {rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        )}
        <p className="mt-1 text-xs">
          Woda: {content.guidelines.waterGlasses || "auto z wagi"} szkl./dzień ·
          Raport: godz. {content.guidelines.reportHour || "18"} · Treningi:{" "}
          {content.guidelines.trainingsPerWeek || "—"} / tydz.
        </p>
      </section>

      {profile && (
        <section className="mt-4">
          <h2 className="text-sm font-bold uppercase tracking-wide">Profil</h2>
          <p className="text-xs">
            {profile.goal} · {profile.gender} · {profile.age} lat ·{" "}
            {profile.weight} kg · {profile.height} cm · aktywność:{" "}
            {profile.activity} · {profile.trainingFrequency} treningów/tydz. ·{" "}
            {profile.mealsPerDay} posiłków/dzień
          </p>
          {profile.preferences && (
            <p className="mt-1 text-xs">Preferencje: {profile.preferences}</p>
          )}
          {profile.healthNotes && (
            <p className="mt-1 text-xs">Zdrowie: {profile.healthNotes}</p>
          )}
        </section>
      )}

      <section className="mt-4">
        <h2 className="text-sm font-bold uppercase tracking-wide">
          Ostatni raport dzienny
        </h2>
        {report ? (
          <ul className="mt-1 grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs">
            {Object.entries(report.values).map(([k, v]) => (
              <li key={k}>
                {labelOf(k)}: <b>{String(v)}</b>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs">Brak raportów.</p>
        )}
      </section>

      <section className="mt-4">
        <h2 className="text-sm font-bold uppercase tracking-wide">
          Pomiary ciała ({ms.length})
        </h2>
        {ms.length === 0 ? (
          <p className="text-xs">Brak pomiarów.</p>
        ) : (
          <table className="mt-1 w-full border-collapse text-[11px]">
            <thead>
              <tr>
                {cols.map((h) => (
                  <th
                    key={h}
                    className="border border-gray-400 px-1.5 py-0.5 text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ms.slice(0, 20).map((m) => (
                <tr key={m.id}>
                  <td className="border border-gray-400 px-1.5 py-0.5">
                    {m.date}
                  </td>
                  {cols.slice(1).map((c) => (
                    <td
                      key={c}
                      className="border border-gray-400 px-1.5 py-0.5"
                    >
                      {m.values[c] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="mt-6 text-[10px] text-gray-600">
        Wygenerowano z FitCoach AI — {new Date().toLocaleString("pl-PL")}
      </p>
    </div>
  );
}

// ---- Czat z podopiecznym (zakładka "Czat") ----
// Szybkie odpowiedzi w czacie — pigułki wstawiają gotowy tekst do edycji.
const QUICK_REPLIES = [
  "Dobra robota, tak trzymaj! 💪",
  "Pilnuj RIR 2 w seriach głównych.",
  "Wyślij mi zdjęcie posiłku 📸",
  "Pamiętaj o raporcie dnia do 20:00.",
  "Jak samopoczucie po ostatnim treningu?",
];

function TrainerChat({ email }: { email: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!email) return;
    setMessages(getChat(email));
  }, [email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  const send = () => {
    if (!email) return;
    const t = text.trim();
    if (!t && !pendingImage) return;
    setMessages(
      sendChatMessage(email, {
        from: "trainer",
        text: t || "📷 Zdjęcie",
        ...(pendingImage ? { image: pendingImage } : {}),
      })
    );
    setText("");
    setPendingImage(null);
  };

  const handlePhoto = async (file: File) => {
    try {
      setPendingImage(await resizeImage(file));
    } catch {
      /* ignoruj błąd odczytu */
    }
  };

  const fmt = (at: string) =>
    new Date(at).toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <section className="space-y-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
        💬 Czat z podopiecznym
      </h2>
      <div className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        {messages.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">
            Brak wiadomości — napisz pierwszą.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.from === "trainer";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  mine
                    ? "rounded-br-md bg-emerald-600 text-white"
                    : "rounded-bl-md border border-slate-700 bg-slate-800 text-slate-100"
                }`}
              >
                {!mine && (
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Podopieczny
                  </p>
                )}
                {m.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.image}
                    alt="Załącznik"
                    className="mb-1.5 max-h-56 w-full rounded-lg object-cover"
                  />
                )}
                {m.text && <p className="whitespace-pre-line">{m.text}</p>}
                <p
                  className={`mt-1 text-right text-[10px] ${
                    mine ? "text-emerald-100/80" : "text-slate-500"
                  }`}
                >
                  {fmt(m.at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {pendingImage && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pendingImage} alt="Załącznik" className="h-16 w-16 rounded-lg object-cover" />
          <div className="flex-1 text-xs text-slate-400">Zdjęcie dołączone</div>
          <button
            type="button"
            onClick={() => setPendingImage(null)}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Usuń
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Szybka odpowiedź:
        </span>
        {QUICK_REPLIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() =>
              setText((prev) => (prev ? `${prev} ${q}` : q))
            }
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handlePhoto(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Dodaj zdjęcie"
          className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
        >
          📷
        </button>
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Odpowiedz podopiecznemu…"
          className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={send}
          disabled={!text.trim() && !pendingImage}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-40"
        >
          Wyślij
        </button>
      </div>
    </section>
  );
}

// ---- Kalendarz: prośby podopiecznego (zakładka "Kalendarz") ----
function TrainerCalendar({ email }: { email: string }) {
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!email) return;
    setRequests(getSessionRequests(email));
  }, [email]);

  const decide = (id: string, status: "confirmed" | "declined") => {
    if (!email) return;
    setRequests(decideSessionRequest(email, id, status));
    setInfo(
      status === "confirmed"
        ? "Termin potwierdzony — podopieczny widzi status w kalendarzu."
        : "Termin odrzucony."
    );
  };

  const STATUS_BADGE: Record<SessionRequest["status"], { label: string; cls: string }> = {
    requested: {
      label: "Prośba — oczekuje",
      cls: "bg-amber-500/15 text-amber-300 ring-amber-500/40",
    },
    confirmed: {
      label: "Potwierdzony ✓",
      cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40",
    },
    declined: {
      label: "Odrzucony ✗",
      cls: "bg-red-500/15 text-red-300 ring-red-500/40",
    },
  };

  const fmtDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}.${m}.${y}`;
  };

  const pending = requests.filter((r) => r.status === "requested");
  const decided = [...requests].reverse().filter((r) => r.status !== "requested");

  return (
    <section className="space-y-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
        📅 Kalendarz — prośby o termin
      </h2>

      {info && (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
          {info}
        </p>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-sm font-bold text-slate-100">
          Oczekujące ({pending.length})
        </p>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Brak próśeb o termin.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {pending.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-slate-950/50 px-3 py-2.5"
              >
                <span className="font-mono text-sm font-bold text-slate-100">
                  {fmtDate(r.date)} · {r.time}
                </span>
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-500/40">
                  {STATUS_BADGE.requested.label}
                </span>
                {r.note && (
                  <span className="flex-1 truncate text-xs text-slate-500">
                    „{r.note}"
                  </span>
                )}
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => decide(r.id, "confirmed")}
                  className="rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  ✅ Potwierdź
                </button>
                <button
                  type="button"
                  onClick={() => decide(r.id, "declined")}
                  className="rounded-full border border-red-500/50 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                >
                  ❌ Odrzuć
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-sm font-bold text-slate-100">Historia decyzji</p>
        {decided.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Brak rozstrzygniętych prośeb.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {decided.map((r) => {
              const st = STATUS_BADGE[r.status];
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2"
                >
                  <span className="font-mono text-sm text-slate-300">
                    {fmtDate(r.date)} · {r.time}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${st.cls}`}
                  >
                    {st.label}
                  </span>
                  {r.decidedAt && (
                    <span className="text-[11px] text-slate-600">
                      decyzja: {new Date(r.decidedAt).toLocaleString("pl-PL")}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
