-- Indecsi lipsa pe coloane de foreign key, semnalati de advisor-ul de
-- performanta. Nu schimba niciun comportament, doar viteza interogarilor
-- care filtreaza dupa aceste coloane (JOIN-uri, DELETE cascade etc.) --
-- conteaza abia cand tabelele cresc mult (mii+ de randuri).
create index if not exists idx_chats_user_id on public.chats(user_id);
create index if not exists idx_messages_chat_id on public.messages(chat_id);
create index if not exists idx_messages_user_id on public.messages(user_id);
create index if not exists idx_restaurant_users_restaurant_id on public.restaurant_users(restaurant_id);
