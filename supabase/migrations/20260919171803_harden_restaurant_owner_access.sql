-- Revine la restaurant_users ca sursa de adevar pentru accesul proprietarului,
-- in loc de potrivirea pe alert_email introdusa in
-- 20260808070037_restrict_owner_access_to_alert_email.sql.
--
-- Motivul: potrivirea pe alert_email inseamna ca izolarea intre restaurante
-- depinde de un text liber, needitat separat de super-admin -- daca doua
-- restaurante ajung vreodata cu acelasi alert_email, sau daca adresa se
-- schimba, izolarea cedeaza silentios (fara nicio eroare, doar acces gresit
-- sau pierdut). restaurant_users e un tabel explicit, cu constrangere
-- unique(user_id, restaurant_id) si RLS proprii -- accesul se schimba DOAR
-- printr-o actiune explicita (INSERT/DELETE), niciodata ca efect secundar al
-- editarii unui camp text.
--
-- Pasul 1: completam retroactiv restaurant_users pentru restaurantele
-- existente, pe baza potrivirii curente alert_email <-> auth.users.email
-- (case-insensitive) -- exact regula pe care o inlocuim, aplicata o
-- singura data, ca sa nu piarda niciun proprietar existent accesul.
insert into public.restaurant_users (user_id, restaurant_id, role)
select u.id, r.id, 'owner'
from public.restaurants r
join auth.users u on lower(u.email) = lower(r.alert_email)
where r.alert_email is not null
on conflict (user_id, restaurant_id) do nothing;

-- Pasul 2: has_restaurant_access() foloseste DOAR restaurant_users de acum
-- inainte. is_admin() ramane neschimbat -- super-adminul are in continuare
-- acces total.
CREATE OR REPLACE FUNCTION public.has_restaurant_access(target_restaurant_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select is_admin() or exists (
    select 1 from restaurant_users
    where restaurant_id = target_restaurant_id
      and user_id = (select auth.uid())
  );
$function$;

-- Nota pentru viitor: orice restaurant nou trebuie sa primeasca un rand in
-- restaurant_users la creare (vezi app/admin-x7k2/actions.ts -- createRestaurant
-- acum face asta automat). Daca vreodata se schimba manual alert_email pe un
-- restaurant existent, actualizeaza si restaurant_users -- cele doua NU se mai
-- sincronizeaza automat, exact ca sa evitam fragilitatea de mai sus.
