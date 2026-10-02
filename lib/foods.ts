// Baza produktów do składania dań (jak w Fitatu) — wartości ODŻYWCZE NA 100 g.
// Wyszukiwanie odporna na polskie znaki (ł → l, diakrytyki usuwane).

export type Food = {
  id: string;
  name: string;
  cat: FoodCat;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  aliases?: string[];
};

export type FoodCat =
  | "mieso"
  | "nabial"
  | "zboze"
  | "warzywa"
  | "owoce"
  | "tluszcze"
  | "dania"
  | "przekaski"
  | "napoje";

export const FOOD_CATS: { id: FoodCat; label: string }[] = [
  { id: "mieso", label: "Mięso i ryby" },
  { id: "nabial", label: "Nabiał" },
  { id: "zboze", label: "Zbożowe i kasze" },
  { id: "warzywa", label: "Warzywa" },
  { id: "owoce", label: "Owoce" },
  { id: "tluszcze", label: "Tłuszcze i orzechy" },
  { id: "dania", label: "Gotowe dania" },
  { id: "przekaski", label: "Przekąski i słodycze" },
  { id: "napoje", label: "Napoje" },
];

export const FOODS: Food[] = [
  // ---- Mięso i ryby ----
  { id: "pierz-kurczaka", name: "Pierś z kurczaka (gotowana)", cat: "mieso", kcal: 165, protein: 31, carbs: 0, fat: 4 },
  { id: "kurczak-mielony", name: "Mielone z kurczaka", cat: "mieso", kcal: 180, protein: 20, carbs: 0, fat: 10 },
  { id: "indyk", name: "Pierś z indyka (gotowana)", cat: "mieso", kcal: 135, protein: 29, carbs: 0, fat: 1 },
  { id: "mielone-wolowe", name: "Mielone wołowe (smażone)", cat: "mieso", kcal: 250, protein: 26, carbs: 0, fat: 17 },
  { id: "mielone-wieprzowe", name: "Mielone wieprzowe (smażone)", cat: "mieso", kcal: 290, protein: 16, carbs: 0, fat: 24 },
  { id: "schabowy", name: "Kotlet schabowy (smażony)", cat: "mieso", kcal: 280, protein: 20, carbs: 10, fat: 18 },
  { id: "karkowka", name: "Karkówka pieczona", cat: "mieso", kcal: 320, protein: 24, carbs: 0, fat: 24 },
  { id: "wolowina-stek", name: "Wołowina / stek", cat: "mieso", kcal: 271, protein: 26, carbs: 0, fat: 18 },
  { id: "szynka", name: "Szynka gotowana", cat: "mieso", kcal: 145, protein: 21, carbs: 1, fat: 6 },
  { id: "kielbasa", name: "Kiełbasa (surowa)", cat: "mieso", kcal: 300, protein: 12, carbs: 2, fat: 27 },
  { id: "boczek", name: "Boczek wędzony", cat: "mieso", kcal: 540, protein: 9, carbs: 0, fat: 55 },
  { id: "losos", name: "Łosoś", cat: "mieso", kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { id: "dorsz", name: "Dorsz", cat: "mieso", kcal: 82, protein: 18, carbs: 0, fat: 1 },
  { id: "tunczyk", name: "Tuńczyk (w wodzie, puszka)", cat: "mieso", kcal: 116, protein: 26, carbs: 0, fat: 1 },
  { id: "krewetki", name: "Krewetki", cat: "mieso", kcal: 99, protein: 24, carbs: 0, fat: 0.3 },

  // ---- Nabiał ----
  { id: "jajko", name: "Jajko (100 g ≈ 2 szt.)", cat: "nabial", kcal: 143, protein: 13, carbs: 1, fat: 9.5 },
  { id: "twarog", name: "Twaróg półtłusty", cat: "nabial", kcal: 140, protein: 18, carbs: 3, fat: 6 },
  { id: "twarog-chudy", name: "Twaróg chudy", cat: "nabial", kcal: 99, protein: 18, carbs: 3, fat: 1 },
  { id: "ser-zolty", name: "Ser żółty (gouda)", cat: "nabial", kcal: 350, protein: 25, carbs: 2, fat: 27 },
  { id: "feta", name: "Ser feta", cat: "nabial", kcal: 264, protein: 14, carbs: 4, fat: 21 },
  { id: "mozzarella", name: "Mozzarella", cat: "nabial", kcal: 280, protein: 28, carbs: 3, fat: 17 },
  { id: "ser-smazony", name: "Ser smażony / camembert", cat: "nabial", kcal: 350, protein: 15, carbs: 2, fat: 31 },
  { id: "mleko-2", name: "Mleko 2%", cat: "nabial", kcal: 50, protein: 3.3, carbs: 5, fat: 2 },
  { id: "mleko-0", name: "Mleko 0%", cat: "nabial", kcal: 34, protein: 3.4, carbs: 5, fat: 0.1 },
  { id: "jogurt-naturalny", name: "Jogurt naturalny", cat: "nabial", kcal: 60, protein: 4, carbs: 4, fat: 3.3 },
  { id: "jogurt-grek", name: "Jogurt grecki 10%", cat: "nabial", kcal: 97, protein: 9, carbs: 4, fat: 5 },
  { id: "smietana", name: "Śmietana 18%", cat: "nabial", kcal: 180, protein: 2.5, carbs: 3, fat: 18 },
  { id: "maslo", name: "Masło", cat: "nabial", kcal: 717, protein: 0.9, carbs: 0.1, fat: 81 },

  // ---- Zbożowe i kasze ----
  { id: "ryz", name: "Ryż biały (gotowany)", cat: "zboze", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: "ryz-brazowy", name: "Ryż brązowy (gotowany)", cat: "zboze", kcal: 112, protein: 2.6, carbs: 24, fat: 0.9 },
  { id: "makaron", name: "Makaron (gotowany)", cat: "zboze", kcal: 158, protein: 5.8, carbs: 31, fat: 0.9 },
  { id: "kasza-gryczana", name: "Kasza gryczana (gotowana)", cat: "zboze", kcal: 110, protein: 4.5, carbs: 20, fat: 1.5 },
  { id: "kasza-jaglana", name: "Kasza jaglana (gotowana)", cat: "zboze", kcal: 110, protein: 3.5, carbs: 23, fat: 1 },
  { id: "kuskus", name: "Kuskus (gotowany)", cat: "zboze", kcal: 112, protein: 3.8, carbs: 23, fat: 0.2 },
  { id: "owsianka", name: "Płatki owsiane (suche)", cat: "zboze", kcal: 379, protein: 13, carbs: 67, fat: 6.5 },
  { id: "chleb-zytni", name: "Chleb żytni", cat: "zboze", kcal: 230, protein: 8, carbs: 48, fat: 3 },
  { id: "bulka", name: "Bułka pszenna", cat: "zboze", kcal: 265, protein: 9, carbs: 50, fat: 5 },
  { id: "tortilla", name: "Tortilla / wrap", cat: "zboze", kcal: 300, protein: 8, carbs: 50, fat: 7 },
  { id: "ziemniaki", name: "Ziemniaki (gotowane)", cat: "zboze", kcal: 87, protein: 2, carbs: 20, fat: 0.1 },
  { id: "frytki", name: "Frytki", cat: "zboze", kcal: 312, protein: 3.4, carbs: 41, fat: 15 },
  { id: "nalesniki", name: "Naleśniki (ciasto)", cat: "zboze", kcal: 220, protein: 8, carbs: 28, fat: 8 },
  { id: "ziemniaczane-placki", name: "Placki ziemniaczane", cat: "zboze", kcal: 240, protein: 5, carbs: 32, fat: 11 },

  // ---- Warzywa ----
  { id: "pomidor", name: "Pomidor", cat: "warzywa", kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { id: "ogorek", name: "Ogórek", cat: "warzywa", kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { id: "salata", name: "Sałata liściowa", cat: "warzywa", kcal: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  { id: "papryka", name: "Papryka", cat: "warzywa", kcal: 27, protein: 1, carbs: 6, fat: 0.3 },
  { id: "cebula", name: "Cebula", cat: "warzywa", kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  { id: "marchew", name: "Marchew", cat: "warzywa", kcal: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { id: "brokul", name: "Brokuł", cat: "warzywa", kcal: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { id: "kalafior", name: "Kalafior", cat: "warzywa", kcal: 25, protein: 1.9, carbs: 5, fat: 0.3 },
  { id: "kapusta", name: "Kapusta / coleslaw", cat: "warzywa", kcal: 25, protein: 1.3, carbs: 5.8, fat: 0.1 },
  { id: "cukinia", name: "Cukinia", cat: "warzywa", kcal: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  { id: "szpinak", name: "Szpinak", cat: "warzywa", kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { id: "pieczarki", name: "Pieczarki", cat: "warzywa", kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  { id: "fasola-czerwona", name: "Fasola czerwona (gotowana)", cat: "warzywa", kcal: 127, protein: 8.7, carbs: 23, fat: 0.5 },
  { id: "groszek", name: "Groszek zielony", cat: "warzywa", kcal: 81, protein: 5, carbs: 14, fat: 0.4 },
  { id: "kukurydza", name: "Kukurydza", cat: "warzywa", kcal: 86, protein: 3.3, carbs: 19, fat: 1.4 },

  // ---- Owoce ----
  { id: "banan", name: "Banan", cat: "owoce", kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { id: "jablko", name: "Jabłko", cat: "owoce", kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { id: "pomarancza", name: "Pomarańcza", cat: "owoce", kcal: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  { id: "winogrona", name: "Winogrona", cat: "owoce", kcal: 69, protein: 0.7, carbs: 18, fat: 0.2 },
  { id: "truskawki", name: "Truskawki", cat: "owoce", kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  { id: "borowki", name: "Borówki", cat: "owoce", kcal: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  { id: "awokado", name: "Awokado", cat: "owoce", kcal: 160, protein: 2, carbs: 9, fat: 15 },
  { id: "kiwi", name: "Kiwi", cat: "owoce", kcal: 61, protein: 1.1, carbs: 15, fat: 0.5 },

  // ---- Tłuszcze i orzechy ----
  { id: "olej-rzepakowy", name: "Olej rzepakowy", cat: "tluszcze", kcal: 884, protein: 0, carbs: 0, fat: 100 },
  { id: "oliwa", name: "Oliwa z oliwek", cat: "tluszcze", kcal: 884, protein: 0, carbs: 0, fat: 100 },
  { id: "orzechy-wloskie", name: "Orzechy włoskie", cat: "tluszcze", kcal: 654, protein: 15, carbs: 14, fat: 65 },
  { id: "nerkowce", name: "Orzechy nerkowca", cat: "tluszcze", kcal: 553, protein: 18, carbs: 30, fat: 44 },
  { id: "migdaly", name: "Migdały", cat: "tluszcze", kcal: 579, protein: 21, carbs: 22, fat: 50 },
  { id: "slonecznik", name: "Nasiona słonecznika", cat: "tluszcze", kcal: 584, protein: 21, carbs: 20, fat: 52 },
  { id: "pestki-dyni", name: "Pestki dyni", cat: "tluszcze", kcal: 559, protein: 30, carbs: 11, fat: 49 },
  { id: "hummus", name: "Hummus", cat: "tluszcze", kcal: 166, protein: 8, carbs: 14, fat: 10 },

  // ---- Gotowe dania ----
  { id: "pizza-margherita", name: "Pizza margherita", cat: "dania", kcal: 266, protein: 11, carbs: 33, fat: 10 },
  { id: "pierogi-ruskie", name: "Pierogi ruskie (gotowane)", cat: "dania", kcal: 170, protein: 6, carbs: 25, fat: 5 },
  { id: "pierogi-miesne", name: "Pierogi mięsne (gotowane)", cat: "dania", kcal: 190, protein: 8, carbs: 26, fat: 6 },
  { id: "golabki", name: "Gołąbki w sosie", cat: "dania", kcal: 130, protein: 7, carbs: 12, fat: 6 },
  { id: "zurek", name: "Żurek", cat: "dania", kcal: 60, protein: 3, carbs: 6, fat: 2.5 },
  { id: "pomidorowa", name: "Zupa pomidorowa", cat: "dania", kcal: 50, protein: 1.5, carbs: 5, fat: 2.5 },
  { id: "bigos", name: "Bigos", cat: "dania", kcal: 90, protein: 5, carbs: 7, fat: 4 },
  { id: "kebab", name: "Kebab w bułce", cat: "dania", kcal: 250, protein: 15, carbs: 25, fat: 10 },
  { id: "kurczak-5-smakow", name: "Kurczak w pięciu smakach", cat: "dania", kcal: 190, protein: 18, carbs: 8, fat: 9 },
  { id: "zapiekanka", name: "Zapiekanka z pieczarkami", cat: "dania", kcal: 210, protein: 9, carbs: 24, fat: 8 },
  { id: "omlet", name: "Omlet (2 jajka)", cat: "dania", kcal: 180, protein: 13, carbs: 1, fat: 14 },
  { id: "jajecznica", name: "Jajecznica na maśle", cat: "dania", kcal: 210, protein: 13, carbs: 2, fat: 17 },
  { id: "kotlet-devolaj", name: "Devolay (smażony)", cat: "dania", kcal: 260, protein: 19, carbs: 12, fat: 15 },

  // ---- Przekąski i słodycze ----
  { id: "chipsy", name: "Chipsy ziemniaczane", cat: "przekaski", kcal: 536, protein: 7, carbs: 53, fat: 34 },
  { id: "czekolada-mleczna", name: "Czekolada mleczna", cat: "przekaski", kcal: 535, protein: 7.5, carbs: 59, fat: 30 },
  { id: "czekolada-gorzka", name: "Czekolada gorzka 70%", cat: "przekaski", kcal: 546, protein: 10, carbs: 46, fat: 31 },
  { id: "ciasto-czekoladowe", name: "Ciasto czekoladowe", cat: "przekaski", kcal: 370, protein: 5, carbs: 50, fat: 17 },
  { id: "lody", name: "Lody waniliowe", cat: "przekaski", kcal: 207, protein: 3.5, carbs: 24, fat: 11 },
  { id: "wafle-ryzowe", name: "Wafle ryżowe", cat: "przekaski", kcal: 387, protein: 8, carbs: 82, fat: 3 },
  { id: "baton-bialkowy", name: "Baton białkowy", cat: "przekaski", kcal: 350, protein: 33, carbs: 34, fat: 10 },
  { id: "orzeszki-ziemne", name: "Orzeszki ziemne", cat: "przekaski", kcal: 567, protein: 26, carbs: 16, fat: 49 },

  // ---- Napoje ----
  { id: "kawa-czarna", name: "Kawa czarna", cat: "napoje", kcal: 2, protein: 0.1, carbs: 0, fat: 0 },
  { id: "kawa-latte", name: "Kawa latte (mleko 2%)", cat: "napoje", kcal: 46, protein: 3, carbs: 4.6, fat: 1.9 },
  { id: "herbata", name: "Herbata (bez cukru)", cat: "napoje", kcal: 1, protein: 0, carbs: 0, fat: 0 },
  { id: "sok-pomaranczowy", name: "Sok pomarańczowy", cat: "napoje", kcal: 45, protein: 0.7, carbs: 10, fat: 0.2 },
  { id: "cola", name: "Cola / napój słodzony", cat: "napoje", kcal: 42, protein: 0, carbs: 10.6, fat: 0 },
  { id: "piwo", name: "Piwo (500 ml)", cat: "napoje", kcal: 43, protein: 0.5, carbs: 3.6, fat: 0 },
  { id: "wino-czerwone", name: "Wino czerwone", cat: "napoje", kcal: 85, protein: 0.1, carbs: 2.6, fat: 0 },
  { id: "odzywka-bialkowa", name: "Odżywka białkowa (proszek)", cat: "napoje", kcal: 400, protein: 80, carbs: 10, fat: 5 },
  { id: "kakao-mleko", name: "Kakao na mleku", cat: "napoje", kcal: 70, protein: 3.5, carbs: 9, fat: 2.3 },
];

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export const FOOD_BY_ID: Record<string, Food> = FOODS.reduce(
  (acc, f) => {
    acc[f.id] = f;
    return acc;
  },
  {} as Record<string, Food>
);

// Wyszukiwanie w bazie — zwraca maks. 30 trafień, lepiej dopasowane wyżej.
export function searchFoods(query: string, limit = 30): Food[] {
  const q = normalizeText(query.trim());
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);
  const scored: { food: Food; score: number }[] = [];
  for (const f of FOODS) {
    const name = normalizeText(f.name);
    const hay = `${name} ${normalizeText((f.aliases ?? []).join(" "))}`;
    let score = 0;
    if (name.startsWith(q)) score = 100;
    else if (name.includes(q)) score = 60;
    else if (words.every((w) => name.includes(w))) score = 40;
    else if (words.some((w) => hay.includes(w))) score = 20;
    if (score > 0) scored.push({ food: f, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name))
    .slice(0, limit)
    .map((s) => s.food);
}

// Przeliczenie wartości produktu na podaną gramaturę (zaokrąglone do 0.1 g).
export function scaleFood(
  food: Food,
  grams: number
): { name: string; grams: number; kcal: number; protein: number; carbs: number; fat: number } {
  const g = Math.max(0, grams);
  const k = g / 100;
  const r1 = (n: number) => Math.round(n * 10) / 10;
  return {
    name: food.name,
    grams: Math.round(g),
    kcal: Math.round(food.kcal * k),
    protein: r1(food.protein * k),
    carbs: r1(food.carbs * k),
    fat: r1(food.fat * k),
  };
}

// Suma składników → wartości CAŁEGO dania
export function sumIngredients(
  ingredients: { kcal: number; protein: number; carbs: number; fat: number }[]
): { kcal: number; protein: number; carbs: number; fat: number } {
  const r1 = (n: number) => Math.round(n * 10) / 10;
  return ingredients.reduce(
    (acc, i) => ({
      kcal: acc.kcal + Math.round(i.kcal),
      protein: r1(acc.protein + i.protein),
      carbs: r1(acc.carbs + i.carbs),
      fat: r1(acc.fat + i.fat),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}