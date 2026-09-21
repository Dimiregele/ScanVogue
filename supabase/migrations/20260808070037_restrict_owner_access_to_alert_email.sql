-- Acces la panoul proprietarului legat STRICT de alert_email al restaurantului,
-- nu de un tabel separat care trebuie populat manual la fiecare onboarding.
-- is_admin() ramane neschimbat -- super-adminul are in continuare acces total.
-- restaurant_users ramane in schema pentru o eventuala extindere viitoare
-- (mai multi angajati per restaurant), dar nu mai e folosit pentru acces MVP.
CREATE OR REPLACE FUNCTION public.has_restaurant_access(target_restaurant_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select is_admin() or exists (
    select 1 from restaurants
    where id = target_restaurant_id
      and alert_email is not null
      and lower(alert_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$function$;
