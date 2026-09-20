-- Camp pentru rezumatul AI (o linie), raspunsul sugerat de AI (editabil de
-- proprietar inainte de trimitere), flag pentru cazuri sensibile care merita
-- atentie umana suplimentara, si momentul la care a fost efectiv trimis un
-- raspuns catre client (null = nu s-a trimis inca).
ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS ai_suggested_reply text,
  ADD COLUMN IF NOT EXISTS ai_sensitive boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reply_sent_at timestamptz;
