"use client";

import { useEffect, useRef, useState } from "react";
import {
  getChat,
  sendChatMessage,
  getTrainerById,
  type ChatMessage,
} from "@/lib/store";

// Zmniejsz zdjęcie (max 900 px) — jak na stronie zdjęć
export function resizeImage(file: File): Promise<string> {
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

export default function ChatSection({ email }: { email: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [trainerName, setTrainerName] = useState("Trener");
  const [photoErr, setPhotoErr] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!email) return;
    setMessages(getChat(email));
    const tid = window.localStorage.getItem("fitcoach_client_trainer_id");
    setTrainerName((tid && getTrainerById(tid)?.name) || "Trener");
  }, [email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  const send = () => {
    if (!email) return;
    const t = text.trim();
    if (!t && !pendingImage) return;
    setMessages(
      sendChatMessage(email, {
        from: "client",
        text: t || "📷 Zdjęcie",
        ...(pendingImage ? { image: pendingImage } : {}),
      })
    );
    setText("");
    setPendingImage(null);
  };

  const handlePhoto = async (file: File) => {
    setPhotoErr("");
    try {
      setPendingImage(await resizeImage(file));
    } catch (err) {
      setPhotoErr(err instanceof Error ? err.message : "Nie udało się dodać zdjęcia.");
    }
  };

  const fmt = (at: string) =>
    new Date(at).toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Czat
        </p>
        <h1 className="mt-1 text-xl font-bold text-slate-50">
          Czat z trenerem
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Napisz wiadomość lub wyślij zdjęcie — trener odpowiada tutaj.
          Cała rozmowa zostaje w Twoim panelu.
        </p>
      </header>

      <section className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        {messages.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">
            Napisz pierwszą wiadomość do trenera 👋
          </p>
        )}
        {messages.map((m) => {
          const mine = m.from === "client";
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  mine
                    ? "rounded-br-md bg-emerald-600 text-white"
                    : "rounded-bl-md border border-slate-700 bg-slate-800 text-slate-100"
                }`}
              >
                {!mine && (
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                    {trainerName}
                  </p>
                )}
                {m.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.image}
                    alt="Załącznik"
                    className="mb-1.5 max-h-56 w-full rounded-lg object-cover"
                  />
                )}
                {m.text && <p className="whitespace-pre-line">{m.text}</p>}
                <p
                  className={`mt-1 text-right text-[10px] ${
                    mine ? "text-emerald-100/80" : "text-slate-500"
                  }`}
                >
                  {fmt(m.at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </section>

      {pendingImage && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pendingImage}
            alt="Załącznik"
            className="h-16 w-16 rounded-lg object-cover"
          />
          <div className="flex-1 text-xs text-slate-400">
            Zdjęcie dołączone do wiadomości
          </div>
          <button
            type="button"
            onClick={() => setPendingImage(null)}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Usuń
          </button>
        </div>
      )}
      {photoErr && <p className="text-xs text-red-400">{photoErr}</p>}

      <div className="flex items-end gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handlePhoto(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Dodaj zdjęcie"
          className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
        >
          📷
        </button>
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Napisz do trenera…"
          className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={send}
          disabled={!text.trim() && !pendingImage}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-40"
        >
          Wyślij
        </button>
      </div>
    </div>
  );
}