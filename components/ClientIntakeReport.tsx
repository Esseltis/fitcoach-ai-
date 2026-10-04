"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  PROFILE_OPTIONS,
  type ClientProfile,
} from "@/lib/store";

// Profesjonalny raport wstępny (intake) — wzorowany na standardowych
// ankietach personal trainerów (dane osobiste → cele → PAR-Q → historia
// treningowa → żywienie → regeneracja → dyspozycyjność → oczekiwania).
// Wariant screen = ciemny UI trenera; wariant doc = biały dokument do PDF
// (renderowany przez portal poza divem print:hidden i sam wywołuje druk).

const actFactor = (activity: string) => {
  if (activity.startsWith("Brak")) return 1.2;
  if (activity.startsWith("Niska")) return 1.375;
  if (activity.startsWith("Umiarkowana")) return 1.55;
  if (activity.startsWith("Wysoka")) return 1.725;
  if (activity.startsWith("Bardzo")) return 1.9;
  return 1.375;
};

const bmiCategory = (bmi: number) => {
  if (bmi < 18.5) return { label: "Niedowaga", color: "text-sky-300" };
  if (bmi < 25) return { label: "Prawidłowa", color: "text-emerald-300" };
  if (bmi < 30) return { label: "Nadwaga", color: "text-amber-300" };
  return { label: "Otyłość", color: "text-red-300" };
};

const num = (s: string) => {
  const n = Number(String(s).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

type Flag = { text: string; level: "danger" | "warn" };

/** Czerwone / bursztynowe flagi z wywiadu zdrowotnego. */
function healthFlags(p: ClientProfile): Flag[] {
  const f: Flag[] = [];
  if (p.exertionSymptoms === "Tak")
    f.push({
      text: "Objawy przy wysiłku (ból w klatce, zawroty, duszność) — bezwzględna konsultacja lekarska przed treningiem.",
      level: "danger",
    });
  if (p.medicalClearance === "Nie wiem")
    f.push({
      text: "Brak wiedzy o zgodzie lekarza — zweryfikuj przed rozpoczęciem.",
      level: "warn",
    });
  if (p.healthConditions.length > 0)
    f.push({
      text: `Choroby przewlekłe: ${p.healthConditions.join(", ")} — dostosuj intensywność i monitoruj RIR/HR.`,
      level: "warn",
    });
  if (p.injuries.trim())
    f.push({
      text: `Kontuzje / operacje: ${p.injuries.trim()} — wyeliminuj ćwiczenia obciążające tę strukturę.`,
      level: "warn",
    });
  if (p.painPoints.length > 0)
    f.push({
      text: `Dolegliwości bólowe: ${p.painPoints.join(", ")}.`,
      level: "warn",
    });
  const meds = p.medications.trim();
  if (meds && !/^(brak|nie|nic|—|-|\/)$/i.test(meds))
    f.push({
      text: `Leki: ${meds} — np. leki modyfikujące tętno/ciśnienie wpływają na strefy wysiłku.`,
      level: "warn",
    });
  return f;
}

/** Lista wypełnianych pól do paska kompletności ankiety. */
function completeness(p: ClientProfile): number {
  const s = (v: string) => (v.trim() ? 1 : 0);
  const a = (v: string[]) => (v.length ? 1 : 0);
  const checks = [
    s(p.goal), s(p.age), s(p.weight), s(p.height), s(p.activity),
    s(p.occupation), s(p.goalShort), s(p.goalLong), s(p.goalDeadline),
    s(p.motivation), s(p.successMeasure), s(p.medicalClearance),
    a(p.healthConditions), s(p.injuries), a(p.painPoints),
    s(p.exertionSymptoms), s(p.trainingExp), s(p.sportsHistory),
    s(p.gymAccess), s(p.trainingFrequency), s(p.mealsPerDay),
    s(p.allergies), s(p.cooking), s(p.waterLiters), s(p.sleepHours),
    s(p.stressLevel), s(p.stepsPerDay), a(p.availableDays),
    s(p.preferredTime), s(p.trainingMode), s(p.expectations),
    s(p.parqConsent),
  ];
  return Math.round((checks.reduce((x, y) => x + y, 0) / checks.length) * 100);
}

// ————————————————————————————————————————————————
// Pomocnicze bloki treści (wspólne dla screen i doc)
// ————————————————————————————————————————————————

function analytics(p: ClientProfile) {
  const w = num(p.weight);
  const h = num(p.height);
  const age = num(p.age);
  const ok = w > 20 && h > 100 && age >= 13;
  const bmi = ok ? w / Math.pow(h / 100, 2) : NaN;
  const bmr = ok
    ? 10 * w + 6.25 * h - 5 * age + (p.gender === "kobieta" ? 161 : -5)
    : NaN;
  const tdee = ok ? Math.round(bmr * actFactor(p.activity)) : NaN;
  const goalFactor = p.goal.startsWith("Redukcja")
    ? 0.85
    : p.goal.startsWith("Masa")
    ? 1.1
    : 1;
  const target = ok ? Math.round((tdee * goalFactor) / 10) * 10 : NaN;
  return { bmi, bmr, tdee, target, ok };
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">
      {label}
    </p>
    <p className="mt-0.5 text-sm font-medium">{value || "—"}</p>
  </div>
);

const Chips = ({ items }: { items: string[] }) =>
  items.length ? (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span
          key={i}
          className="rounded-full border border-current/30 bg-black/5 px-2 py-0.5 text-[11px] font-medium"
        >
          {i}
        </span>
      ))}
    </div>
  ) : null;

/** Sekcja raportu — nagłówek + treść. `tone` steruje kolorami doc/screen. */
function Sec({
  n,
  title,
  dark,
  children,
}: {
  n: number;
  title: string;
  dark: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border p-4 ${
        dark ? "border-slate-800 bg-slate-950/70" : "border-slate-300 bg-white"
      }`}
    >
      <h3
        className={`mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide ${
          dark ? "text-emerald-400" : "text-emerald-700"
        }`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
            dark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {n}
        </span>
        {title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

const Wide = ({ children }: { children: React.ReactNode }) => (
  <div className="sm:col-span-2">{children}</div>
);

function FlagsBlock({ flags, dark }: { flags: Flag[]; dark: boolean }) {
  if (!flags.length)
    return (
      <p
        className={`rounded-lg border px-3 py-2 text-xs font-medium ${
          dark
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            : "border-emerald-300 bg-emerald-50 text-emerald-700"
        }`}
      >
        ✓ Brak ostrzeżeń w wywiadzie zdrowotnym — gotowy do ustalenia planu.
      </p>
    );
  return (
    <div className="space-y-2">
      {flags.map((f) => (
        <p
          key={f.text}
          className={`rounded-lg border px-3 py-2 text-xs font-medium ${
            f.level === "danger"
              ? dark
                ? "border-red-500/50 bg-red-500/10 text-red-300"
                : "border-red-300 bg-red-50 text-red-700"
              : dark
              ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
              : "border-amber-300 bg-amber-50 text-amber-800"
          }`}
        >
          {f.level === "danger" ? "🛑 " : "⚠️ "}
          {f.text}
        </p>
      ))}
    </div>
  );
}

function Metrics({
  p,
  dark,
}: {
  p: ClientProfile;
  dark: boolean;
}) {
  const { bmi, tdee, target, ok } = analytics(p);
  const cat = ok ? bmiCategory(bmi) : null;
  const cell = dark
    ? "rounded-lg border border-slate-800 bg-slate-900/60 p-3"
    : "rounded-lg border border-slate-300 bg-slate-50 p-3";
  const lab = dark ? "text-[10px] uppercase text-slate-500" : "text-[10px] uppercase text-slate-500";
  const val = dark ? "text-lg font-bold text-slate-50" : "text-lg font-bold text-slate-900";
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <div className={cell}>
        <p className={lab}>BMI</p>
        <p className={val}>
          {ok ? bmi.toFixed(1) : "—"}
          {cat && (
            <span className={`ml-1 text-[11px] font-semibold ${cat.color}`}>
              {cat.label}
            </span>
          )}
        </p>
      </div>
      <div className={cell}>
        <p className={lab}>Szac. TDEE</p>
        <p className={val}>
          {ok ? tdee : "—"} <span className="text-[11px] font-medium">kcal</span>
        </p>
      </div>
      <div className={cell}>
        <p className={lab}>Cel kaloryczny</p>
        <p className={val}>
          {ok ? target : "—"} <span className="text-[11px] font-medium">kcal</span>
        </p>
      </div>
      <div className={cell}>
        <p className={lab}>Treningi / tydz.</p>
        <p className={val}>{p.trainingFrequency || "—"}</p>
      </div>
    </div>
  );
}

function Body({ p, dark }: { p: ClientProfile; dark: boolean }) {
  const flags = healthFlags(p);
  const pct = completeness(p);
  const text = dark ? "text-slate-200" : "text-slate-800";
  return (
    <div className={`space-y-3 ${text}`}>
      {/* 1. Tożsamość + cele w skrócie */}
      <div
        className={`rounded-xl border p-4 ${
          dark ? "border-emerald-500/40 bg-emerald-500/5" : "border-emerald-300 bg-emerald-50"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p
              className={`text-[10px] font-semibold uppercase tracking-wide ${
                dark ? "text-emerald-300" : "text-emerald-700"
              }`}
            >
              Cel główny
            </p>
            <p className="text-lg font-bold">{p.goal || "—"}</p>
          </div>
          <div className="text-right">
            <p className={`text-[10px] uppercase ${dark ? "text-slate-400" : "text-slate-500"}`}>
              Kompletność ankiety
            </p>
            <p className="text-lg font-bold">{pct}%</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Row label="Wiek" value={p.age ? `${p.age} lat` : ""} />
          <Row
            label="Płeć"
            value={
              p.gender
                ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1)
                : ""
            }
          />
          <Row label="Waga" value={p.weight ? `${p.weight} kg` : ""} />
          <Row label="Wzrost" value={p.height ? `${p.height} cm` : ""} />
        </div>
      </div>

      <Metrics p={p} dark={dark} />

      {/* 2. Bezpieczeństwo */}
      <Sec n={1} title="Zdrowie i bezpieczeństwo (PAR-Q)" dark={dark}>
        <Row label="Zgoda lekarza" value={p.medicalClearance} />
        <Row label="Objawy przy wysiłku" value={p.exertionSymptoms} />
        <Wide>
          <p className="text-[10px] font-semibold uppercase opacity-60">
            Choroby przewlekłe
          </p>
          <Chips items={p.healthConditions} />
        </Wide>
        <Wide>
          <p className="text-[10px] font-semibold uppercase opacity-60">
            Dolegliwości bólowe
          </p>
          <Chips items={p.painPoints} />
        </Wide>
        <Wide>
          <Row
            label="Kontuzje / operacje / urazy"
            value={p.injuries}
          />
        </Wide>
        <Wide>
          <Row label="Przyjmowane leki" value={p.medications} />
        </Wide>
        <Wide>
          <p className="text-[10px] font-semibold uppercase opacity-60">
            Flagi wywiadu
          </p>
          <div className="mt-1">
            <FlagsBlock flags={flags} dark={dark} />
          </div>
        </Wide>
      </Sec>

      {/* 3. Cele */}
      <Sec n={2} title="Cele i motywacja" dark={dark}>
        <Wide>
          <Row label="Cel krótkoterminowy (do ~3 mies.)" value={p.goalShort} />
        </Wide>
        <Wide>
          <Row label="Cel długoterminowy (6–12 mies.)" value={p.goalLong} />
        </Wide>
        <Row label="Termin" value={p.goalDeadline} />
        <Row label="Wyznacznik sukcesu" value={p.successMeasure} />
        <Wide>
          <Row label="Motywacja — dlaczego?" value={p.motivation} />
        </Wide>
      </Sec>

      {/* 4. Historia treningowa */}
      <Sec n={3} title="Historia treningowa" dark={dark}>
        <Row label="Doświadczenie" value={p.trainingExp} />
        <Row label="Aktywność ogólna" value={p.activity} />
        <Row label="Dostęp do sprzętu" value={p.gymAccess} />
        <Row label="Preferowany tryb" value={p.trainingMode} />
        <Wide>
          <Row label="Uprawiane dotąd sporty" value={p.sportsHistory} />
        </Wide>
        <Wide>
          <Row label="Nielubiane / wykluczone ćwiczenia" value={p.dislikedExercises} />
        </Wide>
      </Sec>

      {/* 5. Żywienie */}
      <Sec n={4} title="Żywienie" dark={dark}>
        <Row label="Posiłki dziennie" value={p.mealsPerDay} />
        <Row label="Gotowanie" value={p.cooking} />
        <Row label="Alergie / nietolerancje" value={p.allergies} />
        <Row label="Produkty nielubiane" value={p.dislikedFoods} />
        <Row label="Śniadanie" value={p.breakfast} />
        <Row label="Woda (l / dzień)" value={p.waterLiters} />
        <Row label="Kawa" value={p.coffee} />
        <Row label="Alkohol" value={p.alcohol} />
        <Row label="Papierosy" value={p.smoking} />
        <Row label="Słodycze / przekąski" value={p.sweets} />
        <Wide>
          <Row label="Preferencje / wykluczenia żywieniowe" value={p.preferences} />
        </Wide>
      </Sec>

      {/* 6. Regeneracja */}
      <Sec n={5} title="Regeneracja i tryb życia" dark={dark}>
        <Row label="Sen (h / noc)" value={p.sleepHours} />
        <Row label="Pora snu" value={p.sleepTime} />
        <Row label="Poziom stresu (1–5)" value={p.stressLevel ? `${p.stressLevel}/5` : ""} />
        <Row label="Kroki / dzień" value={p.stepsPerDay} />
        <Row label="Tryb pracy" value={p.occupation} />
        <Row label="Poziom aktywności" value={p.activity} />
      </Sec>

      {/* 7. Dyspozycyjność */}
      <Sec n={6} title="Dyspozycyjność" dark={dark}>
        <Wide>
          <p className="text-[10px] font-semibold uppercase opacity-60">
            Dostępne dni treningowe
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {PROFILE_OPTIONS.days.map((d) => {
              const on = p.availableDays.includes(d);
              return (
                <span
                  key={d}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    on
                      ? dark
                        ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
                        : "border-emerald-500 bg-emerald-100 text-emerald-700"
                      : dark
                      ? "border-slate-700 text-slate-600"
                      : "border-slate-200 text-slate-400"
                  }`}
                >
                  {on ? "✓ " : ""}
                  {d}
                </span>
              );
            })}
          </div>
        </Wide>
        <Row label="Preferowana pora" value={p.preferredTime} />
        <Row label="Treningi w tygodniu" value={p.trainingFrequency} />
      </Sec>

      {/* 8. Kontakt i oczekiwania */}
      <Sec n={7} title="Kontakt i oczekiwania" dark={dark}>
        <Row label="Telefon" value={p.phone} />
        <Row
          label="Oświadczenie PAR-Q"
          value={
            p.parqConsent
              ? p.parqConsent.charAt(0).toUpperCase() + p.parqConsent.slice(1)
              : ""
          }
        />
        <Wide>
          <Row label="Oczekiwania wobec trenera" value={p.expectations} />
        </Wide>
        <Wide>
          <Row label="Dodatkowe uwagi" value={p.comments || p.healthNotes} />
        </Wide>
      </Sec>
    </div>
  );
}

// ————————————————————————————————————————————————
// Wariant dokumentu drukowanego (biały, do PDF)
// ————————————————————————————————————————————————

function PrintDoc({
  profile,
  clientName,
  email,
  onDone,
}: {
  profile: ClientProfile;
  clientName: string;
  email: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const after = () => onDone();
    window.addEventListener("afterprint", after);
    const id = window.setTimeout(() => window.print(), 120);
    return () => {
      window.removeEventListener("afterprint", after);
      window.clearTimeout(id);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-white p-6 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <header className="mb-4 flex items-start justify-between border-b-2 border-slate-900 pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
              FitCoach AI · Raport wstępny (intake)
            </p>
            <h1 className="text-xl font-extrabold uppercase tracking-tight">
              {clientName || email}
            </h1>
            <p className="text-xs text-slate-600">{email}</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p>
              Wysłano:{" "}
              {profile.submittedAt
                ? new Date(profile.submittedAt).toLocaleString("pl-PL")
                : "—"}
            </p>
            <p>
              {new Date().toLocaleDateString("pl-PL")} · str. 1/1
            </p>
          </div>
        </header>
        <Body p={profile} dark={false} />
        <footer className="mt-4 border-t border-slate-300 pt-2 text-[10px] text-slate-500">
          Raport wygenerowany automatycznie na podstawie ankiety wstępnej
          podopiecznego · FitCoach AI
        </footer>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————
// Wariant ekranowy (zakładka „Profil” trenera)
// ————————————————————————————————————————————————

export default function ClientIntakeReport({
  profile,
  clientName,
  email,
}: {
  profile: ClientProfile;
  clientName: string;
  email: string;
}) {
  const [printing, setPrinting] = useState(false);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_30px_rgba(15,23,42,0.9)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            📋 Raport wstępny (intake)
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Pełny wywiad z ankiety klienta — na jego podstawie ustalasz plan,
            żywienie i regenerację. Dane wysłano:{" "}
            {profile.submittedAt
              ? new Date(profile.submittedAt).toLocaleString("pl-PL")
              : "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPrinting(true)}
          className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
        >
          🖨 Drukuj / zapisz PDF
        </button>
      </div>

      <Body p={profile} dark />

      {printing &&
        createPortal(
          <PrintDoc
            profile={profile}
            clientName={clientName}
            email={email}
            onDone={() => setPrinting(false)}
          />,
          document.body
        )}
    </section>
  );
}