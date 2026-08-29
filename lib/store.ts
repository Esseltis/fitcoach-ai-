// Wspólna warstwa danych dla panelu klienta i trenera.
// Na razie dane trzymane są w localStorage (demo). Później przeniesiemy to do bazy.

export type Trainer = {
  id: string;
  name: string;
  title: string;
  focus: string;
  email: string;
  password: string;
};

export type ClientReport = {
  values: Record<string, string | number | boolean>;
  submittedAt: string; // ISO
};

// ---- Konfiguracja raportu dziennego (ustalana przez trenera) ----

export type ReportFieldDef = {
  key: string;
  label: string;
  type: "range" | "boolean" | "number" | "select" | "text";
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string | number | boolean;
  options?: string[];
  placeholder?: string;
};

export const REPORT_FIELDS: ReportFieldDef[] = [
  { key: "wellbeing", label: "Samopoczucie (1–5)", type: "range", min: 1, max: 5, defaultValue: 3 },
  { key: "trainingDone", label: "Zrealizowałem trening", type: "boolean", defaultValue: false },
  { key: "mealsDone", label: "Zrealizowałem posiłki", type: "boolean", defaultValue: false },
  { key: "sleepHours", label: "Sen (h)", type: "number", step: 0.5, defaultValue: 7 },
  { key: "weight", label: "Waga (kg)", type: "number", step: 0.1, defaultValue: "", placeholder: "np. 78" },
  { key: "energy", label: "Poziom energii (1–5)", type: "range", min: 1, max: 5, defaultValue: 3 },
  { key: "stress", label: "Poziom stresu (1–5)", type: "range", min: 1, max: 5, defaultValue: 3 },
  { key: "appetite", label: "Apetyt", type: "select", options: ["Mały", "Normalny", "Duży"], defaultValue: "Normalny" },
  { key: "waterIntake", label: "Woda (litry)", type: "number", step: 0.1, defaultValue: "", placeholder: "np. 2.0" },
  { key: "pain", label: "Ból / dyskomfort", type: "text", defaultValue: "", placeholder: "np. kolano, plecy..." },
  { key: "notes", label: "Notatka dla trenera", type: "text", defaultValue: "", placeholder: "Jak się czułeś, co było trudne..." },
];

const trainerReportFieldsKey = (trainerId: string) =>
  `fitcoach_trainer_${trainerId}_report_fields`;

export function getTrainerReportFields(trainerId: string): string[] {
  const raw = safeGet(trainerReportFieldsKey(trainerId));
  if (!raw) return REPORT_FIELDS.map((f) => f.key);
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.filter((k) => REPORT_FIELDS.some((f) => f.key === k));
  } catch {
    /* ignore */
  }
  return REPORT_FIELDS.map((f) => f.key);
}

export function saveTrainerReportFields(trainerId: string, keys: string[]) {
  safeSet(trainerReportFieldsKey(trainerId), JSON.stringify(keys));
}

export function getClientTrainerId(): string | null {
  return safeGet("fitcoach_client_trainer_id");
}

export type TrainerPlan = {
  diet: string;
  training: string;
  hydration: string;
  supplementation: string;
  notes: string;
  updatedAt: string; // ISO
};

export type ClientRecord = {
  email: string;
  name: string;
  trainerId: string;
};

export type ClientProfile = {
  goal: string;
  gender: string;
  age: string;
  weight: string;
  height: string;
  activity: string;
  trainingFrequency: string;
  mealsPerDay: string;
  preferences: string;
  healthNotes: string;
  submittedAt: string;
};

export const DEMO_TRAINERS: Trainer[] = [
  {
    id: "t1",
    name: "Michał Kowalski",
    title: "Trener sylwetki i redukcji",
    focus: "Redukcja tkanki tłuszczowej, budowa sylwetki",
    email: "trener.michal@fitcoach.ai",
    password: "demo123",
  },
  {
    id: "t2",
    name: "Anna Nowak",
    title: "Trenerka kobiecej sylwetki",
    focus: "Pośladki, brzuch, zdrowy kręgosłup",
    email: "trener.anna@fitcoach.ai",
    password: "demo123",
  },
];

const K_TRAINER_LOGGED = "fitcoach_trainer_logged_in";
const K_TRAINER_ID = "fitcoach_trainer_id";
const K_TRAINER_EMAIL = "fitcoach_trainer_email";
const K_CLIENT_REGISTRY = "fitcoach_client_registry";
const reportKey = (email: string) => `fitcoach_report_${email}`;
const planKey = (trainerId: string, email: string) =>
  `fitcoach_plan_${trainerId}_${email}`;

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

// ---- Tożsamość trenera ----

export function getTrainerIdentity(): { id: string; email: string } | null {
  if (safeGet(K_TRAINER_LOGGED) !== "true") return null;
  const id = safeGet(K_TRAINER_ID);
  const email = safeGet(K_TRAINER_EMAIL);
  if (!id || !email) return null;
  return { id, email };
}

export function trainerLogin(email: string, password: string): Trainer | null {
  const trainer = DEMO_TRAINERS.find(
    (t) => t.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!trainer || trainer.password !== password) return null;
  safeSet(K_TRAINER_LOGGED, "true");
  safeSet(K_TRAINER_ID, trainer.id);
  safeSet(K_TRAINER_EMAIL, trainer.email);
  return trainer;
}

export function trainerLogout() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(K_TRAINER_LOGGED);
    window.localStorage.removeItem(K_TRAINER_ID);
    window.localStorage.removeItem(K_TRAINER_EMAIL);
  } catch {
    /* ignore */
  }
}

export function getTrainerById(id: string): Trainer | undefined {
  return DEMO_TRAINERS.find((t) => t.id === id);
}

// ---- Rejestr klientów ----

const SEED_CLIENTS: ClientRecord[] = [
  { email: "jan.kowalski@fitcoach.ai", name: "Jan Kowalski", trainerId: "t1" },
  { email: "piotr.zielinski@fitcoach.ai", name: "Piotr Zieliński", trainerId: "t1" },
  { email: "maria.wisniewska@fitcoach.ai", name: "Maria Wiśniewska", trainerId: "t2" },
  { email: "tomasz.lewandowski@fitcoach.ai", name: "Tomasz Lewandowski", trainerId: "t2" },
];

// Upewnia się, że rejestr istnieje (i dodaje klienta z bieżącej przeglądarki, jeśli wybrał trenera).
export function ensureClientRegistry() {
  if (typeof window === "undefined") return;
  let registry: ClientRecord[] = [];
  const raw = safeGet(K_CLIENT_REGISTRY);
  if (raw) {
    try {
      registry = JSON.parse(raw);
    } catch {
      registry = [];
    }
  }
  const exists = (email: string) => registry.some((c) => c.email === email);
  for (const c of SEED_CLIENTS) if (!exists(c.email)) registry.push(c);

  // dodaj / zaktualizuj bieżącego klienta, jeśli wybrał trenera
  const clientEmail = safeGet("fitcoach_client_email");
  const clientTrainer = safeGet("fitcoach_client_trainer_id");
  if (clientEmail && clientTrainer) {
    const idx = registry.findIndex((c) => c.email === clientEmail);
    if (idx === -1) {
      registry.push({
        email: clientEmail,
        name: clientEmail.split("@")[0].replace(/\./g, " "),
        trainerId: clientTrainer,
      });
    } else if (registry[idx].trainerId !== clientTrainer) {
      registry[idx].trainerId = clientTrainer;
    }
  }
  safeSet(K_CLIENT_REGISTRY, JSON.stringify(registry));
}

export function getClientsForTrainer(trainerId: string): ClientRecord[] {
  ensureClientRegistry();
  const raw = safeGet(K_CLIENT_REGISTRY);
  if (!raw) return [];
  try {
    const all: ClientRecord[] = JSON.parse(raw);
    return all.filter((c) => c.trainerId === trainerId);
  } catch {
    return [];
  }
}

export function getClientByEmail(email: string): ClientRecord | null {
  ensureClientRegistry();
  const raw = safeGet(K_CLIENT_REGISTRY);
  if (!raw) return null;
  try {
    const all: ClientRecord[] = JSON.parse(raw);
    return all.find((c) => c.email === email) ?? null;
  } catch {
    return null;
  }
}

// ---- Raport klienta ----

export function getReport(email: string): ClientReport | null {
  const raw = safeGet(reportKey(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ClientReport;
  } catch {
    return null;
  }
}

export function saveReport(email: string, data: ClientReport) {
  safeSet(reportKey(email), JSON.stringify(data));
}

// ---- Profil klienta (raport wstępny) ----

const clientProfileKey = (email: string) => `fitcoach_client_profile_${email}`;

export function getClientProfile(email: string): ClientProfile | null {
  const raw = safeGet(clientProfileKey(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ClientProfile;
  } catch {
    return null;
  }
}

export function saveClientProfile(email: string, data: ClientProfile) {
  safeSet(clientProfileKey(email), JSON.stringify(data));
}

// ---- Plan trenera dla klienta ----

export function getPlan(trainerId: string, email: string): TrainerPlan | null {
  const raw = safeGet(planKey(trainerId, email));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TrainerPlan;
  } catch {
    return null;
  }
}

export function savePlan(trainerId: string, email: string, data: TrainerPlan) {
  safeSet(planKey(trainerId, email), JSON.stringify(data));
}

// ---- Treść panelu klienta (wypełniana przez trenera) ----

export type Tip = { title: string; desc: string };
export type DietMeal = {
  category?: MealCategory;
  name: string;
  description: string;
  calories: string;
  carbs?: string;
  protein?: string;
  fat?: string;
};
export type SupplementItem = {
  id: string;
  name: string;
  type: string;
  shortDesc: string;
  dosing: string;
  info: string;
};
export type TrainingExercise = {
  name: string;
  series: string;
  workTime: string;
  rest: string;
};
export type TrainingComment = { label: string; text: string };
export type CateringProvider = {
  name: string;
  note: string;
  recommended: boolean;
};

export type TrainerContent = {
  intro: {
    greeting: string;
    text: string;
    changesTitle: string;
    changes: string[];
    updateLabel: string;
    updateDate: string;
  };
  nutrition: {
    balanceText: string;
    balanceType: string;
    balanceValue: string;
    calories: string;
    carbsKcal: string;
    proteinKcal: string;
    fatKcal: string;
    carbsG: string;
    proteinG: string;
    fatG: string;
    carbsPct: string;
    proteinPct: string;
    fatPct: string;
    weight: string;
    height: string;
  };
  tips: Tip[];
  diet: {
    targetCalories: string;
    meals: DietMeal[];
  };
  supplements: SupplementItem[];
  hydration: {
    general: string;
    beverages: string[];
    planText: string;
  };
  training: {
    days: { label: string; status: string }[];
    dayExercises: Record<number, TrainingExercise[]>;
    comment: TrainingComment[];
  };
  catering: {
    note: string;
    providers: CateringProvider[];
  };
  updatedAt: string;
};

export const DEFAULT_CONTENT: TrainerContent = {
  intro: {
    greeting: "Siema!",
    text: "Tutaj trener wprowadzi Cię w aktualną wersję planu – co zostało zmienione i na co zwracać uwagę.",
    changesTitle: "W aktualizacji planu:",
    changes: ["kaloryczność na podobnym poziomie", "więcej posiłków", "odświeżone menu"],
    updateLabel: "Aktualizacja 1",
    updateDate: new Date().toISOString().slice(0, 10),
  },
  nutrition: {
    balanceText:
      "Bilans kaloryczny ustalony indywidualnie do Twojego celu i aktualnej masy ciała.",
    balanceType: "Utrzymanie",
    balanceValue: "0%",
    calories: "2800",
    carbsKcal: "1400",
    proteinKcal: "800",
    fatKcal: "600",
    carbsG: "350",
    proteinG: "200",
    fatG: "67",
    carbsPct: "50",
    proteinPct: "29",
    fatPct: "21",
    weight: "81",
    height: "173",
  },
  tips: [
    { title: "Woda", desc: "Pij odpowiednią ilość wody przez cały dzień." },
    { title: "Ważenie posiłków", desc: "Produkty waż przed obróbką termiczną." },
    { title: "Przyprawy", desc: "Używaj dowolnych przypraw bez cukru i tłuszczu." },
  ],
  diet: {
    targetCalories: "2800",
    meals: [
      { category: "sniadanie", name: "Owsianka z owocami", description: "Owsianka z owocami i orzechami.", calories: "550" },
      { category: "ii_sniadanie", name: "Jogurt z borówkami", description: "Jogurt naturalny z garścią borówek.", calories: "300" },
      { category: "obiad", name: "Kurczak z ryżem", description: "Kurczak z ryżem i warzywami.", calories: "750" },
      { category: "podwieczorek", name: "Omlet białkowy", description: "Omlet białkowy z pomidorem.", calories: "350" },
      { category: "kolacja", name: "Twaróg z rzodkiewką", description: "Twaróg z rzodkiewką i szczypiorkiem.", calories: "450" },
    ],
  },
  supplements: [
    {
      id: "whey",
      name: "Odżywka białkowa",
      type: "Odżywka białkowa",
      shortDesc: "Uzupełnienie białka po treningu.",
      dosing: "1 porcja po treningu.",
      info: "Koncentrat białka serwatkowego najwyższej jakości.",
    },
  ],
  hydration: {
    general: "Pij przede wszystkim wodę mineralną. Docelowo min. 2–2.5 litra płynów dziennie.",
    beverages: [
      "Kawa: bez cukru, mleko max 100 ml dziennie.",
      "Herbata: bez cukru, 1–2 filiżanki dziennie.",
      "Napoje zero: okazjonalnie.",
    ],
    planText: "1–28 DNI: min. 2–2.5 litra płynów dziennie (woda + napoje bez kalorii).",
  },
  training: {
    days: [
      { label: "Dzień 1", status: "Treningowy" },
      { label: "Dzień 2", status: "Odpoczynek" },
      { label: "Dzień 3", status: "Treningowy" },
      { label: "Dzień 4", status: "Aktywny" },
      { label: "Dzień 5", status: "Treningowy" },
      { label: "Dzień 6", status: "Odpoczynek" },
      { label: "Dzień 7", status: "Aktywny" },
    ],
    dayExercises: {
      1: [
        { name: "Pompki w wąskim podparciu", series: "4 x 8–12", workTime: "Seria do upadku", rest: "90 sek." },
        { name: "Przysiad bułgarski", series: "3 x 10–12", workTime: "Noga po nodze", rest: "90 sek." },
        { name: "Plank", series: "2 serie", workTime: "max", rest: "90 sek." },
      ],
    },
    comment: [
      { label: "Serie rozgrzewkowe – co to jest?", text: "Lekkie serie przygotowujące mięśnie do pracy." },
      { label: "RPE – co to jest?", text: "Subiektywne odczucie wysiłku w skali 1–10." },
    ],
  },
  catering: {
    note: "Lista cateringów, z którymi mamy podpisaną umowę i które poleca trener.",
    providers: [
      { name: "MaczuFit", note: "Dieta pudełkowa 5 posiłków dziennie.", recommended: true },
      { name: "FitBox", note: "Opcja wegetariańska.", recommended: false },
    ],
  },
  updatedAt: "",
};

const contentKey = (email: string) => `fitcoach_content_${email}`;

export function getClientContent(email: string): TrainerContent {
  const raw = safeGet(contentKey(email));
  if (!raw) return structuredClone(DEFAULT_CONTENT);
  try {
    return { ...structuredClone(DEFAULT_CONTENT), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_CONTENT);
  }
}

export function saveClientContent(email: string, data: TrainerContent) {
  safeSet(contentKey(email), JSON.stringify({ ...data, updatedAt: new Date().toISOString() }));
}

// ---- Biblioteka przepisów i treningów (szybki wybór dla trenera) ----

export type Recipe = { id: string; name: string; detail: string };
export type Workout = { id: string; name: string; detail: string };

export const GENERAL_RECIPES: Recipe[] = [
  {
    id: "r1",
    name: "Owsianka z owocami",
    detail:
      "50g płatków owsianych, 250ml mleka, garść owoców, łyżka orzechów, cynamon.",
  },
  {
    id: "r2",
    name: "Kurczak z ryżem i warzywami",
    detail:
      "150g piersi z kurczaka, 60g ryżu, warzywa na parze, łyżka oliwy.",
  },
  {
    id: "r3",
    name: "Omlet białkowy",
    detail:
      "3 białka + 1 całe jajko, pomidor, szczypiorek, szczypta soli.",
  },
  {
    id: "r4",
    name: "Sałatka z tuńczykiem",
    detail:
      "Puszka tuńczyka w sosie własnym, mix sałat, ogórek, pomidor, oliwa, cytryna.",
  },
  {
    id: "r5",
    name: "Twaróg z rzodkiewką",
    detail:
      "150g chudego twarogu, rzodkiewka, szczypiorek, jogurt naturalny.",
  },
  {
    id: "r6",
    name: "Łosoś z kaszą i brokułem",
    detail:
      "120g łososia, 60g kaszy jaglanej, brokuł, sok z cytryny.",
  },
];

export const GENERAL_WORKOUTS: Workout[] = [
  {
    id: "w1",
    name: "Trening FBW",
    detail:
      "Przysiady 3x12, wyciskanie sztangi 3x10, wiosłowanie 3x10, martwy ciąg 3x8, brzuch 3x15.",
  },
  {
    id: "w2",
    name: "Górne partie (push)",
    detail:
      "Wyciskanie 4x8, pompki 3x15, rozpiętki 3x12, wyciskanie barki 3x10, triceps 3x12.",
  },
  {
    id: "w3",
    name: "Dolne partie (pull)",
    detail:
      "Martwy ciąg 4x6, podciąganie 3x8, wiosłowanie 3x10, uginanie bicepsa 3x12.",
  },
  {
    id: "w4",
    name: "Trening cardio interwałowy",
    detail:
      "5 min rozgrzewki, 10x (30s sprint / 60s marsz), 5 min schłodzenia.",
  },
  {
    id: "w5",
    name: "Trening nóg",
    detail:
      "Przysiad ze sztangą 4x10, wykroki 3x12, uginanie nóg 3x12, łydki 4x15.",
  },
  {
    id: "w6",
    name: "Trening mobilności i brzucha",
    detail:
      "Plank 3x45s, deska boczna 2x30s, martwy robak 3x10, rozciąganie 10 min.",
  },
];

const trainerRecipesKey = (trainerId: string) =>
  `fitcoach_trainer_${trainerId}_recipes`;
const trainerWorkoutsKey = (trainerId: string) =>
  `fitcoach_trainer_${trainerId}_workouts`;

function getStoredList<T>(key: string): T[] {
  const raw = safeGet(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function getTrainerRecipes(trainerId: string): Recipe[] {
  return getStoredList<Recipe>(trainerRecipesKey(trainerId));
}

export function saveTrainerRecipe(
  trainerId: string,
  data: { name: string; detail: string }
): Recipe[] {
  const list = getTrainerRecipes(trainerId);
  list.push({ id: crypto.randomUUID(), name: data.name, detail: data.detail });
  safeSet(trainerRecipesKey(trainerId), JSON.stringify(list));
  return list;
}

export function getTrainerWorkouts(trainerId: string): Workout[] {
  return getStoredList<Workout>(trainerWorkoutsKey(trainerId));
}

// ---- Biblioteka posiłków trenera (z kategoriami) ----

export type MealCategory =
  | "sniadanie"
  | "ii_sniadanie"
  | "obiad"
  | "podwieczorek"
  | "kolacja";

export const MEAL_CATEGORIES: { key: MealCategory; label: string }[] = [
  { key: "sniadanie", label: "Śniadanie" },
  { key: "ii_sniadanie", label: "II śniadanie" },
  { key: "obiad", label: "Obiad" },
  { key: "podwieczorek", label: "Podwieczorek" },
  { key: "kolacja", label: "Kolacja" },
];

export type Meal = {
  id: string;
  category: MealCategory;
  name: string;
  description: string;
  calories: string;
  carbs?: string;
  protein?: string;
  fat?: string;
};

const trainerMealsKey = (trainerId: string) =>
  `fitcoach_trainer_${trainerId}_meals`;

export function getTrainerMeals(trainerId: string): Meal[] {
  return getStoredList<Meal>(trainerMealsKey(trainerId));
}

export function saveTrainerMeal(
  trainerId: string,
  data: Omit<Meal, "id">
): Meal[] {
  const list = getTrainerMeals(trainerId);
  list.push({ ...data, id: crypto.randomUUID() });
  safeSet(trainerMealsKey(trainerId), JSON.stringify(list));
  return list;
}

export function removeTrainerMeal(trainerId: string, mealId: string): Meal[] {
  const list = getTrainerMeals(trainerId).filter((m) => m.id !== mealId);
  safeSet(trainerMealsKey(trainerId), JSON.stringify(list));
  return list;
}

// ---- Biblioteka produktów trenera (surowce, np. chleb żytni) ----

export type Product = {
  id: string;
  name: string;
  description?: string;
  kcal100: string;
  carbs100?: string;
  protein100?: string;
  fat100?: string;
};

const trainerProductsKey = (trainerId: string) =>
  `fitcoach_trainer_${trainerId}_products`;

export function getTrainerProducts(trainerId: string): Product[] {
  return getStoredList<Product>(trainerProductsKey(trainerId));
}

export function saveTrainerProduct(
  trainerId: string,
  data: Omit<Product, "id">
): Product[] {
  const list = getTrainerProducts(trainerId);
  list.push({ ...data, id: crypto.randomUUID() });
  safeSet(trainerProductsKey(trainerId), JSON.stringify(list));
  return list;
}

export function removeTrainerProduct(trainerId: string, productId: string): Product[] {
  const list = getTrainerProducts(trainerId).filter((p) => p.id !== productId);
  safeSet(trainerProductsKey(trainerId), JSON.stringify(list));
  return list;
}

// ---- Biblioteka treningów trenera (bloki ćwiczeń) ----

export type WorkoutBlock = {
  id: string;
  name: string;
  exercises: TrainingExercise[];
};

const trainerBlocksKey = (trainerId: string) =>
  `fitcoach_trainer_${trainerId}_blocks`;

export function getTrainerWorkoutBlocks(trainerId: string): WorkoutBlock[] {
  return getStoredList<WorkoutBlock>(trainerBlocksKey(trainerId));
}

export function saveTrainerWorkoutBlock(
  trainerId: string,
  data: Omit<WorkoutBlock, "id">
): WorkoutBlock[] {
  const list = getTrainerWorkoutBlocks(trainerId);
  list.push({ ...data, id: crypto.randomUUID() });
  safeSet(trainerBlocksKey(trainerId), JSON.stringify(list));
  return list;
}

export function removeTrainerWorkoutBlock(
  trainerId: string,
  blockId: string
): WorkoutBlock[] {
  const list = getTrainerWorkoutBlocks(trainerId).filter((b) => b.id !== blockId);
  safeSet(trainerBlocksKey(trainerId), JSON.stringify(list));
  return list;
}

export function saveTrainerWorkout(
  trainerId: string,
  data: { name: string; detail: string }
): Workout[] {
  const list = getTrainerWorkouts(trainerId);
  list.push({ id: crypto.randomUUID(), name: data.name, detail: data.detail });
  safeSet(trainerWorkoutsKey(trainerId), JSON.stringify(list));
  return list;
}
