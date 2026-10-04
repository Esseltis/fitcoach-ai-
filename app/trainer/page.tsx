"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getTrainerById,
  getTrainerIdentity,
  getClientsForTrainer,
  getReport,
  getPlan,
  getClientProfile,
  getClientContent,
  getWeeklyReportStatus,
  getWorkoutSession,
  getTrainerReportFields,
  saveTrainerReportFields,
  REPORT_FIELDS,
  trainerLogout,
  resolveGoalRequest,
  type ClientRecord,
  type ReportConfigField,
} from "@/lib/store";
import { getAttentionList, type AttentionEntry } from "@/lib/coach";
import { CLOUD_SYNCED_EVENT, cloudSignOut } from "@/lib/cloud";

export default function TrainerDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [identity, setIdentity] = useState<{ id: string; email: string } | null>(
    null
  );
  const [view, setView] = useState<"clients" | "report">("clients");
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [attention, setAttention] = useState<AttentionEntry[]>([]);
  const [reportFields, setReportFields] = useState<ReportConfigField[]>([]);
  const [saved, setSaved] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customType, setCustomType] =
    useState<ReportConfigField["type"]>("text");

  useEffect(() => {
    const id = getTrainerIdentity();
    if (!id) {
      router.replace("/trainer/login");
      return;
    }
    setIdentity(id);
    setClients(getClientsForTrainer(id.id));
    setReportFields(getTrainerReportFields(id.id));
    setAttention(getAttentionList(id.id));
    setReady(true);
  }, [router]);

  // Chmura: odśwież listę podopiecznych po każdej synchronizacji z Supabase.
  useEffect(() => {
    if (!identity) return;
    const onSynced = () => {
      setClients(getClientsForTrainer(identity.id));
      setReportFields(getTrainerReportFields(identity.id));
      setAttention(getAttentionList(identity.id));
    };
    window.addEventListener(CLOUD_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CLOUD_SYNCED_EVENT, onSynced);
  }, [identity]);

  // Decyzja przy propozycji celu (adaptacyjny cel podopiecznego)
  const resolveGoal = (clientEmail: string, accept: boolean) => {
    resolveGoalRequest(clientEmail, accept);
    if (identity) setAttention(getAttentionList(identity.id));
  };

  const persist = (next: ReportConfigField[]) => {
    if (!identity) return;
    setReportFields(next);
    saveTrainerReportFields(identity.id, next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const toggleReportField = (key: string) => {
    const existing = reportFields.find((f) => f.key === key);
    if (existing) {
      persist(reportFields.filter((f) => f.key !== key));
    } else {
      const def = REPORT_FIELDS.find((f) => f.key === key);
      if (def) persist([...reportFields, { ...def, custom: false }]);
    }
  };

  const removeCustomField = (key: string) => {
    persist(reportFields.filter((f) => f.key !== key));
  };

  const addCustomField = () => {
    if (!customLabel.trim()) return;
    const key = `custom_${Date.now()}`;
    const type = customType;
    const base: ReportConfigField = {
      key,
      label: customLabel.trim(),
      type,
      defaultValue:
        type === "boolean" ? false : type === "number" ? "" : "",
      custom: true,
    };
    if (type === "range") {
      base.min = 1;
      base.max = 5;
      base.defaultValue = 3;
    }
    if (type === "select") {
      base.options = ["Opcja 1", "Opcja 2", "Opcja 3"];
      base.defaultValue = "Opcja 1";
    }
    persist([...reportFields, base]);
    setCustomLabel("");
    setCustomType("text");
  };

  const handleLogout = async () => {
    trainerLogout();
    await cloudSignOut();
    router.push("/trainer/login");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-200">Ładowanie panelu trenera...</p>
      </div>
    );
  }

  const trainer = identity ? getTrainerById(identity.id) : undefined;

  // Status każdego podopiecznego na dziś: raport tygodniowy, świeży
  // raport bez odpowiedzi, trwający teraz trening (dane jak w CoachPro:
  // panel dnia pilnuje, kto raportuje i kto ćwiczy).
  const statusByEmail: Record<
    string,
    { weeklyDue: boolean; reportNew: boolean; trainingNow: boolean }
  > = {};
  for (const c of clients) {
    const weekly = getWeeklyReportStatus(c.email);
    const cc = getClientContent(c.email);
    const rep = getReport(c.email);
    statusByEmail[c.email] = {
      weeklyDue: weekly.due,
      reportNew:
        !!rep && (!cc.feedback?.at || rep.submittedAt > cc.feedback.at),
      trainingNow: !!getWorkoutSession(c.email),
    };
  }
  const kpi = {
    total: clients.length,
    overdue: clients.filter((c) => statusByEmail[c.email]?.weeklyDue).length,
    fresh: clients.filter((c) => statusByEmail[c.email]?.reportNew).length,
    live: clients.filter((c) => statusByEmail[c.email]?.trainingNow).length,
  };

  // Filtr listy — po imieniu i e-mailu (KPI liczone na pełnej liście).
  const q = query.trim().toLowerCase();
  const visible = q
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      )
    : clients;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="hidden md:flex w-64 bg-slate-950/95 border-r border-slate-800 flex-col">
        <div className="h-16 px-5 flex items-center border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-900 text-sm font-bold shadow-lg">
              FC
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">FitCoach AI</span>
              <span className="text-[11px] text-slate-400">Panel trenera</span>
            </div>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setView("clients")}
              className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition ${
                view === "clients"
                  ? "bg-slate-800/90 text-slate-50"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-50"
              }`}
            >
              <span
                className={`h-7 w-1 rounded-full ${
                  view === "clients" ? "bg-emerald-400" : "bg-transparent"
                }`}
              />
              <span className="truncate">Moi podopieczni</span>
            </button>
            <button
              type="button"
              onClick={() => setView("report")}
              className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition ${
                view === "report"
                  ? "bg-slate-800/90 text-slate-50"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-50"
              }`}
            >
              <span
                className={`h-7 w-1 rounded-full ${
                  view === "report" ? "bg-emerald-400" : "bg-transparent"
                }`}
              />
              <span className="truncate">Raport</span>
            </button>
          </div>
        </div>
        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
          >
            Wyloguj się
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-slate-800 px-6 py-6">
          <p className="text-xs uppercase tracking-wide text-emerald-400">
            Panel trenera
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-50">
            {trainer?.name ?? identity?.email ?? "Trener"}
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {trainer?.title}
            {trainer?.focus ? ` • ${trainer.focus}` : ""}
          </p>
        </header>

        <div className="p-6">
          {view === "clients" && (
            <>
          {/* 📊 Panel dnia — kto raportuje, kto ćwiczy */}
          <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Podopieczni
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-50">
                {kpi.total}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                aktywnych współprac
              </p>
            </div>
            <div
              className={`rounded-2xl border p-4 ${
                kpi.overdue > 0
                  ? "border-red-500/50 bg-red-500/10"
                  : "border-slate-800 bg-slate-950/80"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Raport tyg. zaległy
              </p>
              <p
                className={`mt-1 text-2xl font-extrabold ${
                  kpi.overdue > 0 ? "text-red-300" : "text-slate-50"
                }`}
              >
                {kpi.overdue}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {kpi.overdue > 0 ? "🔥 wymaga przypomnienia" : "✓ wszyscy na czas"}
              </p>
            </div>
            <div
              className={`rounded-2xl border p-4 ${
                kpi.fresh > 0
                  ? "border-amber-500/50 bg-amber-500/10"
                  : "border-slate-800 bg-slate-950/80"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Nowe raporty
              </p>
              <p
                className={`mt-1 text-2xl font-extrabold ${
                  kpi.fresh > 0 ? "text-amber-300" : "text-slate-50"
                }`}
              >
                {kpi.fresh}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {kpi.fresh > 0 ? "czekają na Twoją odpowiedź" : "✓ skrzynka czysta"}
              </p>
            </div>
            <div
              className={`rounded-2xl border p-4 ${
                kpi.live > 0
                  ? "border-sky-500/50 bg-sky-500/10"
                  : "border-slate-800 bg-slate-950/80"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Trening trwa teraz
              </p>
              <p
                className={`mt-1 text-2xl font-extrabold ${
                  kpi.live > 0 ? "text-sky-300" : "text-slate-50"
                }`}
              >
                {kpi.live}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {kpi.live > 0 ? "🔵 klienci ćwiczą" : "nikt nie ćwiczy"}
              </p>
            </div>
          </section>

          {/* 🚩 Do uwagi — czerwone flagi i decyzje celowe */}
          {attention.length > 0 && (
            <section className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-500/5 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-400">
                🚩 Do uwagi ({attention.length})
              </p>
              <div className="mt-3 space-y-3">
                {attention.map((entry) => {
                  const pending = entry.goalRequest?.status === "pending";
                  const flags = entry.flags.filter(
                    (f) => !(pending && f.text.startsWith("Propozycja"))
                  );
                  return (
                    <div
                      key={entry.email}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link
                          href={`/trainer/client/${encodeURIComponent(entry.email)}`}
                          className="text-sm font-semibold text-slate-100 hover:text-emerald-400"
                        >
                          {entry.name}
                        </Link>
                        <span className="text-[11px] text-slate-500">
                          {entry.email}
                        </span>
                      </div>
                      {flags.length > 0 && (
                        <ul className="mt-1.5 space-y-1">
                          {flags.map((f, i) => (
                            <li
                              key={i}
                              className={`text-xs ${
                                f.severity === "high"
                                  ? "text-rose-300"
                                  : f.severity === "med"
                                    ? "text-amber-300"
                                    : "text-slate-400"
                              }`}
                            >
                              {f.severity === "high"
                                ? "🔴"
                                : f.severity === "med"
                                  ? "🟠"
                                  : "🟡"}{" "}
                              {f.text}
                            </li>
                          ))}
                        </ul>
                      )}
                      {pending && entry.goalRequest && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2">
                          <span className="text-xs text-sky-200">
                            ⚖️ Propozycja celu: {entry.goalRequest.current} →{" "}
                            {entry.goalRequest.suggested} kcal —{" "}
                            {entry.goalRequest.reason.slice(0, 80)}
                          </span>
                          <div className="ml-auto flex gap-2">
                            <button
                              type="button"
                              onClick={() => resolveGoal(entry.email, true)}
                              className="rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400"
                            >
                              ✓ Akceptuj
                            </button>
                            <button
                              type="button"
                              onClick={() => resolveGoal(entry.email, false)}
                              className="rounded-md border border-slate-700 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-800"
                            >
                              ✗ Odrzuć
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          {clients.length > 0 && attention.length === 0 && (
            <p className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
              ✅ Nikt nie wymaga uwagi — wszyscy raportują i trzymają plan.
            </p>
          )}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Podopieczni ({q ? `${visible.length}/${clients.length}` : clients.length})
            </p>
            {clients.length > 0 && (
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="🔍 Szukaj podopiecznego (imię lub e-mail)…"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400 sm:w-72"
              />
            )}
          </div>
          {clients.length === 0 ? (
            <p className="text-sm text-slate-400">
              Brak przypisanych podopiecznych.
            </p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-slate-400">
              Brak wyników dla „{query.trim()}” — spróbuj innej frazy.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((c) => {
                const report = getReport(c.email);
                const profile = getClientProfile(c.email);
                const plan = identity ? getPlan(identity.id, c.email) : null;
                const st = statusByEmail[c.email];
                return (
                  <Link
                    key={c.email}
                    href={`/trainer/client/${encodeURIComponent(c.email)}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-[0_18px_30px_rgba(15,23,42,0.9)] hover:border-emerald-400/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-slate-950 flex items-center justify-center text-sm font-bold shadow-lg">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-wrap justify-end gap-1">
                        {st?.weeklyDue && (
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-300 ring-1 ring-red-500/40">
                            🔴 Raport zaległy
                          </span>
                        )}
                        {st?.reportNew && (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300 ring-1 ring-amber-500/40">
                            🟡 Nowy raport
                          </span>
                        )}
                        {st?.trainingNow && (
                          <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-300 ring-1 ring-sky-500/40">
                            🔵 Trening trwa
                          </span>
                        )}
                        {plan ? (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                            Plan przypisany
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                            Brak planu
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-50">{c.name}</p>
                    <p className="text-[11px] text-slate-400">{c.email}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            profile ? "bg-emerald-400" : "bg-slate-600"
                          }`}
                        />
                        <p className="text-[11px] text-slate-500">
                          Profil: {profile ? "wypełniony" : "brak"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            report ? "bg-emerald-400" : "bg-slate-600"
                          }`}
                        />
                        <p className="text-[11px] text-slate-500">
                          Raport dzienny: {report ? "wysłany" : "brak"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            st?.weeklyDue ? "bg-red-400" : "bg-emerald-400"
                          }`}
                        />
                        <p className="text-[11px] text-slate-500">
                          Raport tyg.:{" "}
                          {st?.weeklyDue ? "zaległy — przypomnij" : "aktualny ✓"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
            </>
          )}
        </div>

        {view === "report" && (
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                Konfiguracja raportu podopiecznych
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Zaznacz, które pola podopieczny ma wypełniać w raporcie dziennym.
                Działa dla wszystkich Twoich klientów.
              </p>
            </div>
            {saved && <span className="text-xs text-emerald-300">Zapisano ✓</span>}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {REPORT_FIELDS.map((f) => (
              <label
                key={f.key}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-200 hover:border-emerald-500/50"
              >
                <input
                  type="checkbox"
                  checked={reportFields.some((r) => r.key === f.key)}
                  onChange={() => toggleReportField(f.key)}
                  className="accent-emerald-500"
                />
                {f.label}
              </label>
            ))}
          </div>

          {reportFields.filter((f) => f.custom).length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Własne pola
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {reportFields
                  .filter((f) => f.custom)
                  .map((f) => (
                    <span
                      key={f.key}
                      className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200"
                    >
                      {f.label}
                      <button
                        type="button"
                        onClick={() => removeCustomField(f.key)}
                        className="text-slate-400 hover:text-red-300"
                        title="Usuń pole"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Dodaj własne pole
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="np. Ile kroków zrobiłeś?"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
              />
              <select
                value={customType}
                onChange={(e) =>
                  setCustomType(e.target.value as ReportConfigField["type"])
                }
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
              >
                <option value="text">Tekst</option>
                <option value="number">Liczba</option>
                <option value="range">Suwak 1–5</option>
                <option value="boolean">Tak/Nie</option>
                <option value="select">Wybór</option>
              </select>
              <button
                type="button"
                onClick={addCustomField}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Dodaj
              </button>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
