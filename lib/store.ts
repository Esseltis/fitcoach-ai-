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
  // Samopoczucie
  { key: "wellbeing", label: "Samopoczucie (1–5)", type: "range", min: 1, max: 5, defaultValue: 3 },
  { key: "energy", label: "Poziom energii (1–5)", type: "range", min: 1, max: 5, defaultValue: 3 },
  { key: "sleepHours", label: "Sen (h)", type: "number", step: 0.5, defaultValue: 7 },
  { key: "stress", label: "Poziom stresu (1–5)", type: "range", min: 1, max: 5, defaultValue: 3 },
  { key: "appetite", label: "Apetyt", type: "select", options: ["Mały", "Normalny", "Duży"], defaultValue: "Normalny" },
  { key: "hunger", label: "Głód między posiłkami (1–5, 5 = silny)", type: "range", min: 1, max: 5, defaultValue: 3 },
  { key: "alcoholSweets", label: "Alkohol / słodycze w ciągu dnia", type: "boolean", defaultValue: false },
  // Realizacja planu
  { key: "trainingDone", label: "Zrealizowałem trening", type: "boolean", defaultValue: false },
  { key: "mealsDone", label: "Zrealizowałem wszystkie posiłki", type: "boolean", defaultValue: false },
  { key: "adherence", label: "Przestrzeganie planu (%)", type: "range", min: 0, max: 100, step: 5, defaultValue: 100 },
  { key: "steps", label: "Kroki", type: "number", step: 500, defaultValue: "", placeholder: "np. 10000" },
  { key: "activeMinutes", label: "Aktywność dodatkowa (min)", type: "number", step: 5, defaultValue: "", placeholder: "np. 30" },
  { key: "waterIntake", label: "Woda (litry)", type: "number", step: 0.1, defaultValue: "", placeholder: "np. 2.0" },
  { key: "weight", label: "Waga (kg)", type: "number", step: 0.1, defaultValue: "", placeholder: "np. 78" },
  // Uwagi i pytania
  { key: "pain", label: "Ból / dyskomfort", type: "text", defaultValue: "", placeholder: "np. kolano, plecy..." },
  { key: "problem", label: "Największy problem dnia", type: "text", defaultValue: "", placeholder: "np. wieczorny głód, brak czasu na trening..." },
  { key: "questions", label: "Pytania do trenera", type: "text", defaultValue: "", placeholder: "np. czy mogę zamienić ćwiczenie X na Y?" },
  { key: "tomorrow", label: "Mój plan na jutro", type: "text", defaultValue: "", placeholder: "np. trening rano, posiłki jak w planie" },
  { key: "notes", label: "Notatka dla trenera", type: "text", defaultValue: "", placeholder: "Jak się czułeś, co było trudne..." },
];

export type ReportConfigField = {
  key: string;
  label: string;
  type: ReportFieldDef["type"];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string | number | boolean;
  options?: string[];
  placeholder?: string;
  custom?: boolean;
};

const trainerReportFieldsKey = (trainerId: string) =>
  `fitcoach_trainer_${trainerId}_report_fields`;

const reportFieldsSeenV2Key = (trainerId: string) =>
  `fitcoach_trainer_${trainerId}_report_fields_seen_v2`;

// Jednorazowo dopisz nowe rubryki do już zapisanych konfiguracji raportu,
// żeby trenerzy z zapisanymi ustawieniami też je dostali.
function mergeNewReportDefaults(
  trainerId: string,
  fields: ReportConfigField[]
): ReportConfigField[] {
  if (safeGet(reportFieldsSeenV2Key(trainerId))) return fields;
  const seen = new Set(fields.map((f) => f.key));
  const missing = REPORT_FIELDS.filter((f) => !seen.has(f.key)).map((f) => ({
    ...f,
    custom: false,
  }));
  if (missing.length > 0) {
    const merged = [...fields, ...missing];
    safeSet(trainerReportFieldsKey(trainerId), JSON.stringify(merged));
    safeSet(reportFieldsSeenV2Key(trainerId), "1");
    return merged;
  }
  safeSet(reportFieldsSeenV2Key(trainerId), "1");
  return fields;
}

export function getTrainerReportFields(trainerId: string): ReportConfigField[] {
  const raw = safeGet(trainerReportFieldsKey(trainerId));
  if (!raw) return REPORT_FIELDS.map((f) => ({ ...f, custom: false }));
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      // Migracja starego formatu: tablica samych kluczy ("wellbeing", ...).
      const isLegacy = arr.some((item) => typeof item === "string");
      if (isLegacy) {
        const migrated = arr
          .map((item) => {
            if (typeof item === "string") {
              const def = REPORT_FIELDS.find((f) => f.key === item);
              return def ? { ...def, custom: false } : null;
            }
            return item;
          })
          .filter(Boolean) as ReportConfigField[];
        // usuń duplikaty po kluczu (stary tablica mogła mieć klucz + obiekt)
        const seen = new Set<string>();
        const deduped = migrated.filter((f) => {
          if (!f?.key || seen.has(f.key)) return false;
          seen.add(f.key);
          return true;
        });
        return mergeNewReportDefaults(trainerId, deduped);
      }
      return mergeNewReportDefaults(trainerId, arr as ReportConfigField[]);
    }
  } catch {
    /* ignore */
  }
  return REPORT_FIELDS.map((f) => ({ ...f, custom: false }));
}

export function saveTrainerReportFields(
  trainerId: string,
  fields: ReportConfigField[]
) {
  safeSet(trainerReportFieldsKey(trainerId), JSON.stringify(fields));
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
  guidelines: TrainerGuidelines;
  tasks: string[];
  feedback: { text: string; at: string };
  updatedAt: string;
};

// Wytyczne trenera — sterują aplikacją podopiecznego (woda, przypomnienia, cele)
export type TrainerGuidelines = {
  periodGoal: string; // cel okresu, np. "−4 kg w 8 tygodni"
  weeklyFocus: string; // priorytet bieżącego tygodnia
  rules: string[]; // zasady (jedna na linię)
  waterGlasses: string; // "" = auto z masy ciała
  reportHour: string; // "" = 18
  trainingsPerWeek: string; // "" = brak celu
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
  guidelines: {
    periodGoal: "Redukcja: −4 kg w 8 tygodni",
    weeklyFocus: "Ten tydzień: 4 treningi, zero słodyczy, sen 7+ h.",
    rules: [
      "Raport dnia do godziny 20:00",
      "Waga rano na czczo, po toalecie",
      "Posiłek potreningowy do 30 min po treningu",
    ],
    waterGlasses: "",
    reportHour: "20",
    trainingsPerWeek: "4",
  },
  tasks: [
    "Zrealizuj trening zgodnie z planem dnia",
    "Odhacz wszystkie posiłki w Diecie",
    "Wypij minimum 8 szklanek wody",
    "Wypełnij raport dnia i wyślij do trenera",
  ],
  feedback: { text: "", at: "" },
  updatedAt: "",
};

const contentKey = (email: string) => `fitcoach_content_${email}`;

export function getClientContent(email: string): TrainerContent {
  const raw = safeGet(contentKey(email));
  if (!raw) return structuredClone(DEFAULT_CONTENT);
  try {
    const base = structuredClone(DEFAULT_CONTENT);
    const parsed = JSON.parse(raw) as Partial<TrainerContent>;
    return {
      ...base,
      ...parsed,
      // treści zapisane przed dodaniem wytycznych — uzupełnij brakujące pola
      guidelines: { ...base.guidelines, ...(parsed.guidelines ?? {}) },
      feedback: { ...base.feedback, ...(parsed.feedback ?? {}) },
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : base.tasks,
    };
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

// ---- Pomiary ciała klienta ----

export const MEASUREMENT_METRICS: {
  key: string;
  label: string;
  unit: string;
}[] = [
  { key: "weight", label: "Waga", unit: "kg" },
  { key: "pas", label: "Pas", unit: "cm" },
  { key: "brzuch", label: "Brzuch", unit: "cm" },
  { key: "biceps", label: "Biceps", unit: "cm" },
  { key: "klatka", label: "Klatka", unit: "cm" },
  { key: "uda", label: "Uda", unit: "cm" },
  { key: "lydki", label: "Łydki", unit: "cm" },
];

export type Measurement = {
  id: string;
  date: string; // YYYY-MM-DD
  values: Record<string, string>;
};

const measurementsKey = (email: string) => `fitcoach_measurements_${email}`;

export function getMeasurements(email: string): Measurement[] {
  const list = getStoredList<Measurement>(measurementsKey(email));
  return list.sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function addMeasurement(
  email: string,
  data: { date: string; values: Record<string, string> }
): Measurement[] {
  const list = getMeasurements(email);
  list.push({ id: crypto.randomUUID(), date: data.date, values: data.values });
  safeSet(measurementsKey(email), JSON.stringify(list));
  return list;
}

export function removeMeasurement(email: string, id: string): Measurement[] {
  const list = getMeasurements(email).filter((m) => m.id !== id);
  safeSet(measurementsKey(email), JSON.stringify(list));
  return list;
}

// ---- Nawodnienie klienta (szklanki wody na dzień) ----

const waterKey = (email: string) => `fitcoach_water_${email}`;
const lastDrinkKey = (email: string) => `fitcoach_water_last_${email}`;

function getWaterMap(email: string): Record<string, number> {
  const raw = safeGet(waterKey(email));
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return typeof obj === "object" && obj !== null ? obj : {};
  } catch {
    return {};
  }
}

export function getWaterForDate(email: string, date: string): number {
  return getWaterMap(email)[date] ?? 0;
}

export function setWaterForDate(
  email: string,
  date: string,
  count: number
): number {
  const map = getWaterMap(email);
  const prev = map[date] ?? 0;
  map[date] = Math.max(0, count);
  safeSet(waterKey(email), JSON.stringify(map));
  if (map[date] > prev) {
    safeSet(lastDrinkKey(email), String(Date.now()));
  }
  return map[date];
}

// ---- Odhaczanie wykonanych ćwiczeń (plan treningowy online) ----

const trainingKey = (email: string) => `fitcoach_training_done_${email}`;

function getTrainingDone(email: string): Record<string, string[]> {
  const raw = safeGet(trainingKey(email));
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return typeof obj === "object" && obj !== null ? obj : {};
  } catch {
    return {};
  }
}

export function getDoneExerciseIds(
  email: string,
  dayId: number
): string[] {
  return getTrainingDone(email)[String(dayId)] ?? [];
}

export function toggleExerciseDone(
  email: string,
  dayId: number,
  exerciseId: string
): string[] {
  const map = getTrainingDone(email);
  const key = String(dayId);
  const current = map[key] ?? [];
  const next = current.includes(exerciseId)
    ? current.filter((id) => id !== exerciseId)
    : [...current, exerciseId];
  map[key] = next;
  safeSet(trainingKey(email), JSON.stringify(map));
  return next;
}

// ---- Odhaczanie zjedzonych posiłków ----

const mealsDoneKey = (email: string) => `fitcoach_meals_done_${email}`;

function getMealsDone(email: string): Record<string, string[]> {
  const raw = safeGet(mealsDoneKey(email));
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return typeof obj === "object" && obj !== null ? obj : {};
  } catch {
    return {};
  }
}

export function getDoneMeals(email: string, date: string): string[] {
  return getMealsDone(email)[date] ?? [];
}

export function toggleMealDone(
  email: string,
  date: string,
  mealId: string
): string[] {
  const map = getMealsDone(email);
  const current = map[date] ?? [];
  const next = current.includes(mealId)
    ? current.filter((id) => id !== mealId)
    : [...current, mealId];
  map[date] = next;
  safeSet(mealsDoneKey(email), JSON.stringify(map));
  return next;
}

// ---- Wybór wariantu posiłku (do zliczania kalorii i makro) ----

const mealChoicesKey = (email: string) => `fitcoach_meal_choices_${email}`;

export function getMealChoices(
  email: string,
  date: string
): Record<string, number> {
  const raw = safeGet(mealChoicesKey(email));
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    if (typeof obj !== "object" || obj === null) return {};
    return (obj[date] ?? {}) as Record<string, number>;
  } catch {
    return {};
  }
}

export function setMealChoice(
  email: string,
  date: string,
  category: string,
  variantIdx: number
): Record<string, number> {
  const raw = safeGet(mealChoicesKey(email));
  let map: Record<string, Record<string, number>> = {};
  try {
    const obj = raw ? JSON.parse(raw) : null;
    if (typeof obj === "object" && obj !== null) map = obj;
  } catch {
    /* ignore */
  }
  map[date] = { ...(map[date] ?? {}), [category]: variantIdx };
  safeSet(mealChoicesKey(email), JSON.stringify(map));
  return map[date];
}

// ---- Log treningowy: wykonane serie (kg × powtórzenia × wysiłek) ----

export type ExerciseLogEntry = { kg: string; reps: string; effort: string };

const trainingLogKey = (email: string) => `fitcoach_training_log_${email}`;

export function getTrainingLog(
  email: string,
  dayId: number
): Record<string, ExerciseLogEntry> {
  const raw = safeGet(trainingLogKey(email));
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    if (typeof obj !== "object" || obj === null) return {};
    return (obj[String(dayId)] ?? {}) as Record<string, ExerciseLogEntry>;
  } catch {
    return {};
  }
}

export function setTrainingLogEntry(
  email: string,
  dayId: number,
  exerciseId: string,
  entry: ExerciseLogEntry
): Record<string, ExerciseLogEntry> {
  const raw = safeGet(trainingLogKey(email));
  let map: Record<string, Record<string, ExerciseLogEntry>> = {};
  try {
    const obj = raw ? JSON.parse(raw) : null;
    if (typeof obj === "object" && obj !== null) map = obj;
  } catch {
    /* ignore */
  }
  map[String(dayId)] = { ...(map[String(dayId)] ?? {}), [exerciseId]: entry };
  safeSet(trainingLogKey(email), JSON.stringify(map));
  return map[String(dayId)];
}

// ---- Ostatni łyk wody (do przypomnień o nawodnieniu) ----

export function getLastDrinkTs(email: string): number {
  const raw = safeGet(lastDrinkKey(email));
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

// ---- Surowe mapy aktywności (seria dni na dashboardzie) ----

export { getMealsDone as getMealsDoneByDate, getWaterMap as getWaterAll };

// ---- Zdjęcia postępów ----

export type ProgressPhoto = { id: string; date: string; dataUrl: string };

const photosKey = (email: string) => `fitcoach_photos_${email}`;
export const MAX_PROGRESS_PHOTOS = 15;

export function getProgressPhotos(email: string): ProgressPhoto[] {
  const raw = safeGet(photosKey(email));
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as ProgressPhoto[]) : [];
  } catch {
    return [];
  }
}

export function addProgressPhoto(
  email: string,
  photo: { date: string; dataUrl: string }
): { photos: ProgressPhoto[]; error: string | null } {
  const list = getProgressPhotos(email);
  if (list.length >= MAX_PROGRESS_PHOTOS) {
    return {
      photos: list,
      error: `Osiągnięto limit ${MAX_PROGRESS_PHOTOS} zdjęć. Usuń starsze, aby dodać nowe.`,
    };
  }
  const next: ProgressPhoto[] = [
    { id: crypto.randomUUID(), date: photo.date, dataUrl: photo.dataUrl },
    ...list,
  ];
  if (typeof window === "undefined") {
    return { photos: list, error: "Brak dostępu do pamięci przeglądarki." };
  }
  try {
    window.localStorage.setItem(photosKey(email), JSON.stringify(next));
  } catch {
    return {
      photos: list,
      error: "Brak miejsca w przeglądarce — usuń jedno ze starszych zdjęć.",
    };
  }
  return { photos: next, error: null };
}

export function removeProgressPhoto(email: string, id: string): ProgressPhoto[] {
  const list = getProgressPhotos(email).filter((p) => p.id !== id);
  safeSet(photosKey(email), JSON.stringify(list));
  return list;
}

// ---- Masa ciała (profil klienta lub treść trenera) ----

export function getBodyWeightKg(
  email: string,
  fallbackWeight?: string
): number {
  const profile = getClientProfile(email);
  const raw = profile?.weight ?? fallbackWeight ?? "";
  const kg = parseFloat(String(raw).replace(",", "."));
  return Number.isFinite(kg) && kg > 0 ? kg : 0;
}

// ---- Aktywności spoza planu (bilans energetyczny, wzorowany na Respo) ----

export type ActivityEntry = {
  id: string;
  name: string;
  minutes: number; // 0, gdy podano własny kcal
  kcal: number;
};

export const ACTIVITY_PRESETS: {
  id: string;
  name: string;
  met: number; // met metaboliczny — kcal = MET × waga × godziny
}[] = [
  { id: "spacer", name: "Spacer", met: 3.5 },
  { id: "marsz", name: "Szybki marsz", met: 5 },
  { id: "bieg", name: "Bieg", met: 9 },
  { id: "rower", name: "Rower", met: 6.5 },
  { id: "plywanie", name: "Pływanie", met: 8 },
  { id: "silownia", name: "Siłownia", met: 5 },
  { id: "pilka", name: "Piłka nożna / koszykówka", met: 7 },
  { id: "taniec", name: "Taniec", met: 5 },
  { id: "schody", name: "Wchodzenie po schodach", met: 8 },
  { id: "sprzatanie", name: "Sprzątanie / prace domowe", met: 3 },
  { id: "joga", name: "Joga / rozciąganie", met: 2.5 },
  { id: "inne", name: "Inne (własny kcal)", met: 0 },
];

export function estimateActivityKcal(
  met: number,
  weightKg: number,
  minutes: number
): number {
  if (!met || !weightKg || !minutes) return 0;
  return Math.round((met * weightKg * minutes) / 60);
}

const activitiesKey = (email: string) => `fitcoach_activities_${email}`;

export function getActivitiesByDate(email: string): Record<
  string,
  ActivityEntry[]
> {
  const raw = safeGet(activitiesKey(email));
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return typeof obj === "object" && obj !== null
      ? (obj as Record<string, ActivityEntry[]>)
      : {};
  } catch {
    return {};
  }
}

export function getActivities(email: string, date: string): ActivityEntry[] {
  return getActivitiesByDate(email)[date] ?? [];
}

export function addActivity(
  email: string,
  date: string,
  entry: Omit<ActivityEntry, "id">
): ActivityEntry[] {
  const map = getActivitiesByDate(email);
  const list = [
    ...(map[date] ?? []),
    { id: crypto.randomUUID(), ...entry },
  ];
  map[date] = list;
  safeSet(activitiesKey(email), JSON.stringify(map));
  return list;
}

export function removeActivity(
  email: string,
  date: string,
  id: string
): ActivityEntry[] {
  const map = getActivitiesByDate(email);
  const list = (map[date] ?? []).filter((a) => a.id !== id);
  map[date] = list;
  safeSet(activitiesKey(email), JSON.stringify(map));
  return list;
}

// ---- Samopoczucie: sytość i motywacja (check-in 1–5) ----

export type MoodEntry = { satiety: number; motivation: number };

const moodKey = (email: string) => `fitcoach_mood_${email}`;

export function getMoodByDate(email: string): Record<string, MoodEntry> {
  const raw = safeGet(moodKey(email));
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return typeof obj === "object" && obj !== null
      ? (obj as Record<string, MoodEntry>)
      : {};
  } catch {
    return {};
  }
}

export function getMoodForDate(
  email: string,
  date: string
): MoodEntry | null {
  return getMoodByDate(email)[date] ?? null;
}

export function setMoodForDate(
  email: string,
  date: string,
  entry: MoodEntry
): MoodEntry {
  const map = getMoodByDate(email);
  const next = {
    satiety: Math.min(5, Math.max(0, Math.round(entry.satiety))),
    motivation: Math.min(5, Math.max(0, Math.round(entry.motivation))),
  };
  map[date] = next;
  safeSet(moodKey(email), JSON.stringify(map));
  return next;
}

// ---- Zadania od trenera (checklista dnia, odhaczana per data) ----

const tasksDoneKey = (email: string) => `fitcoach_tasks_done_${email}`;

export function getTasksDone(email: string, date: string): string[] {
  const raw = safeGet(tasksDoneKey(email));
  if (!raw) return [];
  try {
    const obj = JSON.parse(raw);
    if (typeof obj !== "object" || obj === null) return [];
    return (obj[date] ?? []) as string[];
  } catch {
    return [];
  }
}

export function toggleTaskDone(
  email: string,
  date: string,
  task: string
): string[] {
  const raw = safeGet(tasksDoneKey(email));
  let map: Record<string, string[]> = {};
  try {
    const obj = raw ? JSON.parse(raw) : null;
    if (typeof obj === "object" && obj !== null) map = obj;
  } catch {
    /* ignore */
  }
  const current = map[date] ?? [];
  map[date] = current.includes(task)
    ? current.filter((t) => t !== task)
    : [...current, task];
  safeSet(tasksDoneKey(email), JSON.stringify(map));
  return map[date];
}

// ---- Lista zakupów (agregacja składu dań + własne produkty) ----

export type ShoppingState = { checked: string[]; custom: string[] };

const shoppingKey = (email: string) => `fitcoach_shopping_${email}`;

export function getShopping(email: string): ShoppingState {
  const raw = safeGet(shoppingKey(email));
  if (!raw) return { checked: [], custom: [] };
  try {
    const obj = JSON.parse(raw);
    if (typeof obj !== "object" || obj === null) {
      return { checked: [], custom: [] };
    }
    return {
      checked: Array.isArray(obj.checked) ? (obj.checked as string[]) : [],
      custom: Array.isArray(obj.custom) ? (obj.custom as string[]) : [],
    };
  } catch {
    return { checked: [], custom: [] };
  }
}

function saveShopping(email: string, state: ShoppingState): ShoppingState {
  safeSet(shoppingKey(email), JSON.stringify(state));
  return state;
}

export function toggleShoppingItem(
  email: string,
  item: string
): ShoppingState {
  const state = getShopping(email);
  const checked = state.checked.includes(item)
    ? state.checked.filter((i) => i !== item)
    : [...state.checked, item];
  return saveShopping(email, { ...state, checked });
}

export function addCustomShoppingItem(
  email: string,
  item: string
): ShoppingState {
  const state = getShopping(email);
  const clean = item.trim();
  if (!clean) return state;
  const all = [...state.custom];
  if (!all.some((i) => i.toLowerCase() === clean.toLowerCase())) all.push(clean);
  return saveShopping(email, { ...state, custom: all });
}

export function removeCustomShoppingItem(
  email: string,
  item: string
): ShoppingState {
  const state = getShopping(email);
  return saveShopping(email, {
    custom: state.custom.filter((i) => i !== item),
    checked: state.checked.filter((i) => i !== item),
  });
}

export function clearShoppingChecked(email: string): ShoppingState {
  const state = getShopping(email);
  return saveShopping(email, { ...state, checked: [] });
}

// ---- Posiłki ze zdjęcia (AI: kcal + makro, jak w Fitatu) ----

export type PhotoMeal = {
  id: string;
  category: string; // sniadanie | ii_sniadanie | obiad | podwieczorek | kolacja
  date: string; // YYYY-MM-DD
  name: string;
  recipe: string[];
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string; // dataURL JPEG (skompresowany)
  source: "ai" | "demo";
  createdAt: string; // ISO
};

// Ochrona localStorage (~5 MB limitu) — 12 zdjęć dziennie wystarcza na demo.
export const MAX_PHOTO_MEALS_PER_DAY = 12;

const photoMealsKey = (email: string) => `fitcoach_photo_meals_${email}`;

export function getPhotoMealsByDate(email: string): Record<
  string,
  PhotoMeal[]
> {
  const raw = safeGet(photoMealsKey(email));
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return typeof obj === "object" && obj !== null
      ? (obj as Record<string, PhotoMeal[]>)
      : {};
  } catch {
    return {};
  }
}

export function getPhotoMeals(email: string, date: string): PhotoMeal[] {
  return getPhotoMealsByDate(email)[date] ?? [];
}

export function addPhotoMeal(
  email: string,
  meal: Omit<PhotoMeal, "id" | "createdAt">
): PhotoMeal[] {
  const map = getPhotoMealsByDate(email);
  const list = map[meal.date] ?? [];
  if (list.length >= MAX_PHOTO_MEALS_PER_DAY) return list;
  const next = [
    { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...meal },
    ...list,
  ];
  map[meal.date] = next;
  safeSet(photoMealsKey(email), JSON.stringify(map));
  return next;
}

export function removePhotoMeal(
  email: string,
  date: string,
  id: string
): PhotoMeal[] {
  const map = getPhotoMealsByDate(email);
  const list = (map[date] ?? []).filter((m) => m.id !== id);
  map[date] = list;
  safeSet(photoMealsKey(email), JSON.stringify(map));
  return list;
}
