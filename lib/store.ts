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
  wellbeing: number; // 1-5
  trainingDone: boolean;
  mealsDone: boolean;
  sleepHours: number;
  weight: number;
  notes: string;
  submittedAt: string; // ISO
};

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

  // dodaj bieżącego klienta, jeśli wybrał trenera
  const clientEmail = safeGet("fitcoach_client_email");
  const clientTrainer = safeGet("fitcoach_client_trainer_id");
  if (clientEmail && clientTrainer && !exists(clientEmail)) {
    registry.push({
      email: clientEmail,
      name: clientEmail.split("@")[0].replace(/\./g, " "),
      trainerId: clientTrainer,
    });
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

export function saveTrainerWorkout(
  trainerId: string,
  data: { name: string; detail: string }
): Workout[] {
  const list = getTrainerWorkouts(trainerId);
  list.push({ id: crypto.randomUUID(), name: data.name, detail: data.detail });
  safeSet(trainerWorkoutsKey(trainerId), JSON.stringify(list));
  return list;
}
