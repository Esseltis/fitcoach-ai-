"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Sparkles,
  Dumbbell,
  Utensils,
  LineChart,
  MessageCircle,
  LogOut,
  User,
  Activity,
  Scale,
  Ruler,
  Timer,
  AlertTriangle,
  Star,
  FileText,
  CheckCircle2,
  Droplets,
  Camera,
  Flame,
  ShoppingBasket,
  Calendar,
  Trophy,
} from "lucide-react";
import {
  getClientContent,
  DEFAULT_CONTENT,
  type TrainerContent,
  getDoneMeals,
  toggleMealDone,
  getWaterForDate,
  setWaterForDate,
  getDoneExerciseIds,
  toggleExerciseDone,
  getMealChoices,
  setMealChoice,
  getTrainingLog,
  setTrainingLogEntry,
  getSetLog,
  setExerciseSets,
  getSubstitutions,
  setSubstitution,
  getWorkoutSession,
  saveWorkoutSession,
  type ExerciseLogEntry,
  type SetLogEntry,
  type WorkoutSession,
  type TrainingExercise,
  getMealsDoneByDate,
  getWaterAll,
  getLastDrinkTs,
  getBodyWeightKg,
  getActivities,
  getWeeklyReportStatus,
  setMoodForDate,
  getMoodByDate,
  getTasksDone,
  toggleTaskDone,
  getPhotoMeals,
  addPhotoMeal,
  removePhotoMeal,
  MAX_PHOTO_MEALS_PER_DAY,
  type PhotoMeal,
  getDishLog,
  getDishLogByDate,
  addDishLog,
  removeDishLog,
  type DishLogEntry,
  getDailyLogs,
  saveDailyLog,
} from "@/lib/store";
import { CLOUD_SYNCED_EVENT, cloudSignOut } from "@/lib/cloud";
import { buildWeeklyReview } from "@/lib/coach";
import { fileToDataUrl } from "@/lib/images";
import MealAddPanel from "@/components/MealAddPanel";
import RestTimer from "@/components/RestTimer";
import ExerciseCard from "@/components/ExerciseCard";
import PwaRegister from "@/components/PwaRegister";
import ChatSection from "@/components/ChatSection";
import CalendarSection from "@/components/CalendarSection";
import SessionReport from "@/components/SessionReport";
import RecordsView from "@/components/RecordsView";

const todayISO = () => new Date().toISOString().slice(0, 10);

// Wynik /api/analyze-meal — AI po kluczu OPENAI_API_KEY, w przeciwnym razie demo
type AnalyzeResult =
  | {
      ok: true;
      source: "ai" | "demo";
      name: string;
      recipe: string[];
      kcal: number;
      protein: number;
      carbs: number;
      fat: number;
    }
  | { ok: false; error?: string };

type AnalyzeOk = Extract<AnalyzeResult, { ok: true }>;

// Cel nawodnienia: ~31 ml/kg masy ciała, szklanka = 250 ml.
// Trener może nadpisać cel liczbą szklanek (guidelines.waterGlasses).
function computeWaterGoal(
  email: string,
  fallbackWeight?: string,
  trainerGlasses?: string
): number {
  const override = Number(trainerGlasses);
  if (trainerGlasses && Number.isFinite(override) && override > 0) {
    return Math.max(1, Math.min(20, Math.round(override)));
  }
  const kg = getBodyWeightKg(email, fallbackWeight);
  if (!kg) return 8;
  return Math.max(4, Math.min(15, Math.round((kg * 31) / 250)));
}

// Okna czasowe przypomnień o posiłkach (minuty od północy)
const MEAL_WINDOWS: {
  cat: string;
  label: string;
  from: number;
  to: number;
}[] = [
  { cat: "sniadanie", label: "śniadanie", from: 7 * 60, to: 10 * 60 },
  { cat: "ii_sniadanie", label: "II śniadanie", from: 10 * 60, to: 12 * 60 },
  { cat: "obiad", label: "obiad", from: 12 * 60, to: 15 * 60 },
  { cat: "podwieczorek", label: "podwieczorek", from: 15 * 60, to: 17 * 60 + 30 },
  { cat: "kolacja", label: "kolację", from: 18 * 60, to: 21 * 60 },
];

type SectionId =
  | "dashboard"
  | "analiza"
  | "plan-zywieniowy"
  | "porady"
  | "dieta"
  | "suplementy"
  | "nawodnienie"
  | "trening"
  | "catering"
  | "settings"
  | "plan"
  | "diet"
  | "progress"
  | "chat"
  | "kalendarz"
  | "rekordy";

const bodyStats = [
  { label: "Wiek", value: "35", unit: "lat", icon: Timer },
  { label: "Waga", value: "87.2", unit: "kg", icon: Scale },
  { label: "Wzrost", value: "178", unit: "cm", icon: Ruler },
  { label: "Biceps", value: "35.0", unit: "cm" },
  { label: "Klatka", value: "100.0", unit: "cm" },
  { label: "Brzuch", value: "75.0", unit: "cm" },
  { label: "Pas", value: "80.0", unit: "cm" },
  { label: "Uda", value: "60.0", unit: "cm" },
  { label: "Łydki", value: "35.0", unit: "cm" },
];

const trainingDays = [
  { day: 1, label: "Dzień", rest: false },
  { day: 2, label: "Dzień (odpoczynek)", rest: true },
  { day: 3, label: "Dzień", rest: false },
  { day: 4, label: "Dzień", rest: false },
  { day: 5, label: "Dzień", rest: false },
  { day: 6, label: "Dzień (odpoczynek)", rest: true },
  { day: 7, label: "Dzień", rest: false },
];

const exercises = [
  {
    lp: 1,
    name: "Pompki w wąskim podparciu",
    sets: 4,
    reps: [9, 7, 13, 9],
    difficulty: 3,
  },
  {
    lp: 2,
    name: "Unoszenie nóg do klatki piersiowej w zwisie na drążku",
    sets: 3,
    reps: [6, 16, 5],
    difficulty: 4,
  },
  {
    lp: 3,
    name: "Unoszenie nóg do klatki w zwisie na drabinkach",
    sets: 3,
    reps: [6, 9, 14],
    difficulty: 2,
  },
];

const meals = ["Śniadanie", "II śniadanie", "Obiad", "Przekąska", "Podwieczorek"];

const trainers = [
  {
    id: "t1",
    name: "Michał Kowalski",
    title: "Trener sylwetki i redukcji",
    specialization: "Redukcja tkanki tłuszczowej, budowa sylwetki",
    price: "od 249 zł / mies.",
    rating: 4.9,
    reviews: 38,
  },
  {
    id: "t2",
    name: "Anna Nowak",
    title: "Trenerka kobiecej sylwetki",
    specialization: "Pośladki, brzuch, zdrowy kręgosłup",
    price: "od 289 zł / mies.",
    rating: 5.0,
    reviews: 52,
  },
];

/** Data z przesunięciem (0 = dziś, −1 = wczoraj) — jak todayISO(). */
const dayOffsetISO = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

/** Najczęściej powtarzane danie z historii wpisów (do szybkiego dodania). */
type TopDish = {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: DishLogEntry["ingredients"];
  portions: number;
  servings: number;
  replacePlan: boolean;
  count: number;
};

export default function ClientDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  // Raport PDF po treningu (druk z osobnego komponentu)
  const [printReport, setPrintReport] = useState<{
    dayId: number;
    elapsedSec?: number;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [activeTrainingDay, setActiveTrainingDay] = useState(1);
  const [activeMealIndex, setActiveMealIndex] = useState(2); // obiad
  const [hasTrainer, setHasTrainer] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [content, setContent] = useState<TrainerContent>(DEFAULT_CONTENT);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = window.localStorage.getItem("fitcoach_client_logged_in");
    const storedEmail = window.localStorage.getItem("fitcoach_client_email");
    const trainerId = window.localStorage.getItem("fitcoach_client_trainer_id");

    if (loggedIn !== "true") {
      router.replace("/login");
      return;
    }

    setEmail(storedEmail);
    setHasTrainer(Boolean(trainerId));
    if (storedEmail) setContent(getClientContent(storedEmail));

    // Głęboki link ?sekcja=… — pozwala wejść od razu w wybraną sekcję
    // (używany m.in. przez redirecty ze starych tras /client/trening itd.)
    const wanted = new URLSearchParams(window.location.search).get("sekcja");
    const known: SectionId[] = [
      "dieta",
      "nawodnienie",
      "trening",
      "suplementy",
      "catering",
      "porady",
      "analiza",
      "plan-zywieniowy",
      "chat",
      "kalendarz",
      "rekordy",
    ];
    if (wanted && known.includes(wanted as SectionId)) {
      setActiveSection(wanted as SectionId);
    }

    setReady(true);
  }, [router]);

  // Chmura: odśwież dane z chmury (plan, wytyczne, treść trenera)
  // po każdej synchronizacji z Supabase.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onSynced = () => {
      const storedEmail = window.localStorage.getItem("fitcoach_client_email");
      if (storedEmail) setContent(getClientContent(storedEmail));
    };
    window.addEventListener(CLOUD_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CLOUD_SYNCED_EVENT, onSynced);
  }, []);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("fitcoach_client_logged_in");
      window.localStorage.removeItem("fitcoach_client_email");
    }
    await cloudSignOut();
    router.push("/");
  };

  const handleSelectTrainer = (trainerId: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("fitcoach_client_trainer_id", trainerId);
    }
    setHasTrainer(true);
    router.push("/client/profil");
  };

  const handleChangeTrainer = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("fitcoach_client_trainer_id");
    }
    setHasTrainer(false);
    setActiveSection("dashboard");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-200">Ładowanie panelu...</p>
      </div>
    );
  }

  const navItems: { id: string; label: string; icon: any; href?: string }[] = [
    {
      id: "dashboard",
      label: "Panel główny",
      icon: LayoutDashboard,
      href: "/client",
    },
    {
      id: "wprowadzenie",
      label: "Wprowadzenie",
      icon: Activity,
      href: "/client/wprowadzenie",
    },
    {
      id: "profil",
      label: "Mój profil",
      icon: User,
      href: "/client/profil",
    },
    {
      id: "analiza",
      label: "Analiza żywieniowa",
      icon: LineChart,
      href: "/client/analiza-zywieniowa",
    },
    {
      id: "plan-zywieniowy",
      label: "Plan żywieniowy",
      icon: Utensils,
      href: "/client/plan-zywieniowy",
    },
    {
      id: "porady",
      label: "Porady żywieniowe",
      icon: MessageCircle,
      href: "/client/porady-zywieniowe",
    },
    {
      id: "dieta",
      label: "Dieta",
      icon: Utensils,
      href: "/client/dieta",
    },
    {
      id: "suplementy",
      label: "Suplementy",
      icon: Dumbbell,
      href: "/client/suplementy",
    },
    {
      id: "nawodnienie",
      label: "Nawodnienie",
      icon: Activity,
      href: "/client/nawodnienie",
    },
    {
      id: "trening",
      label: "Trening",
      icon: Dumbbell,
      href: "/client/trening",
    },
    {
      id: "catering",
      label: "Catering",
      icon: Utensils,
      href: "/client/catering",
    },
    {
      id: "plan-od-trenera",
      label: "Plan od trenera",
      icon: FileText,
      href: "/client/plan-od-trenera",
    },
    {
      id: "pomiary",
      label: "Pomiary ciała",
      icon: Ruler,
      href: "/client/stats",
    },
    {
      id: "zdjecia",
      label: "Zdjęcia postępów",
      icon: Camera,
      href: "/client/zdjecia",
    },
    {
      id: "aktywnosci",
      label: "Aktywności",
      icon: Flame,
      href: "/client/aktywnosci",
    },
    {
      id: "rekordy",
      label: "Moje rekordy",
      icon: Trophy,
    },
    {
      id: "zakupy",
      label: "Lista zakupów",
      icon: ShoppingBasket,
      href: "/client/zakupy",
    },
    {
      id: "coaching",
      label: "Coaching AI",
      icon: Sparkles,
      href: "/client/coaching",
    },
    {
      id: "kalendarz",
      label: "Kalendarz",
      icon: Calendar,
    },
    {
      id: "chat",
      label: "Czat z trenerem",
      icon: MessageCircle,
    },
    {
      id: "raport",
      label: "Raport tygodniowy",
      icon: FileText,
      href: "/client/raport",
    },
  ];

  return (
    <>
    <div className="min-h-screen bg-slate-950 text-slate-100 flex print:hidden">
      {/* Lewy pasek nawigacji */}
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
              <span className="text-[11px] text-slate-400">
                Panel podopiecznego
              </span>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-2 mb-2 text-[11px] font-semibold uppercase text-slate-500">
              Panel
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isDashboard = item.id === "dashboard";
                const isIntro = item.id === "wprowadzenie";
                const isAnalysis = item.id === "analiza";
                const isDietPlan = item.id === "plan-zywieniowy";
                const isTips = item.id === "porady";
                const isMeals = item.id === "dieta";
                const isSupplements = item.id === "suplementy";
                const isHydration = item.id === "nawodnienie";
                const isTraining = item.id === "trening";
                const isCatering = item.id === "catering";
                const isChat = item.id === "chat";
                const isCal = item.id === "kalendarz";
                const isRec = item.id === "rekordy";
                const active =
                  (isDashboard && activeSection === "dashboard" && !showIntro) ||
                  (isIntro && showIntro) ||
                  (isAnalysis && activeSection === "analiza") ||
                  (isDietPlan && activeSection === "plan-zywieniowy") ||
                  (isTips && activeSection === "porady") ||
                  (isMeals && activeSection === "dieta") ||
                  (isSupplements && activeSection === "suplementy") ||
                  (isHydration && activeSection === "nawodnienie") ||
                  (isTraining && activeSection === "trening") ||
                  (isCatering && activeSection === "catering") ||
                  (isChat && activeSection === "chat") ||
                  (isCal && activeSection === "kalendarz") ||
                  (isRec && activeSection === "rekordy");
                const disabled =
                  !hasTrainer &&
                  item.id !== "dashboard" &&
                  item.id !== "pomiary" &&
                  item.id !== "zdjecia" &&
                  item.id !== "aktywnosci" &&
                  item.id !== "zakupy" &&
                  item.id !== "coaching";
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (disabled) return;
                      if (isDashboard) {
                        setShowIntro(false);
                        setActiveSection("dashboard");
                        return;
                      }
                      if (isIntro) {
                        setShowIntro(true);
                        setActiveSection("dashboard");
                        return;
                      }
                      if (isAnalysis) {
                        setShowIntro(false);
                        setActiveSection("analiza");
                        return;
                      }
                      if (isDietPlan) {
                        setShowIntro(false);
                        setActiveSection("plan-zywieniowy");
                        return;
                      }
                      if (isTips) {
                        setShowIntro(false);
                        setActiveSection("porady");
                        return;
                      }
                      if (isMeals) {
                        setShowIntro(false);
                        setActiveSection("dieta");
                        return;
                      }
                      if (isSupplements) {
                        setShowIntro(false);
                        setActiveSection("suplementy");
                        return;
                      }
                      if (isHydration) {
                        setShowIntro(false);
                        setActiveSection("nawodnienie");
                        return;
                      }
                      if (isTraining) {
                        setShowIntro(false);
                        setActiveSection("trening");
                        return;
                      }
                      if (isCatering) {
                        setShowIntro(false);
                        setActiveSection("catering");
                        return;
                      }
                      if (isChat) {
                        setShowIntro(false);
                        setActiveSection("chat");
                        return;
                      }
                      if (isCal) {
                        setShowIntro(false);
                        setActiveSection("kalendarz");
                        return;
                      }
                      if (isRec) {
                        setShowIntro(false);
                        setActiveSection("rekordy");
                        return;
                      }
                      setShowIntro(false);
                      if (item.href) {
                        router.push(item.href);
                      }
                    }}
                    className={`group w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition ${
                      disabled
                        ? "text-slate-600 cursor-not-allowed"
                        : active
                        ? "bg-slate-800/90 text-slate-50 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-50"
                    }`}
                  >
                    <span
                      className={`h-7 w-1 rounded-full transition group-hover:bg-slate-500/60 ${
                        active ? "bg-emerald-400" : "bg-transparent"
                      }`}
                    />
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-2 mb-2 text-[11px] font-semibold uppercase text-slate-500">
              Moje konto
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setShowIntro(false);
                  setActiveSection("settings");
                }}
                className={`group w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition ${
                  activeSection === "settings"
                    ? "bg-slate-800/90 text-slate-50 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-50"
                }`}
              >
                <span
                  className={`h-7 w-1 rounded-full transition group-hover:bg-slate-500/60 ${
                    activeSection === "settings"
                      ? "bg-emerald-400"
                      : "bg-transparent"
                  }`}
                />
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-500 text-[11px]">
                  ⚙
                </span>
                <span className="truncate">Ustawienia</span>
              </button>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 bg-slate-900/70 border border-slate-800">
                <User className="h-4 w-4" />
                <span className="truncate">
                  {email ?? "podopieczny@fitcoach.ai"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Wyloguj</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Główna część */}
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-400">
              Panel podopiecznego
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-slate-50">
              {hasTrainer
                ? "Twój trening i współpraca z trenerem"
                : "Wybierz trenera, aby rozpocząć współpracę"}
            </h1>
          </div>
          {hasTrainer && (
            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                  content.updatedAt
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-amber-500/10 text-amber-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    content.updatedAt ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                {content.updatedAt
                  ? "Plan od trenera: gotowy"
                  : "Plan w przygotowaniu"}
              </span>
              <button
                type="button"
                onClick={handleChangeTrainer}
                className="rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800/80 transition"
              >
                Zmień trenera
              </button>
            </div>
          )}
        </header>

        {!hasTrainer ? (
          <TrainersListSection onSelectTrainer={handleSelectTrainer} />
        ) : showIntro ? (
          <IntroSection content={content} />
        ) : (
          <>
            {activeSection === "dashboard" && (
              <DashboardSection
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                email={email ?? ""}
                content={content}
              />
            )}
            {activeSection === "analiza" && (
              <NutritionAnalysisSection content={content} />
            )}
            {activeSection === "plan-zywieniowy" && <DietPlanSection />}
            {activeSection === "porady" && <NutritionTipsSection content={content} />}
            {activeSection === "dieta" && <MealsVariantsSection content={content} />}
            {activeSection === "suplementy" && (
              <SupplementsSection content={content} />
            )}
            {activeSection === "nawodnienie" && (
              <HydrationSection content={content} />
            )}
            {activeSection === "trening" && (
              <TrainingSection
                content={content}
                onPrintReport={(dayId, elapsedSec) =>
                  setPrintReport({ dayId, elapsedSec })
                }
              />
            )}
            {activeSection === "catering" && <CateringSection content={content} />}
            {activeSection === "settings" && <SettingsSection />}
            {activeSection === "plan" && (
              <TrainingPlanSection
                activeTrainingDay={activeTrainingDay}
                setActiveTrainingDay={setActiveTrainingDay}
              />
            )}
            {activeSection === "diet" && (
              <DietSection
                activeMealIndex={activeMealIndex}
                setActiveMealIndex={setActiveMealIndex}
              />
            )}
            {activeSection === "progress" && <ProgressSection />}
            {activeSection === "chat" && <ChatSection email={email ?? ""} />}
            {activeSection === "kalendarz" && (
              <CalendarSection email={email ?? ""} />
            )}
            {activeSection === "rekordy" && (
              <RecordsView
                email={email ?? ""}
                content={content}
                variant="client"
              />
            )}
          </>
        )}
      </main>
      {email && (
        <ReminderHost
          email={email}
          fallbackWeight={content.nutrition.weight}
          mealCats={content.diet.meals
            .map((m) => m.category ?? "")
            .filter((c) => c !== "")}
          canReport={hasTrainer}
          reportHour={Number(content.guidelines?.reportHour) || 18}
          trainerWaterGlasses={content.guidelines?.waterGlasses}
          onOpenDiet={() => {
            setShowIntro(false);
            setActiveSection("dieta");
          }}
        />
      )}

      {/* PWA: rejestracja service workera + prośba o powiadomienia */}
      <PwaRegister />
    </div>

    {/* Raport PDF po treningu — widoczny tylko przy drukowaniu */}
    {printReport && (
      <SessionReport
        email={email ?? ""}
        content={content}
        dayId={printReport.dayId}
        elapsedSec={printReport.elapsedSec}
        onDone={() => setPrintReport(null)}
      />
    )}
    </>
  );
}

function ReminderHost({
  email,
  fallbackWeight,
  mealCats,
  canReport,
  onOpenDiet,
  reportHour,
  trainerWaterGlasses,
}: {
  email: string;
  fallbackWeight?: string;
  mealCats: string[];
  canReport: boolean;
  onOpenDiet: () => void;
  reportHour: number;
  trainerWaterGlasses?: string;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<"water" | "meal" | "report" | null>(null);
  const [mealLabel, setMealLabel] = useState("");
  const [glasses, setGlasses] = useState(0);
  const [goal, setGoal] = useState(8);
  const [closedAt, setClosedAt] = useState(0);

  // zależność jako string — referencja tablicy zmienia się przy każdym renderze
  const mealCatsKey = mealCats.join(",");

  useEffect(() => {
    const goalG = computeWaterGoal(email, fallbackWeight, trainerWaterGlasses);
    setGoal(goalG);
    const openedAt = Date.now();

    const check = () => {
      const now = Date.now();
      const g = getWaterForDate(email, todayISO());
      setGlasses(g);

      // „Później" wycisza wszystkie przypomnienia na godzinę
      if (closedAt && now - closedAt < 60 * 60 * 1000) {
        setKind(null);
        return;
      }

      // 1) woda — godzina bez łyka
      const last = Math.max(getLastDrinkTs(email) || 0, openedAt);
      if (g < goalG && now - last > 60 * 60 * 1000) {
        setKind("water");
        return;
      }

      // 2) posiłek — okno czasowe, a posiłek nieodhaczony
      const nowD = new Date();
      const minutes = nowD.getHours() * 60 + nowD.getMinutes();
      const done = getDoneMeals(email, todayISO());
      const due = MEAL_WINDOWS.find(
        (w) =>
          mealCats.includes(w.cat) &&
          !done.includes(w.cat) &&
          minutes >= w.from &&
          minutes <= w.to
      );
      if (due) {
        setMealLabel(due.label);
        setKind("meal");
        return;
      }

      // 3) raport tygodniowy — wieczorem (godzina od trenera), gdy termin minął
      if (
        canReport &&
        nowD.getHours() >= reportHour &&
        getWeeklyReportStatus(email).due
      ) {
        setKind("report");
        return;
      }

      setKind(null);
    };

    check();
    const id = window.setInterval(check, 5 * 60 * 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, fallbackWeight, mealCatsKey, canReport, closedAt, reportHour, trainerWaterGlasses]);

  const info =
    kind === "water"
      ? {
          icon: "💧",
          title: "Pora na szklankę wody!",
          body: `Dzisiaj: ${glasses} z ${goal} szklanek.`,
          primary: "+1 szklanka",
          action: "water" as const,
          border: "border-sky-500/40",
          btn: "bg-sky-500 hover:bg-sky-400",
        }
      : kind === "meal"
      ? {
          icon: "🍽️",
          title: `Pora na ${mealLabel}!`,
          body: "Gdy zjesz — odhacz posiłek w Diecie.",
          primary: "Odhacz w Diecie",
          action: "diet" as const,
          border: "border-amber-500/40",
          btn: "bg-amber-500 hover:bg-amber-400",
        }
      : kind === "report"
      ? {
          icon: "📝",
          title: "Raport tygodniowy do wysłania",
          body: "Minęło 7 dni — złóż raport z pomiarami, zdjęciami i rubrykami.",
          primary: "Wyślij raport",
          action: "report" as const,
          border: "border-emerald-500/40",
          btn: "bg-emerald-500 hover:bg-emerald-400",
        }
      : null;

  useEffect(() => {
    if (
      info &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification(`🔔 ${info.title}`, { body: info.body });
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, glasses, goal, mealLabel]);

  if (!info) return null;

  const postpone = () => {
    setClosedAt(Date.now());
    setKind(null);
  };

  const runAction = () => {
    if (info.action === "water") {
      setGlasses(setWaterForDate(email, todayISO(), glasses + 1));
      setKind(null);
    } else if (info.action === "diet") {
      onOpenDiet();
      setKind(null);
    } else {
      router.push("/client/raport");
      setKind(null);
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-72 rounded-2xl border ${info.border} bg-slate-900 p-4 text-xs text-slate-200 shadow-2xl`}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">{info.icon}</span>
        <div className="flex-1">
          <p className="font-semibold text-slate-50">{info.title}</p>
          <p className="mt-1 text-slate-400">{info.body}</p>
        </div>
        <button
          type="button"
          aria-label="Zamknij przypomnienie"
          onClick={postpone}
          className="text-slate-500 hover:text-slate-300"
        >
          ✕
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={runAction}
          className={`flex-1 rounded-xl px-3 py-2 font-semibold text-slate-950 ${info.btn}`}
        >
          {info.primary}
        </button>
        <button
          type="button"
          onClick={postpone}
          className="rounded-xl border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-800"
        >
          Później
        </button>
      </div>
    </div>
  );
}

function DashboardSection({
  activeSection,
  setActiveSection,
  email,
  content,
}: {
  activeSection: SectionId;
  setActiveSection: (id: SectionId) => void;
  email: string;
  content: TrainerContent;
}) {
  const [streakData, setStreakData] = useState({ streak: 0, monthPct: 0 });
  const [tasksDone, setTasksDone] = useState<string[]>([]);
  const [reportAt, setReportAt] = useState<string | null>(null);
  const [weeklyBan, setWeeklyBan] = useState<{
    due: boolean;
    overdue: number;
    lastAt: string | null;
  } | null>(null);
  const [mood, setMood] = useState<{ satiety: number; motivation: number }>({
    satiety: 0,
    motivation: 0,
  });
  const [moodWeek, setMoodWeek] = useState<
    { key: string; label: string; satiety: number; motivation: number }[]
  >([]);
  const [weekScore, setWeekScore] = useState<{
    score: number;
    tip: string;
  } | null>(null);

  // Podgląd tygodniowego coachingu (wynik + 1 wskazówka) na panelu głównym
  useEffect(() => {
    const r = buildWeeklyReview(email);
    setWeekScore({ score: r.score, tip: r.tips[0] ?? "" });
  }, [email]);

  // Szybki dziennik dnia (sen + kroki) — uzupełniany z panelu głównego,
  // bez wchodzenia w formularz raportu; trafia do tych samych values.
  const [quick, setQuick] = useState({ sleep: "", steps: "" });
  const [quickSaved, setQuickSaved] = useState(false);

  useEffect(() => {
    const meals = getMealsDoneByDate(email);
    const water = getWaterAll(email);
    const moods = getMoodByDate(email);
    const now = new Date();
    // Klucze zapisujemy przez todayISO(); dla dni przeszłych bierzemy południe,
    // żeby konwersja UTC nie przesunęła daty na sąsiedni dzień.
    const iso = (d: Date) => {
      if (d.toDateString() === now.toDateString()) return todayISO();
      const mid = new Date(d);
      mid.setHours(12, 0, 0, 0);
      return mid.toISOString().slice(0, 10);
    };
    const isActive = (d: Date) => {
      const k = iso(d);
      return (meals[k]?.length ?? 0) > 0 || (water[k] ?? 0) > 0;
    };

    // Seria: kolejne dni z aktywnością (dziś jeszcze może być pusty)
    let s = 0;
    const cursor = new Date(now);
    if (!isActive(cursor)) cursor.setDate(cursor.getDate() - 1);
    while (isActive(cursor) && s < 365) {
      s++;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Aktywność w bieżącym miesiącu
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    let activeDays = 0;
    while (d <= now) {
      if (isActive(d)) activeDays++;
      d.setDate(d.getDate() + 1);
    }
    const monthPct = Math.round((activeDays / now.getDate()) * 100);

    setStreakData({ streak: s, monthPct });

    // Samopoczucie: dzisiaj + ostatnie 7 dni
    setMood(moods[iso(now)] ?? { satiety: 0, motivation: 0 });
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const k = iso(day);
      const e = moods[k];
      week.push({
        key: k,
        label: day.toLocaleDateString("pl-PL", { weekday: "short" }).slice(0, 2),
        satiety: e?.satiety ?? 0,
        motivation: e?.motivation ?? 0,
      });
    }
    setMoodWeek(week);
  }, [email]);

  // Zadania od trenera — odhaczane per dzień
  useEffect(() => {
    setTasksDone(getTasksDone(email, todayISO()));
    setReportAt(getWeeklyReportStatus(email).last?.submittedAt ?? null);
    const dv = getDailyLogs(email)[todayISO()]?.values ?? {};
    setQuick({
      sleep: dv.sleepHours != null ? String(dv.sleepHours) : "",
      steps: dv.steps != null ? String(dv.steps) : "",
    });
    // Nakaz raportu tygodniowego (pomiary + zdjęcia raz na 7 dni)
    const ws = getWeeklyReportStatus(email);
    setWeeklyBan({
      due: ws.due,
      overdue: ws.overdueDays,
      lastAt: ws.last?.submittedAt ?? null,
    });
  }, [email]);

  const toggleTask = (task: string) => {
    setTasksDone(toggleTaskDone(email, todayISO(), task));
  };

  // Zapis sen / kroki — merge z istniejącym wpisem dnia, żeby nie skasować
  // wartości wpisanych wcześniej w formularzu raportu.
  const saveQuick = (field: "sleepHours" | "steps", raw: string) => {
    const cur = getDailyLogs(email)[todayISO()];
    const value = raw.trim();
    if (!value && !cur) return; // nie tworzymy pustego wpisu
    saveDailyLog(email, todayISO(), {
      ...(cur?.values ?? {}),
      [field]: value,
    });
    setQuickSaved(true);
    window.setTimeout(() => setQuickSaved(false), 2000);
  };

  const setMoodValue = (field: "satiety" | "motivation", value: number) => {
    const next = setMoodForDate(email, todayISO(), { ...mood, [field]: value });
    setMood(next);
    setMoodWeek((w) =>
      w.map((d, i) => (i === w.length - 1 ? { ...d, ...next } : d))
    );
  };

  const taskItems = (content.tasks ?? []).filter((t) => t.trim());
  const tasksDoneCount = tasksDone.filter((t) => taskItems.includes(t)).length;

  return (
    <div className="space-y-6">
      {/* 📋 Nakaz: raport tygodniowy — pomiary + zdjęcia raz na 7 dni */}
      {weeklyBan?.due && (
        <Link
          href="/client/raport?tab=weekly"
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 transition hover:bg-red-500/20"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
              📋 Raport tygodniowy{" "}
              {weeklyBan.overdue > 1
                ? `— zaległy od ${weeklyBan.overdue} dni`
                : "— do wysłania"}
            </p>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
              Co 7 dni wyślij trenerowi pomiary sylwetki i zdjęcia.{" "}
              {weeklyBan.lastAt
                ? `Ostatni: ${new Date(weeklyBan.lastAt).toLocaleDateString("pl-PL")}.`
                : "Pierwszy raport jeszcze nie był wysłany."}
            </p>
          </div>
          <span className="text-xs font-semibold text-red-700 dark:text-red-400">
            Wyślij teraz →
          </span>
        </Link>
      )}

      <GuidelinesCard g={content.guidelines} />

      {/* 🧠 Coaching AI — podgląd tygodnia */}
      {weekScore && (
        <Link
          href="/client/coaching"
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 transition hover:bg-emerald-500/20"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              🧠 Coaching AI — Twój tydzień
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-300">
              {weekScore.tip}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {weekScore.score}
              <span className="text-sm font-medium text-slate-500">/100</span>
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Szczegóły →
            </span>
          </div>
        </Link>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
      {/* Karta z BMI i wymiarami */}
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Tryb i sekcje */}
          <div className="flex w-full flex-col gap-3 lg:w-40">
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 dark:bg-transparent dark:bg-gradient-to-b dark:from-emerald-950/70 dark:to-slate-950/80">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Tryb
              </p>
              <p className="mt-1 text-xs text-slate-200">
                Trening online z trenerem, personalizowane plany i raporty.
              </p>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-950/60 px-2 py-1.5 text-[11px]">
                <span className="text-slate-300">Status</span>
                <span className="flex items-center gap-1 font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Aktywny
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Sekcje
              </p>
              <div className="mt-2 space-y-1.5 text-[11px] text-slate-300">
                <button
                  type="button"
                  onClick={() => setActiveSection("dashboard")}
                  className="flex w-full items-center justify-between rounded-lg px-1 py-1 hover:bg-slate-900/80 transition"
                >
                  <span>Wymiary</span>
                  <span
                    className={`h-1 w-8 rounded-full ${
                      activeSection === "dashboard"
                        ? "bg-emerald-500/80"
                        : "bg-slate-700"
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("progress")}
                  className="flex w-full items-center justify-between rounded-lg px-1 py-1 hover:bg-slate-900/80 transition"
                >
                  <span>Statystyki</span>
                  <span
                    className={`h-1 w-8 rounded-full ${
                      activeSection === "progress"
                        ? "bg-sky-400/80"
                        : "bg-slate-700"
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("progress")}
                  className="flex w-full items-center justify-between rounded-lg px-1 py-1 hover:bg-slate-900/80 transition"
                >
                  <span>Postępy</span>
                  <span className="h-1 w-8 rounded-full bg-slate-700" />
                </button>
              </div>
            </div>
          </div>

          {/* Środek z sylwetką i BMI */}
          <div className="flex w-full flex-col items-center justify-center gap-4 lg:w-[260px]">
            <div className="relative flex h-72 w-full max-w-xs items-center justify-center">
              <div className="relative flex h-72 w-36 items-center justify-center">
                <img
                  src="/body-male-v2.png"
                  alt="Sylwetka podopiecznego"
                  className="relative h-64 w-auto object-contain dark:brightness-0 dark:invert"
                />
              </div>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Twoje BMI
              </p>
              <p className="text-3xl font-semibold text-emerald-400">27.5</p>
              <p className="text-xs text-slate-400">
                Nadwaga – do omówienia z trenerem
              </p>
            </div>
          </div>

          {/* Karta z licznikiem dni */}
          <div className="flex w-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs lg:w-52">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Twój plan
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-50">
                Redukcja – 12 tygodni
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Aktualny etap: tydzień 4 z 12.
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-slate-900/80 p-3">
              <p className="text-[11px] text-slate-400">Do końca planu:</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-400">
                56 dni
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                33% planu za Tobą – trzymaj tempo!
              </p>
            </div>

            {/* Seria dni */}
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/30 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-300/90">
                Seria dni 🔥
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-400">
                {streakData.streak}{" "}
                {streakData.streak === 1 ? "dzień" : "dni"}
              </p>
              <p className="text-[11px] text-slate-400">
                {streakData.streak > 0
                  ? "z rzędu z realizacją planu"
                  : "Odhacz posiłek lub napij się wody, żeby zacząć serię"}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all"
                  style={{ width: `${streakData.monthPct}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                {streakData.monthPct}% aktywności w tym miesiącu
              </p>
            </div>

            {/* Szybki dziennik: sen i kroki */}
            <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                  Dziennik dnia 📝
                </p>
                {quickSaved && (
                  <span className="text-[10px] font-semibold text-emerald-300">
                    Zapisano ✓
                  </span>
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-[10px] text-slate-400">Sen (h)</span>
                  <input
                    value={quick.sleep}
                    onChange={(e) => {
                      const v = e.target.value;
                      setQuick((q) => ({ ...q, sleep: v }));
                      saveQuick("sleepHours", v);
                    }}
                    onBlur={(e) => saveQuick("sleepHours", e.target.value)}
                    inputMode="decimal"
                    placeholder="np. 7.5"
                    className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-emerald-400"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] text-slate-400">Kroki</span>
                  <input
                    value={quick.steps}
                    onChange={(e) => {
                      const v = e.target.value;
                      setQuick((q) => ({ ...q, steps: v }));
                      saveQuick("steps", v);
                    }}
                    onBlur={(e) => saveQuick("steps", e.target.value)}
                    inputMode="numeric"
                    placeholder="np. 10000"
                    className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-emerald-400"
                  />
                </label>
              </div>
              <p className="mt-1.5 text-[10px] text-slate-500">
                Trener widzi te wartości w swoim panelu — zapisują się
                automatycznie.
              </p>
            </div>
          </div>
        </div>

        {/* Wymiary ciała */}
        <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-200 sm:grid-cols-3">
          {bodyStats.map((stat) => {
            const Icon = stat.icon ?? Activity;
            return (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] text-emerald-300">
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {stat.label}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-50">
                    {stat.value}{" "}
                    <span className="text-[11px] text-slate-400">
                      {stat.unit}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prawa kolumna – plan i komunikaty */}
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
              {taskItems.length > 0 ? "Zadania od trenera" : "Dzisiejsze zadania"}
            </p>
            <p className="text-xs text-slate-300">
              {taskItems.length > 0
                ? "Odhacz po kolei — jutro lista startuje od nowa."
                : "Zrealizuj plan, wypełnij raport i wyślij do trenera."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {taskItems.length > 0 && (
              <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                {tasksDoneCount}/{taskItems.length}
              </span>
            )}
            <Link
              href="/client/raport"
              className="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Wyślij raport
            </Link>
          </div>
        </div>

        {taskItems.length > 0 ? (
          <ol className="space-y-2 text-xs text-slate-200">
            {taskItems.map((task, i) => {
              const done = tasksDone.includes(task);
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => toggleTask(task)}
                    className={`flex w-full items-start gap-2 rounded-xl border p-2.5 text-left transition ${
                      done
                        ? "border-emerald-500/40 bg-emerald-950/40"
                        : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        done
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span
                      className={`font-semibold ${
                        done ? "text-slate-400 line-through" : "text-slate-50"
                      }`}
                    >
                      {task}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        ) : (
          <ol className="space-y-2 text-xs text-slate-200">
            <li className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950">
                1
              </span>
              <div>
                <p className="font-semibold text-slate-50">
                  Przeczytaj plan na dziś
                </p>
                <p className="text-[11px] text-slate-400">
                  Sprawdź ćwiczenia, serie i powtórzenia oraz uwagi od trenera.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-950">
                2
              </span>
              <div>
                <p className="font-semibold text-slate-50">
                  Zrealizuj trening i posiłki
                </p>
                <p className="text-[11px] text-slate-400">
                  Zaznacz, co udało się wykonać, a co wymagało modyfikacji.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-950">
                3
              </span>
              <div>
                <p className="font-semibold text-slate-50">
                  Wypełnij krótki raport
                </p>
                <p className="text-[11px] text-slate-400">
                  Napisz, jak się czułeś, co było łatwe, a co trudniejsze.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-2.5">
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-950">
                4
              </span>
              <div>
                <p className="font-semibold text-slate-50">
                  Wyślij do trenera i czekaj na feedback
                </p>
                <p className="text-[11px] text-slate-400">
                  Trener dostosuje kolejne dni na podstawie Twoich raportów.
                </p>
              </div>
            </li>
          </ol>
        )}

        {content.feedback?.text ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-900/25 p-3 text-xs text-emerald-50">
            <div className="flex items-start gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 text-emerald-300" />
              <div className="min-w-0">
                <p className="font-semibold">Wiadomość od trenera</p>
                <p className="mt-1 whitespace-pre-line text-[11px] text-emerald-50/90">
                  {content.feedback.text}
                </p>
                {content.feedback.at && (
                  <p className="mt-1.5 text-[10px] text-emerald-200/60">
                    {new Date(content.feedback.at).toLocaleString("pl-PL")}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-900/30 p-3 text-xs text-amber-100">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
              <div>
                <p className="font-semibold">Przypomnienie od trenera</p>
                <p className="text-[11px] text-amber-100/90">
                  Pamiętaj o zdjęciach sylwetki raz na 2 tygodnie – pomoże to lepiej
                  ocenić postępy niż sama waga.
                </p>
              </div>
            </div>
          </div>
        )}
        {reportAt &&
          (!content.feedback?.at || content.feedback.at < reportAt) && (
            <p className="rounded-xl border border-amber-500/40 bg-amber-900/20 px-3 py-2 text-[11px] text-amber-200">
              ⏳ Twój raport z {new Date(reportAt).toLocaleString("pl-PL")}{" "}
              czeka na odpowiedź trenera.
            </p>
          )}

        {/* Sytość i motywacja (check-in jak w Respo) */}
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-400">
              Sytość i motywacja
            </p>
            <p className="text-xs text-slate-300">
              Oceń dzień w skali 1–5 — trener zobaczy Twój trend.
            </p>
          </div>
          <MoodScale
            label="Sytość"
            value={mood.satiety}
            activeClass="bg-sky-500 text-slate-950"
            onChange={(v) => setMoodValue("satiety", v)}
          />
          <MoodScale
            label="Motywacja"
            value={mood.motivation}
            activeClass="bg-amber-500 text-slate-950"
            onChange={(v) => setMoodValue("motivation", v)}
          />
          {moodWeek.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2">
              <p className="mb-1 px-1 text-[10px] uppercase tracking-wide text-slate-500">
                Ostatnie 7 dni
              </p>
              <div className="flex items-end justify-between gap-1">
                {moodWeek.map((d) => (
                  <div
                    key={d.key}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <div className="flex h-6 items-end gap-0.5">
                      <span
                        className="w-1.5 rounded-t-sm bg-sky-400"
                        style={{ height: `${d.satiety * 4.8}px` }}
                      />
                      <span
                        className="w-1.5 rounded-t-sm bg-amber-400"
                        style={{ height: `${d.motivation * 4.8}px` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500">{d.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-1 flex items-center gap-3 px-1 text-[9px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  sytość
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  motywacja
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
    </div>
  );
}

function GuidelinesCard({
  g,
}: {
  g: TrainerContent["guidelines"] | undefined;
}) {
  if (!g) return null;
  const rules = (g.rules ?? []).filter((r) => r.trim());
  const hasAny =
    g.periodGoal.trim() ||
    g.weeklyFocus.trim() ||
    rules.length > 0 ||
    g.waterGlasses ||
    g.trainingsPerWeek ||
    g.reportHour;
  if (!hasAny) return null;
  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] dark:bg-transparent dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-slate-950/95 dark:to-slate-950/95">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            🎯 Wytyczne trenera
          </p>
          {g.periodGoal && (
            <p className="mt-1 text-lg font-semibold text-slate-50">
              {g.periodGoal}
            </p>
          )}
          {g.weeklyFocus && (
            <p className="mt-0.5 text-xs font-medium text-amber-800 dark:text-amber-200/90">
              📌 {g.weeklyFocus}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          {g.waterGlasses && (
            <span className="rounded-full bg-sky-500/15 px-2.5 py-1 text-sky-300">
              💧 {g.waterGlasses} szklanek / dzień
            </span>
          )}
          {g.trainingsPerWeek && (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-300">
              🏋️ {g.trainingsPerWeek}× trening / tydz.
            </span>
          )}
          {g.reportHour && (
            <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-amber-300">
              📝 przypomnienie o raporcie {g.reportHour}:00
            </span>
          )}
        </div>
      </div>
      {rules.length > 0 && (
        <ul className="mt-3 grid gap-1.5 text-xs text-slate-300 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1.5"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Wskazówki trenera widoczne w sekcjach Dieta / Trening / Suplementy / Nawodnienie
function TrainerTipsBanner({ content }: { content: TrainerContent }) {
  const focus = content.guidelines?.weeklyFocus?.trim() ?? "";
  const fb = content.feedback;
  const hasFb = Boolean(fb?.text.trim());
  if (!focus && !hasFb) return null;
  return (
    <div className="space-y-1.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 shadow-[0_0_25px_rgba(16,185,129,0.12)] dark:bg-transparent dark:bg-gradient-to-r dark:from-emerald-950/60 dark:to-slate-950/80">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
        🎯 Wskazówki trenera
      </p>
      {focus && (
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          {focus}
        </p>
      )}
      {hasFb && (
        <p className="max-h-24 overflow-hidden whitespace-pre-line text-xs leading-relaxed text-slate-300">
          {fb!.text}
        </p>
      )}
      {fb?.at && (
        <p className="text-[10px] text-slate-500">
          Odpowiedź z {new Date(fb.at).toLocaleString("pl-PL")}
        </p>
      )}
    </div>
  );
}

function MoodScale({
  label,
  value,
  onChange,
  activeClass,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  activeClass: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-300">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            aria-label={`${label}: ${v}`}
            onClick={() => onChange(v)}
            className={`h-7 w-7 rounded-lg text-xs font-semibold transition ${
              value === v
                ? activeClass
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function IntroSection({ content }: { content: TrainerContent }) {
  const intro = content.intro;
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      {/* Pasek aktualizacji u góry */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500/10 via-emerald-500/30 to-emerald-500/10 px-5 py-2 border border-emerald-400/70 shadow-[0_0_25px_rgba(16,185,129,0.6)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400">
            <span className="text-emerald-300 text-xl">!</span>
          </div>
          <div className="flex flex-col leading-tight text-xs">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-200">
              {intro.updateLabel}
            </span>
            <span className="text-[11px] text-emerald-100">{intro.updateDate}</span>
          </div>
        </div>
      </div>

      {/* Pasek tytułu sekcji „Wstęp” */}
      <div className="mt-4 flex items-center gap-2 rounded-full bg-slate-900/70 px-5 py-2 border border-slate-700/80 shadow-[0_10px_30px_rgba(15,23,42,0.9)]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-200">
          Wstęp
        </span>
      </div>

      {/* Główna karta tekstowa */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/90 px-5 py-6 text-[13px] leading-relaxed text-slate-200 shadow-[0_20px_40px_rgba(15,23,42,0.9)]">
        <div className="space-y-3">
          <p className="font-semibold text-slate-100">{intro.greeting}</p>
          <p>{intro.text}</p>
        </div>

        <div className="mt-4 space-y-2">
          <p className="font-semibold text-slate-100">{intro.changesTitle}</p>
          <ul className="list-disc space-y-1 pl-5 text-slate-200">
            {intro.changes.map((ch, i) => (
              <li key={i}>{ch}</li>
            ))}
          </ul>
        </div>
      </section>
    </section>
  );
}

function NutritionAnalysisSection({ content }: { content: TrainerContent }) {
  const n = content.nutrition;
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8">
      {/* Pasek tytułu sekcji */}
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400">
          Analiza żywieniowa
        </p>
        <h1 className="text-2xl font-extrabold tracking-[0.15em] text-slate-50 md:text-3xl">
          Bilans kaloryczny i makroskładniki
        </h1>
      </header>

      {/* Bilans kaloryczny – pasek + „zegar” */}
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 text-xs text-slate-200 shadow-[0_20px_40px_rgba(15,23,42,0.9)]">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <div className="mb-3 h-0.5 w-full rounded-full bg-slate-800">
              <div className="h-full w-40 rounded-full bg-gradient-to-r from-sky-500 via-slate-100 to-transparent" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              Bilans kaloryczny
            </p>
            <p className="mt-3 text-[13px] text-slate-200 leading-relaxed">
              {n.balanceText}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative h-40 w-40">
              <div className="absolute inset-0 rounded-full border-[10px] border-slate-800" />
              <div className="absolute inset-1 rounded-full border-[10px] border-slate-700 border-b-transparent border-l-transparent rotate-20" />
              <div className="absolute inset-5 rounded-full bg-slate-950/95 flex flex-col items-center justify-center">
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
                  {n.balanceType}
                </p>
                <p className="mt-1 text-2xl font-semibold text-emerald-400">
                  {n.balanceValue}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">{n.calories} kcal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Makroskładniki – okrąg + sylwetka */}
      <section className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)] text-xs text-slate-200">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              Makroskładniki
            </p>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-4 rounded-full bg-emerald-400" />
                Węglowodany
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-4 rounded-full bg-red-400" />
                Białko
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-4 rounded-full bg-sky-400" />
                Tłuszcze
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative h-40 w-40 flex-shrink-0">
              <div className="absolute inset-0 rounded-full border-[10px] border-slate-800" />
              <div className="absolute inset-1 rounded-full border-[10px] border-emerald-400 border-t-transparent border-r-transparent rotate-10" />
              <div className="absolute inset-3 rounded-full border-[10px] border-red-400 border-b-transparent border-l-transparent -rotate-15" />
              <div className="absolute inset-5 rounded-full border-[10px] border-sky-400 border-t-transparent border-l-transparent rotate-25" />
              <div className="absolute inset-9 flex flex-col items-center justify-center rounded-full bg-slate-950">
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.25em]">
                  Razem
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-50">
                  {n.calories}
                </p>
                <p className="text-[11px] text-slate-400">kcal</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-wide text-slate-300">
                  Węglowodany
                </p>
                <p className="text-[11px] font-semibold text-emerald-300">
                  {n.carbsKcal} kcal
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-wide text-slate-300">
                  Białko
                </p>
                <p className="text-[11px] font-semibold text-red-300">
                  {n.proteinKcal} kcal
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-wide text-slate-300">
                  Tłuszcze
                </p>
                <p className="text-[11px] font-semibold text-sky-300">
                  {n.fatKcal} kcal
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 text-[13px] text-slate-200">
              <p>
                Podział makroskładników w formie wskaźników, które widzisz na
                wykresach, jest dostosowany indywidualnie do Twoich celów i
                aktualnej masy ciała.
              </p>
              <p>
                Zapamiętaj – białka i węglowodany są głównym „paliwem” dla
                treningu oraz regeneracji, a tłuszcze odpowiadają za gospodarkę
                hormonalną i układ nerwowy. Dlatego ważne jest pilnowanie
                zarówno ilości kcal, jak i proporcji między makroskładnikami.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-[10px] text-slate-300">
              <div className="relative h-32 w-20 rounded-full bg-gradient-to-b from-sky-500/40 via-sky-400/10 to-transparent border border-sky-400/60 flex items-end justify-center">
                <span className="mb-2 text-xs font-semibold text-slate-50">
                  {n.weight} kg
                </span>
              </div>
              <div className="space-y-1 text-left">
                <p className="font-semibold text-slate-100">Twoje parametry</p>
                <p>Waga: {n.weight} kg</p>
                <p>Wzrost: {n.height} cm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dolne paski procentowe */}
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 text-xs text-slate-200">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
          Rozkład makroskładników
        </p>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-200">Węglowodany</span>
              <span className="text-emerald-300">{n.carbsPct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full w-[60%] rounded-full bg-emerald-400" />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-200">Białko</span>
              <span className="text-red-300">{n.proteinPct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full w-[27%] rounded-full bg-red-400" />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-200">Tłuszcze</span>
              <span className="text-sky-300">{n.fatPct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full w-[13%] rounded-full bg-sky-400" />
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 text-[11px] text-slate-300 md:grid-cols-3">
          <div>
            Węglowodany:{" "}
            <span className="font-semibold text-emerald-300">{n.carbsG} g</span>
          </div>
          <div>
            Białko: <span className="font-semibold text-red-300">{n.proteinG} g</span>
          </div>
          <div>
            Tłuszcze: <span className="font-semibold text-sky-300">{n.fatG} g</span>
          </div>
        </div>
      </section>
    </section>
  );
}

function DietPlanSection() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
          PLAN DIETETYCZNY
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Poniżej znajdziesz w uproszczony sposób podział węglowodanów, białka i
          tłuszczu na każdy posiłek w Twoim planie dietetycznym, ustalony przez
          trenera dla Twojego celu sylwetkowego.
        </p>
      </header>

      <section className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
        <div className="min-w-[640px]">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-0.5 w-8 bg-sky-500" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              MAKROSKŁADNIKI NA POSIŁKI
            </p>
          </div>

          <table className="w-full border-collapse text-center">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                <th className="border-b border-slate-800 py-2"></th>
                <th className="border-b border-slate-800 py-2">Śniadanie</th>
                <th className="border-b border-slate-800 py-2">II śniadanie</th>
                <th className="border-b border-slate-800 py-2">Obiad</th>
                <th className="border-b border-slate-800 py-2">Przekąska</th>
                <th className="border-b border-slate-800 py-2">Podwieczorek</th>
                <th className="border-b border-slate-800 py-2">Kolacja</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-[11px]">
                <td className="border-b border-slate-800 py-2 pl-2 text-left text-sky-400">
                  Węglowodany
                </td>
                <td className="border-b border-slate-800 py-2">40</td>
                <td className="border-b border-slate-800 py-2">40</td>
                <td className="border-b border-slate-800 py-2">50</td>
                <td className="border-b border-slate-800 py-2">50</td>
                <td className="border-b border-slate-800 py-2">60</td>
                <td className="border-b border-slate-800 py-2">40</td>
              </tr>
              <tr className="text-[11px]">
                <td className="border-b border-slate-800 py-2 pl-2 text-left text-emerald-400">
                  Białko
                </td>
                <td className="border-b border-slate-800 py-2">20</td>
                <td className="border-b border-slate-800 py-2">20</td>
                <td className="border-b border-slate-800 py-2">30</td>
                <td className="border-b border-slate-800 py-2">30</td>
                <td className="border-b border-slate-800 py-2">20</td>
                <td className="border-b border-slate-800 py-2">20</td>
              </tr>
              <tr className="text-[11px]">
                <td className="py-2 pl-2 text-left text-amber-400">Tłuszcze</td>
                <td className="py-2">15</td>
                <td className="py-2">15</td>
                <td className="py-2">10</td>
                <td className="py-2">10</td>
                <td className="py-2">15</td>
                <td className="py-2">10</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-sm leading-relaxed text-slate-200">
        <p>
          Twój nowy plan dietetyczny składa się z 4 posiłków stałych i jednego
          płynnego. Poniższy opis możesz w przyszłości zastąpić realnym tekstem
          od trenera – struktura jest przygotowana tak, aby wygodnie się go
          czytało.
        </p>

        <p>
          Organizm potrzebuje regularnego dostarczania składników odżywczych,
          które są niezbędne do produkowania energii na co dzień. Dlatego
          jedzenie częstszych, mniejszych porcji często jest dobrym rozwiązaniem
          podczas redukcji tkanki tłuszczowej.
        </p>

        <div className="space-y-1">
          <p className="font-semibold text-slate-100">Stosując się do planu:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              białko to głównie budowa i odbudowa tkanek, wspiera regenerację,
            </li>
            <li>
              węglowodany to główne źródło energii dla Twojego organizmu,
            </li>
            <li>
              tłuszcze są niezbędne do pracy układu hormonalnego i nerwowego.
            </li>
          </ul>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-slate-100">
            Kilka ważnych zasad stosowania planu:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              staraj się trzymać podobnych godzin posiłków w ciągu dnia
              (dopuszczalne są przesunięcia 1–2h),
            </li>
            <li>
              jeśli zmieniasz kolejność posiłków, pilnuj, aby zjeść wszystkie w
              ciągu dnia,
            </li>
            <li>
              raportuj trenerowi, gdy często pomijasz któryś z posiłków – to
              sygnał, że plan wymaga korekty.
            </li>
          </ul>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-slate-100">
            Podstawy Twojego schematu posiłków:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Każdy stały posiłek zawiera źródło białka, węglowodanów złożonych
              oraz porcję warzyw lub owoców.
            </li>
            <li>
              Posiłek płynny (np. shake) możesz wkomponować po treningu lub w
              dowolnym momencie dnia, gdy jest Ci wygodniej.
            </li>
            <li>
              Jeżeli masz gorszy dzień i nie zrealizujesz planu w 100%, nie
              traktuj tego jako porażki – ważne, abyś wracał do schematu przy
              kolejnych dniach.
            </li>
          </ul>
        </div>
      </section>
    </section>
  );
}

function NutritionTipsSection({ content }: { content: TrainerContent }) {
  const tips = content.tips;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
          PORADY ŻYWIENIOWE
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Ogólne porady pomocne w realizacji planu żywieniowego. Tutaj dowiesz
          się na czym smażyć, jakich przypraw używać i na co w trakcie biegu po
          wymarzoną sylwetkę zwrócić szczególną uwagę.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-sm text-slate-200">
        {tips.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-950/80 p-3"
          >
            <p className="text-sm font-semibold text-sky-300">
              {item.title.toUpperCase()}
            </p>
            <p className="text-xs text-slate-300">{item.desc}</p>
          </div>
        ))}
      </section>
    </section>
  );
}

function MealsVariantsSection({ content }: { content: TrainerContent }) {
  const meals = content.diet.meals;
  const catOrder: string[] = [
    "sniadanie",
    "ii_sniadanie",
    "obiad",
    "podwieczorek",
    "kolacja",
  ];
  const catLabels: Record<string, string> = {
    sniadanie: "Śniadanie",
    ii_sniadanie: "II śniadanie",
    obiad: "Obiad",
    podwieczorek: "Podwieczorek",
    kolacja: "Kolacja",
  };
  const groups = catOrder
    .map((cat) => ({
      cat,
      label: catLabels[cat],
      items: meals.filter((m) => (m.category ?? "") === cat),
    }))
    .filter((g) => g.items.length > 0);
  const [activeTab, setActiveTab] = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);
  const group = groups[activeTab] ?? groups[0];
  const variant = group?.items[activeVariant] ?? group?.items[0];
  const [email, setEmail] = useState("demo@fitcoach.ai");
  const [doneMeals, setDoneMeals] = useState<string[]>([]);
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [burned, setBurned] = useState(0);

  // Posiłek spoza planu: zdjęcie → analiza AI (kcal + makro)
  const [photoMeals, setPhotoMeals] = useState<PhotoMeal[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dishHint, setDishHint] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeOk | null>(null);
  const [photoError, setPhotoError] = useState("");

  // Wpisy z panelu „Dodaj posiłek" (składniki / moje dania / ręczne / kod)
  const [dishLogs, setDishLogs] = useState<DishLogEntry[]>([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  // Powielanie z wczoraj + top-5 najczęściej jadanych dań
  const [yesterLogs, setYesterLogs] = useState<DishLogEntry[]>([]);
  const [topDishes, setTopDishes] = useState<TopDish[]>([]);

  useEffect(() => {
    const storedEmail =
      window.localStorage.getItem("fitcoach_client_email") ?? "demo@fitcoach.ai";
    setEmail(storedEmail);
    setDoneMeals(getDoneMeals(storedEmail, todayISO()));
    setChoices(getMealChoices(storedEmail, todayISO()));
    setBurned(
      getActivities(storedEmail, todayISO()).reduce((s, a) => s + a.kcal, 0)
    );
    setPhotoMeals(getPhotoMeals(storedEmail, todayISO()));
    setDishLogs(getDishLog(storedEmail, todayISO()));
    setYesterLogs(getDishLog(storedEmail, dayOffsetISO(-1)));
    // Top-5 dań z całej historii wpisów (po nazwie, najczęściej na górze)
    const agg = new Map<string, TopDish>();
    for (const entries of Object.values(getDishLogByDate(storedEmail))) {
      for (const e of entries) {
        const cur = agg.get(e.name);
        if (cur) {
          cur.count += 1;
        } else {
          agg.set(e.name, {
            name: e.name,
            kcal: e.kcal,
            protein: e.protein,
            carbs: e.carbs,
            fat: e.fat,
            ingredients: e.ingredients,
            portions: e.portions,
            servings: e.servings,
            replacePlan: e.replacePlan,
            count: 1,
          });
        }
      }
    }
    setTopDishes(
      [...agg.values()].sort((a, b) => b.count - a.count).slice(0, 5)
    );
  }, []);

  const pickVariant = (idx: number) => {
    setActiveVariant(idx);
    setChoices(setMealChoice(email, todayISO(), group.cat, idx));
  };

  const toggleMeal = (cat: string) => {
    const shownIdx = group.items[activeVariant] ? activeVariant : 0;
    setChoices(setMealChoice(email, todayISO(), cat, shownIdx));
    setDoneMeals(toggleMealDone(email, todayISO(), cat));
  };

  const resetUpload = () => {
    setShowUpload(false);
    setPhotoPreview(null);
    setAnalysis(null);
    setDishHint("");
    setPhotoError("");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // pozwala wybrać ten sam plik ponownie
    if (!file) return;
    setPhotoError("");
    setAnalysis(null);
    try {
      setPhotoPreview(await fileToDataUrl(file, 1024, 0.75));
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "Nie udało się wczytać zdjęcia."
      );
    }
  };

  const analyzePhoto = async () => {
    if (!photoPreview || analyzing) return;
    setAnalyzing(true);
    setPhotoError("");
    try {
      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: photoPreview,
          category: group.cat,
          hint: dishHint.trim() || undefined,
        }),
      });
      const data = (await res.json()) as AnalyzeResult;
      if (!data.ok) {
        setPhotoError(data.error || "Analiza nie powiodła się.");
        return;
      }
      setAnalysis(data);
    } catch {
      setPhotoError("Brak połączenia z serwerem analizy — spróbuj ponownie.");
    } finally {
      setAnalyzing(false);
    }
  };

  const saveAnalysis = () => {
    if (!analysis || !photoPreview) return;
    if (photoMeals.length >= MAX_PHOTO_MEALS_PER_DAY) {
      setPhotoError(
        `Limit ${MAX_PHOTO_MEALS_PER_DAY} zdjęć dziennie — usuń któreś ze swoich dań.`
      );
      return;
    }
    setPhotoMeals(
      addPhotoMeal(email, {
        category: group.cat,
        date: todayISO(),
        name: analysis.name,
        recipe: analysis.recipe,
        kcal: analysis.kcal,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
        image: photoPreview,
        source: analysis.source,
      })
    );
    // Posiłek ze zdjęcia = zjedzony
    if (!doneMeals.includes(group.cat)) {
      setDoneMeals(toggleMealDone(email, todayISO(), group.cat));
    }
    resetUpload();
  };

  const deletePhotoMeal = (id: string) => {
    setPhotoMeals(removePhotoMeal(email, todayISO(), id));
  };

  const catPhotos = photoMeals.filter((p) => p.category === group?.cat);
  const catLogs = dishLogs.filter((l) => l.category === group?.cat);
  const yesterForCat = group
    ? yesterLogs.filter((l) => l.category === group.cat)
    : [];

  const deleteLog = (id: string) => {
    setDishLogs(removeDishLog(email, todayISO(), id));
  };

  const afterLogAdded = (list: DishLogEntry[]) => {
    setDishLogs(list);
    if (
      group &&
      list.some((e) => e.category === group.cat && e.replacePlan) &&
      !doneMeals.includes(group.cat)
    ) {
      setDoneMeals(toggleMealDone(email, todayISO(), group.cat));
    }
  };

  const handleDishSaved = (list: DishLogEntry[]) => {
    afterLogAdded(list);
    setShowAddMeal(false);
  };

  // 🔁 Powiel wczorajsze wpisy do obecnej kategorii
  const repeatYesterday = () => {
    if (!group) return;
    const src = yesterLogs.filter((e) => e.category === group.cat);
    if (!src.length) return;
    let next: DishLogEntry[] = getDishLog(email, todayISO());
    for (const e of src) {
      next = addDishLog(email, {
        date: todayISO(),
        category: e.category,
        name: e.name,
        kcal: e.kcal,
        protein: e.protein,
        carbs: e.carbs,
        fat: e.fat,
        ingredients: e.ingredients,
        portions: e.portions,
        servings: e.servings,
        replacePlan: e.replacePlan,
        source: e.source,
      });
    }
    afterLogAdded(next);
  };

  // ⭐ Dodaj często powtarzane danie jednym kliknięciem
  const addTopDish = (d: TopDish) => {
    if (!group) return;
    const next = addDishLog(email, {
      date: todayISO(),
      category: group.cat,
      name: d.name,
      kcal: d.kcal,
      protein: d.protein,
      carbs: d.carbs,
      fat: d.fat,
      ingredients: d.ingredients,
      portions: d.portions,
      servings: d.servings,
      replacePlan: d.replacePlan,
      source: "zapisane",
    });
    afterLogAdded(next);
  };

  const doneCount = groups.filter((g) => doneMeals.includes(g.cat)).length;

  // Bilans dnia: zdjęcia i wpisy „zamiast planu" zastępują wariant z diety,
  // wpisy „dodatkowo" zawsze się doliczają (jak w Fitatu).
  const eaten = groups.reduce(
    (acc, g) => {
      const add = (v: {
        kcal: number;
        protein: number;
        carbs: number;
        fat: number;
      }) => {
        acc.kcal += Math.round(v.kcal);
        acc.carbs += v.carbs;
        acc.protein += v.protein;
        acc.fat += v.fat;
      };
      const photos = photoMeals.filter((p) => p.category === g.cat);
      const repl = dishLogs.filter(
        (l) => l.category === g.cat && l.replacePlan
      );
      const extraLogs = dishLogs.filter(
        (l) => l.category === g.cat && !l.replacePlan
      );
      if (photos.length > 0 || repl.length > 0) {
        photos.forEach(add);
        repl.forEach(add);
      } else if (doneMeals.includes(g.cat)) {
        const v = g.items[choices[g.cat] ?? 0] ?? g.items[0];
        add({
          kcal: parseInt(v.calories) || 0,
          protein: parseInt(v.protein || "0") || 0,
          carbs: parseInt(v.carbs || "0") || 0,
          fat: parseInt(v.fat || "0") || 0,
        });
      }
      extraLogs.forEach(add);
      return acc;
    },
    { kcal: 0, carbs: 0, protein: 0, fat: 0 }
  );
  const targetKcal = parseInt(content.diet.targetCalories) || 0;
  const targetCarbs = parseInt(content.nutrition.carbsG) || 0;
  const targetProtein = parseInt(content.nutrition.proteinG) || 0;
  const targetFat = parseInt(content.nutrition.fatG) || 0;

  if (groups.length === 0) {
    return (
      <section className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-sm text-slate-300">
        Trener nie ułożył jeszcze diety.
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
          POSIŁKI I WARIANTY
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Posiłki ułożone przez trenera — w każdej kategorii możesz wybrać
          spośród kilku wariantów. Zjadłeś coś innego? Wgraj zdjęcie dania (AI
          wyceni kcal i makro) albo złóż własne danie z produktów — jak w
          Fitatu — i dopisz je do bilansu dnia.
        </p>
      </header>

      <TrainerTipsBanner content={content} />

      {/* Postęp dnia */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-slate-200">
          <span className="text-slate-300">Zrealizowane posiłki dziś</span>
          <span className="font-semibold text-emerald-400">
            {doneCount} / {groups.length}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: `${
                groups.length ? (doneCount / groups.length) * 100 : 0
              }%`,
            }}
          />
        </div>
      </section>

      {/* Kalorie i makro dnia — układ jak w Fitatu */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
            Dzisiejszy bilans dnia
          </p>
          <p className="text-slate-400">
            plan + wpisy własne + zdjęcia
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">
              Pozostało do zjedzenia
            </p>
            <p
              className={`text-3xl font-extrabold tracking-tight ${
                targetKcal > 0 && targetKcal - eaten.kcal >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {targetKcal > 0 ? (
                targetKcal - eaten.kcal >= 0 ? (
                  targetKcal - eaten.kcal
                ) : (
                  `+${eaten.kcal - targetKcal}`
                )
              ) : (
                "—"
              )}
              <span className="ml-1 text-sm font-semibold text-slate-400">
                kcal
              </span>
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              zjedzono{" "}
              <span className="font-semibold text-slate-100">{eaten.kcal}</span>{" "}
              z {targetKcal} kcal
            </p>
          </div>
          <p
            className={`text-2xl font-extrabold ${
              targetKcal > 0 && eaten.kcal > targetKcal
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {targetKcal > 0
              ? Math.min(999, Math.round((eaten.kcal / targetKcal) * 100))
              : 0}
            %
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${
              targetKcal > 0 && eaten.kcal > targetKcal
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{
              width: `${
                targetKcal
                  ? Math.min(100, (eaten.kcal / targetKcal) * 100)
                  : 0
              }%`,
            }}
          />
        </div>

        {/* Bilans energetyczny (zjedzone − spalone, jak w Respo) */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
          <Link
            href="/client/aktywnosci"
            className="text-slate-400 hover:text-slate-200"
          >
            🔥 Spalone:{" "}
            <span className="font-semibold text-orange-400">{burned} kcal</span>{" "}
            <span className="text-[10px] underline underline-offset-2">
              (dodaj aktywność →)
            </span>
          </Link>
          <span className="text-slate-300">
            Możesz jeszcze zjeść:{" "}
            <span className="font-semibold text-emerald-400">
              {Math.max(0, targetKcal - eaten.kcal + burned)} kcal
            </span>
          </span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            {
              label: "Węgle",
              value: eaten.carbs,
              target: targetCarbs,
              color: "bg-sky-400",
            },
            {
              label: "Białko",
              value: eaten.protein,
              target: targetProtein,
              color: "bg-emerald-400",
            },
            {
              label: "Tłuszcze",
              value: eaten.fat,
              target: targetFat,
              color: "bg-amber-400",
            },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{m.label}</span>
                <span className="font-semibold text-slate-100">
                  {m.value} / {m.target} g
                </span>
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500">
                {m.target - m.value >= 0
                  ? `pozostało ${m.target - m.value} g`
                  : `ponad plan o ${m.value - m.target} g`}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${m.color}`}
                  style={{
                    width: `${
                      m.target ? Math.min(100, (m.value / m.target) * 100) : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200">
        <div className="flex flex-wrap gap-2">
          {groups.map((g, idx) => (
            <button
              key={g.cat}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`flex-1 min-w-[90px] rounded-lg px-4 py-2 text-center uppercase tracking-wide ${
                activeTab === idx
                  ? "bg-sky-500 text-slate-950 font-semibold shadow-[0_0_18px_rgba(56,189,248,0.6)]"
                  : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
              }`}
            >
              {doneMeals.includes(g.cat) && "✓ "}
              {photoMeals.some((p) => p.category === g.cat) && "📷 "}
              {g.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
        <div className="flex flex-wrap gap-2">
          {group.items.map((m, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => pickVariant(idx)}
              className={`rounded-full px-4 py-1.5 text-[11px] ${
                activeVariant === idx
                  ? "bg-sky-500 text-slate-950 font-semibold"
                  : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
            {group?.label ?? "Posiłek"}: {variant?.name ?? "—"}
          </p>
          <p className="text-[11px] text-slate-400">
            Docelowa kaloryczność:{" "}
            <span className="font-semibold text-sky-300">
              {content.diet.targetCalories} kcal
            </span>
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.7fr_1.3fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80">
            <div className="h-56 w-full bg-[url('https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center" />
          </div>

          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="self-start text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              WARTOŚCI ODŻYWCZE
            </p>
            <div className="relative h-40 w-40">
              <div className="absolute inset-0 rounded-full border-[10px] border-slate-800" />
              <div className="absolute inset-1 rounded-full border-[10px] border-emerald-500/80 border-r-transparent border-b-transparent rotate-[30deg]" />
              <div className="absolute inset-3 rounded-full border-[10px] border-sky-500/80 border-l-transparent border-b-transparent -rotate-[20deg]" />
              <div className="absolute inset-5 rounded-full border-[10px] border-amber-400/80 border-t-transparent border-r-transparent rotate-[15deg]" />
              <div className="absolute inset-10 flex flex-col items-center justify-center rounded-full bg-slate-950">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  {variant?.calories || "—"} kcal
                </p>
                <p className="mt-1 text-center text-[10px] text-slate-300">
                  {variant?.carbs || variant?.protein || variant?.fat
                    ? `W ${variant.carbs || "—"} · B ${variant.protein || "—"} · T ${variant.fat || "—"} g`
                    : variant?.name ?? "Posiłek"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400">
            OPIS
          </p>
          <p>{variant?.description || "Brak opisu tego posiłku."}</p>
        </div>

        {/* Twoje wpisy: zdjęcia (AI) + dania ze składników / ręczne */}
        {(catPhotos.length > 0 || catLogs.length > 0) && (
          <div className="space-y-2 rounded-2xl border border-sky-500/40 bg-sky-950/30 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
              🧩 Twoje wpisy — {group.label}
            </p>
            {catPhotos.map((p) => (
              <div
                key={p.id}
                className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-20 w-20 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-semibold text-slate-100">
                      {p.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => deletePhotoMeal(p.id)}
                      title="Usuń to danie"
                      className="shrink-0 rounded-md px-2 text-slate-500 hover:bg-slate-800 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-300">
                    <span className="text-sm font-semibold text-sky-300">
                      {p.kcal} kcal
                    </span>{" "}
                    · W {p.carbs} · B {p.protein} · T {p.fat} g
                  </p>
                  {p.recipe.length > 0 && (
                    <p className="mt-1 truncate text-[11px] text-slate-500">
                      {p.recipe[0]}
                    </p>
                  )}
                  <p className="mt-1 text-[10px]">
                    {p.source === "ai" ? (
                      <span className="text-emerald-400">🤖 Analiza AI</span>
                    ) : (
                      <span className="text-amber-300">⚡ Wycena testowa</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            {catLogs.map((l) => (
              <div
                key={l.id}
                className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-2xl">
                  {l.source === "skladniki"
                    ? "🧩"
                    : l.source === "zapisane"
                    ? "⭐"
                    : "✏️"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-semibold text-slate-100">
                      {l.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => deleteLog(l.id)}
                      title="Usuń wpis"
                      className="shrink-0 rounded-md px-2 text-slate-500 hover:bg-slate-800 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-300">
                    <span className="text-sm font-semibold text-sky-300">
                      {l.kcal} kcal
                    </span>{" "}
                    · W {l.carbs} · B {l.protein} · T {l.fat} g
                    {l.portions > 1 && (
                      <span className="ml-1 text-slate-500">
                        ({l.servings}/{l.portions} porcji)
                      </span>
                    )}
                  </p>
                  {l.ingredients.length > 0 && (
                    <details className="mt-1">
                      <summary className="cursor-pointer truncate text-[10px] text-slate-500 hover:text-slate-300">
                        Skład:{" "}
                        {l.ingredients
                          .map((i) => `${i.name.split(" (")[0]} ${i.grams} g`)
                          .join(" · ")}
                      </summary>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10px] text-slate-400">
                        {l.ingredients.map((i, idx) => (
                          <li key={idx}>
                            {i.name} — {i.grams} g ({i.kcal} kcal)
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <p className="mt-1 text-[10px]">
                    {l.replacePlan ? (
                      <span className="text-emerald-400">zamiast planu</span>
                    ) : (
                      <span className="text-amber-300">dodatkowo</span>
                    )}
                    {l.source === "zapisane" && (
                      <span className="text-slate-500"> · z moich dań</span>
                    )}
                    {l.source === "reczne" && (
                      <span className="text-slate-500"> · wpis ręczny</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-slate-500">
              Wpisy „zamiast planu" zastępują planowany wariant w bilansie dnia,
              „dodatkowo" są doliczane osobno.
            </p>
          </div>
        )}

        {/* Szybkie powielanie wczoraj + top-5 z historii */}
        {!showUpload && !showAddMeal && (yesterForCat.length > 0 || topDishes.length > 0) && (
          <div className="space-y-2">
            {yesterForCat.length > 0 && (
              <button
                type="button"
                onClick={repeatYesterday}
                className="flex w-full items-center gap-2 overflow-hidden rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
                title={yesterForCat.map((e) => e.name).join(" · ")}
              >
                <span className="shrink-0">🔁 Powiel z wczoraj</span>
                <span className="min-w-0 truncate text-[11px] font-normal text-emerald-300/90">
                  {yesterForCat.map((e) => e.name).join(" · ")}
                </span>
                <span className="ml-auto shrink-0 text-[11px] text-emerald-400">
                  +{yesterForCat.reduce((s, e) => s + e.kcal, 0)} kcal
                </span>
              </button>
            )}
            {topDishes.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  ⭐ Często jadłeś — dodaj jednym kliknięciem
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {topDishes.map((d) => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => addTopDish(d)}
                      className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
                      title={`Wpisz: ${d.name} — ${d.kcal} kcal`}
                    >
                      {d.name}{" "}
                      <span className="text-slate-500">
                        · {d.kcal} kcal
                        {d.count > 1 ? ` ×${d.count}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dodawanie posiłku: zdjęcie (AI) albo składniki jak w Fitatu */}
        {!showUpload && !showAddMeal && (
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setPhotoError("");
                setShowUpload(true);
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-sky-500/50 bg-sky-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-sky-200 transition hover:bg-sky-500/20"
            >
              <Camera className="h-4 w-4" />
              📷 Zdjęcie dania (AI)
            </button>
            <button
              type="button"
              onClick={() => setShowAddMeal(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-sky-400"
            >
              ➕ Dodaj posiłek (składniki)
            </button>
          </div>
        )}

        {showAddMeal && (
          <MealAddPanel
            email={email}
            category={group.cat}
            categoryLabel={group.label}
            onClose={() => setShowAddMeal(false)}
            onSaved={handleDishSaved}
          />
        )}

        {/* Wgrywanie zdjęcia posiłku */}
        {showUpload && (
          <div className="space-y-3 rounded-2xl border border-sky-500/40 bg-slate-950/90 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
                📷 Posiłek spoza planu — wycena
              </p>
              <button
                type="button"
                onClick={resetUpload}
                className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
              >
                ✕ Zamknij
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded-full bg-sky-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-950 hover:bg-sky-400">
                {photoPreview ? "🔄 Zmień zdjęcie" : "Wybierz zdjęcie dania"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
              </label>
              {photoPreview && (
                <span className="text-[11px] text-slate-400">
                  Zdjęcie gotowe ✓
                </span>
              )}
            </div>

            {photoPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt="Podgląd zdjęcia dania"
                className="h-44 w-full rounded-xl border border-slate-800 object-cover"
              />
            )}

            <input
              value={dishHint}
              onChange={(e) => setDishHint(e.target.value)}
              placeholder="Co to było? (np. Kurczak w pięciu smakach) — opcjonalnie"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />

            {photoError && (
              <p className="text-[11px] text-red-400">{photoError}</p>
            )}

            <button
              type="button"
              onClick={analyzePhoto}
              disabled={!photoPreview || analyzing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing
                ? "⏳ AI analizuje zdjęcie…"
                : "⚡ Wycen kcal, makro i skład"}
            </button>

            {analysis && (
              <div className="space-y-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-slate-50">
                    {analysis.name}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      analysis.source === "ai"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {analysis.source === "ai" ? "🤖 AI" : "⚡ szacunek"}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  <span className="text-lg font-bold text-sky-300">
                    {analysis.kcal} kcal
                  </span>{" "}
                  · W {analysis.carbs} g · B {analysis.protein} g · T{" "}
                  {analysis.fat} g
                </p>
                {analysis.recipe.length > 0 && (
                  <div className="text-[11px] text-slate-400">
                    <p className="uppercase tracking-wide text-slate-500">
                      Skład / przepis
                    </p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4">
                      {analysis.recipe.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.source === "demo" && (
                  <p className="text-[10px] leading-relaxed text-amber-300/80">
                    ⚡ Wycena testowa z bazy produktów — zdjęcia nie analizuje
                    jeszcze AI. Po dodaniu klucza OPENAI_API_KEY w Vercel AI
                    będzie czytać samo zdjęcie (bez zmian w kodzie).
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={saveAnalysis}
                    className="flex-1 rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 hover:bg-sky-400"
                  >
                    ✓ Zapisz jako {group.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalysis(null)}
                    className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Odrzuć
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Odhaczanie posiłku */}
        <button
          type="button"
          onClick={() => toggleMeal(group.cat)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wide transition ${
            doneMeals.includes(group.cat)
              ? "border border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
              : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {doneMeals.includes(group.cat)
            ? `Zjedzone — kliknij, aby odhacz (${group.label})`
            : `Oznacz jako zjedzony (${group.label})`}
        </button>
      </section>
    </section>
  );
}

function SupplementsSection({ content }: { content: TrainerContent }) {
  const list = content.supplements;
  const [activeId, setActiveId] = useState<string>(list[0]?.id ?? "");
  const active = list.find((s) => s.id === activeId) ?? list[0];

  if (list.length === 0) {
    return (
      <section className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-sm text-slate-300">
        Trener nie zalecił jeszcze żadnych suplementów.
      </section>
    );
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
          SUPLEMENTACJA
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Dokładna rozpiska uzupełnienia diety – odżywek i suplementów. Dawki,
          pory stosowania, produkty – wszystko czarno na białym.
        </p>
      </header>

      <TrainerTipsBanner content={content} />

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
          PRZEPISANE SUPLEMENTY
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-xs text-slate-200">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex w-full flex-col items-center gap-3 md:w-56">
            <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/80">
              <span className="text-[11px] text-slate-500">Zdjęcie suplementu</span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              {active.type}
            </p>
            <button className="w-full rounded-full bg-sky-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-950 hover:bg-sky-400">
              Zamów teraz
            </button>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-50">
                {active.name}
              </h2>
              <p className="mt-1 text-[11px] text-slate-400">{active.shortDesc}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                  DAWKOWANIE
                </p>
                <p className="text-[11px] text-slate-200">
                  {active?.dosing || "Brak dawkowania."}
                </p>
              </div>
              <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                  INFORMACJE O SUPLEMENCIE
                </p>
                <p className="text-[11px] text-slate-200">
                  {active?.info || "Brak informacji."}
                </p>
              </div>
            </div>

            <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] text-slate-200">
              <p className="font-semibold text-slate-100">Opis suplementu:</p>
              <p>{active?.shortDesc || "Brak opisu."}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2 text-xs text-slate-200">
        {list.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveId(s.id)}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
              active.id === s.id
                ? "border-sky-500 bg-slate-900/90"
                : "border-slate-800 bg-slate-950/80 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-800" />
              <div>
                <p className="text-sm font-semibold text-slate-50">{s.name}</p>
                <p className="text-[11px] text-slate-400">{s.type}</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400">
              {active.id === s.id ? "Wybrany" : "Zmień"}
            </span>
          </button>
        ))}
      </section>
    </section>
  );
}

function HydrationSection({ content }: { content: TrainerContent }) {
  const h = content.hydration;
  const [email, setEmail] = useState("demo@fitcoach.ai");
  const [glasses, setGlasses] = useState(0);
  const [goal, setGoal] = useState(8);

  useEffect(() => {
    const storedEmail =
      window.localStorage.getItem("fitcoach_client_email") ?? "demo@fitcoach.ai";
    setEmail(storedEmail);
    setGlasses(getWaterForDate(storedEmail, todayISO()));
    setGoal(
      computeWaterGoal(storedEmail, content.nutrition.weight, content.guidelines?.waterGlasses)
    );
  }, [content.nutrition.weight]);

  const setGlassesFor = (count: number) => {
    setGlasses(setWaterForDate(email, todayISO(), count));
  };

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
          NAWODNIENIE ORGANIZMU
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Opis zasad związanych z gospodarką wodno–elektrolitową. Oprócz diety
          jest to drugi najważniejszy obszar, którego codziennie pilnujesz.
        </p>
      </header>

      <TrainerTipsBanner content={content} />

      {/* Interaktywny licznik wody */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-xs text-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
              TWOJE NAWODNIENIE DZIŚ
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Klikaj szklanki lub przyciski +/−, aby odnotować wypitą wodę.
              Postęp zapisuje się automatycznie.
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-50">
            {glasses} / {goal} szklanek · {(glasses * 0.25).toFixed(2)} L
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <button
            type="button"
            onClick={() => setGlassesFor(glasses - 1)}
            disabled={glasses <= 0}
            aria-label="Zmniejsz liczbę szklanek"
            className="h-9 w-9 rounded-lg border border-slate-700 bg-slate-950/70 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40"
          >
            −
          </button>
          {Array.from({ length: goal }).map((_, idx) => {
            const filled = idx < glasses;
            return (
              <button
                key={idx}
                type="button"
                aria-label={`Szklanka ${idx + 1}`}
                onClick={() =>
                  setGlassesFor(idx + 1 === glasses ? idx : idx + 1)
                }
                className={`flex h-12 w-8 items-end justify-center rounded-md border transition ${
                  filled
                    ? "border-sky-400 bg-gradient-to-t from-sky-500 to-sky-300/70"
                    : "border-slate-700 bg-slate-950/60 hover:border-sky-500/60"
                }`}
              >
                <Droplets
                  className={`mb-1 h-3.5 w-3.5 ${
                    filled ? "text-slate-950" : "text-slate-600"
                  }`}
                />
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setGlassesFor(glasses + 1)}
            disabled={glasses >= goal}
            aria-label="Zwiększ liczbę szklanek"
            className="h-9 w-9 rounded-lg border border-slate-700 bg-slate-950/70 text-sm font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40"
          >
            +
          </button>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-sky-400 transition-all"
            style={{ width: `${Math.min(100, (glasses / goal) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Cel: {goal} szklanek (ok. {(goal * 0.25).toFixed(2)} L) —{" "}
          {glasses >= goal ? "osiągnięty ✓" : `brakuje ${goal - glasses}`}
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-sm text-slate-200">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="h-0.5 w-8 bg-emerald-500" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              UWAGI OGÓLNE DO TWOJEGO NAWODNIENIA
            </p>
          </div>
          <p>{h.general}</p>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
            POZOSTAŁE NAPOJE
          </p>
          <ul className="list-disc space-y-1 pl-5 text-xs text-slate-200">
            {h.beverages.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-xs text-slate-200">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
          LEGENDA (PRZYKŁAD)
        </p>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="flex flex-col items-center gap-1">
            <div className="h-10 w-10 rounded-md bg-sky-500/40 border border-sky-400" />
            <p className="text-center text-[11px] text-slate-300">
              1 szklanka wody
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-10 w-10 rounded-md bg-sky-400/30 border border-sky-300" />
            <p className="text-center text-[11px] text-slate-300">
              250 ml napoju
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-12 w-8 rounded-md bg-sky-500/50 border border-sky-400" />
            <p className="text-center text-[11px] text-slate-300">
              0.5 l butelka
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-14 w-10 rounded-md bg-sky-500/60 border border-sky-400" />
            <p className="text-center text-[11px] text-slate-300">
              1 l butelka
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-xs text-slate-200">
        <p className="text-center text-sm font-semibold text-slate-50">
          PLAN TWOJEGO NAWODNIENIA
        </p>
        <p className="text-center text-[11px] text-slate-400">{h.planText}</p>

        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="flex items-end gap-2">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-10 w-4 rounded-b-md bg-gradient-to-t from-sky-500/70 to-sky-300/40 border border-sky-400/80"
              />
            ))}
          </div>
          <p className="text-[11px] text-slate-300">
            Odpowiada to mniej więcej 8 szklankom wody w ciągu dnia.
          </p>
        </div>
      </section>
    </section>
  );
}

/** „60 s" → 60, „1:30" → 90, „2 min" → 120 (bez danych → 90 s). */
function parseRestSec(rest?: string): number {
  if (!rest) return 90;
  const mm = rest.match(/(\d+)\s*:\s*(\d+)/);
  if (mm) return Number(mm[1]) * 60 + Number(mm[2]);
  const n = parseInt(rest.replace(",", "."), 10);
  if (!Number.isFinite(n) || n <= 0) return 90;
  return /min/i.test(rest) ? n * 60 : n;
}

function TrainingSection({
  content,
  onPrintReport,
}: {
  content: TrainerContent;
  onPrintReport: (dayId: number, elapsedSec?: number) => void;
}) {
  const t = content.training;
  const days = t.days;
  const [activeIdx, setActiveIdx] = useState(0);
  const activeDayNum = activeIdx + 1;
  const exercises = t.dayExercises[activeDayNum] ?? [];
  const activeDay = days[activeIdx] ?? days[0];
  const [email, setEmail] = useState("demo@fitcoach.ai");
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [log, setLog] = useState<Record<string, ExerciseLogEntry>>({});
  // Historia: wszystkie wcześniejsze wpisy tego ćwiczenia w planie
  const [histMap, setHistMap] = useState<
    Record<string, { day: number; entry: ExerciseLogEntry }[]>
  >({});
  // Tryb sesji: serie (tabela jak w myfitcoach), podmiany ćwiczeń, licznik
  const [setsMap, setSetsMap] = useState<Record<string, SetLogEntry[]>>({});
  const [subs, setSubs] = useState<Record<string, string>>({});
  const [session, setSession] = useState<WorkoutSession | null>(null);
  // Podsumowanie ostatnio zakończonej sesji → pasek z raportem PDF
  const [finished, setFinished] = useState<{
    dayId: number;
    elapsedSec: number;
  } | null>(null);
  const [nowTs, setNowTs] = useState(() => Date.now());
  // Pływający timer przerwy
  const [timerTrigger, setTimerTrigger] = useState(0);
  const [timerSec, setTimerSec] = useState(90);

  useEffect(() => {
    const storedEmail =
      window.localStorage.getItem("fitcoach_client_email") ?? "demo@fitcoach.ai";
    setEmail(storedEmail);
    setDoneIds(getDoneExerciseIds(storedEmail, activeDayNum));
    setLog(getTrainingLog(storedEmail, activeDayNum));
    setSetsMap(getSetLog(storedEmail, activeDayNum));
    setSubs(getSubstitutions(storedEmail)[String(activeDayNum)] ?? {});
    setSession(getWorkoutSession(storedEmail));
  }, [activeDayNum]);

  // Tykający licznik sesji (jak 01:03:21 w myfitcoach)
  useEffect(() => {
    if (!session) return;
    setNowTs(Date.now());
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session]);

  // Budujemy historię (wszystkie wpisy) dla ćwiczeń aktywnego dnia.
  // Kolejność przeglądania: wcześniejsze dni → koniec tygodnia (plan jest
  // cykliczny, więc np. wtorkowe ćwiczenie może „powtórzyć się" w piątek).
  useEffect(() => {
    const exs = content.training.dayExercises[activeDayNum] ?? [];
    const order: number[] = [];
    for (let d = activeDayNum - 1; d >= 1; d--) order.push(d);
    for (let d = days.length; d > activeDayNum; d--) order.push(d);
    const logs: Record<number, Record<string, ExerciseLogEntry>> = {};
    for (const d of order) logs[d] = getTrainingLog(email, d);
    const map: Record<string, { day: number; entry: ExerciseLogEntry }[]> = {};
    for (const ex of exs) {
      const list: { day: number; entry: ExerciseLogEntry }[] = [];
      for (const d of order) {
        const dayExs = content.training.dayExercises[d] ?? [];
        const idx = dayExs.findIndex((e) => e.name === ex.name);
        if (idx < 0) continue;
        const entry = logs[d]?.[String(idx + 1)];
        if (entry && (entry.kg || entry.reps)) list.push({ day: d, entry });
      }
      map[ex.name] = list;
    }
    setHistMap(map);
  }, [email, activeDayNum, days.length, content]);

  const startRest = (sec: number) => {
    setTimerSec(sec);
    setTimerTrigger((t) => t + 1);
  };

  const toggleExercise = (exerciseId: string) => {
    const wasDone = doneIds.includes(exerciseId);
    const next = toggleExerciseDone(email, activeDayNum, exerciseId);
    setDoneIds(next);
    // Odhaczenie ćwiczenia = start przerwy z planu (jak w Fitatu)
    if (!wasDone && next.includes(exerciseId)) {
      const idx = Number(exerciseId) - 1;
      startRest(parseRestSec(exercises[idx]?.rest));
    }
  };

  // 🚀 Start / koniec sesji treningowej (licznik czasu)
  const startSession = () => {
    const s: WorkoutSession = { dayId: activeDayNum, startedAt: Date.now() };
    saveWorkoutSession(email, s);
    setSession(s);
    setNowTs(s.startedAt);
  };

  const endSession = () => {
    const elapsedSec = session
      ? Math.round((Date.now() - session.startedAt) / 1000)
      : 0;
    const dayId = session?.dayId ?? activeDayNum;
    saveWorkoutSession(email, null);
    setSession(null);
    setFinished({ dayId, elapsedSec });
  };

  // Domyślne wiersze serii: tyle, ile w planie; pierwszy wiersz
  // podmieniamy starym logiem (kg × powt.), jeśli klient już coś logował
  const defaultSets = (ex: TrainingExercise, exId: string): SetLogEntry[] => {
    const n = Math.max(1, Math.min(10, parseInt(ex.series, 10) || 3));
    const rows: SetLogEntry[] = Array.from({ length: n }, () => ({
      reps: "",
      kg: "",
      rir: "",
      done: false,
    }));
    const legacy = log[exId];
    if (legacy && (legacy.kg || legacy.reps)) {
      rows[0] = { reps: legacy.reps, kg: legacy.kg, rir: "", done: false };
    }
    return rows;
  };

  const updateSets = (exId: string, next: SetLogEntry[]) => {
    setExerciseSets(email, activeDayNum, exId, next);
    setSetsMap((m) => ({ ...m, [exId]: next }));

    // Mirror do logu jednoepisodowego — widok trenera pokazuje
    // „kg × powtórzenia" na podstawie ostatniej odhaczonej serii
    const val =
      [...next].reverse().find((s) => s.done && (s.kg || s.reps)) ??
      [...next].reverse().find((s) => s.kg || s.reps);
    if (val) {
      const rir = val.rir === "" ? null : Number(val.rir);
      const effort =
        rir === null ? "" : rir <= 1 ? "meczacy" : rir <= 2 ? "sredni" : "latwy";
      setLog(
        setTrainingLogEntry(email, activeDayNum, exId, {
          kg: val.kg,
          reps: val.reps,
          effort,
        })
      );
    }

    // Wszystkie serie odhaczone = ćwiczenie gotowe (startuje timer przerwy)
    if (
      next.length > 0 &&
      next.every((s) => s.done) &&
      !doneIds.includes(exId)
    ) {
      toggleExercise(exId);
    }
  };

  const updateSub = (exId: string, name: string | null) => {
    setSubstitution(email, activeDayNum, exId, name);
    setSubs((m) => {
      const next = { ...m };
      if (name === null) delete next[exId];
      else next[exId] = name;
      return next;
    });
  };

  const fmtElapsed = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };
  const fmtSecShort = (sec: number) => fmtElapsed(sec * 1000);

  const sessionActive = session !== null && session.dayId === activeDayNum;
  const totalSets = exercises.reduce(
    (sum, ex, i) =>
      sum +
      (setsMap[String(i + 1)]?.length ??
        Math.max(1, parseInt(ex.series, 10) || 3)),
    0
  );
  const doneSetsCount = exercises.reduce(
    (sum, _, i) =>
      sum + (setsMap[String(i + 1)] ?? []).filter((s) => s.done).length,
    0
  );

  const doneCount = exercises.filter((_, i) =>
    doneIds.includes(String(i + 1))
  ).length;

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="space-y-4">
        <h1 className="text-center text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-left md:text-4xl">
          PLAN TRENINGOWY
        </h1>
        <p className="max-w-3xl text-sm text-slate-300">
          Plan ułożony przez trenera – kolejność ćwiczeń, ilość serii, czas
          pracy i przerwy na każdy dzień.
        </p>

        {content.guidelines?.trainingsPerWeek && (
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300">
            🎯 Cel trenera: {content.guidelines.trainingsPerWeek} treningi w
            tygodniu
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-2 text-xs text-slate-200">
          {days.map((day, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`flex-1 min-w-[110px] rounded-lg px-4 py-2 text-left uppercase tracking-wide ${
                activeIdx === idx
                  ? "bg-emerald-500 text-slate-950 font-semibold shadow-[0_0_18px_rgba(16,185,129,0.6)]"
                  : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
              }`}
            >
              <div className="flex flex-col leading-tight">
                <span>{day.label}</span>
                <span className="text-[10px] normal-case opacity-80">
                  {day.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </header>

      <TrainerTipsBanner content={content} />

      {/* Tryb sesji: licznik czasu + licznik serii (jak w myfitcoach) */}
      {sessionActive && session ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                Trening trwa
              </p>
              <p className="font-mono text-xl font-bold text-slate-50">
                {fmtElapsed(nowTs - session.startedAt)}
              </p>
            </div>
            <span className="rounded-full bg-slate-950/60 px-3 py-1 text-[11px] text-slate-200 ring-1 ring-emerald-500/40">
              Serie: {doneSetsCount}/{totalSets}
            </span>
            <span className="rounded-full bg-slate-950/60 px-3 py-1 text-[11px] text-slate-200">
              Ćwiczenia: {doneCount}/{exercises.length}
            </span>
          </div>
          <button
            type="button"
            onClick={endSession}
            className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            🏁 Zakończ trening
          </button>
        </div>
      ) : finished ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
              ✅ Trening zakończony
            </p>
            <p className="text-sm text-slate-200">
              {days[finished.dayId - 1]?.label ?? "Dzień treningowy"} · czas{" "}
              {fmtSecShort(finished.elapsedSec)} — pobierz raport PDF z
              podsumowaniem serii.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                onPrintReport(finished.dayId, finished.elapsedSec)
              }
              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              📄 Raport PDF
            </button>
            <button
              type="button"
              onClick={() => setFinished(null)}
              className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-300 transition hover:border-slate-500"
            >
              Zamknij
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={startSession}
          className="w-full rounded-2xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
        >
          🚀 Rozpocznij trening — włącz licznik czasu i loguj serie
        </button>
      )}

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
            DZIEŃ TRENINGOWY
          </p>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] text-emerald-300 ring-1 ring-emerald-500/40">
              Wykonane: {doneCount} / {exercises.length}
            </span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300">
              Status:{" "}
              <span className="font-semibold text-emerald-400">
                {activeDay?.status ?? "—"}
              </span>
            </span>
            <button
              type="button"
              title="Podsumowanie dnia w PDF"
              onClick={() => onPrintReport(activeDayNum)}
              className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font-semibold text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              📄 Raport PDF
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {exercises.length === 0 && (
            <p className="text-sm text-slate-400">
              Brak ćwiczeń dla tego dnia.
            </p>
          )}
          {exercises.map((ex, i) => {
            const exId = String(i + 1);
            const sub = subs[exId] ?? null;
            return (
              <ExerciseCard
                key={i}
                ex={ex}
                exId={exId}
                idx={i}
                displayName={sub ?? ex.name}
                isDone={doneIds.includes(exId)}
                sets={setsMap[exId] ?? defaultSets(ex, exId)}
                history={histMap[ex.name] ?? []}
                sub={sub}
                restSec={parseRestSec(ex.rest)}
                onToggle={() => toggleExercise(exId)}
                onSets={(next) => updateSets(exId, next)}
                onSub={(name) => updateSub(exId, name)}
                onRest={startRest}
              />
            );
          })}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
          KOMENTARZ DO TRENINGU
        </p>
        <div className="space-y-2">
          {t.comment.map((cm, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-slate-800 bg-slate-950/80"
            >
              <summary className="flex cursor-pointer items-center justify-between px-4 py-2 text-[11px] font-semibold text-slate-200">
                {cm.label}
                <span className="transition text-slate-500 group-open:rotate-180">
                  ˅
                </span>
              </summary>
              <div className="border-t border-slate-800 px-4 py-3 text-[11px] text-slate-300">
                {cm.text}
              </div>
            </details>
          ))}
        </div>
      </section>

      <div className="flex justify-between">
        <button
          type="button"
          className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
        >
          Wstecz
        </button>
        <button
          type="button"
          className="rounded-full bg-sky-500 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 hover:bg-sky-400"
        >
          Przejdź dalej
        </button>
      </div>

      <RestTimer trigger={timerTrigger} seconds={timerSec} />
    </section>
  );
}

function CateringSection({ content }: { content: TrainerContent }) {
  const cat = content.catering;
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
          Plan żywieniowy
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-50">
          Catering dietetyczny
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">{cat.note}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {cat.providers.map((p, i) => (
          <section
            key={i}
            className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-50">{p.name}</h2>
              {p.recommended && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  Polecany przez trenera
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-300">{p.note}</p>
          </section>
        ))}
      </div>
    </section>
  );
}

function SettingsSection() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400">
          Ustawienia
        </p>
        <h1 className="text-2xl font-extrabold tracking-[0.15em] text-slate-50 md:text-3xl">
          Zarządzanie kontem i historią zakupów
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)_minmax(0,1.2fr)]">
        {/* Miniaturka / avatar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
              Miniaturka
            </p>
            <div className="flex items-center justify-center">
              <button
                type="button"
                className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-sky-400 bg-slate-950 text-4xl text-sky-400"
              >
                +
              </button>
            </div>
            <p className="mt-3 text-[11px] text-slate-500 text-center">
              Dozwolone formaty: .jpg, .png. Rozmiar do 4&nbsp;MB.
            </p>
          </div>

          {/* Zmiana hasła – makieta */}
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400">
              Zmień hasło
            </p>
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Obecne hasło"
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                disabled
              />
              <input
                type="password"
                placeholder="Nowe hasło"
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                disabled
              />
              <input
                type="password"
                placeholder="Powtórz hasło"
                className="w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                disabled
              />
            </div>
            <button
              type="button"
              className="mt-1 inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-950 hover:bg-sky-400"
              disabled
            >
              Zmień hasło (demo)
            </button>
          </div>
        </div>

        {/* Historia zakupów – tabela */}
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300 text-center mb-1">
            Historia zakupów
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-[11px]">
              <thead>
                <tr className="text-slate-400">
                  <th className="border-b border-slate-800 py-2 pr-4 font-semibold">
                    Nazwa planu
                  </th>
                  <th className="border-b border-slate-800 py-2 pr-4 font-semibold">
                    Data zakupu
                  </th>
                  <th className="border-b border-slate-800 py-2 pr-4 font-semibold">
                    Okres
                  </th>
                  <th className="border-b border-slate-800 py-2 pr-4 font-semibold">
                    Kwota
                  </th>
                  <th className="border-b border-slate-800 py-2 pr-4 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: "Prowadzenie online 1 miesiąc",
                    date: "26.02.2026",
                    duration: "1 mies.",
                    price: "229 zł",
                    status: "Zaakceptowana",
                  },
                  {
                    name: "Prowadzenie online 1 miesiąc",
                    date: "07.09.2023",
                    duration: "1 mies.",
                    price: "149 zł",
                    status: "Zaakceptowana",
                  },
                  {
                    name: "Prowadzenie online 1 miesiąc",
                    date: "06.08.2023",
                    duration: "1 mies.",
                    price: "149 zł",
                    status: "Zaakceptowana",
                  },
                  {
                    name: "Dieta 1 miesiąc",
                    date: "11.06.2023",
                    duration: "1 mies.",
                    price: "99 zł",
                    status: "Anulowana",
                  },
                ].map((row) => (
                  <tr key={`${row.name}-${row.date}`} className="border-b border-slate-900/60">
                    <td className="py-2 pr-4 text-slate-100">{row.name}</td>
                    <td className="py-2 pr-4 text-slate-300">{row.date}</td>
                    <td className="py-2 pr-4 text-slate-300">{row.duration}</td>
                    <td className="py-2 pr-4 text-amber-300">{row.price}</td>
                    <td className="py-2 pr-4">
                      <span className="inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informacje o koncie / numerze / usuwanie */}
        <div className="space-y-4">
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              Informacje
            </p>
            <div className="space-y-1">
              <p className="text-[11px] text-slate-500">Imię</p>
              <p className="text-sm font-semibold text-slate-50">Mateusz</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-slate-500">Adres e-mail</p>
              <p className="text-sm font-mono text-slate-100">
                podopieczny@fitcoach.ai
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-slate-500">Data urodzenia</p>
              <p className="text-sm text-slate-100">1994-04-16</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              Numer telefonu
            </p>
            <p className="text-[11px] text-slate-500">Aktualny</p>
            <p className="text-sm font-semibold text-emerald-300">
              +48 517 751 589
            </p>
            <input
              type="tel"
              placeholder="Nowy numer telefonu"
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              disabled
            />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-950 hover:bg-sky-400"
              disabled
            >
              Zmień numer (demo)
            </button>
          </div>

          <div className="space-y-3 rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-xs text-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-300">
              Usuwanie konta
            </p>
            <p className="text-[11px] text-red-200">
              Uwaga! Jeśli usuniesz konto, wszystkie Twoje dane zostaną
              bezpowrotnie skasowane i stracisz możliwość logowania się do
              panelu. W wersji demo ta funkcja jest wyłączona.
            </p>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-500 px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-50 opacity-60 cursor-not-allowed"
            >
              Usuń konto (demo)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrainingPlanSection({
  activeTrainingDay,
  setActiveTrainingDay,
}: {
  activeTrainingDay: number;
  setActiveTrainingDay: (day: number) => void;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)]">
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
              Plan treningowy
            </p>
            <p className="text-xs text-slate-300">
              Przykładowy plan na 7 dni. W docelowej wersji dane będą pochodzić
              od Twojego trenera.
            </p>
          </div>
          <div className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-200">
            Plan: góra / dół + core
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 p-2 text-xs">
          {trainingDays.map((day) => (
            <button
              key={day.day}
              type="button"
              onClick={() => setActiveTrainingDay(day.day)}
              className={`min-w-[80px] rounded-lg border px-3 py-2 text-left transition ${
                activeTrainingDay === day.day
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                  : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
              }`}
            >
              <p className="text-[11px] font-semibold">
                Dzień {day.day}
                {day.rest && <span className="ml-1 text-[10px]">(odpoczynek)</span>}
              </p>
              {!day.rest && (
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Trening siłowy + core
                </p>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Ćwiczenia (przykład)
          </p>
          <div className="grid gap-2 text-slate-200">
            {exercises.map((ex) => (
              <div
                key={ex.lp}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-50">
                    {ex.lp}. {ex.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Serie: {ex.sets} • Powtórzenia: {ex.reps.join(" / ")}
                  </p>
                </div>
                <div className="flex flex-col items-end text-[11px] text-slate-400">
                  <span>Trudność:</span>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-3 rounded-full ${
                          i < ex.difficulty ? "bg-emerald-400" : "bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Notatki do dnia {activeTrainingDay}
          </p>
          <span className="rounded-full bg-slate-900/80 px-2 py-1 text-[10px] text-slate-300">
            Przykładowe dane
          </span>
        </div>
        <ul className="space-y-2 text-[11px] text-slate-300">
          <li>• Skup się na technice, nie na ciężarze.</li>
          <li>• Przerwy między seriami 60–90 sekund.</li>
          <li>• Po treningu minimum 10 minut spokojnego rozciągania.</li>
        </ul>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
          <p className="text-[11px] font-semibold text-slate-50">
            Raport z dnia (demo)
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Tu w przyszłości wpiszesz, jak poszedł trening, a trener zobaczy to
            w swoim panelu.
          </p>
        </div>
      </div>
    </section>
  );
}

function DietSection({
  activeMealIndex,
  setActiveMealIndex,
}: {
  activeMealIndex: number;
  setActiveMealIndex: (index: number) => void;
}) {
  type DietSubSection =
    | "wprowadzenie"
    | "analiza"
    | "plan"
    | "porady"
    | "dieta"
    | "suplementy"
    | "nawodnienie"
    | "trening"
    | "catering";

  const [dietSection, setDietSection] =
    useState<DietSubSection>("wprowadzenie");

  const dietNavItems: { id: DietSubSection; label: string }[] = [
    { id: "wprowadzenie", label: "Wprowadzenie" },
    { id: "analiza", label: "Analiza żywieniowa" },
    { id: "plan", label: "Plan żywieniowy" },
    { id: "porady", label: "Porady żywieniowe" },
    { id: "dieta", label: "Dieta" },
    { id: "suplementy", label: "Suplementy" },
    { id: "nawodnienie", label: "Nawodnienie" },
    { id: "trening", label: "Trening" },
    { id: "catering", label: "Catering" },
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-[200px_minmax(0,1.5fr)_minmax(0,1.1fr)]">
      {/* Lewa kolumna – sekcje żywieniowe */}
      <aside className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-200">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Plan żywieniowy
        </p>
        <div className="mt-2 space-y-1.5">
          {dietNavItems.map((item) => {
            const active = dietSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDietSection(item.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-[11px] transition ${
                  active
                    ? "bg-emerald-500 text-slate-950 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                    : "bg-slate-900/70 text-slate-300 hover:bg-slate-900"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </aside>

      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
              Plan żywieniowy
            </p>
            <p className="text-xs text-slate-300">
              Przykładowy rozkład posiłków. W docelowej wersji będzie pochodził
              z planu od trenera.
            </p>
          </div>
          <div className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-200">
            Cel: redukcja, 2100 kcal
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80 p-2 text-xs">
          {meals.map((meal, index) => (
            <button
              key={meal}
              type="button"
              onClick={() => setActiveMealIndex(index)}
              className={`min-w-[110px] rounded-lg border px-3 py-2 text-left transition ${
                activeMealIndex === index
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                  : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
              }`}
            >
              <p className="text-[11px] font-semibold">{meal}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">Przykładowy opis</p>
            </button>
          ))}
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Szczegóły posiłku (demo)
          </p>
          <ul className="space-y-1 text-slate-200">
            <li>• Źródło białka</li>
            <li>• Źródło węglowodanów złożonych</li>
            <li>• Warzywa / owoce</li>
            <li>• Zdrowe tłuszcze</li>
          </ul>
          <p className="text-[11px] text-slate-400">
            W finalnej wersji skład i gramatury będzie uzupełniał Twój trener.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 px-4 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="space-y-2 text-xs text-slate-300">
              <p className="text-[11px] uppercase text-slate-500 font-semibold">
                Wartości odżywcze (przykład)
              </p>
              <p>
                Węglowodany: <span className="font-semibold">100 kcal</span>
              </p>
              <p>
                Białko: <span className="font-semibold">40 kcal</span>
              </p>
              <p>
                Tłuszcze: <span className="font-semibold">135 kcal</span>
              </p>
            </div>
            <div className="relative h-40 w-40 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div className="absolute inset-1 rounded-full border-4 border-emerald-500 border-l-transparent border-b-transparent rotate-12" />
              <div className="absolute inset-3 rounded-full border-4 border-sky-500 border-r-transparent border-b-transparent -rotate-6" />
              <div className="absolute inset-5 rounded-full border-4 border-amber-400 border-t-transparent border-r-transparent rotate-24" />
              <div className="relative h-20 w-20 rounded-full bg-slate-900 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400">Kcal</span>
                <span className="text-2xl font-semibold text-slate-50">275</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 px-4 py-3 flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">
                Woda w ciągu dnia
              </span>
              <span className="text-emerald-400 font-semibold">1.5L</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-8 rounded-b-lg border border-slate-700 bg-gradient-to-t from-sky-500/80 to-sky-400/40"
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 px-4 py-3 text-xs space-y-2">
            <p className="text-[11px] uppercase text-slate-500 font-semibold">
              Kaloryczność posiłków (przykład)
            </p>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden flex">
              <div className="flex-1 bg-emerald-500" />
              <div className="flex-[0.7] bg-sky-500" />
              <div className="flex-[0.8] bg-amber-400" />
              <div className="flex-[0.5] bg-fuchsia-500" />
            </div>
            <p className="text-[11px] text-slate-400">
              Docelowo tutaj zobaczysz rozkład kaloryczności wszystkich posiłków
              w ciągu dnia.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressSection() {
  const [dateLabels, setDateLabels] = useState<string[]>([]);
  const [focusedMetric, setFocusedMetric] = useState<
    "waga" | "pas" | "brzuch" | "biceps" | "klatka" | "uda" | "lydki" | null
  >(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "fitcoach_client_start_date";
    const today = new Date();
    let stored = window.localStorage.getItem(key);
    let start: Date;

    const setDemoStart = () => {
      // Demo: pokaż zakres mniej więcej 6 miesięcy wstecz.
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      window.localStorage.setItem(key, sixMonthsAgo.toISOString().slice(0, 10));
      return sixMonthsAgo;
    };

    if (!stored) {
      start = setDemoStart();
    } else {
      const parsed = new Date(stored);
      const diffMs = today.getTime() - parsed.getTime();
      const diffDaysExisting = diffMs / (1000 * 60 * 60 * 24);

      if (Number.isNaN(parsed.getTime()) || diffDaysExisting < 1) {
        // Jeśli wcześniej zapisaliśmy "dziś" (bardzo krótki okres),
        // zresetuj na 6 miesięcy wstecz, żeby oś nie była pusta.
        start = setDemoStart();
      } else {
        start = parsed;
      }
    }

    const totalMs = Math.max(
      1000 * 60 * 60 * 24,
      today.getTime() - start.getTime(),
    );
    const diffDays = Math.max(
      1,
      Math.round(totalMs / (1000 * 60 * 60 * 24)),
    );
    // Im dłużej trwa współpraca, tym więcej punktów, ale max 7
    const steps = Math.min(7, Math.max(3, Math.round(diffDays / 30) + 2));

    const labels: string[] = [];
    for (let i = 0; i < steps; i++) {
      const t =
        steps === 1
          ? today.getTime()
          : start.getTime() + (totalMs * i) / (steps - 1);
      const d = new Date(t);
      labels.push(
        d.toLocaleDateString("pl-PL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      );
    }
    setDateLabels(labels);
  }, []);

  const isVisible = (key:
    | "waga"
    | "pas"
    | "brzuch"
    | "biceps"
    | "klatka"
    | "uda"
    | "lydki",
  ) => !focusedMetric || focusedMetric === key;

  const chestDots = [
    { x: 8, y: 55, value: 108 },
    { x: 32, y: 60, value: 101 },
    { x: 66, y: 54, value: 108 },
    { x: 92, y: 48, value: 108 },
  ];
  const waistDots = [
    { x: 8, y: 70, value: 83 },
    { x: 32, y: 68, value: 78 },
    { x: 66, y: 69, value: 82 },
    { x: 92, y: 72, value: 93 },
  ];
  const bellyDots = [
    { x: 8, y: 65, value: 93 },
    { x: 32, y: 64, value: 90 },
    { x: 66, y: 64, value: 92 },
    { x: 92, y: 66, value: 95 },
  ];
  const thighDots = [
    { x: 8, y: 80, value: 57 },
    { x: 32, y: 78, value: 53 },
    { x: 66, y: 78, value: 53 },
    { x: 92, y: 81, value: 61 },
  ];
  const weightDots = [
    { x: 8, y: 88, value: 81 },
    { x: 32, y: 87, value: 81 },
    { x: 66, y: 88, value: 81 },
    { x: 92, y: 88, value: 81 },
  ];
  const bicepsDots = [
    { x: 8, y: 83, value: 38 },
    { x: 32, y: 82, value: 38 },
    { x: 66, y: 83, value: 38 },
    { x: 92, y: 83, value: 38 },
  ];
  const calvesDots = [
    { x: 8, y: 87, value: 37 },
    { x: 32, y: 86, value: 37 },
    { x: 66, y: 87, value: 37 },
    { x: 92, y: 88, value: 37 },
  ];

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-xs text-slate-200">
      {/* Legenda / przełączniki jak na screenie */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2">
        {[
          {
            label: "WAGA",
            color: "border-cyan-400 bg-cyan-500/20 text-cyan-300", // jasny turkus
            key: "waga",
          },
          {
            label: "PAS",
            color: "border-rose-400 bg-rose-500/20 text-rose-300", // róż
            key: "pas",
          },
          {
            label: "BRZUCH",
            color: "border-orange-400 bg-orange-500/25 text-orange-300", // pomarańcz
            key: "brzuch",
          },
          {
            label: "BICEPS",
            color: "border-blue-400 bg-blue-500/25 text-blue-300", // niebieski
            key: "biceps",
          },
          {
            label: "KLATKA",
            color: "border-emerald-400 bg-emerald-500/20 text-emerald-300", // zielony
            key: "klatka",
          },
          {
            label: "UDA",
            color: "border-amber-400 bg-amber-500/25 text-amber-300", // żółty
            key: "uda",
          },
          {
            label: "ŁYDKI",
            color: "border-violet-400 bg-violet-500/25 text-violet-300", // fiolet
            key: "lydki",
          },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() =>
              setFocusedMetric(
                focusedMetric === item.key ? null : (item.key as any),
              )
            }
            className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
              focusedMetric === item.key
                ? `${item.color} ring-1 ring-offset-1 ring-offset-slate-900`
                : item.color
            }`}
          >
            <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-current">
              ✓
            </span>
            <span>{item.label}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setFocusedMetric(null)}
          className="ml-auto rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200 hover:bg-slate-800"
        >
          Wszystkie
        </button>
      </div>

      {/* „Wykres” z wieloma liniami – wersja statyczna / dekoracyjna */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950/95 p-4">
        <div className="relative h-56 w-full overflow-hidden rounded-xl bg-slate-950/80">
          {/* Pionowe i poziome linie siatki */}
          <div className="absolute inset-0 opacity-40">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute left-0 right-0 h-px bg-slate-800"
                style={{ top: `${(i + 1) * 14}%` }}
              />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute top-0 bottom-0 w-px bg-slate-800"
                style={{ left: `${(i + 1) * 14}%` }}
              />
            ))}
          </div>

          {/* Linie „obwodów” jako proste pseudo-wykresy (tylko wygląd) */}
          <div className="relative h-full w-full">
            {/* Klatka – zielona */}
            {isVisible("klatka") && (
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,55 16,50 33,60 50,52 67,54 84,50 100,48"
                  fill="none"
                  stroke="rgba(74,222,128,1)" /* klatka */
                  strokeWidth="2"
                />
              </svg>
            )}
            {/* Pas – różowy */}
            {isVisible("pas") && (
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,70 16,68 33,66 50,65 67,67 84,69 100,72"
                  fill="none"
                  stroke="rgba(244,114,182,1)" /* pas */
                  strokeWidth="2"
                />
              </svg>
            )}
            {/* Brzuch – pomarańczowy */}
            {isVisible("brzuch") && (
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,65 16,64 33,63 50,62 67,63 84,64 100,66"
                  fill="none"
                  stroke="rgba(251,146,60,1)" /* brzuch */
                  strokeWidth="2"
                />
              </svg>
            )}
            {/* Uda – żółte */}
            {isVisible("uda") && (
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,80 16,78 33,76 50,75 67,76 84,78 100,81"
                  fill="none"
                  stroke="rgba(250,204,21,1)" /* uda */
                  strokeWidth="2"
                />
              </svg>
            )}
            {/* Waga – niebieska, blisko dołu */}
            {isVisible("waga") && (
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,88 16,87 33,86 50,86 67,87 84,88 100,88"
                  fill="none"
                  stroke="rgba(34,211,238,1)" /* waga */
                  strokeWidth="2"
                />
              </svg>
            )}
            {/* Biceps – niebieski (nad wagą) */}
            {isVisible("biceps") && (
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,83 16,82 33,81 50,81 67,82 84,83 100,83"
                  fill="none"
                  stroke="rgba(59,130,246,1)" /* biceps */
                  strokeWidth="2"
                />
              </svg>
            )}
            {/* Łydki – fioletowe (najniższa linia, wyżej nad datami) */}
            {isVisible("lydki") && (
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,87 16,86 33,86 50,87 67,87 84,88 100,88"
                  fill="none"
                  stroke="rgba(139,92,246,1)" /* łydki */
                  strokeWidth="2"
                />
              </svg>
            )}
          </div>

          {/* Etykiety wartości jako HTML, żeby nie były rozciągane */}
          {isVisible("klatka") &&
            chestDots.map((d) => (
              <div
                key={`klatka-${d.x}-${d.value}`}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-2.5 text-[11px] font-semibold text-slate-50 drop-shadow-[0_0_6px_rgba(15,23,42,0.95)]"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
              >
                {d.value}
              </div>
            ))}
          {isVisible("pas") &&
            waistDots.map((d) => (
              <div
                key={`pas-${d.x}-${d.value}`}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-2.5 text-[11px] font-semibold text-slate-50 drop-shadow-[0_0_6px_rgba(15,23,42,0.95)]"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
              >
                {d.value}
              </div>
            ))}
          {isVisible("brzuch") &&
            bellyDots.map((d) => (
              <div
                key={`brzuch-${d.x}-${d.value}`}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-2.5 text-[11px] font-semibold text-slate-50 drop-shadow-[0_0_6px_rgba(15,23,42,0.95)]"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
              >
                {d.value}
              </div>
            ))}
          {isVisible("uda") &&
            thighDots.map((d) => (
              <div
                key={`uda-${d.x}-${d.value}`}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-2.5 text-[11px] font-semibold text-slate-50 drop-shadow-[0_0_6px_rgba(15,23,42,0.95)]"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
              >
                {d.value}
              </div>
            ))}
          {isVisible("waga") &&
            weightDots.map((d) => (
              <div
                key={`waga-${d.x}-${d.value}`}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-2.5 text-[11px] font-semibold text-slate-50 drop-shadow-[0_0_6px_rgba(15,23,42,0.95)]"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
              >
                {d.value}
              </div>
            ))}
          {isVisible("biceps") &&
            bicepsDots.map((d) => (
              <div
                key={`biceps-${d.x}-${d.value}`}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-2.5 text-[11px] font-semibold text-slate-50 drop-shadow-[0_0_6px_rgba(15,23,42,0.95)]"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
              >
                {d.value}
              </div>
            ))}
          {isVisible("lydki") &&
            calvesDots.map((d) => (
              <div
                key={`lydki-${d.x}-${d.value}`}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-2.5 text-[11px] font-semibold text-slate-50 drop-shadow-[0_0_6px_rgba(15,23,42,0.95)]"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
              >
                {d.value}
              </div>
            ))}

          {/* Oś czasu na dole */}
          <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[9px] text-slate-400">
            {(dateLabels.length
              ? dateLabels
              : ["04.03.2026", "04.03.2026"]
            ).map((label, idx) => (
              <span key={`${label}-${idx}`}>{label}</span>
            ))}
          </div>
        </div>

        {/* Podsumowanie wagi jak na screenie */}
        <div className="mt-4 flex flex-col items-center gap-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Aktualna waga
          </p>
          <p className="text-3xl font-bold text-slate-50">
            <span className="align-middle text-emerald-400 mr-1">↑</span>81{" "}
            <span className="text-sm text-slate-300">kg</span>
          </p>
        </div>
      </div>

      {/* Dolne kafelki z obwodami – uproszczona wersja */}
      <div className="grid gap-3 text-xs text-slate-200 md:grid-cols-3">
        <div className="space-y-1 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
            Biceps
          </p>
          <p className="text-lg font-semibold text-slate-50">
            38 <span className="text-[11px] text-slate-400">cm</span>
          </p>
        </div>
        <div className="space-y-1 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Klatka
          </p>
          <p className="text-lg font-semibold text-slate-50">
            108 <span className="text-[11px] text-slate-400">cm</span>
          </p>
        </div>
        <div className="space-y-1 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-400">
            Pas
          </p>
          <p className="text-lg font-semibold text-slate-50">
            90 <span className="text-[11px] text-slate-400">cm</span>
          </p>
        </div>
        <div className="space-y-1 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400">
            Brzuch
          </p>
          <p className="text-lg font-semibold text-slate-50">
            93 <span className="text-[11px] text-slate-400">cm</span>
          </p>
        </div>
        <div className="space-y-1 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400">
            Uda
          </p>
          <p className="text-lg font-semibold text-slate-50">
            61 <span className="text-[11px] text-slate-400">cm</span>
          </p>
        </div>
        <div className="space-y-1 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300">
            Łydki
          </p>
          <p className="text-lg font-semibold text-slate-50">
            37 <span className="text-[11px] text-slate-400">cm</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function TrainersListSection({
  onSelectTrainer,
}: {
  onSelectTrainer: (id: string) => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200">
      <p className="text-sm text-slate-200">
        Wybierz trenera, z którym chcesz współpracować. To tylko przykładowe
        profile – w docelowej wersji pojawią się tu prawdziwi trenerzy z ich
        opisami i ocenami od podopiecznych.
      </p>
      <div className="space-y-3">
        {trainers.map((trainer) => (
          <article
            key={trainer.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/90 flex items-center justify-center text-slate-950 text-sm font-semibold">
                {trainer.name[0]}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-50">
                  {trainer.name}
                </h2>
                <p className="text-[11px] text-emerald-300 font-semibold">
                  {trainer.title}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  {trainer.specialization}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.round(trainer.rating)
                            ? "text-amber-400"
                            : "text-slate-600"
                        }`}
                        fill={
                          i < Math.round(trainer.rating)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </div>
                  <span>
                    {trainer.rating.toFixed(1)} ({trainer.reviews} opinii)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 text-xs">
              <span className="text-emerald-400 font-semibold">
                {trainer.price}
              </span>
              <button
                type="button"
                onClick={() => onSelectTrainer(trainer.id)}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-950 hover:bg-emerald-400 transition"
              >
                Wybierz tego trenera
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

