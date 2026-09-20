-- Consolidam politicile "admin full access X" (ALL) + "owner ... X" (SELECT
-- sau UPDATE) intr-o singura politica per actiune (SELECT/INSERT/UPDATE/
-- DELETE), combinand conditiile cu OR. Comportamentul efectiv ramane
-- IDENTIC -- doar Postgres nu mai evalueaza doua politici separate pentru
-- aceeasi interogare. Facem asta pe rand, per tabela, ca sa fie usor de
-- verificat.

-- ===== complaints =====
drop policy if exists "admin full access complaints" on public.complaints;
drop policy if exists "owner reads own complaints" on public.complaints;
drop policy if exists "owner updates own complaints status" on public.complaints;

create policy "complaints select (admin or owner)" on public.complaints
  for select using (is_admin() or has_restaurant_access(restaurant_id));
create policy "complaints insert (admin only)" on public.complaints
  for insert with check (is_admin());
create policy "complaints update (admin or owner)" on public.complaints
  for update using (is_admin() or has_restaurant_access(restaurant_id))
  with check (is_admin() or has_restaurant_access(restaurant_id));
create policy "complaints delete (admin only)" on public.complaints
  for delete using (is_admin());

-- ===== restaurants =====
drop policy if exists "admin full access restaurants" on public.restaurants;
drop policy if exists "owner reads own restaurant" on public.restaurants;
drop policy if exists "owner updates own restaurant settings" on public.restaurants;

create policy "restaurants select (admin or owner)" on public.restaurants
  for select using (is_admin() or has_restaurant_access(id));
create policy "restaurants insert (admin only)" on public.restaurants
  for insert with check (is_admin());
create policy "restaurants update (admin or owner)" on public.restaurants
  for update using (is_admin() or has_restaurant_access(id))
  with check (is_admin() or has_restaurant_access(id));
create policy "restaurants delete (admin only)" on public.restaurants
  for delete using (is_admin());

-- ===== scans =====
drop policy if exists "admin full access scans" on public.scans;
drop policy if exists "owner reads own scans" on public.scans;

create policy "scans select (admin or owner)" on public.scans
  for select using (is_admin() or has_restaurant_access(restaurant_id));
create policy "scans insert (admin only)" on public.scans
  for insert with check (is_admin());
create policy "scans update (admin only)" on public.scans
  for update using (is_admin()) with check (is_admin());
create policy "scans delete (admin only)" on public.scans
  for delete using (is_admin());

-- ===== theme_resolutions (owner-ul avea acces ALL, nu doar select) =====
drop policy if exists "admin full access theme_resolutions" on public.theme_resolutions;
drop policy if exists "owner manages own theme_resolutions" on public.theme_resolutions;

create policy "theme_resolutions select (admin or owner)" on public.theme_resolutions
  for select using (is_admin() or has_restaurant_access(restaurant_id));
create policy "theme_resolutions insert (admin or owner)" on public.theme_resolutions
  for insert with check (is_admin() or has_restaurant_access(restaurant_id));
create policy "theme_resolutions update (admin or owner)" on public.theme_resolutions
  for update using (is_admin() or has_restaurant_access(restaurant_id))
  with check (is_admin() or has_restaurant_access(restaurant_id));
create policy "theme_resolutions delete (admin or owner)" on public.theme_resolutions
  for delete using (is_admin() or has_restaurant_access(restaurant_id));

-- ===== theme_snapshots =====
drop policy if exists "admin full access theme_snapshots" on public.theme_snapshots;
drop policy if exists "owner reads own theme_snapshots" on public.theme_snapshots;

create policy "theme_snapshots select (admin or owner)" on public.theme_snapshots
  for select using (is_admin() or has_restaurant_access(restaurant_id));
create policy "theme_snapshots insert (admin only)" on public.theme_snapshots
  for insert with check (is_admin());
create policy "theme_snapshots update (admin only)" on public.theme_snapshots
  for update using (is_admin()) with check (is_admin());
create policy "theme_snapshots delete (admin only)" on public.theme_snapshots
  for delete using (is_admin());

-- ===== restaurant_users (si aici aplicam fix-ul auth.uid() -> (select auth.uid())) =====
drop policy if exists "admin full access restaurant_users" on public.restaurant_users;
drop policy if exists "user reads own restaurant_users row" on public.restaurant_users;

create policy "restaurant_users select (admin or self)" on public.restaurant_users
  for select using (is_admin() or user_id = (select auth.uid()));
create policy "restaurant_users insert (admin only)" on public.restaurant_users
  for insert with check (is_admin());
create policy "restaurant_users update (admin only)" on public.restaurant_users
  for update using (is_admin()) with check (is_admin());
create policy "restaurant_users delete (admin only)" on public.restaurant_users
  for delete using (is_admin());

-- ===== profiles, chats, messages: doar fix-ul auth.uid() -> (select auth.uid()),
-- nu aveau politici duplicate =====
drop policy if exists "Users see own profile" on public.profiles;
create policy "Users see own profile" on public.profiles
  for all using ((select auth.uid()) = id);

drop policy if exists "Users see own chats" on public.chats;
create policy "Users see own chats" on public.chats
  for all using ((select auth.uid()) = user_id);

drop policy if exists "Users see own messages" on public.messages;
create policy "Users see own messages" on public.messages
  for all using ((select auth.uid()) = user_id);
