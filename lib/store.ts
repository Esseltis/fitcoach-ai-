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
