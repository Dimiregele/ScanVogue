create or replace function is_admin() returns boolean as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$ language sql security definer stable set search_path = public;

create or replace function has_restaurant_access(target_restaurant_id uuid) returns boolean as $$
  select is_admin() or exists (
    select 1 from restaurant_users
    where restaurant_id = target_restaurant_id and user_id = auth.uid()
  );
$$ language sql security definer stable set search_path = public;
