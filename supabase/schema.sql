-- ============================================================
-- FitCoach AI — schemat bazy danych (Supabase)
-- Uruchom: Supabase → SQL Editor → New query → wklej → Run
-- ============================================================

-- Dokumenty: każdy klucz z localStorage (fitcoach_*) trafia tutaj
-- jako wiersz (właściciel + klucz + wartość JSON/string).
create table if not exists public.documents (
  owner_email text not null,
  doc_key     text not null,
  value       text not null,
  updated_at  timestamptz not null default now(),
  primary key (owner_email, doc_key)
);

-- Powiązania trener ↔ podopieczny (klient wpisuje e-mail trenera).
create table if not exists public.memberships (
  trainer_email text not null,
  client_email  text not null,
  created_at    timestamptz not null default now(),
  primary key (trainer_email, client_email)
);

create index if not exists documents_owner_idx
  on public.documents (owner_email);
create index if not exists memberships_client_idx
  on public.memberships (client_email);

-- Adres e-mail zalogowanego (z JWT) — używany w politykach RLS.
create or replace function public.request_email()
returns text
language sql
stable
as $$
  select auth.jwt() ->> 'email'
$$;

alter table public.documents enable row level security;
alter table public.memberships enable row level security;

-- ---- memberships: trener widzi swoich klientów i odwrotnie ----

create policy "memberships_select" on public.memberships
  for select
  using (
    trainer_email = public.request_email()
    or client_email = public.request_email()
  );

create policy "memberships_insert" on public.memberships
  with check (
    trainer_email = public.request_email()
    or client_email = public.request_email()
  );

create policy "memberships_delete" on public.memberships
  for delete
  using (trainer_email = public.request_email());

-- ---- documents: właściciel = pełen dostęp ----

create policy "documents_owner_all" on public.documents
  for all
  using (owner_email = public.request_email())
  with check (owner_email = public.request_email());

-- ---- trener: pełen dostęp do dokumentów swoich podopiecznych ----
-- (plan, wytyczne, raporty — trener je zapisuje i czyta)

create policy "documents_trainer_member" on public.documents
  for all
  using (
    exists (
      select 1 from public.memberships m
      where m.trainer_email = public.request_email()
        and m.client_email = documents.owner_email
    )
  )
  with check (
    exists (
      select 1 from public.memberships m
      where m.trainer_email = public.request_email()
        and m.client_email = documents.owner_email
    )
  );

-- ---- klient: ODCZYT dokumentów swojego trenera ----
-- (przepisy, bloki treningowe, produkty trenera)

create policy "documents_client_reads_trainer" on public.documents
  for select
  using (
    exists (
      select 1 from public.memberships m
      where m.client_email = public.request_email()
        and m.trainer_email = documents.owner_email
    )
  );