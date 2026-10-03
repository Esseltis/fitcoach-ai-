// ============================================================
// Warstwa chmury (Supabase) — tryb HYBRYDOWY.
//
// Bez zmiennych środowiskowych aplikacja działa dokładnie jak dotychczas
// (localStorage / demo). Po ustawieniu w Vercel zmiennych:
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY
// włącza się synchronizacja: dane z localStorage trafiają do Supabase
// i odwrotnie, a trener widzi podopiecznych niezależnie od urządzenia.
//
// Model danych: "dokumenty" — każdy klucz fitcoach_* jest wierszem
// documents(owner_email, doc_key, value, updated_at).
// Właściciel = adres e-mail zapisany w kluczu (klucze klienta zawierają @),
// a dla kluczy bez e-maila — adres e-mail zalogowanej sesji.
// Konflikty: ostatni zapis wygrywa (LWW po updated_at).
// ============================================================

import type { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const META_KEY = "fitcoach_cloud_meta";
/** Zdarzenie dispatchowane po każdej udanej synchronizacji (ciąg). */
export const CLOUD_SYNCED_EVENT = "fitcoach:synced";

const PUSH_DEBOUNCE_MS = 1200;
/** Klucze sesji — nie synchronizujemy (zapobiega "ghost login" na innym urządzeniu). */
const PUSH_DENYLIST = new Set([
  "fitcoach_client_logged_in",
  "fitcoach_trainer_logged_in",
]);

let sessionEmail: string | null = null;
let clientPromise: Promise<SupabaseClient | null> | null = null;

// ---- Konfiguracja ----

export function cloudEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON);
}

export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!cloudEnabled()) return null;
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js")
      .then(({ createClient }) =>
        createClient(SUPABASE_URL, SUPABASE_ANON, {
          auth: { persistSession: true, autoRefreshToken: true },
        })
      )
      .catch(() => null);
  }
  return clientPromise;
}

// ---- Lokalne helpery ----

function localGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function localSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function readMeta(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(META_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMeta(meta: Record<string, string>) {
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

function setMeta(key: string, iso: string) {
  const meta = readMeta();
  meta[key] = iso;
  writeMeta(meta);
}

function allLocalKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("fitcoach_") && k !== META_KEY) keys.push(k);
    }
  } catch {
    /* ignore */
  }
  return keys;
}

/** Właściciel dokumentu: e-mail z klucza albo e-mail sesji. */
function ownerForKey(key: string): string | null {
  const seg = key.slice(key.lastIndexOf("_") + 1);
  if (seg.includes("@")) return seg.toLowerCase();
  return sessionEmail;
}

function prettyName(email: string): string {
  return email.split("@")[0].replace(/[._-]+/g, " ");
}

// ---- Błędy auth → po polsku ----

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Nieprawidłowy e-mail lub hasło.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Konto z tym adresem już istnieje — zaloguj się.";
  if (m.includes("password") && m.includes("least"))
    return "Hasło musi mieć co najmniej 6 znaków.";
  if (m.includes("email not confirmed"))
    return "Potwierdź adres e-mail — kliknij link z wiadomości.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Zbyt wiele prób — spróbuj za chwilę.";
  if (m.includes("fetch") || m.includes("network") || m.includes("failed"))
    return "Brak połączenia z chmurą — spróbuj ponownie.";
  return message;
}

export type CloudResult = { ok: boolean; error?: string; needsConfirm?: boolean };

// ---- Sesja / auth ----

export async function cloudSessionEmail(): Promise<string | null> {
  const sb = await getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getSession();
    sessionEmail = data.session?.user.email?.toLowerCase() ?? null;
  } catch {
    sessionEmail = null;
  }
  return sessionEmail;
}

export function currentSessionEmail(): string | null {
  return sessionEmail;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function cloudSignIn(
  email: string,
  password: string
): Promise<CloudResult> {
  const sb = await getSupabase();
  if (!sb) return { ok: false, error: "Chmura nie jest skonfigurowana." };
  try {
    const { data, error } = await sb.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    if (error) return { ok: false, error: translateAuthError(error.message) };
    sessionEmail = data.user.email?.toLowerCase() ?? null;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: translateAuthError(String(e)) };
  }
}

export async function cloudSignUp(
  email: string,
  password: string
): Promise<CloudResult> {
  const sb = await getSupabase();
  if (!sb) return { ok: false, error: "Chmura nie jest skonfigurowana." };
  try {
    const { data, error } = await sb.auth.signUp({
      email: normalizeEmail(email),
      password,
    });
    if (error) return { ok: false, error: translateAuthError(error.message) };
    sessionEmail = data.user?.email?.toLowerCase() ?? null;
    // Bez potwierdzenia e-mail Supabase zwraca od razu sesję.
    if (!data.session) return { ok: true, needsConfirm: true };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: translateAuthError(String(e)) };
  }
}

export async function cloudSignOut() {
  sessionEmail = null;
  const sb = await getSupabase();
  if (!sb) return;
  try {
    await sb.auth.signOut();
  } catch {
    /* ignore */
  }
}

// ---- Push (debounce po safeSet w store) ----

const pendingPushes = new Map<
  string,
  { timer: ReturnType<typeof setTimeout>; value: string }
>();

/** Wywoływane z safeSet — wtrychanie klucza do chmury z debounce. */
export function schedulePush(key: string, value: string) {
  if (!cloudEnabled() || typeof window === "undefined") return;
  if (PUSH_DENYLIST.has(key)) return;
  const prev = pendingPushes.get(key);
  if (prev) clearTimeout(prev.timer);
  const timer = setTimeout(() => {
    pendingPushes.delete(key);
    void pushKey(key, value);
  }, PUSH_DEBOUNCE_MS);
  pendingPushes.set(key, { timer, value });
}

async function pushKey(key: string, value: string) {
  const sb = await getSupabase();
  if (!sb || !sessionEmail) return;
  const owner = ownerForKey(key);
  if (!owner) return;
  const now = new Date().toISOString();
  try {
    const { error } = await sb
      .from("documents")
      .upsert(
        { owner_email: owner, doc_key: key, value, updated_at: now },
        { onConflict: "owner_email,doc_key" }
      );
    if (!error) setMeta(key, now);
  } catch {
    /* cichy fail — dane zostaną wgrane przy kolejnym zapisie/pullu */
  }
}

// ---- Pull (zakres: ja + podopieczni/ja + mój trener) ----

async function pullOwners(
  sb: SupabaseClient,
  me: string
): Promise<string[]> {
  const owners = new Set<string>([me]);
  try {
    const asTrainer = await sb
      .from("memberships")
      .select("client_email")
      .eq("trainer_email", me);
    if (!asTrainer.error && asTrainer.data) {
      const members: string[] = [];
      for (const r of asTrainer.data) {
        const e = (r.client_email ?? "").toLowerCase();
        if (e) {
          owners.add(e);
          members.push(e);
        }
      }
      // Odśwież lokalny rejestr klientów (wzór, którego szuka panel trenera).
      if (members.length > 0) mergeMembersIntoRegistry(members, me);
    }
    const asClient = await sb
      .from("memberships")
      .select("trainer_email")
      .eq("client_email", me);
    if (!asClient.error && asClient.data) {
      for (const r of asClient.data) {
        const e = (r.trainer_email ?? "").toLowerCase();
        if (e) owners.add(e);
      }
    }
  } catch {
    /* ignore */
  }
  return Array.from(owners);
}

/** Dopisuje podopiecznych (z memberships) do lokalnego rejestru klienta. */
function mergeMembersIntoRegistry(memberEmails: string[], trainerEmail: string) {
  try {
    const raw = window.localStorage.getItem("fitcoach_client_registry");
    let reg: Array<{ email: string; name: string; trainerId: string }> = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) reg = parsed;
      } catch {
        /* nowy rejestr */
      }
    }
    let changed = false;
    for (const email of memberEmails) {
      const i = reg.findIndex((c) => c && c.email === email);
      if (i === -1) {
        reg.push({ email, name: prettyName(email), trainerId: trainerEmail });
        changed = true;
      } else if (reg[i].trainerId !== trainerEmail) {
        reg[i].trainerId = trainerEmail;
        changed = true;
      }
    }
    if (changed) {
      window.localStorage.setItem("fitcoach_client_registry", JSON.stringify(reg));
    }
  } catch {
    /* ignore */
  }
}

/** Pobranie stanu chmury do localStorage (LWW po updated_at). */
export async function cloudPull(): Promise<void> {
  if (!cloudEnabled() || typeof window === "undefined") return;
  const sb = await getSupabase();
  if (!sb) return;
  const me = sessionEmail ?? (await cloudSessionEmail());
  if (!me) return;

  const owners = await pullOwners(sb, me);
  let rows: Array<{
    doc_key: string;
    value: string;
    updated_at: string;
  }> = [];
  try {
    const { data, error } = await sb
      .from("documents")
      .select("doc_key, value, updated_at")
      .in("owner_email", owners);
    if (error || !data) return;
    rows = data;
  } catch {
    return;
  }

  const meta = readMeta();
  let changed = false;
  for (const row of rows) {
    if (!row?.doc_key || typeof row.value !== "string") continue;
    const local = localGet(row.doc_key);
    const m = meta[row.doc_key];
    // Brak metadanych = chmura jest źródłem prawdy (pierwsze logowanie).
    if (local === null || !m || row.updated_at > m) {
      localSet(row.doc_key, row.value);
      meta[row.doc_key] = row.updated_at;
      changed = true;
    }
  }
  if (changed) writeMeta(meta);
  try {
    window.dispatchEvent(new CustomEvent(CLOUD_SYNCED_EVENT));
  } catch {
    /* ignore */
  }
}

/**
 * Pełny rozruch po zalogowaniu / przy wejściu na stronę:
 * pull (stan chmury) + wgranie lokalnej historii, której chmura nie zna.
 */
export async function cloudBootstrap(): Promise<void> {
  if (!cloudEnabled() || typeof window === "undefined") return;
  await cloudSessionEmail();
  if (!sessionEmail) return;
  await cloudPull();
  const meta = readMeta();
  for (const key of allLocalKeys()) {
    if (PUSH_DENYLIST.has(key) || meta[key]) continue;
    const value = localGet(key);
    if (value !== null) void pushKey(key, value);
  }
}

// ---- Powiązanie trener ↔ podopieczny ----

export async function cloudAddMembership(
  trainerEmail: string
): Promise<CloudResult> {
  const sb = await getSupabase();
  if (!sb) return { ok: false, error: "Chmura nie jest skonfigurowana." };
  const me = sessionEmail ?? (await cloudSessionEmail());
  if (!me)
    return { ok: false, error: "Zaloguj się ponownie, aby połączyć z trenerem." };
  try {
    const { error } = await sb.from("memberships").upsert(
      {
        trainer_email: normalizeEmail(trainerEmail),
        client_email: me,
      },
      { onConflict: "trainer_email,client_email" }
    );
    if (error) return { ok: false, error: translateAuthError(error.message) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: translateAuthError(String(e)) };
  }
}