"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

/**
 * PWA + powiadomienia:
 *  • rejestruje service worker (offline + instalowalność aplikacji),
 *  • jeśli przeglądarka nie ma jeszcze uprawnień — pokazuje dyskretny
 *    przycisk „🔔 Włącz" (potrzebny do przypomnień o posiłkach/raporcie).
 */
export default function PwaRegister() {
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(
    "unsupported"
  );
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    if ("Notification" in window) setPerm(Notification.permission);
  }, []);

  if (perm !== "default" || hidden) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex max-w-[270px] items-start gap-2 rounded-2xl border border-amber-500/50 bg-slate-900/95 px-3 py-2.5 shadow-[0_10px_40px_rgba(2,6,23,0.5)] backdrop-blur">
      <Bell className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-slate-100">
          Powiadomienia PWA
        </p>
        <p className="text-[10px] leading-snug text-slate-400">
          Włącz przypomnienia o posiłkach, wodzie i raporcie dnia.
        </p>
        <button
          type="button"
          onClick={() => {
            void Notification.requestPermission().then((p) => setPerm(p));
          }}
          className="mt-1.5 rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-slate-950 transition hover:bg-amber-400"
        >
          🔔 Włącz powiadomienia
        </button>
      </div>
      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label="Później"
        className="mt-0.5 shrink-0 text-slate-500 transition hover:text-slate-300"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}