-- Suport pentru masurile anti-abuz din app/r/[slug]/page.tsx, app/api/scan
-- si app/api/complaint:
--   - scans: dedup pe (restaurant_id, ip_hash, user_agent) intr-o fereastra
--     scurta, ca sa nu umfle analytics-ul un script care reincarca pagina.
--   - complaints: ip_hash pentru rate limiting si un plafon de lungime pe
--     mesaj (in plus fata de cel din UI, care poate fi ocolit trivial).
--
-- Stocam ip_hash (hash, NU adresa IP in clar) -- suficient ca sa comparam
-- "e aceeasi sursa?" pentru dedup/rate-limit, fara sa pastram IP-ul
-- utilizatorului in clar in baza de date. Hash-ul se calculeaza in aplicatie
-- (lib/request-meta.ts), cu o cheie separata din variabilele de mediu.

alter table public.scans
  add column if not exists ip_hash text,
  add column if not exists user_agent text;

alter table public.complaints
  add column if not exists ip_hash text;

-- Index compus pentru interogarea de dedup: "exista deja o scanare recenta
-- de la aceasta sursa, pentru acest restaurant?"
create index if not exists idx_scans_dedup
  on public.scans (restaurant_id, ip_hash, user_agent, created_at desc);

-- Index compus pentru interogarea de rate-limit: "cate reclamatii a trimis
-- aceasta sursa recent, la acest restaurant?"
create index if not exists idx_complaints_rate_limit
  on public.complaints (restaurant_id, ip_hash, created_at desc);

-- Index simplu pe created_at, folosit de job-ul lunar de retentie
-- (app/api/data-retention) ca sa gaseasca eficient randurile mai vechi de
-- perioada declarata in politica de confidentialitate.
create index if not exists idx_scans_created_at on public.scans (created_at);
create index if not exists idx_complaints_created_at on public.complaints (created_at);

-- Plafon de lungime pe mesaj -- in plus fata de limita din UI (usor de
-- ocolit printr-un request direct catre API). 2000 e acelasi plafon impus
-- si server-side in app/api/complaint/route.ts; il tinem si la nivel de
-- schema ca ultima linie de aparare, indiferent pe unde vine INSERT-ul.
alter table public.complaints
  add constraint complaints_message_length check (char_length(message) <= 2000);
