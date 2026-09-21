-- Tabela public.profiles e populata automat de trigger-ul on_auth_user_created
-- la fiecare cont Supabase Auth nou (boilerplate ramas dintr-un template
-- initial, nefolosit nicaieri in cod -- niciun fisier din aplicatie nu
-- citeste/scrie in "profiles"). Constrangerea originala nu avea ON DELETE,
-- deci Postgres bloca STERGEREA oricarui user din auth.users cat timp
-- exista randul lui in profiles (adica mereu) -- de-asta niciun user nu
-- putea fi sters, din Dashboard sau de oriunde altundeva.
alter table public.profiles
  drop constraint profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;
