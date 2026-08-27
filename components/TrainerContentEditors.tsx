"use client";

import type { TrainerContent } from "@/lib/store";

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1">
      {label && <span className="text-[11px] font-medium text-slate-300">{label}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
      />
    </label>
  );
}

function TA({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1">
      {label && <span className="text-[11px] font-medium text-slate-300">{label}</span>}
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
      />
    </label>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      {children}
    </div>
  );
}

function AddBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-dashed border-emerald-500/50 px-4 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10"
    >
      + {label}
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start rounded-md border border-slate-700 px-2 py-0.5 text-[11px] text-slate-400 hover:border-red-500/60 hover:text-red-300"
    >
      Usuń
    </button>
  );
}

export function IntroEditor({
  c,
  set,
}: {
  c: TrainerContent;
  set: (c: TrainerContent) => void;
}) {
  const upd = (patch: Partial<TrainerContent["intro"]>) =>
    set({ ...c, intro: { ...c.intro, ...patch } });
  const changes = c.intro.changes;
  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input label="Powitanie" value={c.intro.greeting} onChange={(v) => upd({ greeting: v })} />
        <Input label="Etykieta aktualizacji" value={c.intro.updateLabel} onChange={(v) => upd({ updateLabel: v })} />
        <Input label="Data aktualizacji" value={c.intro.updateDate} onChange={(v) => upd({ updateDate: v })} />
      </div>
      <TA label="Tekst wprowadzenia" rows={5} value={c.intro.text} onChange={(v) => upd({ text: v })} />
      <Input label="Tytuł listy zmian" value={c.intro.changesTitle} onChange={(v) => upd({ changesTitle: v })} />
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-slate-300">Lista zmian (punkty)</p>
        {changes.map((ch, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={ch}
              onChange={(e) =>
                upd({ changes: changes.map((x, j) => (j === i ? e.target.value : x)) })
              }
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
            />
            <RemoveBtn
              onClick={() => upd({ changes: changes.filter((_, j) => j !== i) })}
            />
          </div>
        ))}
        <AddBtn onClick={() => upd({ changes: [...changes, ""] })} label="Dodaj punkt" />
      </div>
    </Card>
  );
}

export function NutritionEditor({
  c,
  set,
}: {
  c: TrainerContent;
  set: (c: TrainerContent) => void;
}) {
  const n = c.nutrition;
  const upd = (patch: Partial<TrainerContent["nutrition"]>) =>
    set({ ...c, nutrition: { ...n, ...patch } });
  return (
    <Card>
      <TA label="Opis bilansu kalorycznego" rows={4} value={n.balanceText} onChange={(v) => upd({ balanceText: v })} />
      <div className="grid gap-3 sm:grid-cols-4">
        <Input label="Typ bilansu" value={n.balanceType} onChange={(v) => upd({ balanceType: v })} />
        <Input label="Wartość (np. +12%)" value={n.balanceValue} onChange={(v) => upd({ balanceValue: v })} />
        <Input label="Kalorie (kcal)" value={n.calories} onChange={(v) => upd({ calories: v })} />
        <Input label="Waga (kg)" value={n.weight} onChange={(v) => upd({ weight: v })} />
        <Input label="Wzrost (cm)" value={n.height} onChange={(v) => upd({ height: v })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input label="Węglowodany kcal" value={n.carbsKcal} onChange={(v) => upd({ carbsKcal: v })} />
        <Input label="Białko kcal" value={n.proteinKcal} onChange={(v) => upd({ proteinKcal: v })} />
        <Input label="Tłuszcze kcal" value={n.fatKcal} onChange={(v) => upd({ fatKcal: v })} />
        <Input label="Węglowodany g" value={n.carbsG} onChange={(v) => upd({ carbsG: v })} />
        <Input label="Białko g" value={n.proteinG} onChange={(v) => upd({ proteinG: v })} />
        <Input label="Tłuszcze g" value={n.fatG} onChange={(v) => upd({ fatG: v })} />
        <Input label="Węglowodany %" value={n.carbsPct} onChange={(v) => upd({ carbsPct: v })} />
        <Input label="Białko %" value={n.proteinPct} onChange={(v) => upd({ proteinPct: v })} />
        <Input label="Tłuszcze %" value={n.fatPct} onChange={(v) => upd({ fatPct: v })} />
      </div>
    </Card>
  );
}

export function TipsEditor({
  c,
  set,
}: {
  c: TrainerContent;
  set: (c: TrainerContent) => void;
}) {
  const tips = c.tips;
  const upd = (list: TrainerContent["tips"]) => set({ ...c, tips: list });
  return (
    <Card>
      <p className="text-[11px] font-medium text-slate-300">Porady (każda rubryka wypełniona)</p>
      {tips.map((t, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <Input label="Tytuł" value={t.title} onChange={(v) => upd(tips.map((x, j) => (j === i ? { ...x, title: v } : x)))} />
          <TA label="Treść" value={t.desc} onChange={(v) => upd(tips.map((x, j) => (j === i ? { ...x, desc: v } : x)))} />
          <RemoveBtn onClick={() => upd(tips.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddBtn onClick={() => upd([...tips, { title: "", desc: "" }])} label="Dodaj poradę" />
    </Card>
  );
}

export function DietEditor({
  c,
  set,
}: {
  c: TrainerContent;
  set: (c: TrainerContent) => void;
}) {
  const diet = c.diet;
  const upd = (patch: Partial<TrainerContent["diet"]>) => set({ ...c, diet: { ...diet, ...patch } });
  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Docelowa kaloryczność (kcal)" value={diet.targetCalories} onChange={(v) => upd({ targetCalories: v })} />
      </div>
      <p className="text-[11px] font-medium text-slate-300">Posiłki / warianty</p>
      {diet.meals.map((m, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
            <Input label="Nazwa posiłku" value={m.name} onChange={(v) => upd({ meals: diet.meals.map((x, j) => (j === i ? { ...x, name: v } : x)) })} />
            <Input label="kcal" value={m.calories} onChange={(v) => upd({ meals: diet.meals.map((x, j) => (j === i ? { ...x, calories: v } : x)) })} />
          </div>
          <TA label="Opis / skład" rows={2} value={m.description} onChange={(v) => upd({ meals: diet.meals.map((x, j) => (j === i ? { ...x, description: v } : x)) })} />
          <RemoveBtn onClick={() => upd({ meals: diet.meals.filter((_, j) => j !== i) })} />
        </div>
      ))}
      <AddBtn
        onClick={() => upd({ meals: [...diet.meals, { name: "", description: "", calories: "" }] })}
        label="Dodaj posiłek"
      />
    </Card>
  );
}

export function SupplementsEditor({
  c,
  set,
}: {
  c: TrainerContent;
  set: (c: TrainerContent) => void;
}) {
  const list = c.supplements;
  const upd = (l: TrainerContent["supplements"]) => set({ ...c, supplements: l });
  return (
    <Card>
      {list.map((s, i) => (
        <div key={s.id || i} className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input label="Nazwa suplementu" value={s.name} onChange={(v) => upd(list.map((x, j) => (j === i ? { ...x, name: v } : x)))} />
            <Input label="Typ" value={s.type} onChange={(v) => upd(list.map((x, j) => (j === i ? { ...x, type: v } : x)))} />
          </div>
          <Input label="Krótki opis" value={s.shortDesc} onChange={(v) => upd(list.map((x, j) => (j === i ? { ...x, shortDesc: v } : x)))} />
          <TA label="Dawkowanie" rows={2} value={s.dosing} onChange={(v) => upd(list.map((x, j) => (j === i ? { ...x, dosing: v } : x)))} />
          <TA label="Informacje / opis" rows={2} value={s.info} onChange={(v) => upd(list.map((x, j) => (j === i ? { ...x, info: v } : x)))} />
          <RemoveBtn onClick={() => upd(list.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddBtn
        onClick={() =>
          upd([
            ...list,
            { id: crypto.randomUUID(), name: "", type: "", shortDesc: "", dosing: "", info: "" },
          ])
        }
        label="Dodaj suplement"
      />
    </Card>
  );
}

export function HydrationEditor({
  c,
  set,
}: {
  c: TrainerContent;
  set: (c: TrainerContent) => void;
}) {
  const h = c.hydration;
  const upd = (patch: Partial<TrainerContent["hydration"]>) => set({ ...c, hydration: { ...h, ...patch } });
  return (
    <Card>
      <TA label="Uwagi ogólne do nawodnienia" rows={4} value={h.general} onChange={(v) => upd({ general: v })} />
      <TA label="Plan nawodnienia" rows={2} value={h.planText} onChange={(v) => upd({ planText: v })} />
      <p className="text-[11px] font-medium text-slate-300">Pozostałe napoje (punkty)</p>
      {h.beverages.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={b}
            onChange={(e) => upd({ beverages: h.beverages.map((x, j) => (j === i ? e.target.value : x)) })}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
          />
          <RemoveBtn onClick={() => upd({ beverages: h.beverages.filter((_, j) => j !== i) })} />
        </div>
      ))}
      <AddBtn onClick={() => upd({ beverages: [...h.beverages, ""] })} label="Dodaj napój" />
    </Card>
  );
}

export function TrainingEditor({
  c,
  set,
}: {
  c: TrainerContent;
  set: (c: TrainerContent) => void;
}) {
  const t = c.training;
  const upd = (patch: Partial<TrainerContent["training"]>) => set({ ...c, training: { ...t, ...patch } });
  return (
    <Card>
      <p className="text-[11px] font-medium text-slate-300">Dni tygodnia (status)</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {t.days.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={d.label}
              onChange={(e) => upd({ days: t.days.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
            />
            <input
              value={d.status}
              onChange={(e) => upd({ days: t.days.map((x, j) => (j === i ? { ...x, status: e.target.value } : x)) })}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
            />
          </div>
        ))}
      </div>
      <p className="text-[11px] font-medium text-slate-300">Ćwiczenia na poszczególne dni</p>
      {Object.keys(t.dayExercises).map((dayNum) => (
        <div key={dayNum} className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[11px] font-semibold text-emerald-300">Dzień {dayNum}</p>
          {t.dayExercises[Number(dayNum)].map((ex, i) => (
            <div key={i} className="space-y-2 border-t border-slate-800 pt-2">
              <Input label="Nazwa ćwiczenia" value={ex.name} onChange={(v) => upd({ dayExercises: updateEx(t, Number(dayNum), i, { name: v }) })} />
              <div className="grid gap-2 sm:grid-cols-3">
                <Input label="Serie" value={ex.series} onChange={(v) => upd({ dayExercises: updateEx(t, Number(dayNum), i, { series: v }) })} />
                <Input label="Czas pracy" value={ex.workTime} onChange={(v) => upd({ dayExercises: updateEx(t, Number(dayNum), i, { workTime: v }) })} />
                <Input label="Przerwa" value={ex.rest} onChange={(v) => upd({ dayExercises: updateEx(t, Number(dayNum), i, { rest: v }) })} />
              </div>
              <RemoveBtn onClick={() => upd({ dayExercises: removeEx(t, Number(dayNum), i) })} />
            </div>
          ))}
          <AddBtn onClick={() => upd({ dayExercises: addEx(t, Number(dayNum)) })} label="Dodaj ćwiczenie" />
        </div>
      ))}
      <p className="text-[11px] font-medium text-slate-300">Komentarz do treningu</p>
      {t.comment.map((cm, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <Input label="Pojęcie" value={cm.label} onChange={(v) => upd({ comment: t.comment.map((x, j) => (j === i ? { ...x, label: v } : x)) })} />
          <TA label="Wyjaśnienie" rows={2} value={cm.text} onChange={(v) => upd({ comment: t.comment.map((x, j) => (j === i ? { ...x, text: v } : x)) })} />
          <RemoveBtn onClick={() => upd({ comment: t.comment.filter((_, j) => j !== i) })} />
        </div>
      ))}
      <AddBtn onClick={() => upd({ comment: [...t.comment, { label: "", text: "" }] })} label="Dodaj komentarz" />
    </Card>
  );
}

function updateEx(
  t: TrainerContent["training"],
  day: number,
  i: number,
  patch: Partial<{ name: string; series: string; workTime: string; rest: string }>
) {
  const list = (t.dayExercises[day] || []).map((x, j) => (j === i ? { ...x, ...patch } : x));
  return { ...t.dayExercises, [day]: list };
}
function removeEx(t: TrainerContent["training"], day: number, i: number) {
  const list = (t.dayExercises[day] || []).filter((_, j) => j !== i);
  return { ...t.dayExercises, [day]: list };
}
function addEx(t: TrainerContent["training"], day: number) {
  const list = [...(t.dayExercises[day] || []), { name: "", series: "", workTime: "", rest: "" }];
  return { ...t.dayExercises, [day]: list };
}

export function CateringEditor({
  c,
  set,
}: {
  c: TrainerContent;
  set: (c: TrainerContent) => void;
}) {
  const cat = c.catering;
  const upd = (patch: Partial<TrainerContent["catering"]>) => set({ ...c, catering: { ...cat, ...patch } });
  return (
    <Card>
      <TA label="Wstęp / nota" rows={2} value={cat.note} onChange={(v) => upd({ note: v })} />
      <p className="text-[11px] font-medium text-slate-300">Firmy cateringowe</p>
      {cat.providers.map((p, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input label="Nazwa firmy" value={p.name} onChange={(v) => upd({ providers: cat.providers.map((x, j) => (j === i ? { ...x, name: v } : x)) })} />
            <label className="flex items-center gap-2 pt-5 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={p.recommended}
                onChange={(e) => upd({ providers: cat.providers.map((x, j) => (j === i ? { ...x, recommended: e.target.checked } : x)) })}
                className="accent-emerald-500"
              />
              Polecany
            </label>
          </div>
          <TA label="Nota / szczegóły" rows={2} value={p.note} onChange={(v) => upd({ providers: cat.providers.map((x, j) => (j === i ? { ...x, note: v } : x)) })} />
          <RemoveBtn onClick={() => upd({ providers: cat.providers.filter((_, j) => j !== i) })} />
        </div>
      ))}
      <AddBtn onClick={() => upd({ providers: [...cat.providers, { name: "", note: "", recommended: false }] })} label="Dodaj catering" />
    </Card>
  );
}
