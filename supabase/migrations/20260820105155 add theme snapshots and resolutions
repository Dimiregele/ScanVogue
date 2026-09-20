-- Instantaneu saptamanal al temelor recurente, calculat automat de job-ul
-- programat (nu la cerere de utilizator) -- elimina orice risc de suprasolicitare
-- a AI-ului, pentru ca temele sunt deja stocate per-reclamatie (coloana
-- complaints.theme), nu se mai recalculeaza cu un apel AI nou de fiecare data.
create table if not exists theme_snapshots (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  computed_at timestamptz not null default now(),
  window_days int not null,
  themes jsonb not null
);

create index if not exists theme_snapshots_restaurant_computed_idx
  on theme_snapshots(restaurant_id, computed_at desc);

alter table theme_snapshots enable row level security;

create policy "admin full access theme_snapshots"
  on theme_snapshots for all
  using (is_admin());

create policy "owner reads own theme_snapshots"
  on theme_snapshots for select
  using (has_restaurant_access(restaurant_id));

-- Marcaje "am rezolvat problema X" facute de proprietar -- folosite ca sa
-- comparam frecventa temei inainte/dupa, ca sa vedem daca remediul a avut
-- efect real, nu doar declarat.
create table if not exists theme_resolutions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  theme text not null,
  resolved_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists theme_resolutions_restaurant_theme_idx
  on theme_resolutions(restaurant_id, theme, resolved_at desc);

alter table theme_resolutions enable row level security;

create policy "admin full access theme_resolutions"
  on theme_resolutions for all
  using (is_admin());

create policy "owner manages own theme_resolutions"
  on theme_resolutions for all
  using (has_restaurant_access(restaurant_id))
  with check (has_restaurant_access(restaurant_id));
