"use client";

import { useMemo, useState } from "react";
import type {
  TrainerContent,
  Meal,
  Product,
  MealCategory,
} from "@/lib/store";
import {
  MEAL_CATEGORIES,
  getTrainerMeals,
  saveTrainerMeal,
  removeTrainerMeal,
  getTrainerProducts,
  saveTrainerProduct,
  removeTrainerProduct,
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

  const [quickCat, setQuickCat] = useState<MealCategory>("sniadanie");

  const [query, setQuery] = useState("");
  const [grams, setGrams] = useState("100");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Produkty (biblioteka surowców, np. chleb żytni)
  const [products, setProducts] = useState<Product[]>(() =>
    getTrainerProducts(trainerId)
  );
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pKcal100, setPKcal100] = useState("");
  const [pCarbs100, setPCarbs100] = useState("");
  const [pProtein100, setPProtein100] = useState("");
  const [pFat100, setPFat100] = useState("");
  const [gramsById, setGramsById] = useState<Record<string, string>>({});

  const addToProducts = () => {
    if (!pName.trim()) return;
    setProducts(
      saveTrainerProduct(trainerId, {
        name: pName.trim(),
        description: pDesc.trim(),
        kcal100: pKcal100.trim(),
        carbs100: pCarbs100.trim(),
        protein100: pProtein100.trim(),
        fat100: pFat100.trim(),
      })
    );
    setPName("");
    setPDesc("");
    setPKcal100("");
    setPCarbs100("");
    setPProtein100("");
    setPFat100("");
  };

  const productFromBase = (p: any) => {
    const n = p.nutriments ?? {};
    const kcal100 = n["energy-kcal_100g"] ?? n["energy-kcal_value"] ?? "";
    setPName(p.product_name ?? "");
    setPKcal100(kcal100 ? String(Math.round(Number(kcal100))) : "");
    setPCarbs100(
      n.carbohydrates_100g != null ? String(Math.round(n.carbohydrates_100g)) : ""
    );
    setPProtein100(
      n.proteins_100g != null ? String(Math.round(n.proteins_100g)) : ""
    );
    setPFat100(
      n.fat_100g != null ? String(Math.round(n.fat_100g)) : ""
    );
  };

  const assignProductToClient = (p: Product) => {
    const g = Number(gramsById[p.id]) || 100;
    const kcal = p.kcal100
      ? Math.round((Number(p.kcal100) * g) / 100)
      : "";
    const sc = (v?: string) =>
      v ? String(Math.round((Number(v) * g) / 100)) : "";
    upd({
      meals: [
        ...diet.meals,
        {
          category: quickCat,
          name: p.name,
          description: `${p.description || ""} · ${g} g`.trim(),
          calories: String(kcal),
          carbs: sc(p.carbs100),
          protein: sc(p.protein100),
          fat: sc(p.fat100),
        },
      ],
    });
  };

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
        {
          category: meal.category,
          name: meal.name,
          description: meal.description,
          calories: meal.calories,
          carbs: meal.carbs,
          protein: meal.protein,
          fat: meal.fat,
        },
      ],
    });
  };

  const addCustomProduct = (cat: MealCategory, p: { name: string; description: string; calories: string; carbs?: string; protein?: string; fat?: string }) => {
    if (!p.name.trim()) return;
    upd({
      meals: [
        ...diet.meals,
        { category: cat, ...p },
      ],
    });
  };

  const removeFromClientByIndex = (cat: MealCategory, i: number) =>
    upd({ meals: removeFromClientHelper(diet.meals, cat, i) });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Kolumna 1: Dieta klienta */}
      <div className="space-y-3">
        <CollapsibleCard title="1. Dieta klienta (na dzień)">
          <Input
            label="Docelowa kaloryczność (kcal)"
            value={diet.targetCalories}
            onChange={(v) => upd({ targetCalories: v })}
          />
          {MEAL_CATEGORIES.map((cat) => {
            const items = diet.meals.filter((m) => (m.category ?? "") === cat.key);
            const kcalSum = items.reduce(
              (s, m) => s + (Number(m.calories) || 0),
              0
            );
            return (
              <div key={cat.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                    {cat.label}
                  </p>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                    {kcalSum} kcal
                  </span>
                </div>
                {items.map((m, i) => (
                  <div
                    key={`${m.name}-${i}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-50">
                          {m.name}
                        </p>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                          {m.calories || "—"} kcal
                        </span>
                      </div>
                      {m.carbs || m.protein || m.fat ? (
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          W {m.carbs || "—"} · B {m.protein || "—"} · T {m.fat || "—"} g
                        </p>
                      ) : null}
                      {m.description && (
                        <p className="mt-1 text-[11px] text-slate-400">{m.description}</p>
                      )}
                    </div>
                    <RemoveBtn onClick={() => removeFromClientByIndex(cat.key, i)} />
                  </div>
                ))}
                <QuickProductForm
                  categoryLabel={cat.label}
                  trainerId={trainerId}
                  onAdd={(p) => addCustomProduct(cat.key, p)}
                />
              </div>
            );
          })}
        </CollapsibleCard>
      </div>

      {/* Kolumna 2: Nasze dania */}
      <div className="space-y-3">
        <CollapsibleCard title="2. Nasze dania">
          <div className="grid gap-2 sm:grid-cols-2">
            <Select
              label="Typ posiłku"
              value={category}
              onChange={(v) => setCategory(v as MealCategory)}
              options={MEAL_CATEGORIES.map((m) => ({ value: m.key, label: m.label }))}
            />
            <Input label="Nazwa dania" value={name} onChange={setName} placeholder="np. Owsianka" />
          </div>
          <TA label="Skład / opis" rows={2} value={description} onChange={setDescription} />
          <div className="grid gap-2 grid-cols-4">
            <Input label="kcal" value={calories} onChange={setCalories} placeholder="550" />
            <Input label="W" value={carbs} onChange={setCarbs} placeholder="60" />
            <Input label="B" value={protein} onChange={setProtein} placeholder="30" />
            <Input label="T" value={fat} onChange={setFat} placeholder="20" />
          </div>
          <AddBtn onClick={addToLibrary} label="Dodaj danie do listy" />

          <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
            {library.length === 0 && (
              <p className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-[11px] text-slate-400">
                Lista dań jest pusta.
              </p>
            )}
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
                      className="flex items-start justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
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
                      </div>
                      <div className="flex flex-col gap-1">
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
          </div>
        </CollapsibleCard>
      </div>

      {/* Kolumna 3: Produkty */}
      <div className="space-y-3">
        <CollapsibleCard title="3. Produkty (np. chleb żytni)">
          <Select
            label="Przypisz do kategorii w diecie"
            value={quickCat}
            onChange={(v) => setQuickCat(v as MealCategory)}
            options={MEAL_CATEGORIES.map((m) => ({ value: m.key, label: m.label }))}
          />

          <div className="grid gap-2 grid-cols-2">
            <div className="col-span-2">
              <Input label="Nazwa produktu" value={pName} onChange={setPName} placeholder="np. Chleb żytni" />
            </div>
            <Input label="kcal / 100g" value={pKcal100} onChange={setPKcal100} placeholder="250" />
            <Input label="W (g)" value={pCarbs100} onChange={setPCarbs100} placeholder="20" />
            <Input label="B (g)" value={pProtein100} onChange={setPProtein100} placeholder="4" />
            <Input label="T (g)" value={pFat100} onChange={setPFat100} placeholder="1" />
          </div>
          <AddBtn onClick={addToProducts} label="Zapisz produkt" />

          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchProducts()}
                placeholder="Szukaj w bazie (OpenFoodFacts)..."
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={searchProducts}
                disabled={searching}
                className="rounded-full bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-50"
              >
                {searching ? "..." : "Szukaj"}
              </button>
            </div>
            {results.length > 0 && (
              <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {results.map((p, i) => {
                  const n = p.nutriments ?? {};
                  const kcal100 = n["energy-kcal_100g"] ?? n["energy-kcal_value"] ?? "?";
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => productFromBase(p)}
                      className="block w-full rounded-md px-2 py-1 text-left text-xs text-slate-200 hover:bg-slate-800"
                    >
                      {p.product_name ?? "Produkt"} · {kcal100} kcal/100g
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-1 space-y-2">
            {products.length === 0 && (
              <p className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-[11px] text-slate-400">
                Brak zapisanych produktów.
              </p>
            )}
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-start justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-50">{p.name}</p>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                      {p.kcal100 || "—"} kcal/100g
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <input
                      type="number"
                      value={gramsById[p.id] ?? "100"}
                      onChange={(e) => setProductGrams(p.id, e.target.value)}
                      className="w-20 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 outline-none focus:border-emerald-400"
                    />
                    <span className="text-[10px] text-slate-400">g</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => assignProductToClient(p)}
                    className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/25"
                  >
                    Do diety
                  </button>
                  <button
                    type="button"
                    onClick={() => setProducts(removeTrainerProduct(trainerId, p.id))}
                    className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-400 hover:border-red-500/60 hover:text-red-300"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleCard>
      </div>
    </div>
  );
}

function removeFromClientHelper(
  meals: { category?: string }[],
  cat: string,
  i: number
) {
  let seen = -1;
  return meals.filter((m) => {
    if ((m.category ?? "") !== cat) return true;
    seen++;
    return seen !== i;
  });
}

function QuickProductForm({
  categoryLabel,
  trainerId,
  onAdd,
}: {
  categoryLabel: string;
  trainerId: string;
  onAdd: (p: {
    name: string;
    description: string;
    calories: string;
    carbs?: string;
    protein?: string;
    fat?: string;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [grams, setGrams] = useState("100");
  const [kcal100, setKcal100] = useState("");
  const [carbs100, setCarbs100] = useState("");
  const [protein100, setProtein100] = useState("");
  const [fat100, setFat100] = useState("");

  const myRecipes = useMemo(() => getTrainerMeals(trainerId), [trainerId, open]);

  const g = Number(grams) || 100;
  const scale = (v: string) => {
    const n = Number(v);
    if (!v.trim() || Number.isNaN(n)) return "";
    return String(Math.round((n * g) / 100));
  };
  const previewKcal = scale(kcal100);

  const reset = () => {
    setName("");
    setGrams("100");
    setKcal100("");
    setCarbs100("");
    setProtein100("");
    setFat100("");
  };

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      description: "",
      calories: scale(kcal100),
      carbs: scale(carbs100),
      protein: scale(protein100),
      fat: scale(fat100),
    });
    reset();
    setOpen(false);
  };

  const addRecipe = (m: Meal) => {
    onAdd({
      name: m.name,
      description: m.description || "",
      calories: m.calories || "",
      carbs: m.carbs ?? "",
      protein: m.protein ?? "",
      fat: m.fat ?? "",
    });
    setOpen(false);
  };

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { product_name?: string; nutriments?: Record<string, number> }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchProducts = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(false);
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        query.trim()
      )}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,nutriments`;
      const r = await fetch(url);
      const j = await r.json();
      setResults(j.products || []);
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const applyProduct = (p: { product_name?: string; nutriments?: Record<string, number> }) => {
    const n = p.nutriments ?? {};
    const kcal = n["energy-kcal_100g"];
    setName(p.product_name ?? "");
    setKcal100(kcal != null ? String(Math.round(kcal)) : "");
    setCarbs100(n.carbohydrates_100g != null ? String(Math.round(n.carbohydrates_100g)) : "");
    setProtein100(n.proteins_100g != null ? String(Math.round(n.proteins_100g)) : "");
    setFat100(n.fat_100g != null ? String(Math.round(n.fat_100g)) : "");
  };

  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[11px] font-medium text-emerald-300 hover:text-emerald-200"
        >
          + Dodaj produkt ({categoryLabel})
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Dodaj do: {categoryLabel}
          </p>

          {myRecipes.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-medium text-slate-300">Z Twoich przepisów:</p>
              <div className="flex flex-wrap gap-1.5">
                {myRecipes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => addRecipe(m)}
                    className="rounded-full border border-emerald-600/50 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200 hover:bg-emerald-500/20"
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Input label="Nazwa (np. Chleb żytni)" value={name} onChange={setName} />
          <div className="grid gap-2 sm:grid-cols-5">
            <Input label="Ilość (g)" value={grams} onChange={setGrams} type="number" placeholder="100" />
            <Input label="kcal / 100g" value={kcal100} onChange={setKcal100} placeholder="np. 250" />
            <Input label="W (g)" value={carbs100} onChange={setCarbs100} placeholder="np. 20" />
            <Input label="B (g)" value={protein100} onChange={setProtein100} placeholder="np. 4" />
            <Input label="T (g)" value={fat100} onChange={setFat100} placeholder="np. 1" />
          </div>
          {previewKcal && (
            <p className="text-[11px] text-slate-400">
              Przy {g} g: <span className="font-semibold text-emerald-300">{previewKcal} kcal</span> (wartości kcal/makro liczone na 100 g)
            </p>
          )}

          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-2">
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchProducts()}
                placeholder="Szukaj produktu w bazie (OpenFoodFacts)..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={searchProducts}
                className="shrink-0 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-600"
              >
                {searching ? "..." : "Szukaj"}
              </button>
            </div>
            {searched && results.length === 0 && (
              <p className="mt-1 text-[11px] text-slate-500">Brak wyników.</p>
            )}
            {results.length > 0 && (
              <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                {results.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyProduct(p)}
                    className="block w-full rounded-md px-2 py-1 text-left text-xs text-slate-200 hover:bg-slate-800"
                  >
                    {p.product_name || "(bez nazwy)"}
                    <span className="ml-1 text-[10px] text-slate-500">
                      {p.nutriments?.["energy-kcal_100g"] != null
                        ? `${Math.round(p.nutriments["energy-kcal_100g"])} kcal/100g`
                        : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={submit}
              className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Dodaj do diety
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="rounded-full border border-slate-700 px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}
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
