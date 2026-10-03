# Chmura: uruchomienie Supabase

Aplikacja działa **hybrydowo**:

- **bez zmiennych środowiskowych** → wszystko jak dotychczas (localStorage, konta demo),
- **z zmiennymi środowiskowymi** → dane synchronizują się z Supabase
  (ten sam telefon/komputer, inne urządzenia, prawdziwa pętla trener ↔ podopieczny).

Nie trzeba zmieniać kodu — wystarczy konfiguracja.

## 1. Załóż projekt Supabase (darmowy plan)

1. Wejdź na <https://supabase.com> → **Start your project** → **New project**.
2. Nazwa: np. `fitcoach`, region: `eu-central-1` (najbliżej PL), hasło bazy: dowolne.
3. Poczekaj ~2 minuty na postawienie projektu.

## 2. Wgraj schemat bazy

W panelu Supabase: **SQL Editor** → **New query** → wklej całą zawartość pliku
[`supabase/schema.sql`](supabase/schema.sql) → **Run** (przycisk w prawym dolnym rogu).

Powinny pojawić się komunikaty `Success. No rows returned`.

## 3. Wyłącz potwierdzanie e-maili (opcjonalnie, wygodne na start)

**Authentication** → **Sign In / Providers** → **Email** → wyłącz
**Confirm email** → **Save**.

Dzięki temu rejestracja loguje od razu. (Można później włączyć — wtedy nowy
użytkownik dostaje link potwierdzający na skrzynkę.)

## 4. Skopiuj zmienne środowiskowe

**Project Settings** → **API** → skopiuj:

- `Project URL` → zmienna `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` (Project API keys) → zmienna `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. Wklej je w Vercel

Projekt na Vercel → **Settings → Environment Variables** → dodaj obie zmienne
(główny environment `Production`) → **Deployments** → ostatni deployment →
**⋯ → Redeploy**.

Po deployu obie strony (`/login` i `/trainer/login`) przełączą się w tryb
chmurowy: rejestracja i logowanie e-mail + hasło.

## Jak to działa po stronie użytkownika

1. **Trener** zakłada konto na `/trainer/login` (przycisk „Załóż konto").
2. **Podopieczny** zakłada konto na `/login`, a potem na ekranie „Wybierz
   trenera" wpisuje **e-mail swojego trenera**.
3. Od tej chwili raporty, plany, wytyczne, zdjęcia sylwetki i wpisy jedzenia
   synchronizują się w obie strony (pull co 60 s + po powrocie do zakładki;
   push z debounce ~1,2 s po każdym zapisie).

## Model danych

- `documents(owner_email, doc_key, value, updated_at)` — każdy klucz
  `fitcoach_*` z localStorage jako wiersz (właściciel = e-mail z klucza albo
  e-mail sesji). Konflikty: **ostatni zapis wygrywa**.
- `memberships(trainer_email, client_email)` — powiązanie trener ↔ podopieczny
  (klient tworzy je, wpisując e-mail trenera).
- **RLS**: użytkownik ma pełny dostęp do własnych dokumentów, trener do
  dokumentów swoich podopiecznych, podopieczny tylko **odczytuje** dokumenty
  trenera (przepisy, bloki, produkty).

## Tryb demo

Po włączeniu chmury konta demo (`podopieczny@fitcoach.ai` / `demo123`) nie
logują się przez Supabase — zarejestruj je raz jako zwykłe konta, jeśli chcesz
ich używać dalej. Przy wyłączonych zmiennych środowiskowych wszystko działa
dawniej, bez żadnych zmian.