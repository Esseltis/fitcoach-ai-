"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getClientProfile,
  saveClientProfile,
  EMPTY_CLIENT_PROFILE,
  PROFILE_OPTIONS,
  type ClientProfile,
} from "@/lib/store";

// Profesjonalna ankieta wstępna (intake) — sekcje jak w standardowych
// formularzach PT: dane, cele, wywiad zdrowotny, trening, żywienie,
// regeneracja, dyspozycyjność i oczekiwania wobec trenera.
// Wybory jednokrotne = pigułki (radio) — lepsze na mobile niż natywne
// selecty i spójne z resztą aplikacji.

function Chip({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        on
          ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
          : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-slate-200"
      }`}
    >
      {on ? "✓ " : ""}
      {label}
    </button>
  );
}

/** Grupa wyboru jednokrotnego w formie pilek (radiogroup). */
function Pills({
  name,
  value,
  onChange,
  options,
  required = false,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: string[] | { value: string; label: string }[];
  required?: boolean;
}) {
  const opts = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {opts.map((o) => {
        const on = value === o.value;
        return (
          <label
            key={o.value}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              on
                ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
                : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-slate-200"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={on}
              required={required}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {on ? "✓ " : ""}
            {o.label}
          </label>
        );
      })}
    </div>
  );
}

function Fieldset({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <legend className="px-1">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] text-emerald-300">
            {n}
          </span>
          {title}
        </span>
        {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
      </legend>
      {children}
    </fieldset>
  );
}

// Komponenty pól MUSZĄ być na poziomie modułu — zdefiniowane wewnątrz
// rendera remountowałyby się przy każdej zmianie i gubiły fokus.
const inputCls =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400";
const labelCls = "block space-y-1";
const labelText = "text-[11px] font-medium text-slate-300";

const Text = ({
  value,
  onChange,
  placeholder,
  required,
  type = "number",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) => (
  <input
    className={inputCls}
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    required={required}
  />
);

const Area = ({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) => (
  <textarea
    className={inputCls}
    rows={rows}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
  />
);

export default function ClientProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState<ClientProfile>({ ...EMPTY_CLIENT_PROFILE });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loggedIn = window.localStorage.getItem("fitcoach_client_logged_in");
    const storedEmail = window.localStorage.getItem("fitcoach_client_email");
    const trainerId = window.localStorage.getItem("fitcoach_client_trainer_id");
    if (loggedIn !== "true" || !storedEmail || !trainerId) {
      router.replace("/login");
      return;
    }
    setEmail(storedEmail);
    const existing = getClientProfile(storedEmail);
    if (existing) setF({ ...EMPTY_CLIENT_PROFILE, ...existing });
    setReady(true);
  }, [router]);

  const set = (patch: Partial<ClientProfile>) =>
    setF((p) => ({ ...p, ...patch }));
  const toggleArr = (
    key: "healthConditions" | "painPoints" | "availableDays",
    v: string
  ) =>
    setF((p) => ({
      ...p,
      [key]: p[key].includes(v)
        ? p[key].filter((x) => x !== v)
        : [...p[key], v],
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    saveClientProfile(email, {
      ...f,
      submittedAt: new Date().toISOString(),
    });
    setSaved(true);
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-200">Ładowanie...</p>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md space-y-5 rounded-2xl border border-emerald-500/40 bg-slate-900/80 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl">
            ✓
          </div>
          <h1 className="text-lg font-semibold text-slate-50">
            Raport wstępny wysłany!
          </h1>
          <p className="text-sm text-slate-400">
            Twój trener dostał pełny wywiad — na jego podstawie ułoży plan
            treningowy i żywieniowy.
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <Link
              href="/client/raport"
              className="inline-block rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Wyślij raport dzienny
            </Link>
            <Link
              href="/client"
              className="inline-block rounded-full border border-slate-700 px-6 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Przejdź do panelu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Krok 1 · Raport wstępny (intake)
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
            Pełny wywiad przed rozpoczęciem
          </h1>
          <p className="mx-auto max-w-lg text-sm text-slate-400">
            Im więcej szczegółów podasz, tym dokładniejszy plan ułoży trener —
            zdrowie, cele, tryb życia i dyspozycyjność mają znaczenie.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Dane osobiste */}
          <Fieldset n={1} title="Dane osobiste i parametry">
            <div className="space-y-1.5">
              <span className={labelText}>Twój cel *</span>
              <Pills
                name="goal"
                value={f.goal}
                onChange={(v) => set({ goal: v })}
                options={PROFILE_OPTIONS.goals}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <span className={labelText}>Płeć</span>
                <Pills
                  name="gender"
                  value={f.gender}
                  onChange={(v) => set({ gender: v })}
                  options={[
                    { value: "mężczyzna", label: "Mężczyzna" },
                    { value: "kobieta", label: "Kobieta" },
                  ]}
                />
              </div>
              <label className={labelCls}>
                <span className={labelText}>Telefon (opcjonalnie)</span>
                <Text
                  type="tel"
                  value={f.phone}
                  onChange={(v) => set({ phone: v })}
                  placeholder="np. 600 100 200"
                />
              </label>
              <label className={labelCls}>
                <span className={labelText}>Wiek (lata) *</span>
                <Text value={f.age} onChange={(v) => set({ age: v })} placeholder="np. 32" required />
              </label>
              <label className={labelCls}>
                <span className={labelText}>Waga (kg) *</span>
                <Text value={f.weight} onChange={(v) => set({ weight: v })} placeholder="np. 81" required />
              </label>
              <label className={labelCls}>
                <span className={labelText}>Wzrost (cm) *</span>
                <Text value={f.height} onChange={(v) => set({ height: v })} placeholder="np. 173" required />
              </label>
            </div>
            <div className="space-y-1.5">
              <span className={labelText}>Aktywność fizyczna *</span>
              <Pills
                name="activity"
                value={f.activity}
                onChange={(v) => set({ activity: v })}
                options={PROFILE_OPTIONS.activities}
                required
              />
            </div>
            <div className="space-y-1.5">
              <span className={labelText}>Tryb pracy</span>
              <Pills
                name="occupation"
                value={f.occupation}
                onChange={(v) => set({ occupation: v })}
                options={PROFILE_OPTIONS.occupations}
              />
            </div>
          </Fieldset>

          {/* 2. Cele */}
          <Fieldset
            n={2}
            title="Cele i motywacja"
            hint="Określ, co chcesz osiągnąć i kiedy — trener ustali na tym podstawie periodyzację."
          >
            <label className={labelCls}>
              <span className={labelText}>Cel krótkoterminowy (2–3 miesiące)</span>
              <Text
                type="text"
                value={f.goalShort}
                onChange={(v) => set({ goalShort: v })}
                placeholder="np. zejść do 75 kg i przebiec 5 km bez przerwy"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelCls}>
                <span className={labelText}>Cel długoterminowy (6–12 miesięcy)</span>
                <Text
                  type="text"
                  value={f.goalLong}
                  onChange={(v) => set({ goalLong: v })}
                  placeholder="np. 10% masy ciała mniej, DEADLIFT 140 kg"
                />
              </label>
              <label className={labelCls}>
                <span className={labelText}>Termin realizacji</span>
                <Text
                  type="text"
                  value={f.goalDeadline}
                  onChange={(v) => set({ goalDeadline: v })}
                  placeholder="np. do wakacji / do 30.06"
                />
              </label>
            </div>
            <label className={labelCls}>
              <span className={labelText}>Wyznacznik sukcesu — jak poznasz, że się udało?</span>
              <Text
                type="text"
                value={f.successMeasure}
                onChange={(v) => set({ successMeasure: v })}
                placeholder="np. rozmiar 32 w spodniach, zdjęcie porównawcze, rekordy na siłowni"
              />
            </label>
            <label className={labelCls}>
              <span className={labelText}>Motywacja — dlaczego chcesz to zmienić?</span>
              <Area
                value={f.motivation}
                onChange={(v) => set({ motivation: v })}
                placeholder="np. zdrowie, energia do zabawy z dziećmi, powrót do formy po urlopie macierzyńskim…"
              />
            </label>
          </Fieldset>

          {/* 3. Zdrowie / PAR-Q */}
          <Fieldset
            n={3}
            title="Zdrowie i bezpieczeństwo (PAR-Q)"
            hint="Wywiad zdrowotny — trener musi wiedzieć, czego unikać w Twoim planie."
          >
            <div className="space-y-1.5">
              <span className={labelText}>Zgoda lekarza na wysiłek</span>
              <Pills
                name="medicalClearance"
                value={f.medicalClearance}
                onChange={(v) => set({ medicalClearance: v })}
                options={PROFILE_OPTIONS.medicalClearance}
              />
            </div>
            <div className="space-y-1.5">
              <span className={labelText}>
                Objawy przy wysiłku (ból w klatce, zawroty, duszność)?
              </span>
              <Pills
                name="exertionSymptoms"
                value={f.exertionSymptoms}
                onChange={(v) => set({ exertionSymptoms: v })}
                options={["Nie", "Tak"]}
              />
            </div>

            <div>
              <span className={labelText}>Choroby przewlekłe (zaznacz wszystkie)</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {PROFILE_OPTIONS.healthConditions.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    on={f.healthConditions.includes(c)}
                    onClick={() => toggleArr("healthConditions", c)}
                  />
                ))}
              </div>
            </div>

            <div>
              <span className={labelText}>Dolegliwości bólowe (zaznacz wszystkie)</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {PROFILE_OPTIONS.painPoints.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    on={f.painPoints.includes(c)}
                    onClick={() => toggleArr("painPoints", c)}
                  />
                ))}
              </div>
            </div>

            <label className={labelCls}>
              <span className={labelText}>Kontuzje, operacje, przewlekłe urazy</span>
              <Area
                value={f.injuries}
                onChange={(v) => set({ injuries: v })}
                placeholder="np. zerwane więzadło w kolanie (2022), przepuklina L4-L5, zespół cieśni nadgarstka…"
              />
            </label>
            <label className={labelCls}>
              <span className={labelText}>Przyjmowane leki</span>
              <Text
                type="text"
                value={f.medications}
                onChange={(v) => set({ medications: v })}
                placeholder='np. na nadciśnienie / tarczycę — lub „brak”'
              />
            </label>
            <label className={labelCls}>
              <span className={labelText}>Zdrowie / przeciwwskazania (dodatkowo)</span>
              <Area
                value={f.healthNotes}
                onChange={(v) => set({ healthNotes: v })}
                placeholder="np. cukrzyca typu 2, astma wysiłkowa, ciąża…"
              />
            </label>
            <label className="flex items-start gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-emerald-500"
                checked={f.parqConsent === "tak"}
                required
                onChange={(e) =>
                  set({ parqConsent: e.target.checked ? "tak" : "" })
                }
              />
              <span>
                Oświadczam, że stan mojego zdrowia pozwala na udział w
                treningach, a podane wyżej informacje są zgodne z prawdą. *
              </span>
            </label>
          </Fieldset>

          {/* 4. Trening */}
          <Fieldset n={4} title="Historia treningowa">
            <div className="space-y-1.5">
              <span className={labelText}>Doświadczenie w treningu</span>
              <Pills
                name="trainingExp"
                value={f.trainingExp}
                onChange={(v) => set({ trainingExp: v })}
                options={PROFILE_OPTIONS.experiences}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelCls}>
                <span className={labelText}>Treningi w tygodniu *</span>
                <Text
                  value={f.trainingFrequency}
                  onChange={(v) => set({ trainingFrequency: v })}
                  placeholder="np. 4"
                  required
                />
              </label>
              <label className={labelCls}>
                <span className={labelText}>Nielubiane / wykluczone ćwiczenia</span>
                <Text
                  type="text"
                  value={f.dislikedExercises}
                  onChange={(v) => set({ dislikedExercises: v })}
                  placeholder="np. przysiad ze sztangą, martwy ciąg"
                />
              </label>
            </div>
            <div className="space-y-1.5">
              <span className={labelText}>Dostęp do sprzętu</span>
              <Pills
                name="gymAccess"
                value={f.gymAccess}
                onChange={(v) => set({ gymAccess: v })}
                options={PROFILE_OPTIONS.gymAccess}
              />
            </div>
            <div className="space-y-1.5">
              <span className={labelText}>Preferowany tryb treningu</span>
              <Pills
                name="trainingMode"
                value={f.trainingMode}
                onChange={(v) => set({ trainingMode: v })}
                options={PROFILE_OPTIONS.trainingModes}
              />
            </div>
            <label className={labelCls}>
              <span className={labelText}>Uprawiane dotąd sporty / aktywności</span>
              <Area
                value={f.sportsHistory}
                onChange={(v) => set({ sportsHistory: v })}
                placeholder="np. piłka nożna 10 lat, bieganie rekreacyjne, nic od liceum…"
              />
            </label>
          </Fieldset>

          {/* 5. Żywienie */}
          <Fieldset n={5} title="Żywienie i nawyki">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelCls}>
                <span className={labelText}>Posiłki dziennie *</span>
                <Text
                  value={f.mealsPerDay}
                  onChange={(v) => set({ mealsPerDay: v })}
                  placeholder="np. 5"
                  required
                />
              </label>
              <label className={labelCls}>
                <span className={labelText}>Woda (litry / dzień)</span>
                <Text
                  value={f.waterLiters}
                  onChange={(v) => set({ waterLiters: v })}
                  placeholder="np. 2.0"
                />
              </label>
            </div>
            <div className="space-y-1.5">
              <span className={labelText}>Gotowanie w domu</span>
              <Pills
                name="cooking"
                value={f.cooking}
                onChange={(v) => set({ cooking: v })}
                options={PROFILE_OPTIONS.cooking}
              />
            </div>
            <div className="space-y-1.5">
              <span className={labelText}>Śniadanie</span>
              <Pills
                name="breakfast"
                value={f.breakfast}
                onChange={(v) => set({ breakfast: v })}
                options={["Tak", "Nie", "Raz na jakiś czas"]}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <span className={labelText}>Kawa</span>
                <Pills
                  name="coffee"
                  value={f.coffee}
                  onChange={(v) => set({ coffee: v })}
                  options={PROFILE_OPTIONS.frequencies}
                />
              </div>
              <div className="space-y-1.5">
                <span className={labelText}>Alkohol</span>
                <Pills
                  name="alcohol"
                  value={f.alcohol}
                  onChange={(v) => set({ alcohol: v })}
                  options={PROFILE_OPTIONS.frequencies}
                />
              </div>
              <div className="space-y-1.5">
                <span className={labelText}>Papierosy / nikotyna</span>
                <Pills
                  name="smoking"
                  value={f.smoking}
                  onChange={(v) => set({ smoking: v })}
                  options={PROFILE_OPTIONS.frequencies}
                />
              </div>
              <div className="space-y-1.5">
                <span className={labelText}>Słodycze i przekąski</span>
                <Pills
                  name="sweets"
                  value={f.sweets}
                  onChange={(v) => set({ sweets: v })}
                  options={PROFILE_OPTIONS.frequencies}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelCls}>
                <span className={labelText}>Alergie / nietolerancje pokarmowe</span>
                <Text
                  type="text"
                  value={f.allergies}
                  onChange={(v) => set({ allergies: v })}
                  placeholder='np. laktoza, orzechy, gluten — lub „brak”'
                />
              </label>
              <label className={labelCls}>
                <span className={labelText}>Produkty, których nie jem / nie lubię</span>
                <Text
                  type="text"
                  value={f.dislikedFoods}
                  onChange={(v) => set({ dislikedFoods: v })}
                  placeholder="np. ryby, tłuste mięso, grzyby"
                />
              </label>
            </div>
            <label className={labelCls}>
              <span className={labelText}>Preferencje / uwagi żywieniowe</span>
              <Area
                value={f.preferences}
                onChange={(v) => set({ preferences: v })}
                placeholder="np. nie jem wieprzowiny, lubię ryby, jem w restauracji 3× w tygodniu…"
              />
            </label>
          </Fieldset>

          {/* 6. Regeneracja */}
          <Fieldset n={6} title="Regeneracja i tryb życia">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className={labelCls}>
                <span className={labelText}>Sen (h / noc)</span>
                <Text value={f.sleepHours} onChange={(v) => set({ sleepHours: v })} placeholder="np. 7" />
              </label>
              <label className={labelCls}>
                <span className={labelText}>Pora snu</span>
                <Text
                  type="text"
                  value={f.sleepTime}
                  onChange={(v) => set({ sleepTime: v })}
                  placeholder="np. 23:00"
                />
              </label>
              <label className={labelCls}>
                <span className={labelText}>Kroki / dzień</span>
                <Text value={f.stepsPerDay} onChange={(v) => set({ stepsPerDay: v })} placeholder="np. 6000" />
              </label>
            </div>
            <div className="space-y-1.5">
              <span className={labelText}>Poziom stresu (1 = niski … 5 = bardzo wysoki)</span>
              <Pills
                name="stressLevel"
                value={f.stressLevel}
                onChange={(v) => set({ stressLevel: v })}
                options={PROFILE_OPTIONS.stressLevels}
              />
            </div>
          </Fieldset>

          {/* 7. Dyspozycyjność */}
          <Fieldset
            n={7}
            title="Dyspozycyjność"
            hint="Zaznacz dni, w których możesz ćwiczyć — plan dnia kalendarza i treningi będą pod to ułożone."
          >
            <div className="flex flex-wrap gap-2">
              {PROFILE_OPTIONS.days.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  on={f.availableDays.includes(d)}
                  onClick={() => toggleArr("availableDays", d)}
                />
              ))}
            </div>
            <div className="space-y-1.5">
              <span className={labelText}>Preferowana pora treningu</span>
              <Pills
                name="preferredTime"
                value={f.preferredTime}
                onChange={(v) => set({ preferredTime: v })}
                options={PROFILE_OPTIONS.preferredTimes}
              />
            </div>
          </Fieldset>

          {/* 8. Oczekiwania */}
          <Fieldset n={8} title="Oczekiwania wobec trenera">
            <label className={labelCls}>
              <span className={labelText}>Czego oczekujesz od współpracy?</span>
              <Area
                value={f.expectations}
                onChange={(v) => set({ expectations: v })}
                placeholder="np. cotygodniowy kontakt, jasne wytyczne, korekta planu co 4 tygodnie, motywacja…"
                rows={3}
              />
            </label>
            <label className={labelCls}>
              <span className={labelText}>Dodatkowe uwagi</span>
              <Area
                value={f.comments}
                onChange={(v) => set({ comments: v })}
                placeholder="Wszystko, co jeszcze powinien wiedzieć Twój trener…"
              />
            </label>
          </Fieldset>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Wyślij raport wstępny do trenera
            </button>
            <Link
              href="/client"
              className="rounded-full border border-slate-700 px-6 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Wróć do panelu
            </Link>
            <p className="text-[11px] text-slate-500">* pola wymagane</p>
          </div>
        </form>
      </main>
    </div>
  );
}