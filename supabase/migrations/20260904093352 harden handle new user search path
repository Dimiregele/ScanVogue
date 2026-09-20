-- La fel ca is_admin() si has_restaurant_access() (deja corecte), fixam
-- search_path-ul mutabil pe handle_new_user() -- fara asta, o functie
-- SECURITY DEFINER e teoretic vulnerabila daca cineva ar putea manipula
-- search_path-ul sesiunii ca sa o faca sa gaseasca un obiect "public.profiles"
-- fals dintr-o alta schema. Comportamentul functiei ramane identic.
alter function public.handle_new_user() set search_path = public;
