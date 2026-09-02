-- ===========================================================================
-- Vérification des policies RLS de SmarCi.
-- ---------------------------------------------------------------------------
-- Simule deux utilisateurs et vérifie qu'aucun ne peut lire ni écrire les
-- données de l'autre. Chaque assertion échoue bruyamment.
--
-- Exécution locale (voir docs/verification-locale.md) :
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.sql
--
-- Le script s'exécute dans une transaction annulée à la fin : il ne laisse
-- aucune donnée derrière lui.
-- ===========================================================================

begin;

-- Deux comptes de test. Le trigger `on_auth_user_created` doit créer les
-- profils correspondants automatiquement.
insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.test');

do $$
begin
  assert (select count(*) from public.profiles
          where id in ('11111111-1111-1111-1111-111111111111',
                       '22222222-2222-2222-2222-222222222222')) = 2,
    'Le trigger handle_new_user n''a pas créé les profils';
end
$$;

-- --- Alice crée une conversation et un message -----------------------------

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

insert into public.conversations (id, user_id, title)
values ('aaaaaaaa-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'Conversation d''Alice');

insert into public.messages (conversation_id, role, content)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'user', 'Bonjour SmarCi');

insert into public.calculations (user_id, type, inputs, results)
values ('11111111-1111-1111-1111-111111111111', 'import_cost',
        '{"quantite": 100}'::jsonb, '{"total": 1000}'::jsonb);

do $$
begin
  assert (select count(*) from public.conversations) = 1,
    'Alice devrait voir sa propre conversation';
  assert (select count(*) from public.messages) = 1,
    'Alice devrait voir son propre message';
  assert (select count(*) from public.calculations) = 1,
    'Alice devrait voir son propre calcul';
  assert (select count(*) from public.profiles) = 1,
    'Alice ne devrait voir que son propre profil';
end
$$;

-- --- Bob ne doit rien voir d'Alice -----------------------------------------

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

do $$
begin
  assert (select count(*) from public.conversations) = 0,
    'FUITE : Bob voit les conversations d''Alice';
  assert (select count(*) from public.messages) = 0,
    'FUITE : Bob voit les messages d''Alice';
  assert (select count(*) from public.calculations) = 0,
    'FUITE : Bob voit les calculs d''Alice';
  assert (select count(*) from public.profiles) = 1,
    'FUITE : Bob voit un profil qui n''est pas le sien';
end
$$;

-- Bob ne doit pas pouvoir écrire dans la conversation d'Alice.
do $$
begin
  insert into public.messages (conversation_id, role, content)
  values ('aaaaaaaa-0000-0000-0000-000000000001', 'user', 'Intrusion');
  raise exception 'FUITE : Bob a pu écrire dans la conversation d''Alice';
exception
  when insufficient_privilege then null;
end
$$;

-- Bob ne doit pas pouvoir s'attribuer une conversation au nom d'Alice.
do $$
begin
  insert into public.conversations (user_id, title)
  values ('11111111-1111-1111-1111-111111111111', 'Usurpation');
  raise exception 'FUITE : Bob a pu créer une conversation au nom d''Alice';
exception
  when insufficient_privilege then null;
end
$$;

-- --- Guide : lecture pour tous, écriture interdite --------------------------

reset role;
insert into public.guide_documents (id, title)
values ('dddddddd-0000-0000-0000-000000000001', 'Document de test');

set local role anon;

do $$
begin
  assert (select count(*) from public.guide_documents) = 1,
    'Le guide doit être lisible sans compte';
end
$$;

do $$
begin
  insert into public.guide_documents (title) values ('Écriture interdite');
  raise exception 'FUITE : un visiteur anonyme a pu écrire dans le guide';
exception
  when insufficient_privilege then null;
end
$$;

reset role;
rollback;
