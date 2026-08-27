"use client";

import { useState } from "react";

type Item = { id: string; name: string; detail: string };

export default function TrainerQuickLibrary({
  title,
  icon,
  saveLabel,
  general,
  own,
  onPick,
  onSave,
}: {
  title: string;
  icon: string;
  saveLabel: string;
  general: Item[];
  own: Item[];
  onPick: (item: Item) => void;
  onSave: (name: string, detail: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");

  const handleSave = () => {
    if (!name.trim() || !detail.trim()) return;
    onSave(name.trim(), detail.trim());
    setName("");
    setDetail("");
  };

  const renderItems = (list: Item[], label: string) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {list.map((it) => (
            <button
              key={it.id}
              type="button"
              title={it.detail}
              onClick={() => onPick(it)}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
            >
              {it.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-xs font-semibold text-emerald-300"
      >
        <span>
          {icon} {title} — szybki wybór
        </span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          {renderItems(general, "Biblioteka ogólna")}
          {renderItems(own, "Twoje (zapisane)")}
          <div className="space-y-1.5 pt-1">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">
              Dodaj własny
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nazwa"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-400"
            />
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={2}
              placeholder="Treść / szczegóły"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
            >
              {saveLabel}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
