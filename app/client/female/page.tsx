'use client';

import { useEffect, useState } from "react";
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
} from "lucide-react";

type SectionId = "dashboard" | "plan" | "diet" | "progress" | "chat";

const bodyStats = [
  { label: "Wiek", value: "29", unit: "lat", icon: Timer },
  { label: "Waga", value: "62.5", unit: "kg", icon: Scale },
  { label: "Wzrost", value: "168", unit: "cm", icon: Ruler },
  { label: "Biceps", value: "27.0", unit: "cm" },
  { label: "Klatka", value: "88.0", unit: "cm" },
  { label: "Talia", value: "68.0", unit: "cm" },
  { label: "Biodra", value: "96.0", unit: "cm" },
  { label: "Uda", value: "56.0", unit: "cm" },
  { label: "Łydki", value: "33.0", unit: "cm" },
];

export default function ClientFemaleDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = window.localStorage.getItem("fitcoach_client_logged_in");
    const storedEmail = window.localStorage.getItem("fitcoach_client_email");

    if (loggedIn !== "true") {
      router.replace("/login");
      return;
    }

    setEmail(storedEmail);
    setReady(true);
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("fitcoach_client_logged_in");
      window.localStorage.removeItem("fitcoach_client_email");
    }
    router.push("/");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-200">Ładowanie panelu…</p>
      </div>
    );
  }

  const navItems: { id: SectionId; label: string; icon: any }[] = [
    { id: "dashboard", label: "Panel główny", icon: LayoutDashboard },
    { id: "plan", label: "Plan treningowy", icon: Dumbbell },
    { id: "diet", label: "Plan żywieniowy", icon: Utensils },
    { id: "progress", label: "Postępy", icon: LineChart },
    { id: "chat", label: "Czat z trenerem", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Lewy pasek nawigacji */}
      <aside className="hidden md:flex w-64 bg-slate-950/95 border-r border-slate-800 flex-col">
        <div className="h-16 px-5 flex items-center border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-pink-500 flex items-center justify-center text-slate-900 text-sm font-bold shadow-lg">
              FC
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">
                FitCoach AI
              </span>
              <span className="text-[11px] text-slate-400">
                Panel podopiecznej
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
                const active = item.id === activeSection;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? "bg-pink-500/90 text-slate-950 shadow-inner"
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
                  {email ?? "podopieczna@fitcoach.ai"}
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
            <p className="text-xs uppercase tracking-wide text-pink-400">
              Panel podopiecznej
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-slate-50">
              Twój trening i plan żywieniowy
            </h1>
          </div>
        </header>

        {activeSection === "dashboard" && <FemaleDashboardSection />}
        {activeSection === "plan" && <PlaceholderSection title="Plan treningowy" />}
        {activeSection === "diet" && <PlaceholderSection title="Plan żywieniowy" />}
        {activeSection === "progress" && <PlaceholderSection title="Postępy" />}
        {activeSection === "chat" && <PlaceholderSection title="Czat z trenerem" />}
      </main>
    </div>
  );
}

function FemaleDashboardSection() {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
      {/* Karta z sylwetką i BMI */}
      <div className="space-y-4 rounded-2xl border border-pink-500/40 bg-slate-900/80 p-4 shadow-[0_0_40px_rgba(244,114,182,0.25)]">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Panel boczny */}
          <div className="flex w-full flex-col gap-3 lg:w-40">
            <div className="rounded-2xl border border-pink-500/40 bg-gradient-to-b from-pink-950/70 via-slate-950/80 to-slate-950/90 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-pink-200">
                Tryb
              </p>
              <p className="mt-1 text-xs text-slate-200">
                Trening online ze wsparciem trenera, dopasowany do Twojej
                sylwetki i celu.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Sekcje
              </p>
              <ul className="mt-2 space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-center justify-between">
                  <span>Wymiary</span>
                  <span className="h-1 w-8 rounded-full bg-pink-400/80" />
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

          {/* Sylwetka + BMI */}
          <div className="flex w-full flex-col items-center justify-center gap-4 lg:w-[260px]">
            <div className="relative flex h-72 w-full max-w-xs items-center justify-center">
              <div className="absolute inset-8 rounded-[999px] bg-pink-500/20 blur-3xl" />
              <div className="relative flex h-72 w-36 items-center justify-center">
                <div className="absolute bottom-6 h-40 w-28 rounded-full bg-gradient-to-t from-pink-500/25 via-pink-400/10 to-transparent blur-2xl" />
                <img
                  src="/body-female.png"
                  alt="Sylwetka podopiecznej"
                  className="relative h-64 w-auto object-contain"
                />
              </div>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Twoje BMI
              </p>
              <p className="text-3xl font-semibold text-pink-300">23.1</p>
              <p className="text-xs text-slate-400">
                Zakres prawidłowy – szczegóły omówisz z trenerem
              </p>
            </div>
          </div>

          {/* Krótki opis planu */}
          <div className="flex w-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs lg:w-52">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Twój plan
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-50">
                Modelowanie sylwetki – 10 tygodni
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Aktualny etap: tydzień 3 z 10.
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-slate-900/80 p-3">
              <p className="text-[11px] text-slate-400">Do końca planu:</p>
              <p className="mt-1 text-2xl font-semibold text-pink-300">49 dni</p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-[30%] rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-500" />
              </div>
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
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] text-pink-300">
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

      {/* Prawa kolumna – zadania na dziś */}
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-pink-300">
              Dzisiejszy plan
            </p>
            <p className="text-xs text-slate-300">
              Zrealizuj trening, wypełnij raport i dodaj krótką notatkę dla
              trenera.
            </p>
          </div>
          <button className="rounded-full bg-pink-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-pink-400">
            Wyślij raport
          </button>
        </div>
        <ol className="space-y-2 text-xs text-slate-200">
          <li>1. Zapoznaj się z planem na dziś.</li>
          <li>2. Wykonaj trening lub aktywny spacer zgodnie z zaleceniami.</li>
          <li>3. Zapisz, jak się czułaś i co wymagało korekty.</li>
        </ol>
      </div>
    </section>
  );
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200">
      <h2 className="text-sm font-semibold text-slate-50 mb-2">{title}</h2>
      <p className="text-xs text-slate-300">
        Ta sekcja w wersji kobiecej panelu jest na razie w przygotowaniu. Układ
        i funkcje będą takie same jak w głównym panelu, tylko w kolorystyce
        dopasowanej do tego widoku.
      </p>
    </section>
  );
}

