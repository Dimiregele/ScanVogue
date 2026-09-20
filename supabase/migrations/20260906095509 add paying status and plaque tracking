-- Urmarim separat "e client platitor" de "is_active" (care controla doar
-- daca pagina publica functioneaza). Placheta fizica se trimite DOAR dupa
-- ce restaurantul incepe sa plateasca, nu in perioada de proba gratuita --
-- de-asta avem nevoie de propriul camp, nu putem folosi is_active pentru asta.
alter table public.restaurants
  add column if not exists is_paying boolean not null default false,
  add column if not exists plaque_sent_at timestamptz;
