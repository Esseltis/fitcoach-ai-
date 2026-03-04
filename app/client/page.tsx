"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
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
} from "lucide-react";

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
  | "plan"
  | "diet"
  | "progress"
  | "chat";

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
  {
    id: "t3",
    name: "Piotr Zieliński",
    title: "Trener siły i sportów walki",
    specialization: "Siła, kondycja, przygotowanie motoryczne",
    price: "od 269 zł / mies.",
    rating: 4.8,
    reviews: 24,
  },
];

export default function ClientDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [activeTrainingDay, setActiveTrainingDay] = useState(1);
  const [activeMealIndex, setActiveMealIndex] = useState(2); // obiad
  const [hasTrainer, setHasTrainer] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

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
    setReady(true);
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("fitcoach_client_logged_in");
      window.localStorage.removeItem("fitcoach_client_email");
    }
    router.push("/");
  };

  const handleSelectTrainer = (trainerId: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("fitcoach_client_trainer_id", trainerId);
    }
    setHasTrainer(true);
    setActiveSection("dashboard");
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
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
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
                  (isCatering && activeSection === "catering");
                const disabled = !hasTrainer && item.id !== "dashboard";
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
                      setShowIntro(false);
                      if (item.href) {
                        router.push(item.href);
                      }
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      disabled
                        ? "text-slate-600 cursor-not-allowed border border-slate-900"
                        : active
                        ? "bg-slate-800 text-white shadow-inner"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
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
            <button
              type="button"
              onClick={handleChangeTrainer}
              className="rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800/80 transition"
            >
              Zmień trenera
            </button>
          )}
        </header>

        {!hasTrainer ? (
          <TrainersListSection onSelectTrainer={handleSelectTrainer} />
        ) : showIntro ? (
          <IntroSection />
        ) : (
          <>
            {activeSection === "dashboard" && (
              <DashboardSection
                activeSection={activeSection}
                setActiveSection={setActiveSection}
              />
            )}
            {activeSection === "analiza" && <NutritionAnalysisSection />}
            {activeSection === "plan-zywieniowy" && <DietPlanSection />}
            {activeSection === "porady" && <NutritionTipsSection />}
            {activeSection === "dieta" && <MealsVariantsSection />}
            {activeSection === "suplementy" && <SupplementsSection />}
            {activeSection === "nawodnienie" && <HydrationSection />}
            {activeSection === "trening" && <TrainingSection />}
            {activeSection === "catering" && <CateringSection />}
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
            {activeSection === "chat" && <ChatSection />}
          </>
        )}
      </main>
    </div>
  );
}

function DashboardSection({
  activeSection,
  setActiveSection,
}: {
  activeSection: SectionId;
  setActiveSection: (id: SectionId) => void;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
      {/* Karta z BMI i wymiarami */}
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Tryb i sekcje */}
          <div className="flex w-full flex-col gap-3 lg:w-40">
            <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/70 to-slate-950/80 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
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
              <div className="absolute inset-8 rounded-[999px] bg-emerald-500/10 blur-3xl" />
              <div className="relative flex h-72 w-36 items-center justify-center">
                <div className="absolute bottom-6 h-40 w-28 rounded-full bg-gradient-to-t from-emerald-500/25 via-emerald-400/5 to-transparent blur-2xl" />
                <img
                  src="/body-male.png"
                  alt="Sylwetka podopiecznego"
                  className="relative h-64 w-auto object-contain"
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
              Dzisiejsze zadania
            </p>
            <p className="text-xs text-slate-300">
              Zrealizuj plan, wypełnij raport i wyślij do trenera.
            </p>
          </div>
          <button className="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400">
            Wyślij raport
          </button>
        </div>

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
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200">
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
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200">
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
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200">
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
      </div>
    </section>
  );
}

function IntroSection() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="space-y-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Plan współpracy
          </p>
          <h1 className="text-3xl font-extrabold tracking-[0.15em] text-slate-50 md:text-4xl">
            START PLANU
          </h1>
        </div>

        <div className="mt-2 flex flex-col items-center gap-1 text-xs text-slate-300">
          <span className="rounded-full border border-emerald-500/50 bg-slate-900/70 px-4 py-1 text-emerald-300">
            AKTUALIZACJA • wersja demo
          </span>
          <span className="text-[11px] text-slate-500">
            Tutaj w przyszłości trener będzie wpisywał numer aktualizacji planu i
            datę.
          </span>
        </div>

        <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      </header>

      <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-sm leading-relaxed text-slate-200">
        <div className="mb-1 flex items-center gap-3">
          <div className="h-0.5 w-10 bg-sky-500" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            WSTĘP
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-emerald-300">Siema Mateusz!</p>
          <p>
            Tutaj trener wprowadzi Cię w aktualną wersję planu – napisze, co
            zostało zmienione, na co masz zwracać uwagę w raportach i jak
            podchodzić do kolejnych tygodni współpracy.
          </p>
          <p>
            Ten tekst jest na razie przykładowy. Możesz go śmiało zastąpić
            dowolną treścią, którą normalnie dostajesz od trenera na ekranie
            „Start planu”.
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-slate-100">W aktualizacji planu:</p>
          <ul className="list-disc space-y-1 pl-5 text-slate-200">
            <li>kaloryczność planu utrzymana na podobnym poziomie,</li>
            <li>lekko zwiększona liczba posiłków w ciągu dnia,</li>
            <li>odświeżone menu i nowe propozycje posiłków,</li>
            <li>zmodyfikowany plan treningowy pod aktualny etap,</li>
            <li>ustalenia dotyczące suplementacji i nawodnienia bez zmian.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-red-400">Ogień!</p>
          <p>
            Poniżej możesz dodać szczegółowe wskazówki dotyczące pomiarów,
            raportów tygodniowych i wszystkiego, co jest ważne z perspektywy
            Twojego trenera. Struktura jest przygotowana tak, żeby łatwo było ją
            czytać na telefonie i komputerze.
          </p>
        </div>
      </section>
    </section>
  );
}

function NutritionAnalysisSection() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
          ANALIZA ŻYWIENIOWA
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Tutaj wyjaśnione są aspekty bilansu kalorycznego, który ustalam na
          obecny okres treningowy. Znajdziesz tutaj także krótkie uzasadnienie
          moich decyzji dotyczących tego tematu.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[2.2fr_1.2fr]">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-xs text-slate-200">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              MAKROSKŁADNIKI
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Węglowodany
              </p>
              <p className="text-lg font-semibold text-emerald-400">
                282.5{" "}
                <span className="text-[11px] font-normal text-slate-300">g</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Białko
              </p>
              <p className="text-lg font-semibold text-sky-400">
                162.8{" "}
                <span className="text-[11px] font-normal text-slate-300">g</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Tłuszcze
              </p>
              <p className="text-lg font-semibold text-rose-400">
                73.2{" "}
                <span className="text-[11px] font-normal text-slate-300">g</span>
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Suma kalorii
            </p>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500" />
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Węglowodany:{" "}
                <span className="font-semibold text-emerald-300">
                  1129.8 kcal
                </span>
              </span>
              <span>
                Białko:{" "}
                <span className="font-semibold text-sky-300">651.2 kcal</span>
              </span>
              <span>
                Tłuszcze:{" "}
                <span className="font-semibold text-rose-300">658.7 kcal</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="relative h-40 w-40 md:h-48 md:w-48">
            <div className="absolute inset-0 rounded-full border-[10px] border-slate-800" />
            <div className="absolute inset-1 rounded-full border-[10px] border-emerald-500/60 border-r-transparent border-b-transparent rotate-[40deg]" />
            <div className="absolute inset-3 rounded-full border-[10px] border-rose-500/70 border-l-transparent border-t-transparent -rotate-[10deg]" />
            <div className="absolute inset-6 flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950/90">
              <p className="text-[11px] uppercase tracking-wide text-rose-300">
                Redukcja
              </p>
              <p className="mt-1 text-3xl font-semibold text-slate-50">-15%</p>
              <p className="mt-1 px-4 text-center text-[11px] text-slate-400">
                2433 kcal przyjęte vs. <br />
                zapotrzebowanie
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 text-xs text-slate-200 md:grid-cols-[2.2fr_1.2fr]">
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Zawartość węglowodanów w diecie
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-[46%] bg-emerald-400" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Zawartość białka w diecie
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-[26%] bg-sky-400" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Zawartość tłuszczów w diecie
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-[27%] bg-rose-400" />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Ilość makroskładników na 1 kg masy ciała
          </p>
          <div className="space-y-2">
            <p>
              Ilość węglowodanów:{" "}
              <span className="font-semibold text-emerald-300">3.5 g</span>
            </p>
            <p>
              Ilość białka:{" "}
              <span className="font-semibold text-sky-300">2.0 g</span>
            </p>
            <p>
              Ilość tłuszczów:{" "}
              <span className="font-semibold text-rose-300">0.9 g</span>
            </p>
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

function NutritionTipsSection() {
  const tips = [
    {
      title: "Woda",
      desc: "Pamiętaj o podstawowej ilości wody, wypijanej przy nawodnieniu organizmu.",
    },
    {
      title: "Ważenie posiłków",
      desc: "Produkty waż przed obróbką termiczną, zawsze w tej samej formie, aby łatwiej było kontrolować ilości.",
    },
    {
      title: "Przyrządzanie posiłków",
      desc: "Do smażenia używaj tłuszczy, które masz wpisane w planie. Unikaj przypadkowego dodawania dodatkowych kalorii.",
    },
    {
      title: "Czego unikać",
      desc: "Słodycze, alkohol i podjadanie między posiłkami potrafią bardzo szybko zepsuć deficyt kaloryczny.",
    },
    {
      title: "Ostatni posiłek",
      desc: "Nie musisz jeść bardzo wcześnie – ważniejsze jest to, aby nie robić wielogodzinnych przerw od ostatniego posiłku do snu.",
    },
    {
      title: "Shake",
      desc: "Do każdego shake’a dodawaj mleko lub napój roślinny zgodnie z planem – traktuj go jako pełnoprawny posiłek.",
    },
    {
      title: "Przyprawy",
      desc: "Używaj dowolnych przypraw, unikając tylko nadmiaru cukru i tłuszczu. Ostre przyprawy mogą wspierać termogenezę.",
    },
  ];

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

function MealsVariantsSection() {
  const mealTabs = [
    "Śniadanie",
    "II śniadanie",
    "Obiad",
    "Przekąska",
    "Podwieczorek",
    "Kolacja",
  ];

  const variants = [
    "Jajka sadzone",
    "Placki białkowe",
    "Łosoś pieczony",
    "Jajecznica",
  ];

  const [activeMeal, setActiveMeal] = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
          POSIŁKI I WARIANTY
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Wybierz dla siebie posiłki wraz z wariantem przygotowania, które chcesz
          jeść. W przyszłości trener wypełni ten ekran konkretnymi propozycjami
          dań dla każdego posiłku.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200">
        <div className="flex flex-wrap gap-2">
          {mealTabs.map((label, idx) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveMeal(idx)}
              className={`flex-1 min-w-[90px] rounded-lg px-4 py-2 text-center uppercase tracking-wide ${
                activeMeal === idx
                  ? "bg-sky-500 text-slate-950 font-semibold shadow-[0_0_18px_rgba(56,189,248,0.6)]"
                  : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {variants.map((v, idx) => (
            <button
              key={v}
              type="button"
              onClick={() => setActiveVariant(idx)}
              className={`rounded-full px-4 py-1.5 text-[11px] ${
                activeVariant === idx
                  ? "bg-sky-500 text-slate-950 font-semibold"
                  : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-[1.7fr_1.3fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80">
            <div className="h-56 w-full bg-[url('https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center" />
          </div>

          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="self-start text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              WARTOŚCI ODŻYWCZE (DEMO)
            </p>
            <div className="relative h-40 w-40">
              <div className="absolute inset-0 rounded-full border-[10px] border-slate-800" />
              <div className="absolute inset-1 rounded-full border-[10px] border-emerald-500/80 border-r-transparent border-b-transparent rotate-[30deg]" />
              <div className="absolute inset-3 rounded-full border-[10px] border-sky-500/80 border-l-transparent border-b-transparent -rotate-[20deg]" />
              <div className="absolute inset-5 rounded-full border-[10px] border-amber-400/80 border-t-transparent border-r-transparent rotate-[15deg]" />
              <div className="absolute inset-10 flex flex-col items-center justify-center rounded-full bg-slate-950">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  375 kcal
                </p>
                <p className="mt-1 text-[11px] text-slate-300">
                  Węglowodany / Białko / Tłuszcze
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400">
            OPIS
          </p>
          <p>
            Tutaj trener opisze szczegóły przygotowania dania – ilości składników,
            sposób przygotowania, ewentualne zamienniki produktów oraz dodatkowe
            wskazówki (np. kiedy najlepiej zjeść ten posiłek w ciągu dnia).
          </p>
        </div>
      </section>
    </section>
  );
}

type Supplement = {
  id: string;
  name: string;
  type: string;
  shortDesc: string;
};

const SUPPLEMENTS: Supplement[] = [
  {
    id: "whey",
    name: "Odżywka białkowa – Balance Wild Protein",
    type: "Odżywka białkowa",
    shortDesc: "Koncentrat białka serwatkowego najwyższej jakości.",
  },
  {
    id: "creatine",
    name: "Creatine Mono",
    type: "Monohydrat kreatyny",
    shortDesc: "Wsparcie siły i wydolności mięśniowej.",
  },
  {
    id: "vitamins",
    name: "Vitamin D3 + K2",
    type: "Witaminy",
    shortDesc: "Wsparcie układu odpornościowego i kostnego.",
  },
  {
    id: "omega3",
    name: "Omega 3",
    type: "Kwasy tłuszczowe",
    shortDesc: "Wsparcie pracy serca i układu nerwowego.",
  },
];

function SupplementsSection() {
  const [activeId, setActiveId] = useState<string>("whey");
  const active = SUPPLEMENTS.find((s) => s.id === activeId) ?? SUPPLEMENTS[0];

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
                  Odżywkę stosuj zgodnie z ilościami podanymi w planie
                  dietetycznym. Zwykle 1–2 porcje dziennie po treningu lub jako
                  uzupełnienie brakującego białka.
                </p>
              </div>
              <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                  INFORMACJE O SUPLEMENCIE
                </p>
                <p className="text-[11px] text-slate-200">
                  W docelowej wersji tutaj trener opisze, dlaczego wybrał ten
                  produkt, na co zwracać uwagę przy stosowaniu oraz ewentualne
                  przeciwwskazania.
                </p>
              </div>
            </div>

            <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] text-slate-200">
              <p className="font-semibold text-slate-100">Opis suplementu:</p>
              <p>
                Tekst przykładowy – w przyszłości trener wypełni go konkretnymi
                informacjami o działaniu, składzie i korzyściach ze stosowania
                suplementu.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2 text-xs text-slate-200">
        {SUPPLEMENTS.map((s) => (
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

function HydrationSection() {
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

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-sm text-slate-200">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="h-0.5 w-8 bg-emerald-500" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              UWAGI OGÓLNE DO TWOJEGO NAWODNIENIA
            </p>
          </div>
          <p>
            Pij przede wszystkim wodę mineralną – nawodnia i jest źródłem cennych
            składników. W dalszej części planu trener może dopisać konkretne
            zalecenia co do ilości i rodzaju wody.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
            POZOSTAŁE NAPOJE
          </p>
          <ul className="list-disc space-y-1 pl-5 text-xs text-slate-200">
            <li>
              Kawa: bez cukru; mleko max 100 ml dziennie (do wszystkich kaw
              łącznie).
            </li>
            <li>
              Herbata: bez cukru; można dodać cytrynę – 1–2 filiżanki dziennie.
            </li>
            <li>
              Napoje zero/cola light – okazjonalnie, nie jako główne źródło
              płynów.
            </li>
            <li>
              Soki owocowe – traktuj raczej jako dodatek smakowy niż osobny
              napój.
            </li>
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
          PLAN TWOJEGO NAWODNIENIA (PRZYKŁAD)
        </p>
        <p className="text-center text-[11px] text-slate-400">
          1–28 DNI: Docelowo min. 2–2.5 litra płynów dziennie (woda + napoje bez
          kalorii).
        </p>

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

function TrainingSection() {
  const exercises = [
    {
      id: 1,
      name: "Pompki w wąskim podparciu",
      series: "4 x 8–12",
      workTime: "Seria do upadku mięśniowego",
      rest: "90 sek.",
    },
    {
      id: 2,
      name: "Przysiad bułgarski ze sztangielkami",
      series: "3 x 10–12",
      workTime: "Noga po nodze",
      rest: "90 sek.",
    },
    {
      id: 3,
      name: "Martwy ciąg na prostych nogach",
      series: "3 x 8–10",
      workTime: "Kontrola zejścia",
      rest: "120 sek.",
    },
    {
      id: 4,
      name: "Wiosłowanie hantlą w opadzie",
      series: "3 x 10–12",
      workTime: "Na stronę",
      rest: "90 sek.",
    },
    {
      id: 5,
      name: "Plank",
      series: "2 serie",
      workTime: "max",
      rest: "90 sek.",
    },
    {
      id: 6,
      name: "Aeroby / Cardio",
      series: "1 seria",
      workTime: "20 min",
      rest: "-",
    },
  ];

  const trainingDays = [
    { id: 1, label: "Dzień 1", status: "Treningowy" },
    { id: 2, label: "Dzień 2", status: "Treningowy" },
    { id: 3, label: "Dzień 3", status: "Aktywny" },
    { id: 4, label: "Dzień 4", status: "Treningowy" },
    { id: 5, label: "Dzień 5", status: "Treningowy" },
    { id: 6, label: "Dzień 6", status: "Aktywny" },
    { id: 7, label: "Dzień 7", status: "Odpoczynek" },
  ];

  const [activeDay, setActiveDay] = useState(1);

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="space-y-4">
        <h1 className="text-center text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-left md:text-4xl">
          PLAN TRENINGOWY
        </h1>
        <p className="max-w-3xl text-sm text-slate-300">
          Poniżej widzisz przykładowy dzień treningowy – kolejność ćwiczeń, ilość
          serii, czas pracy i przerwy. W przyszłości dane będą pochodziły z
          rzeczywistego planu od trenera.
        </p>

        <div className="mt-2 flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-2 text-xs text-slate-200">
          {trainingDays.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => setActiveDay(day.id)}
              className={`flex-1 min-w-[110px] rounded-lg px-4 py-2 text-left uppercase tracking-wide ${
                activeDay === day.id
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

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
            DZIEŃ TRENINGOWY – PRZYKŁAD
          </p>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300">
            Status:{" "}
            <span className="font-semibold text-emerald-400">Aktywny</span>
          </span>
        </div>

        <div className="space-y-3">
          {exercises.map((ex) => (
            <article
              key={ex.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex-1 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Ćwiczenie {ex.id}
                </p>
                <h2 className="text-sm font-semibold text-slate-50">
                  {ex.name}
                </h2>
              </div>

              <div className="grid flex-1 gap-2 text-[11px] text-slate-200 md:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-center">
                  <p className="text-slate-400">Serie</p>
                  <p className="mt-1 text-sm font-semibold text-slate-50">
                    {ex.series}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-center">
                  <p className="text-slate-400">Czas pracy</p>
                  <p className="mt-1 text-sm font-semibold text-slate-50">
                    {ex.workTime}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-center">
                  <p className="text-slate-400">Przerwa</p>
                  <p className="mt-1 text-sm font-semibold text-slate-50">
                    {ex.rest}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
          KOMENTARZ DO TRENINGU (DEMO)
        </p>
        <div className="space-y-2">
          {[
            "Serie rozgrzewkowe – co to jest?",
            "Superseria – co to jest?",
            "Seria łączona – co to jest?",
            "Gigantseria – co to jest?",
            "RPE – co to jest?",
            "MAX – co to jest?",
            "Tempo – co to jest?",
          ].map((label) => (
            <details
              key={label}
              className="group rounded-2xl border border-slate-800 bg-slate-950/80"
            >
              <summary className="flex cursor-pointer items-center justify-between px-4 py-2 text-[11px] font-semibold text-slate-200">
                {label}
                <span className="transition text-slate-500 group-open:rotate-180">
                  ˅
                </span>
              </summary>
              <div className="border-t border-slate-800 px-4 py-3 text-[11px] text-slate-300">
                Tu możesz dodać opis pojęcia – w wersji produkcyjnej trener
                wyjaśni dokładnie, jak wykonywać dane elementy planu.
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
    </section>
  );
}

function CateringSection() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
          Plan żywieniowy
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-50">
          Catering dietetyczny
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Miejsce na integrację z cateringiem dietetycznym: informacje o wybranej
          firmie, wariancie diety oraz wskazówki od trenera, jak z niego
          korzystać.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
        <p>
          Na ten moment to widok poglądowy. Możemy go później rozbudować o
          szczegóły współpracy z cateringiem, linki do zamówień czy informację,
          jak dopasować gotowe posiłki do planu.
        </p>
      </section>
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

function ChatSection() {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            Czat z trenerem (demo)
          </p>
          <p className="text-xs text-slate-300">
            W wersji produkcyjnej tutaj będzie lista wiadomości i szybkie
            odpowiedzi AI.
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <p className="text-[11px] text-slate-400">
          Na razie to tylko makieta – w przyszłości zobaczysz tu historię
          rozmów z trenerem, wpisy z raportów i podpowiedzi AI.
        </p>
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

