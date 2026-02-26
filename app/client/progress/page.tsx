"use client";

import Link from "next/link";
import { ArrowLeft, Images } from "lucide-react";

// Dane przykładowe – docelowo zdjęcia będą wgrywane przez podopiecznego
// i trzymane np. w chmurze. Tu tylko układ i sortowanie od najnowszych.
const progressPhotos = [
  {
    id: 1,
    date: "26.02.2026",
    label: "Aktualna forma",
  },
  {
    id: 2,
    date: "03.09.2023",
    label: "Po 3 miesiącach współpracy",
  },
  {
    id: 3,
    date: "11.07.2023",
    label: "Start współpracy",
  },
];

export default function ClientProgressPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/client"
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-emerald-400 hover:text-emerald-300 transition"
          >
            <ArrowLeft className="h-3 w-3" />
            Wróć do panelu
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Images className="h-4 w-4 text-emerald-400" />
            Postępy – zdjęcia sylwetki
          </div>
        </div>

        <p className="text-xs lg:text-sm text-slate-400 mb-4 max-w-2xl">
          Poniżej zobaczysz swoje zdjęcia ułożone od najnowszych do
          najstarszych. W przyszłości wgrasz je samodzielnie z poziomu panelu,
          a trener będzie mógł je komentować.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {progressPhotos.map((photo) => (
            <article
              key={photo.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="aspect-[3/4] bg-slate-900 flex items-center justify-center text-xs text-slate-500">
                Tu w przyszłości będzie zdjęcie z dnia {photo.date}.
              </div>
              <div className="px-4 py-3 text-xs border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase text-slate-500 font-semibold">
                    {photo.label}
                  </p>
                  <p className="text-slate-300">{photo.date}</p>
                </div>
                <span className="text-[10px] text-slate-500">
                  #{photo.id.toString().padStart(2, "0")}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

