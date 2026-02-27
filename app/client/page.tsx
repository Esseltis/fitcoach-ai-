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

type SectionId = "dashboard" | "plan" | "diet" | "progress" | "chat";

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
                const active = isDashboard && activeSection === "dashboard";
                const disabled = !hasTrainer && item.id !== "dashboard";
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (disabled) return;
                      if (isDashboard) {
                        setActiveSection("dashboard");
                        return;
                      }
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
        ) : (
          <>
            {activeSection === "dashboard" && <DashboardSection />}
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

function DashboardSection() {
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
              <ul className="mt-2 space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-center justify-between">
                  <span>Wymiary</span>
                  <span className="h-1 w-8 rounded-full bg-emerald-500/70" />
                </li>
                <li className="flex items-center justify-between">
                  <span>Statystyki</span>
                  <span className="h-1 w-8 rounded-full bg-slate-700" />
                </li>
                <li className="flex items-center justify-between">
                  <span>Postępy</span>
                  <span className="h-1 w-8 rounded-full bg-slate-700" />
                </li>
              </ul>
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
  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            Postępy
          </p>
          <p className="text-xs text-slate-300">
            Przykładowy widok – w przyszłości wykresy i zdjęcia progresu.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Waga (przykład)
          </p>
          <div className="h-32 rounded-xl bg-slate-950/80 border border-slate-800 flex items-end gap-1 px-2 pb-2">
            {["108", "104", "101", "99", "97"].map((v, i) => (
              <div
                key={v}
                className="flex-1 flex flex-col items-center justify-end gap-1"
              >
                <div
                  className={`w-5 rounded-t-full ${
                    i === 0
                      ? "h-24 bg-slate-700"
                      : "h-16 bg-emerald-500/80"
                  }`}
                />
                <span className="text-[9px] text-slate-500">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Obwody (przykład)
          </p>
          <ul className="space-y-1 text-[11px] text-slate-300">
            <li>• Pas: -4.5 cm</li>
            <li>• Brzuch: -3.0 cm</li>
            <li>• Uda: -2.0 cm</li>
            <li>• Klata: +1.5 cm</li>
          </ul>
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

