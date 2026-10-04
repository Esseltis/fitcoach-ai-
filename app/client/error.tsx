"use client";

import Link from "next/link";

// Error boundary panelu klienta — bez niego Next pokazuje tylko generyczne
// "Application error", co uniemożliwia diagnozę na produkcji.
export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-xl w-full rounded-2xl border border-red-500/40 bg-red-500/10 p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
            Coś się popsuło
          </p>
          <h1 className="mt-1 text-lg font-bold text-slate-100">
            Panel nie mógł się załadować
          </h1>
        </div>
        <p className="text-sm text-slate-300">
          Wyjątek przechwycony przez error boundary panelu:
        </p>
        <pre className="whitespace-pre-wrap break-words rounded-xl bg-black/50 border border-red-500/30 p-3 text-[12px] leading-relaxed text-red-300">
          {error.message}
          {error.digest ? `\ndigest: ${error.digest}` : ""}
          {error.stack ? `\n\n${error.stack}` : ""}
        </pre>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition"
          >
            Spróbuj ponownie
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            ← Strona główna
          </Link>
        </div>
      </div>
    </div>
  );
}