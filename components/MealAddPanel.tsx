"use client";

// Dodawanie posiłków jak w Fitatu:
//  - 🧩 składniki: wyszukaj produkty, podaj gramatury, złóż danie (podsumowanie na żywo)
//  - ⭐ moje dania: powtarzaj zapisane dania (liczba porcji)
//  - ✏️ ręczne: nazwa + kcal/makro, gdy produktu nie ma w bazie
// Wpis ląduje w kategorii dnia i wchodzi w makro bilansu.

import { useEffect, useMemo, useState } from "react";
import {
  searchFoods,
  scaleFood,
  sumIngredients,
  FOOD_CATS,
  FOOD_BY_ID,
  type Food,
} from "@/lib/foods";
import {
  getSavedDishes,
  saveSavedDish,
  removeSavedDish,
  addDishLog,
  getDishLog,
  MAX_SAVED_DISHES,
  MAX_DISH_LOG_PER_DAY,
  type SavedDish,
  type DishLogEntry,
} from "@/lib/store";

const todayISO = () => new Date().toISOString().slice(0, 10);

const CAT_LABELS: Record<string, string> = {
  sniadanie: "Śniadanie",
  ii_sniadanie: "II śniadanie",
  obiad: "Obiad",
  podwieczorek: "Podwieczorek",
  kolacja: "Kolacja",
};

const POPULAR_IDS = [
  "pierz-kurczaka",
  "ryz",
  "jajko",
  "twarog",
  "owsianka",
  "chleb-zytni",
  "banan",
  "losos",
];

const r1 = (n: number) => Math.round(n * 10) / 10;

const num = (v: string) => {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

type Props = {
  email: string;
  category: string;
  categoryLabel: string;
  onClose: () => void;
  onSaved: (entries: DishLogEntry[]) => void;
};

export default function MealAddPanel({
  email,
  category,
  onClose,
  onSaved,
}: Props) {
  const [tab, setTab] = useState<"skladniki" | "moje" | "reczne">("skladniki");
  const [cat, setCat] = useState(category);
  const [extra, setExtra] = useState(false);
  const [err, setErr] = useState("");

  // 🧩 składniki
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<{ food: Food; grams: number }[]>([]);
  const [dishName, setDishName] = useState("");
  const [portions, setPortions] = useState("1");
  const [servings, setServings] = useState("1");
  const [asMine, setAsMine] = useState(true);

  // ⭐ moje dania
  const [savedDishes, setSavedDishes] = useState<SavedDish[]>([]);
  const [savedServings, setSavedServings] = useState<Record<string, string>>(
    {}
  );

  // ✏️ ręczne
  const [manual, setManual] = useState({
    name: "",
    kcal: "",
    p: "",
    c: "",
    f: "",
  });

  useEffect(() => {
    setSavedDishes(getSavedDishes(email));
  }, [email]);

  // Wyniki wyszukiwania; przy pustym polu — popularne produkty
  const results = useMemo(
    () =>
      query.trim()
        ? searchFoods(query)
        : (POPULAR_IDS.map((id) => FOOD_BY_ID[id]).filter(
            Boolean
          ) as Food[]),
    [query]
  );

  // Podsumowanie dania ze składników
  const ingredients = picked.map((p) => scaleFood(p.food, p.grams));
  const total = sumIngredients(ingredients);
  const N = Math.max(1, Math.round(num(portions) || 1));
  const eatN = Math.min(N, Math.max(0.5, num(servings) || 1));
  const logged = {
    kcal: Math.round((total.kcal * eatN) / N),
    protein: r1((total.protein * eatN) / N),
    carbs: r1((total.carbs * eatN) / N),
    fat: r1((total.fat * eatN) / N),
  };

  const addFood = (f: Food) => {
    setErr("");
    setPicked((prev) => {
      const idx = prev.findIndex((p) => p.food.id === f.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], grams: next[idx].grams + 100 };
        return next;
      }
      return [...prev, { food: f, grams: 100 }];
    });
    setQuery("");
  };

  const setGrams = (i: number, grams: number) => {
    setPicked((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, grams } : p))
    );
  };

  const removePicked = (i: number) => {
    setPicked((prev) => prev.filter((_, idx) => idx !== i));
  };

  const loadSavedIntoBuilder = (d: SavedDish) => {
    setPicked(d.ingredients.map((i) => ({ food: ingredientToFood(i), grams: i.grams })));
    setDishName(d.name);
    setPortions(String(d.portions));
    setServings(String(d.portions));
    setTab("skladniki");
    setErr("");
  };

  const saveEntry = (
    base: Omit<DishLogEntry, "id" | "createdAt" | "date" | "category">
  ) => {
    if (getDishLog(email, todayISO()).length >= MAX_DISH_LOG_PER_DAY) {
      setErr(`Limit ${MAX_DISH_LOG_PER_DAY} wpisów dziennie — usuń jakiś wpis.`);
      return;
    }
    const list = addDishLog(email, {
      ...base,
      date: todayISO(),
      category: cat,
    });
    onSaved(list);
  };

  const handleSave = () => {
    setErr("");
    if (tab === "skladniki") {
      if (ingredients.length === 0) {
        setErr("Dodaj przynajmniej jeden składnik.");
        return;
      }
      const name =
        dishName.trim() ||
        ingredients
          .map((i) => i.name.split(" (")[0])
          .slice(0, 3)
          .join(" + ");
      if (asMine && savedDishes.length < MAX_SAVED_DISHES) {
        setSavedDishes(
          saveSavedDish(email, { name, ingredients, portions: N, ...total })
        );
      }
      saveEntry({
        name,
        ...logged,
        ingredients,
        portions: N,
        servings: eatN,
        replacePlan: !extra,
        source: "skladniki",
      });
      return;
    }

    // ✏️ ręczne (zakładka ⭐ obsługuje się przyciskami przy każdym daniu)
    const kcal = num(manual.kcal);
    if (!manual.name.trim() || kcal <= 0) {
      setErr("Podaj nazwę i kalorie (min. 1 kcal).");
      return;
    }
    const entry = {
      name: manual.name.trim(),
      kcal: Math.round(kcal),
      protein: r1(num(manual.p)),
      carbs: r1(num(manual.c)),
      fat: r1(num(manual.f)),
      ingredients: [],
      portions: 1,
      servings: 1,
      replacePlan: !extra,
      source: "reczne" as const,
    };
    if (asMine && savedDishes.length < MAX_SAVED_DISHES) {
      setSavedDishes(
        saveSavedDish(email, {
          name: entry.name,
          ingredients: [],
          portions: 1,
          kcal: entry.kcal,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
        })
      );
    }
    saveEntry(entry);
  };

  const inputCls =
    "w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none";
  const gramsInput =
    "w-20 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-right text-xs text-slate-100 focus:border-sky-500 focus:outline-none";
  const tabCls = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
      active
        ? "bg-sky-500 text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.5)]"
        : "bg-slate-950/70 text-slate-300 hover:bg-slate-900"
    }`;

  return (
    <div className="space-y-4 rounded-2xl border border-sky-500/40 bg-slate-950/95 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
          ➕ Dodaj posiłek
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
        >
          ✕ Zamknij
        </button>
      </div>

      {/* Zakładki */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("skladniki")}
          className={tabCls(tab === "skladniki")}
        >
          🧩 Składniki
        </button>
        <button
          type="button"
          onClick={() => setTab("moje")}
          className={tabCls(tab === "moje")}
        >
          ⭐ Moje dania
        </button>
        <button
          type="button"
          onClick={() => setTab("reczne")}
          className={tabCls(tab === "reczne")}
        >
          ✏️ Ręczne
        </button>
      </div>

      {/* 🧩 SKŁADNIKI */}
      {tab === "skladniki" && (
        <div className="space-y-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj produktu: kurczak, ryż, jajko, twaróg…"
            className={inputCls}
          />

          {results.length > 0 && (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 p-2">
              {!query.trim() && (
                <p className="px-1 pb-1 text-[10px] uppercase tracking-wide text-slate-500">
                  Popularne
                </p>
              )}
              {results.slice(0, 10).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => addFood(f)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-slate-200 hover:bg-slate-800"
                >
                  <span className="min-w-0 truncate">
                    {f.name}
                    <span className="ml-2 text-[10px] text-slate-500">
                      {FOOD_CATS.find((c) => c.id === f.cat)?.label}
                    </span>
                  </span>
                  <span className="shrink-0 text-slate-400">
                    {f.kcal} kcal/100 g <span className="text-sky-400">＋</span>
                  </span>
                </button>
              ))}
            </div>
          )}
          {query.trim() && results.length === 0 && (
            <p className="text-xs text-slate-500">
              Brak w bazie — użyj zakładki ✏️ Ręczne, żeby dodać własne wartości.
            </p>
          )}

          {ingredients.length > 0 && (
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                Składniki dania
              </p>
              {ingredients.map((ing, i) => (
                <div
                  key={`${ing.name}-${i}`}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="min-w-0 flex-1 truncate text-slate-200">
                    {ing.name}
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={picked[i]?.grams ?? 0}
                    onChange={(e) =>
                      setGrams(i, Math.max(1, num(e.target.value)))
                    }
                    className={gramsInput}
                  />
                  <span className="w-4 shrink-0 text-slate-500">g</span>
                  <span className="w-20 shrink-0 text-right font-semibold text-sky-300">
                    {ing.kcal} kcal
                  </span>
                  <button
                    type="button"
                    onClick={() => removePicked(i)}
                    className="shrink-0 rounded px-1.5 text-slate-500 hover:bg-slate-800 hover:text-red-400"
                    title="Usuń składnik"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-2 text-xs">
                <span className="text-slate-400">Razem (całe danie):</span>
                <span className="font-semibold text-slate-100">
                  {total.kcal} kcal · W {total.carbs} · B {total.protein} · T{" "}
                  {total.fat} g
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-400">
                  Porcje:
                  <input
                    type="number"
                    min={1}
                    value={portions}
                    onChange={(e) => {
                      const v = String(
                        Math.max(1, Math.round(num(e.target.value) || 1))
                      );
                      setPortions(v);
                      setServings(v);
                    }}
                    className={gramsInput}
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-400">
                  Zjadam:
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className={gramsInput}
                  />
                  <span className="text-[10px]">z {N}</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                Do zapisu:{" "}
                <span className="font-semibold text-emerald-300">
                  {logged.kcal} kcal · W {logged.carbs} · B {logged.protein} · T{" "}
                  {logged.fat} g
                </span>
              </p>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="Nazwa dania (np. Kurczak z ryżem)"
              className={inputCls}
            />
            <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={asMine}
                onChange={(e) => setAsMine(e.target.checked)}
                className="accent-sky-500"
              />
              Zachowaj jako „moje danie" (do powtarzania)
            </label>
          </div>
        </div>
      )}

      {/* ⭐ MOJE DANIA */}
      {tab === "moje" && (
        <div className="space-y-2">
          {savedDishes.length === 0 ? (
            <p className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400">
              Nie masz jeszcze zapisanych dań. Złóż danie w zakładce 🧩
              Składniki i odhacz „Zachowaj jako moje danie" — potem dodasz je
              jednym kliknięciem.
            </p>
          ) : (
            savedDishes.map((d) => {
              const N2 = Math.max(1, d.portions);
              const eat = Math.min(
                N2,
                Math.max(0.5, num(savedServings[d.id] ?? String(N2)) || N2)
              );
              return (
                <div
                  key={d.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-100">
                        {d.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {d.ingredients.length > 0
                          ? `${d.ingredients.length} składn. · `
                          : ""}
                        {d.kcal} kcal całe · {Math.round(d.kcal / N2)}{" "}
                        kcal/porcja
                      </p>
                      {d.ingredients.length > 0 && (
                        <p className="mt-0.5 truncate text-[10px] text-slate-500">
                          {d.ingredients
                            .map((i) => `${i.name.split(" (")[0]} ${i.grams} g`)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSavedDishes(removeSavedDish(email, d.id))
                      }
                      className="shrink-0 rounded px-1.5 text-slate-500 hover:bg-slate-800 hover:text-red-400"
                      title="Usuń danie z listy"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      Porcje (z {N2}):
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={savedServings[d.id] ?? String(N2)}
                        onChange={(e) =>
                          setSavedServings((prev) => ({
                            ...prev,
                            [d.id]: e.target.value,
                          }))
                        }
                        className={gramsInput}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErr("");
                        saveEntry({
                          name: d.name,
                          kcal: Math.round((d.kcal * eat) / N2),
                          protein: r1((d.protein * eat) / N2),
                          carbs: r1((d.carbs * eat) / N2),
                          fat: r1((d.fat * eat) / N2),
                          ingredients: d.ingredients,
                          portions: N2,
                          servings: eat,
                          replacePlan: !extra,
                          source: "zapisane",
                        });
                      }}
                      className="rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold uppercase text-slate-950 hover:bg-emerald-400"
                    >
                      ➕ Dodaj do dnia
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSavedIntoBuilder(d)}
                      className="rounded-full border border-slate-700 px-3 py-1.5 text-[11px] text-slate-300 hover:border-sky-500 hover:text-sky-300"
                    >
                      Edytuj składniki
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ✏️ RĘCZNE */}
      {tab === "reczne" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Produktu nie ma w bazie? Wpisz wartości z opakowania (na porcję,
            którą jesz).
          </p>
          <input
            value={manual.name}
            onChange={(e) => setManual({ ...manual, name: e.target.value })}
            placeholder="Nazwa (np. Domowy gulasz cioci)"
            className={inputCls}
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { k: "kcal" as const, label: "kcal" },
              { k: "p" as const, label: "Białko (g)" },
              { k: "c" as const, label: "Węgle (g)" },
              { k: "f" as const, label: "Tłuszcze (g)" },
            ].map((f) => (
              <label key={f.k} className="text-[11px] text-slate-400">
                {f.label}
                <input
                  type="number"
                  min={0}
                  value={manual[f.k]}
                  onChange={(e) =>
                    setManual({ ...manual, [f.k]: e.target.value })
                  }
                  className={`${inputCls} mt-1`}
                />
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={asMine}
              onChange={(e) => setAsMine(e.target.checked)}
              className="accent-sky-500"
            />
            Zachowaj jako „moje danie" (do powtarzania)
          </label>
        </div>
      )}

      {/* Wspólne: kategoria + zamiast/dodatkowo + zapis */}
      <div className="space-y-3 border-t border-slate-800 pt-3">
        <label className="text-xs text-slate-400">
          Kategoria:{" "}
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-none"
          >
            {Object.entries(CAT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-3 text-xs">
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 ${
              !extra
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                : "border-slate-700 text-slate-400"
            }`}
          >
            <input
              type="radio"
              name="dishMode"
              checked={!extra}
              onChange={() => setExtra(false)}
              className="accent-emerald-500"
            />
            Zamiast planowanego ({CAT_LABELS[cat]})
          </label>
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 ${
              extra
                ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                : "border-slate-700 text-slate-400"
            }`}
          >
            <input
              type="radio"
              name="dishMode"
              checked={extra}
              onChange={() => setExtra(true)}
              className="accent-amber-500"
            />
            Dodatkowo (np. przekąska)
          </label>
        </div>

        {err && <p className="text-[11px] text-red-400">{err}</p>}

        {tab !== "moje" && (
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl bg-sky-500 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-sky-400"
          >
            ✓ Dodaj do dnia — {CAT_LABELS[cat]}
            {tab === "skladniki" && ingredients.length > 0
              ? ` · ${logged.kcal} kcal`
              : ""}
          </button>
        )}
        {tab === "moje" && (
          <p className="text-center text-[11px] text-slate-500">
            Wybierz porcję i kliknij „➕ Dodaj do dnia" przy daniu.
          </p>
        )}
      </div>
    </div>
  );
}

// Odtworzenie „produktu" ze zapisanego składnika (dania ręczne nie mają ID)
function ingredientToFood(i: {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}): Food {
  const g = Math.max(1, i.grams);
  return {
    id: `custom-${i.name}`,
    name: i.name,
    cat: "dania",
    kcal: Math.round((i.kcal / g) * 100),
    protein: Math.round((i.protein / g) * 1000) / 10,
    carbs: Math.round((i.carbs / g) * 1000) / 10,
    fat: Math.round((i.fat / g) * 1000) / 10,
  };
}