'use client';

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera, Trash2 } from "lucide-react";
import {
  getProgressPhotos,
  addProgressPhoto,
  removeProgressPhoto,
  MAX_PROGRESS_PHOTOS,
  type ProgressPhoto,
} from "@/lib/store";

const todayISO = () => new Date().toISOString().slice(0, 10);

// Zmniejsz zdjęcie (max 900 px) — dzięki temu mieści się w pamięci przeglądarki
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Nie udało się odczytać pliku."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Nie udało się wczytać obrazu."));
      img.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Przeglądarka nie obsługuje przetwarzania obrazu."));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function ZdjeciaPage() {
  const [email, setEmail] = useState<string>("demo@fitcoach.ai");
  const [ready, setReady] = useState(false);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // tryb porównania przed / po
  const [compare, setCompare] = useState(false);
  const [idA, setIdA] = useState<string | null>(null);
  const [idB, setIdB] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const storedEmail =
      window.localStorage.getItem("fitcoach_client_email") ?? "demo@fitcoach.ai";
    setEmail(storedEmail);
    setPhotos(getProgressPhotos(storedEmail));
    setReady(true);
  }, []);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await resizeImage(file);
      const res = addProgressPhoto(email, { date, dataUrl });
      setPhotos(res.photos);
      if (res.error) setError(res.error);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się dodać zdjęcia."
      );
    } finally {
      setBusy(false);
    }
  };

  const remove = (id: string) => {
    if (!window.confirm("Usunąć to zdjęcie?")) return;
    setPhotos(removeProgressPhoto(email, id));
  };

  if (!ready) return null;

  const sorted = [...photos].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0
  );
  // Porównanie: slot „przed" zawsze trzyma starsze zdjęcie
  const pA = sorted.find((p) => p.id === idA) ?? sorted[sorted.length - 1];
  const pB = sorted.find((p) => p.id === idB) ?? sorted[0];
  const pickBefore = (nextId: string) => {
    const p = sorted.find((x) => x.id === nextId);
    if (!p) return;
    if (pB && p.date > pB.date) {
      setIdA(pB.id);
      setIdB(p.id);
    } else {
      setIdA(p.id);
    }
  };
  const pickAfter = (nextId: string) => {
    const p = sorted.find((x) => x.id === nextId);
    if (!p) return;
    if (pA && p.date < pA.date) {
      setIdB(pA.id);
      setIdA(p.id);
    } else {
      setIdB(p.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
            ZDJĘCIA POSTĘPÓW
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Dokumentuj zmiany sylwetki — dodawaj zdjęcie co 2–4 tygodnie, o
            tej samej porze dnia. Zdjęcia zapisują się wyłącznie w Twojej
            przeglądarce.
          </p>
        </header>

        {/* Dodawanie zdjęcia */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-slate-400">
                Data zdjęcia
              </span>
              <input
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              {busy ? "Przetwarzanie…" : "Dodaj zdjęcie"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
            />
            <p className="text-slate-400">
              {photos.length} / {MAX_PROGRESS_PHOTOS} zdjęć
            </p>
            {photos.length >= 2 && (
              <button
                type="button"
                onClick={() => setCompare((c) => !c)}
                className={`ml-auto rounded-xl border px-4 py-2.5 font-semibold transition ${
                  compare
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-700 text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
                }`}
              >
                🔀 {compare ? "Ukryj porównanie" : "Porównaj przed / po"}
              </button>
            )}
          </div>
          {error && (
            <p className="mt-3 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-rose-300">
              {error}
            </p>
          )}
        </section>

        {/* Porównanie przed / po */}
        {compare && sorted.length >= 2 && pA && pB && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                🔀 Przed / po
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 text-slate-400">
                  Przed:
                  <select
                    value={pA.id}
                    onChange={(e) => pickBefore(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {[...sorted]
                      .reverse()
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.date}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="flex items-center gap-1.5 text-slate-400">
                  Po:
                  <select
                    value={pB.id}
                    onChange={(e) => pickAfter(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {[...sorted]
                      .reverse()
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.date}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <figure className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pA.dataUrl}
                    alt={`Przed ${pA.date}`}
                    className="h-80 w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-slate-950/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-400 ring-1 ring-amber-500/50">
                    Przed
                  </span>
                </div>
                <figcaption className="px-3 py-2 text-[11px] text-slate-300">
                  {pA.date}
                </figcaption>
              </figure>
              <figure className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pB.dataUrl}
                    alt={`Po ${pB.date}`}
                    className="h-80 w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-slate-950/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-400 ring-1 ring-emerald-500/50">
                    Po
                  </span>
                </div>
                <figcaption className="px-3 py-2 text-[11px] text-slate-300">
                  {pB.date}
                </figcaption>
              </figure>
            </div>
          </section>
        )}

        {/* Galeria */}
        {sorted.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
            Brak zdjęć — dodaj pierwsze, żeby zacząć dokumentować postępy.
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sorted.map((p) => (
              <figure
                key={p.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.dataUrl}
                  alt={`Postęp ${p.date}`}
                  className="h-56 w-full object-cover"
                />
                <figcaption className="flex items-center justify-between px-3 py-2 text-[11px] text-slate-300">
                  <span>{p.date}</span>
                  <button
                    type="button"
                    aria-label="Usuń zdjęcie"
                    onClick={() => remove(p.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </figcaption>
              </figure>
            ))}
          </section>
        )}

        <div className="text-center">
          <Link
            href="/client"
            className="inline-block rounded-full border border-slate-700 bg-slate-900/70 px-5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            Wróć do panelu
          </Link>
        </div>
      </main>
    </div>
  );
}