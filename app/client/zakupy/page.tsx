"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, RotateCcw, Trash2, ShoppingBasket } from "lucide-react";
import {
  getClientContent,
  getMealChoices,
  MEAL_CATEGORIES,
  getShopping,
  toggleShoppingItem,
  addCustomShoppingItem,
  removeCustomShoppingItem,
  clearShoppingChecked,
  type ShoppingState,
} from "@/lib/store";

const todayISO = () => new Date().toISOString().slice(0, 10);

type ShopItem = { text: string; cat: string; label: string; meal: string };

// Opis dania („Skład / opis" od trenera) → pojedyncze produkty
function splitIngredients(src: string): string[] {
  return src
    .split(/[\n;,]+/)
    .map((s) => s.trim().replace(/[.,;]+$/, "").trim())
    .filter((s) => s.length > 1);
}

export default function ZakupyPage() {
  const [email, setEmail] = useState<string>("demo@fitcoach.ai");
  const [ready, setReady] = useState(false);
  const [planItems, setPlanItems] = useState<ShopItem[]>([]);
  const [shopping, setShopping] = useState<ShoppingState>({
    checked: [],
    custom: [],
  });
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const stored =
      window.localStorage.getItem("fitcoach_client_email") ??
      "demo@fitcoach.ai";
    setEmail(stored);
    setShopping(getShopping(stored));

    const content = getClientContent(stored);
    const choices = getMealChoices(stored, todayISO());
    const meals = content.diet.meals;

    const items: ShopItem[] = [];
    const seen = new Set<string>();
    for (const catDef of MEAL_CATEGORIES) {
      const variants = meals.filter(
        (m) => (m.category ?? "") === catDef.key
      );
      if (variants.length === 0) continue;
      const v = variants[choices[catDef.key] ?? 0] ?? variants[0];
      const source = v.description || v.name;
      const parts = splitIngredients(source);
      const list = parts.length > 0 ? parts : [v.name];
      for (const p of list) {
        const key = p.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        items.push({
          text: p,
          cat: catDef.key,
          label: catDef.label,
          meal: v.name,
        });
      }
    }
    setPlanItems(items);
    setReady(true);
  }, []);

  const toggle = (text: string) => setShopping(toggleShoppingItem(email, text));

  const addCustom = () => {
    const clean = newItem.trim();
    if (!clean) return;
    setShopping(addCustomShoppingItem(email, clean));
    setNewItem("");
  };

  const removeCustom = (text: string) =>
    setShopping(removeCustomShoppingItem(email, text));

  const clearAll = () => setShopping(clearShoppingChecked(email));

  if (!ready) return null;

  const customItems = shopping.custom;
  const total = planItems.length + customItems.length;
  const doneCount = shopping.checked.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const isDone = (text: string) => shopping.checked.includes(text);

  const row = (item: ShopItem, onRemove?: () => void) => (
    <li
      key={item.text}
      className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5"
    >
      <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={isDone(item.text)}
          onChange={() => toggle(item.text)}
          className="mt-0.5 h-4 w-4 flex-shrink-0 accent-emerald-500"
        />
        <div className="min-w-0">
          <p
            className={
              isDone(item.text)
                ? "text-sm text-slate-500 line-through"
                : "text-sm text-slate-100"
            }
          >
            {item.text}
          </p>
          <p className="text-[10px] text-slate-500">{item.meal}</p>
        </div>
      </label>
      {onRemove && (
        <button
          type="button"
          aria-label="Usuń produkt"
          onClick={onRemove}
          className="mt-1 text-slate-500 hover:text-rose-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </li>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
        <header className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-[0.18em] text-slate-50 md:text-4xl">
            LISTA ZAKUPÓW
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Automatycznie zbieramy skład Twoich dań z planu (wg wybranych
            wariantów). Odhaczaj w sklepie i dodawaj własne produkty.
          </p>
        </header>

        {/* Podsumowanie */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              <ShoppingBasket className="h-4 w-4" /> Postęp zakupów
            </p>
            <p className="text-slate-400">
              <span className="font-semibold text-emerald-400">{doneCount}</span>{" "}
              / {total} · {pct}%
            </p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Wyczyść zaznaczenia
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="np. mleko, banany..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                className="w-48 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustom}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
              >
                <Plus className="h-4 w-4" />
                Dodaj
              </button>
            </div>
          </div>
        </section>

        {/* Pozycje z planu diety */}
        {planItems.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
            Plan diety jest pusty — poproś trenera o uzupełnienie składu dań
            (pole „Skład / opis"), a lista zapełni się automatycznie.
          </section>
        ) : (
          MEAL_CATEGORIES.map((catDef) => {
            const items = planItems.filter((i) => i.cat === catDef.key);
            if (items.length === 0) return null;
            return (
              <section
                key={catDef.key}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  {catDef.label}
                </p>
                <ul className="mt-3 space-y-2">
                  {items.map((it) => row(it))}
                </ul>
              </section>
            );
          })
        )}

        {/* Własne produkty */}
        {customItems.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs text-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-300">
              Własne produkty
            </p>
            <ul className="mt-3 space-y-2">
              {customItems.map((text) =>
                row(
                  { text, cat: "custom", label: "Własne", meal: "dopisane ręcznie" },
                  () => removeCustom(text)
                )
              )}
            </ul>
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