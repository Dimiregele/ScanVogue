-- ============================================================
-- SCHEMA FINALA CONSOLIDATA
-- Platforma de management recenzii Google pentru restaurante
-- ============================================================

-- 1. RESTAURANTE (clientii SaaS)
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  subtitle text,
  logo_url text,
  google_review_url text not null,
  alert_email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. ADMINI PLATFORMA (super-admin)
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 3. UTILIZATORI RESTAURANT (proprietari)
create table restaurant_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique(user_id, restaurant_id)
);

-- 4. SCANARI
create table scans (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  choice text check (choice in ('positive', 'negative')),
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create index idx_scans_restaurant_date on scans (restaurant_id, created_at);

-- 5. RECLAMATII
create table complaints (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  message text not null,
  contact_name text,
  contact_phone text,
  contact_email text,
  status text not null default 'new' check (status in ('new', 'read', 'resolved')),
  created_at timestamptz not null default now()
);

create index idx_complaints_restaurant_date on complaints (restaurant_id, created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table restaurants enable row level security;
alter table admins enable row level security;
alter table restaurant_users enable row level security;
alter table scans enable row level security;
alter table complaints enable row level security;

create or replace function is_admin() returns boolean as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$ language sql security definer stable;

create or replace function has_restaurant_access(target_restaurant_id uuid) returns boolean as $$
  select is_admin() or exists (
    select 1 from restaurant_users
    where restaurant_id = target_restaurant_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

create policy "admin full access restaurants" on restaurants
  for all using (is_admin()) with check (is_admin());

create policy "owner reads own restaurant" on restaurants
  for select using (has_restaurant_access(id));

create policy "owner updates own restaurant settings" on restaurants
  for update using (has_restaurant_access(id))
  with check (has_restaurant_access(id));

create policy "admin reads admins" on admins
  for select using (is_admin());

create policy "admin full access restaurant_users" on restaurant_users
  for all using (is_admin()) with check (is_admin());

create policy "user reads own restaurant_users row" on restaurant_users
  for select using (user_id = auth.uid());

create policy "admin full access scans" on scans
  for all using (is_admin()) with check (is_admin());

create policy "owner reads own scans" on scans
  for select using (has_restaurant_access(restaurant_id));

create policy "admin full access complaints" on complaints
  for all using (is_admin()) with check (is_admin());

create policy "owner reads own complaints" on complaints
  for select using (has_restaurant_access(restaurant_id));

create policy "owner updates own complaints status" on complaints
  for update using (has_restaurant_access(restaurant_id))
  with check (has_restaurant_access(restaurant_id));
