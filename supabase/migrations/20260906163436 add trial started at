-- Data la care a inceput luna de proba gratuita -- separata de created_at,
-- pentru ca unele restaurante (Complex Herastrau, demo) au fost create in
-- sistem inainte sa existe conceptul formal de "perioada de proba", deci
-- created_at nu reflecta neaparat data reala de start a trial-ului.
alter table public.restaurants
  add column if not exists trial_started_at timestamptz;
