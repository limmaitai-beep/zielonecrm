# Zielone Hobby Garden — CRM

Aplikacja do zarządzania klientami dla firmy ogrodniczej. Dostęp z telefonu, tabletu i komputera — wystarczy przeglądarka i internet.

## Co umie aplikacja

- Pełna baza klientów: imię, nazwisko, telefon, e-mail, adres, powierzchnia ogrodu
- Statusy: wycena przygotowana / zaakceptowana, projekt gotowy, realizacja w toku, ukończony
- Wgrywanie plików projektów (wizualizacje, PDF, DWG) — bez limitu typowego rozmiaru
- Widok Kanban (etapy realizacji), panel statystyk, notatki przy każdym kliencie
- Wspólne hasło dostępu dla całego zespołu
- Dane widoczne w tej samej chwili na wszystkich urządzeniach

Czas potrzebny na uruchomienie: **około 20–30 minut**, nawet bez doświadczenia w programowaniu. Wykonujesz to raz — później aplikacja działa sama.

---

## Krok 1 — Załóż konto w Supabase (baza danych, 5 minut)

1. Wejdź na [supabase.com](https://supabase.com) i kliknij **Start your project** / **Sign up**.
2. Zaloguj się przez GitHub albo e-mail.
3. Kliknij **New project**:
   - Nazwa: `zielone-hobby-garden`
   - Hasło bazy danych: ustaw i **zapisz je gdzieś bezpiecznie** (nie będzie potrzebne na co dzień, ale dobrze je mieć)
   - Region: wybierz najbliższy (np. Frankfurt)
4. Czekaj 1–2 minuty, aż Supabase utworzy projekt.

## Krok 2 — Uzupełnij bazę danych

1. W panelu Supabase po lewej stronie kliknij **SQL Editor**.
2. Kliknij **New query**.
3. Otwórz plik `supabase_setup.sql` (jest w tym folderze), skopiuj całą jego zawartość i wklej do edytora.
4. Kliknij **Run** (lub Ctrl+Enter).
5. Powinieneś zobaczyć komunikat o sukcesie — tabele `clients`, `client_files`, `client_notes` są gotowe (z 3 przykładowymi klientami).

## Krok 3 — Włącz miejsce na pliki (Storage)

1. W panelu Supabase po lewej kliknij **Storage**.
2. Kliknij **New bucket**.
3. Nazwa: `projekty-ogrody` (dokładnie tak, małymi literami)
4. Włącz **Public bucket** (przełącznik na "tak") — to pozwala pobierać pliki po zalogowaniu się do CRM.
5. Kliknij **Create bucket**.

**Limit wielkości pliku:** domyślny limit w darmowym planie to 50 MB na plik — w większości wystarcza na wizualizacje. Jeśli potrzebujesz większych plików:
- Kliknij na bucket `projekty-ogrody` → **Configuration** → zwiększ **File size limit** (np. do 200 MB).

## Krok 4 — Pobierz dane łączące aplikację z bazą

1. W panelu Supabase kliknij ikonę zębatki **Project Settings** (lub **Settings**).
2. Wejdź w zakładkę **API**.
3. Znajdziesz tam dwie wartości, które będą potrzebne za chwilę:
   - **Project URL** (np. `https://abcdefgh.supabase.co`)
   - **anon public** key (długi ciąg znaków)

Zostaw tę stronę otwartą — wkleisz to w kroku 6.

## Krok 5 — Wgraj aplikację na Vercel (hosting, darmowy)

1. Wejdź na [vercel.com](https://vercel.com) i zaloguj się (najwygodniej przez GitHub).
2. Jeśli nie masz GitHuba: załóż darmowe konto na [github.com](https://github.com), stwórz nowe repozytorium (np. `zielone-crm`) i wgraj do niego całą zawartość tego folderu (przez **Add file → Upload files** w interfejsie GitHub — można przeciągnąć cały folder).
3. W Vercel kliknij **Add New… → Project**.
4. Wybierz repozytorium `zielone-crm` z GitHub i kliknij **Import**.
5. Vercel sam wykryje, że to projekt Vite — nie zmieniaj ustawień budowania.
6. **Nie klikaj jeszcze Deploy** — najpierw przejdź do kroku 6.

## Krok 6 — Wpisz dane dostępowe (zmienne środowiskowe)

Wciąż w Vercel, w ekranie konfiguracji projektu (przed kliknięciem Deploy, albo później w **Settings → Environment Variables**), dodaj trzy zmienne:

| Nazwa zmiennej | Wartość |
|---|---|
| `VITE_SUPABASE_URL` | Project URL z kroku 4 |
| `VITE_SUPABASE_ANON_KEY` | anon public key z kroku 4 |
| `VITE_APP_PASSWORD` | hasło, które ustalisz dla zespołu, np. `OgrodZielony2025` |

Kliknij **Deploy**. Po 1–2 minutach aplikacja będzie dostępna pod adresem typu `https://zielone-crm.vercel.app`.

## Krok 7 — Gotowe

Otwórz wygenerowany adres na telefonie, tablecie i komputerze — wszędzie zobaczysz ten sam ekran logowania. Wpisz ustalone hasło i korzystaj.

**Wskazówka:** na telefonie możesz dodać stronę do ekranu głównego (w Chrome/Safari: menu → "Dodaj do ekranu głównego") — będzie wyglądać i działać jak osobna aplikacja.

---

## Praca na co dzień

- **Dodawanie klienta:** przycisk "Nowy klient" w górnym pasku.
- **Zmiana statusu:** wejdź w kartę klienta → zakładka "Statusy" → kliknij przełącznik.
- **Dodanie wizualizacji projektu:** karta klienta → zakładka "Pliki projektów" → przeciągnij plik albo kliknij, by wybrać z dysku.
- **Notatki:** karta klienta → zakładka "Notatki".
- **Filtrowanie klientów:** zakładka "Klienci" → chipy filtrów na górze (np. "Bez wyceny", "W realizacji").
- **Wylogowanie:** ikona wylogowania w prawym górnym rogu (przydatne na współdzielonych komputerach).

## Dodawanie kolejnych osób z zespołu

Każdy, kto ma adres aplikacji i wspólne hasło, może z niej korzystać — wystarczy podać im link i hasło. Wszyscy widzą te same, aktualne dane.

## Zmiana hasła w przyszłości

W Vercel: **Settings → Environment Variables → VITE_APP_PASSWORD** → edytuj wartość → **Save** → potem **Deployments → "..."→ Redeploy**, aby zmiana zaczęła działać.

## Jeśli coś nie działa

- **"Błąd wczytywania klientów"** — sprawdź, czy `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` są wpisane bez literówek (Vercel → Settings → Environment Variables).
- **Nie można wgrać pliku** — sprawdź, czy bucket `projekty-ogrody` istnieje w Storage i ma włączone "Public bucket".
- **Plik większy niż limit** — zwiększ limit w Storage → projekty-ogrody → Configuration.

## Praca lokalna (opcjonalnie, dla bardziej technicznych osób)

```bash
npm install
cp .env.example .env
# uzupełnij .env swoimi danymi z Supabase
npm run dev
```

Aplikacja wystartuje na `http://localhost:5173`.
