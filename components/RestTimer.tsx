"use client";

// ⏱ Pływający timer przerwy — startuje po odhaczeniu ćwiczenia
// (domyślnie tyle, ile trener zapisał w planie) albo z kafelka „Przerwa".
// Bez kluczy, bez uprawnień — czysty UI + dźwięk przez WebAudio.

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Plus, X } from "lucide-react";

/** Dwa krótkie sygnały dźwiękowe na koniec przerwy. */
function beep() {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const playTone = (startAt: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + 0.25);
      osc.start(ctx.currentTime + startAt);
      osc.stop(ctx.currentTime + startAt + 0.3);
    };
    playTone(0);
    playTone(0.35);
    setTimeout(() => ctx.close(), 1500);
  } catch {
    /* dźwięk niedostępny — bez błędu */
  }
}

export default function RestTimer({
  trigger,
  seconds,
}: {
  trigger: number; // inkrement = start od nowa
  seconds: number; // długość przerwy w sekundach
}) {
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [visible, setVisible] = useState(false);
  const started = useRef(false);

  // Start przy inkrementacji trigger (pierwsze > 0)
  useEffect(() => {
    if (trigger <= 0) return;
    started.current = true;
    setLeft(seconds);
    setFinished(false);
    setRunning(true);
    setVisible(true);
  }, [trigger, seconds]);

  // Tyknięcie co sekundę
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((v) => (v <= 1 ? 0 : v - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Koniec przerwy
  useEffect(() => {
    if (running && left === 0) {
      setRunning(false);
      setFinished(true);
      beep();
    }
  }, [left, running]);

  if (!started.current || !visible) return null;

  const total = Math.max(1, seconds);
  const pct = finished ? 100 : Math.max(0, Math.min(100, (left / total) * 100));
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="fixed bottom-40 right-4 z-[60] w-48 rounded-2xl border border-emerald-500/50 bg-slate-900/95 p-3 shadow-[0_10px_40px_rgba(2,6,23,0.6)] backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
          ⏱ Przerwa
        </span>
        <button
          type="button"
          aria-label="Zamknij timer"
          onClick={() => setVisible(false)}
          className="text-slate-500 hover:text-slate-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p
        className={`mt-1 text-center text-3xl font-bold tabular-nums ${
          finished
            ? "animate-pulse text-emerald-400"
            : running
              ? "text-slate-50"
              : "text-amber-400"
        }`}
      >
        {finished ? "GOTOWE 💪" : `${mm}:${ss}`}
      </p>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-950">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            finished ? "bg-emerald-400" : "bg-emerald-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          disabled={finished}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-40"
          aria-label={running ? "Pauza" : "Wznów"}
        >
          {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => {
            setFinished(false);
            setLeft((v) => v + 30);
            setRunning(true);
          }}
          className="flex h-7 items-center gap-1 rounded-lg border border-slate-700 px-2 text-[11px] text-slate-300 hover:bg-slate-800"
        >
          <Plus className="h-3 w-3" /> 30 s
        </button>
        <button
          type="button"
          onClick={() => {
            setLeft(seconds);
            setFinished(false);
            setRunning(true);
          }}
          className="h-7 rounded-lg border border-slate-700 px-2 text-[11px] text-slate-300 hover:bg-slate-800"
        >
          ↺
        </button>
      </div>
    </div>
  );
}