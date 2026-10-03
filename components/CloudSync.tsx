"use client";

import { useEffect } from "react";
import { cloudEnabled, cloudBootstrap, cloudPull } from "@/lib/cloud";

/**
 * Mostek synchronizacji z Supabase (tryb hybrydowy).
 * Gdy brak zmiennych środowiskowych — nic nie robi (demo działa jak dawniej).
 * Gdy skonfigurowana chmura: przy wejściu na stronę pobiera stan z bazy
 * (i wgrawa lokalną historię), potem odświeża co 60 s i po powrocie
 * do zakładki. Po każdym udanym pullu dispatchuje zdarzenie
 * "fitcoach:synced", na które reagują np. panel trenera i panel klienta.
 */
export default function CloudSync() {
  useEffect(() => {
    if (!cloudEnabled()) return;
    let alive = true;

    void (async () => {
      await cloudBootstrap();
      if (alive) {
        // drugi pull po wgraniu historii — łapie ewentualne konflikty
        await cloudPull();
      }
    })();

    const interval = setInterval(() => {
      void cloudPull();
    }, 60_000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") void cloudPull();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      alive = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}