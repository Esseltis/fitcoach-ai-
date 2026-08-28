"use client";

import { useState } from "react";
import type {
  TrainerContent,
  Meal,
  MealCategory,
} from "@/lib/store";
import {
  MEAL_CATEGORIES,
  getTrainerMeals,
  saveTrainerMeal,
  removeTrainerMeal,
  getTrainerWorkoutBlocks,
  saveTrainerWorkoutBlock,
  removeTrainerWorkoutBlock,
} from "@/lib/store";

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

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block space-y-1">
      {label && <span className="text-[11px] font-medium text-slate-300">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
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

function CollapsibleCard({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-semibold text-slate-100"
      >
        <span>{title}</span>
        <span className={`text-slate-400 transition ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
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
  trainerId,
}: {
  c: TrainerContent;
  set: (c: TrainerContent) => void;
  trainerId: string;
}) {
  const diet = c.diet;
  const upd = (patch: Partial<TrainerContent["diet"]>) => set({ ...c, diet: { ...diet, ...patch } });

  const [library, setLibrary] = useState<Meal[]>(() => getTrainerMeals(trainerId));
  const [category, setCategory] = useState<MealCategory>("sniadanie");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [carbs, setCarbs] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");

  const [query, setQuery] = useState("");
  const [grams, setGrams] = useState("100");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const addToLibrary = () => {
    if (!name.trim()) return;
    setLibrary(
      saveTrainerMeal(trainerId, {
        category,
        name: name.trim(),
        description: description.trim(),
        calories: calories.trim(),
        carbs: carbs.trim(),
        protein: protein.trim(),
        fat: fat.trim(),
      })
    );
    setName("");
    setDescription("");
    setCalories("");
    setCarbs("");
    setProtein("");
    setFat("");
  };

  const searchProducts = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query.trim()
      )}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,nutriments`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.products ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const applyProduct = (p: any) => {
    const n = p.nutriments ?? {};
    const kcal100 =
      n["energy-kcal_100g"] ?? n["energy-kcal_value"] ?? 0;
    const g = Number(grams) || 100;
    const kcal = Math.round((Number(kcal100) * g) / 100);
    const c = n.carbohydrates_100g ?? 0;
    const pr = n.proteins_100g ?? 0;
    const f = n.fat_100g ?? 0;
    const pname = p.product_name ?? "Produkt";
    setName(pname);
    setCalories(String(kcal));
    setCarbs(String(c));
    setProtein(String(pr));
    setFat(String(f));
    setDescription(
      `${pname} — ${g} g (w 100g: ${kcal100} kcal, W:${c} B:${pr} T:${f})`
    );
  };

  const assignToClient = (meal: Meal) => {
    const already = diet.meals.some(
      (m) => m.name === meal.name && m.calories === meal.calories
    );
    if (already) return;
    upd({
      meals: [
        ...diet.meals,
        { name: meal.name, description: meal.description, calories: meal.calories },
      ],
    });
  };

  const removeFromClient = (i: number) =>
    upd({ meals: diet.meals.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      {/* Nowy posiłek do biblioteki */}
      <CollapsibleCard title="Nowy posiłek (własny)">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Typ posiłku"
            value={category}
            onChange={(v) => setCategory(v as MealCategory)}
            options={MEAL_CATEGORIES.map((m) => ({ value: m.key, label: m.label }))}
          />
          <Input label="Nazwa dania" value={name} onChange={setName} placeholder="np. Owsianka z owocami" />
        </div>
        <TA label="Skład / opis" rows={2} value={description} onChange={setDescription} />
        <div className="grid gap-3 sm:grid-cols-4">
          <Input label="Kalorie (kcal)" value={calories} onChange={setCalories} placeholder="np. 550" />
          <Input label="Węglowodany (g)" value={carbs} onChange={setCarbs} placeholder="np. 60" />
          <Input label="Białko (g)" value={protein} onChange={setProtein} placeholder="np. 30" />
          <Input label="Tłuszcze (g)" value={fat} onChange={setFat} placeholder="np. 20" />
        </div>
        <AddBtn onClick={addToLibrary} label="Dodaj do biblioteki" />
      </CollapsibleCard>

      {/* Pobierz produkt z bazy */}
      <CollapsibleCard title="Pobierz produkt z bazy (kcal i makro)" defaultOpen={false}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchProducts()}
            placeholder="np. makaron pszenny"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
          />
          <button
            type="button"
            onClick={searchProducts}
            disabled={searching}
            className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50"
          >
            {searching ? "Szukam..." : "Szukaj"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Input label="Ilość (g)" value={grams} onChange={setGrams} type="number" />
          <p className="pt-5 text-[11px] text-slate-400">
            kcal przeliczone na podaną ilość
          </p>
        </div>

        {results.length > 0 && (
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {results.map((p, i) => {
              const n = p.nutriments ?? {};
              const kcal100 =
                n["energy-kcal_100g"] ?? n["energy-kcal_value"] ?? "?";
              const carbs = n.carbohydrates_100g ?? "?";
              const protein = n.proteins_100g ?? "?";
              const fat = n.fat_100g ?? "?";
              return (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-50">
                      {p.product_name ?? "Produkt"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {kcal100} kcal / 100g · W {carbs} · B {protein} · T {fat}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyProduct(p)}
                    className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/25"
                  >
                    Użyj
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </CollapsibleCard>

      {/* Biblioteka posiłków */}
      <CollapsibleCard title="Twoja biblioteka posiłków">
        {MEAL_CATEGORIES.map((cat) => {
          const items = library.filter((m) => m.category === cat.key);
          if (items.length === 0) return null;
          return (
            <div key={cat.key} className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                {cat.label}
              </p>
              {items.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-50">
                        {meal.name}
                      </p>
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                        {meal.calories || "—"} kcal
                      </span>
                    </div>
                    {meal.carbs || meal.protein || meal.fat ? (
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        W {meal.carbs || "—"} · B {meal.protein || "—"} · T{" "}
                        {meal.fat || "—"} g
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11px] text-slate-400">{meal.description}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => assignToClient(meal)}
                      className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/25"
                    >
                      Do diety
                    </button>
                    <button
                      type="button"
                      onClick={() => setLibrary(removeTrainerMeal(trainerId, meal.id))}
                      className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-400 hover:border-red-500/60 hover:text-red-300"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </CollapsibleCard>

      {/* Dieta klienta */}
      <CollapsibleCard title="Dieta klienta">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Docelowa kaloryczność (kcal)"
            value={diet.targetCalories}
            onChange={(v) => upd({ targetCalories: v })}
          />
        </div>
        {diet.meals.map((m, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-50">{m.name}</p>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                  {m.calories || "—"} kcal
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{m.description}</p>
            </div>
            <RemoveBtn onClick={() => removeFromClient(i)} />
          </div>
        ))}
        {diet.meals.length === 0 && (
          <p className="text-[11px] text-slate-500">
            Dodaj posiłki z biblioteki powyżej, aby złożyć dietę klienta.
          </p>
        )}
      </CollapsibleCard>
    </div>
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
  trainerId,
}: {
  c: TrainerContent;
  set: (c: TrainerContent) => void;
  trainerId: string;
}) {
  const t = c.training;
  const upd = (patch: Partial<TrainerContent["training"]>) => set({ ...c, training: { ...t, ...patch } });

  const [blocks, setBlocks] = useState(() => getTrainerWorkoutBlocks(trainerId));
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [blockName, setBlockName] = useState("");

  const applyBlock = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    upd({ dayExercises: { ...t.dayExercises, [selectedDay]: [...block.exercises] } });
  };

  const saveCurrentDayAsBlock = () => {
    const name = blockName.trim() || `Trening dzień ${selectedDay}`;
    const exercises = t.dayExercises[selectedDay] ?? [];
    setBlocks(saveTrainerWorkoutBlock(trainerId, { name, exercises }));
    setBlockName("");
  };

  return (
    <div className="space-y-4">
      {/* Dni tygodnia + statusy */}
      <Card>
        <p className="text-sm font-semibold text-slate-100">Dni tygodnia (status)</p>
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
      </Card>

      {/* Biblioteka treningów */}
      <Card>
        <p className="text-sm font-semibold text-slate-100">Twoja biblioteka treningów</p>
        <div className="flex flex-wrap gap-1.5">
          {t.days.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedDay(i + 1)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                selectedDay === i + 1
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Dzień {i + 1}
            </button>
          ))}
        </div>

        {blocks.length === 0 ? (
          <p className="text-[11px] text-slate-500">Brak zapisanych treningów.</p>
        ) : (
          <div className="space-y-2">
            {blocks.map((b) => (
              <div
                key={b.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-50">{b.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {b.exercises.length} ćwiczeń
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyBlock(b.id)}
                    className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/25"
                  >
                    Dzień {selectedDay}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlocks(removeTrainerWorkoutBlock(trainerId, b.id))}
                    className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-400 hover:border-red-500/60 hover:text-red-300"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input label="Nazwa nowego treningu" value={blockName} onChange={setBlockName} placeholder={`np. Trening dzień ${selectedDay}`} />
          </div>
          <button
            type="button"
            onClick={saveCurrentDayAsBlock}
            className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Zapisz dzień {selectedDay} jako trening
          </button>
        </div>
      </Card>

      {/* Ćwiczenia na wybrany dzień */}
      <Card>
        <p className="text-sm font-semibold text-slate-100">
          Ćwiczenia — Dzień {selectedDay}
        </p>
        {(() => {
          const list = t.dayExercises[selectedDay] ?? [];
          return (
            <>
              {list.map((ex, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <Input label="Nazwa ćwiczenia" value={ex.name} onChange={(v) => upd({ dayExercises: updateEx(t, selectedDay, i, { name: v }) })} />
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input label="Serie" value={ex.series} onChange={(v) => upd({ dayExercises: updateEx(t, selectedDay, i, { series: v }) })} />
                    <Input label="Czas pracy" value={ex.workTime} onChange={(v) => upd({ dayExercises: updateEx(t, selectedDay, i, { workTime: v }) })} />
                    <Input label="Przerwa" value={ex.rest} onChange={(v) => upd({ dayExercises: updateEx(t, selectedDay, i, { rest: v }) })} />
                  </div>
                  <RemoveBtn onClick={() => upd({ dayExercises: removeEx(t, selectedDay, i) })} />
                </div>
              ))}
              {list.length === 0 && (
                <p className="text-[11px] text-slate-500">
                  Brak ćwiczeń — dodaj poniżej lub zastosuj trening z biblioteki.
                </p>
              )}
              <AddBtn onClick={() => upd({ dayExercises: addEx(t, selectedDay) })} label="Dodaj ćwiczenie" />
            </>
          );
        })()}
      </Card>

      {/* Komentarz do treningu */}
      <Card>
        <p className="text-sm font-semibold text-slate-100">Komentarz do treningu</p>
        {t.comment.map((cm, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <Input label="Pojęcie" value={cm.label} onChange={(v) => upd({ comment: t.comment.map((x, j) => (j === i ? { ...x, label: v } : x)) })} />
            <TA label="Wyjaśnienie" rows={2} value={cm.text} onChange={(v) => upd({ comment: t.comment.map((x, j) => (j === i ? { ...x, text: v } : x)) })} />
            <RemoveBtn onClick={() => upd({ comment: t.comment.filter((_, j) => j !== i) })} />
          </div>
        ))}
        <AddBtn onClick={() => upd({ comment: [...t.comment, { label: "", text: "" }] })} label="Dodaj komentarz" />
      </Card>
    </div>
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
