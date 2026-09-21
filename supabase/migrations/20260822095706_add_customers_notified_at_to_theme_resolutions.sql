alter table theme_resolutions add column if not exists customers_notified_at timestamptz;
comment on column theme_resolutions.customers_notified_at is 'Cand au fost notificati clientii care s-au plans de aceasta tema, ca sa nu se trimita de mai multe ori la fiecare rulare a job-ului.';
