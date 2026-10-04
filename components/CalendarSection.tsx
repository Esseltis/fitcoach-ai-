"use client";

import { useMemo, useState } from "react";
import {
  addSessionRequest,
  getSessionRequests,
  removeSessionRequest,
  type SessionRequest,
} from "@/lib/store";

const MONTHS = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];
const DOW = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

const HOURS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const STATUS: Record<
  SessionRequest["status"],
  { label: string; cls: string }
> = {
  requested: { label: "Prośba — oczekuje", cls: "bg-amber-500/15 text-amber-300 ring-amber-500/40" },
  confirmed: { label: "Potwierdzony ✓", cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40" },
  declined: { label: "Odrzucony ✗", cls: "bg-red-500/15 text-red-300 ring-red-500/40" },
};

export default function CalendarSection({ email }: { email: string }) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [time, setTime] = useState("17:00");
  const [note, setNote] = useState("");
  const [info, setInfo] = useState("");

  // Lazy-load: komponent montuje się przy wejściu w sekcję
  if (!loaded && email) {
    setRequests(getSessionRequests(email));
    setLoaded(true);
  }

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // poniedziałek = 0
  const todayIso = iso(today);

  const byDate: Record<string, SessionRequest[]> = {};
  for (const r of requests) (byDate[r.date] ||= []).push(r);

  const pick = (dayIso: string) => {
    if (dayIso < todayIso) return;
    setSelected(dayIso === selected ? null : dayIso);
    setInfo("");
  };

  const submit = () => {
    if (!email || !selected) return;
    setRequests(addSessionRequest(email, { date: selected, time, note }));
    setInfo(`Wysłano prośbę o ${selected} godz. ${time} — czeka na potwierdzenie trenera.`);
    setNote("");
    setSelected(null);
  };

  const cancel = (id: string) => {
    if (!email) return;
    setRequests(removeSessionRequest(email, id));
    setInfo("Prośba została anulowana.");
  };

  const fmtDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}.${m}.${y}`;
  };

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Kalendarz
        </p>
        <h1 className="mt-1 text-xl font-bold text-slate-50">
          Zapisy na trening
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Wybierz wolny dzień, wyślij prośbę o termin — potwierdzi ją trener.
        </p>
      </header>

      {info && (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
          {info}
        </p>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500"
          >
            ←
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            {MONTHS[month]} {year}
          </p>
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500">
          {DOW.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`o${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = iso(new Date(year, month, i + 1));
            const isToday = d === todayIso;
            const past = d < todayIso;
            const has = (byDate[d] || []).length > 0;
            const isSel = d === selected;
            return (
              <button
                key={d}
                type="button"
                disabled={past}
                onClick={() => pick(d)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition ${
                  isSel
                    ? "bg-emerald-500 font-bold text-slate-950"
                    : past
                    ? "text-slate-700"
                    : "text-slate-200 hover:bg-slate-800"
                } ${isToday && !isSel ? "ring-1 ring-emerald-500/60" : ""}`}
              >
                {i + 1}
                {has && !isSel && (
                  <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>

        <p className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> prośba
            wysłana
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[3px] ring-1 ring-emerald-500" />{" "}
            dziś
          </span>
        </p>
      </section>

      {selected && (
        <section className="rounded-2xl border border-emerald-500/40 bg-slate-900/70 p-4">
          <h2 className="text-sm font-bold text-slate-100">
            Poproś o trening — {fmtDate(selected)}
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase text-slate-400">
                Godzina
              </span>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase text-slate-400">
                Notatka (opcjonalnie)
              </span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="np. wolę trening rano"
                maxLength={300}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-500"
              />
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={submit}
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Wyślij prośbę
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-full border border-slate-700 px-5 py-2 text-sm text-slate-300 hover:border-slate-500"
            >
              Anuluj
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">
          Moje prośby o termin
        </h2>
        {requests.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Brak prośeb — wybierz dzień w kalendarzu powyżej.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {[...requests].reverse().map((r) => {
              const st = STATUS[r.status];
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5"
                >
                  <span className="font-mono text-sm font-bold text-slate-100">
                    {fmtDate(r.date)} · {r.time}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${st.cls}`}
                  >
                    {st.label}
                  </span>
                  {r.note && (
                    <span className="flex-1 truncate text-xs text-slate-500">
                      „{r.note}"
                    </span>
                  )}
                  <span className="flex-1" />
                  {r.status === "requested" && (
                    <button
                      type="button"
                      onClick={() => cancel(r.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Anuluj
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}