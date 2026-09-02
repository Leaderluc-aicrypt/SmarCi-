-- ===========================================================================
-- SmarCi — Schéma initial du MVP
-- ---------------------------------------------------------------------------
-- Tables, relations et RLS décrites au §4 du plan MVP.
--
-- Ce script est IDEMPOTENT : il peut être rejoué sans erreur.
-- Pour l'appliquer : Supabase Dashboard > SQL Editor > coller > Run.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------

-- Recherche vectorielle du guide (§3.2). Installée dans le schéma `extensions`,
-- convention Supabase : le type s'écrit donc `extensions.vector`.
create extension if not exists vector with schema extensions;

-- ---------------------------------------------------------------------------
-- 2. Types
-- ---------------------------------------------------------------------------

-- Niveau d'expérience, utilisé par le copilote pour adapter son ton (§5.1).
do $$
begin
  create type public.experience_level as enum (
    'aspirant', 'debutant', 'amateur', 'professionnel'
  );
exception
  when duplicate_object then null;
end
$$;

-- ---------------------------------------------------------------------------
-- 3. Fonctions utilitaires
-- ---------------------------------------------------------------------------

-- Tient `updated_at` à jour automatiquement.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Tables
-- ---------------------------------------------------------------------------

-- auth.users → profiles (1:1)
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  email            text,
  full_name        text,
  experience_level public.experience_level not null default 'debutant',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.profiles is
  'Profil applicatif, créé automatiquement à l''inscription.';

-- profiles → conversations (1:N)
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  title      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_id_created_at_idx
  on public.conversations (user_id, created_at desc);

-- conversations → messages (1:N)
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content         text not null default '',
  -- Appels d'outils émis par le modèle (`calculate_import_cost`, etc. — §5.1).
  tool_calls      jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at);

-- messages → calculations (1:0-1) : `message_id` est unique et nullable.
create table if not exists public.calculations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  message_id uuid unique references public.messages (id) on delete set null,
  type       text not null check (type in ('import_cost', 'margin')),
  -- Entrées fournies par l'utilisateur et résultat du calcul déterministe.
  -- Conservés tels quels pour pouvoir réafficher le détail (§5.2).
  inputs     jsonb not null,
  results    jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists calculations_user_id_created_at_idx
  on public.calculations (user_id, created_at desc);

-- Guide : vide au MVP, le schéma est posé pour la suite (§4.1).
create table if not exists public.guide_documents (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  source     text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- guide_documents → guide_chunks (1:N)
create table if not exists public.guide_chunks (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.guide_documents (id) on delete cascade,
  content     text not null,
  -- 1536 dimensions = OpenAI `text-embedding-3-small`.
  embedding   extensions.vector(1536),
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists guide_chunks_document_id_idx
  on public.guide_chunks (document_id);

-- Index vectoriel HNSW : contrairement à ivfflat, il n'a pas besoin de données
-- pour être construit, ce qui convient à une table encore vide.
do $$
begin
  create index guide_chunks_embedding_idx
    on public.guide_chunks
    using hnsw (embedding extensions.vector_cosine_ops);
exception
  when duplicate_table then null;
  when others then
    raise notice 'Index HNSW non créé (%). Sans conséquence tant que le guide est vide.', sqlerrm;
end
$$;

-- ---------------------------------------------------------------------------
-- 5. Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

drop trigger if exists guide_documents_set_updated_at on public.guide_documents;
create trigger guide_documents_set_updated_at
  before update on public.guide_documents
  for each row execute function public.set_updated_at();

-- Création automatique du profil à l'inscription.
-- `security definer` : la fonction écrit dans `profiles` alors que la RLS
-- interdirait l'insertion à ce stade (l'utilisateur n'a pas encore de session).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 6. Row Level Security (§4.3)
-- ---------------------------------------------------------------------------
-- RLS active sur les six tables. Chaque utilisateur ne voit que ses données ;
-- le guide est en lecture seule pour tous et n'est modifiable que par
-- `service_role`, qui contourne la RLS.
--
-- `(select auth.uid())` plutôt que `auth.uid()` : PostgreSQL évalue alors la
-- valeur une seule fois par requête au lieu d'une fois par ligne.

alter table public.profiles        enable row level security;
alter table public.conversations   enable row level security;
alter table public.messages        enable row level security;
alter table public.calculations    enable row level security;
alter table public.guide_documents enable row level security;
alter table public.guide_chunks    enable row level security;

-- profiles ------------------------------------------------------------------

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Pas de policy DELETE : un profil disparaît avec son compte auth (cascade).

-- conversations --------------------------------------------------------------

drop policy if exists conversations_select_own on public.conversations;
create policy conversations_select_own on public.conversations
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists conversations_insert_own on public.conversations;
create policy conversations_insert_own on public.conversations
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists conversations_update_own on public.conversations;
create policy conversations_update_own on public.conversations
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists conversations_delete_own on public.conversations;
create policy conversations_delete_own on public.conversations
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- messages -------------------------------------------------------------------
-- L'appartenance passe par la conversation parente.

drop policy if exists messages_select_own on public.messages;
create policy messages_select_own on public.messages
  for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  );

drop policy if exists messages_insert_own on public.messages;
create policy messages_insert_own on public.messages
  for insert to authenticated
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  );

drop policy if exists messages_update_own on public.messages;
create policy messages_update_own on public.messages
  for update to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  );

drop policy if exists messages_delete_own on public.messages;
create policy messages_delete_own on public.messages
  for delete to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  );

-- calculations ---------------------------------------------------------------

drop policy if exists calculations_select_own on public.calculations;
create policy calculations_select_own on public.calculations
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists calculations_insert_own on public.calculations;
create policy calculations_insert_own on public.calculations
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists calculations_update_own on public.calculations;
create policy calculations_update_own on public.calculations
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists calculations_delete_own on public.calculations;
create policy calculations_delete_own on public.calculations
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- guide ----------------------------------------------------------------------
-- Lecture pour tous, écriture réservée à `service_role` : l'absence de policy
-- INSERT/UPDATE/DELETE suffit à interdire l'écriture aux rôles soumis à la RLS.

drop policy if exists guide_documents_select_all on public.guide_documents;
create policy guide_documents_select_all on public.guide_documents
  for select to anon, authenticated
  using (true);

drop policy if exists guide_chunks_select_all on public.guide_chunks;
create policy guide_chunks_select_all on public.guide_chunks
  for select to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 7. Privilèges au niveau table
-- ---------------------------------------------------------------------------
-- Supabase accorde par défaut tous les privilèges à `anon`, `authenticated` et
-- `service_role` sur les nouvelles tables de `public`. On ne s'appuie pas sur
-- cet implicite : les privilèges sont posés explicitement ici, et resserrés.
--
-- La RLS reste la protection principale ; ces GRANT/REVOKE en sont la seconde
-- couche. `anon` n'a aucune raison d'atteindre les données utilisateur, même
-- avec des policies qui les lui refusent déjà.

revoke all on public.profiles      from anon;
revoke all on public.conversations from anon;
revoke all on public.messages      from anon;
revoke all on public.calculations  from anon;

grant select, insert, update, delete on public.profiles      to authenticated;
grant select, insert, update, delete on public.conversations to authenticated;
grant select, insert, update, delete on public.messages      to authenticated;
grant select, insert, update, delete on public.calculations  to authenticated;

grant select on public.guide_documents to anon, authenticated;
grant select on public.guide_chunks    to anon, authenticated;

-- `service_role` contourne la RLS : c'est le rôle d'administration, utilisé
-- uniquement côté serveur (ingestion du guide, maintenance).
grant all on public.profiles        to service_role;
grant all on public.conversations   to service_role;
grant all on public.messages        to service_role;
grant all on public.calculations    to service_role;
grant all on public.guide_documents to service_role;
grant all on public.guide_chunks    to service_role;
