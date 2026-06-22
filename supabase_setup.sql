-- ============================================================
-- ZIELONE HOBBY GARDEN - CRM
-- Skrypt konfiguracyjny bazy danych dla Supabase
-- ============================================================
-- INSTRUKCJA:
-- 1. Wejdz na supabase.com -> Twoj projekt -> SQL Editor
-- 2. Kliknij "New query"
-- 3. Wklej caly ten plik i kliknij "Run"
-- ============================================================

-- Tabela klientow
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text,
  street text,
  city text,
  zip text,
  area_m2 integer default 0,
  quote_value numeric default 0,
  note text,
  meeting_date date,

  -- statusy realizacji
  quoted boolean default false,
  accepted boolean default false,
  design_ready boolean default false,
  in_progress boolean default false,
  done boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela plikow projektow (metadane - pliki fizyczne trzymane w Supabase Storage)
create table if not exists client_files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  file_size bigint,
  uploaded_at timestamptz default now()
);

-- Tabela notatek
create table if not exists client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  note_text text not null,
  created_at timestamptz default now()
);

-- Indeksy dla szybszego wyszukiwania
create index if not exists idx_clients_created on clients(created_at desc);
create index if not exists idx_files_client on client_files(client_id);
create index if not exists idx_notes_client on client_notes(client_id);

-- Funkcja automatycznie aktualizujaca pole updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_clients_updated on clients;
create trigger trg_clients_updated
  before update on clients
  for each row execute function update_updated_at();

-- ============================================================
-- BEZPIECZENSTWO (Row Level Security)
-- Poniewaz logowanie odbywa sie przez wspolne haslo na poziomie
-- aplikacji (nie przez Supabase Auth), wlaczamy dostep dla
-- klucza "anon" tylko do tych tabel - klucz anon NIGDY nie daje
-- dostepu do panelu admina Supabase ani innych projektow.
-- ============================================================

alter table clients enable row level security;
alter table client_files enable row level security;
alter table client_notes enable row level security;

create policy "Pozwol na wszystko - clients" on clients
  for all using (true) with check (true);

create policy "Pozwol na wszystko - client_files" on client_files
  for all using (true) with check (true);

create policy "Pozwol na wszystko - client_notes" on client_notes
  for all using (true) with check (true);

-- ============================================================
-- STORAGE - miejsce na pliki projektow (wizualizacje, PDF, DWG itd.)
-- ============================================================
-- Uwaga: ponizsze trzeba zrobic recznie w panelu Supabase, bo
-- tworzenie bucketow przez SQL bywa ograniczone w darmowym planie:
--
-- 1. Storage -> "New bucket"
-- 2. Nazwa: projekty-ogrody
-- 3. Public bucket: TAK (zaznacz - zeby dalo sie pobierac pliki)
-- 4. Kliknij "Create bucket"
--
-- Limit wielkosci pojedynczego pliku mozna zwiekszyc w:
-- Storage -> projekty-ogrody -> Configuration -> File size limit
-- (domyslnie wystarcza na wieksze wizualizacje, w razie potrzeby zwieksz np. do 200 MB)

-- ============================================================
-- PRZYKLADOWE DANE (opcjonalne - mozesz usunac ten blok)
-- ============================================================

insert into clients (first_name, last_name, phone, email, street, city, zip, area_m2, quote_value, note, quoted, accepted, design_ready, in_progress, done)
values
  ('Monika', 'Wisniewska', '+48 601 234 567', 'm.wisniewska@gmail.com', 'ul. Kwiatowa 3', 'Warszawa', '02-001', 320, 18500, 'Pergola drewniana i oczko wodne, styl angielski.', true, true, true, true, false),
  ('Tomasz', 'Gorski', '+48 512 876 543', 't.gorski@wp.pl', 'ul. Lesna 18', 'Krakow', '30-001', 180, 9200, 'Maly ogrod miejski, styl minimalistyczny.', true, true, false, false, false),
  ('Piotr', 'Zajac', '+48 733 999 001', 'p.zajac@interia.pl', 'ul. Rozana 22', 'Wroclaw', '50-001', 240, 0, 'Nowe zapytanie przez strone internetowa.', false, false, false, false, false)
on conflict do nothing;
