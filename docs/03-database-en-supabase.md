# 🗄️ Les 3: Database koppelen met Supabase — zonder eigen server

Je website is een statische site (ideaal voor GitHub Pages). Met **Supabase** krijg je er een
gratis database + API bij, zónder dat je zelf een server hoeft te draaien. Formulier-aanvragen
worden dan netjes opgeslagen in een database die jij kunt bekijken.

> 💡 **Hoe het werkt:** Browser → Supabase API → PostgreSQL-database.
> De website praat rechtstreeks met Supabase. GitHub host alleen de bestanden.

---

## Stap 1 — Gratis account aanmaken (2 minuten)

1. Ga naar [supabase.com](https://supabase.com) → **Start your project**
2. Log in met je **GitHub-account** (handig, alles aan elkaar gekoppeld)
3. Klik **New project**:
   - **Name:** `home-computerservice`
   - **Database password:** kies een sterk wachtwoord (bewaar dit!)
   - **Region:** `West EU (Frankfurt)` ← dichtsbijzijnd voor Nederland
4. Wacht 1–2 minuten tot het project klaar is

## Stap 2 — De tabel aanmaken (SQL plakken)

1. Klik in Supabase links op **SQL Editor** → **New query**
2. Plak onderstaande code en klik **Run**:

```sql
-- Tabel voor website-aanvragen
create table public.aanvragen (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  naam text not null,
  telefoon text not null,
  vraag text not null,
  bron text default 'website'
);

-- Row Level Security aanzetten (BELANGRIJK!)
alter table public.aanvragen enable row level security;

-- Iedereen (ook niet-ingelogde bezoekers) mag aanvragen TOEVOEGEN...
create policy "Bezoekers mogen aanvragen toevoegen"
  on public.aanvragen for insert to anon
  with check (true);

-- ...maar NIEMAND kan via de website data UITLEZEN.
-- Alleen jij ziet de aanvragen, in je Supabase-dashboard.
```

> 🔐 **Waarom is dit veilig?** De sleutel die straks in je website staat (anon key) mag alleen
> nieuwe rijen *toevoegen*. Uitlezen, wijzigen of verwijderen kan er niet mee. Jij kijkt naar de
> data via je ingelogde Supabase-dashboard.

## Stap 3 — Je sleutels kopiëren

1. In Supabase: **Project Settings** (tandwiel onderin) → **API**
2. Kopieer twee dingen:
   - **Project URL** → zoiets als `https://abcdefgh.supabase.co`
   - **anon public** key (lange code onder "Project API keys")

## Stap 4 — Invullen in de website

Open `js/supabase-config.js` en vervang de twee regels:

```js
window.HOME_SUPABASE = {
  URL: "https://abcdefgh.supabase.co",     // ← jouw Project URL
  ANON_KEY: "eyJhbGciOi...",               // ← jouw anon public key
};
```

Opslaan, committen, pushen — klaar:

```bash
git add js/supabase-config.js
git commit -m "🗄️ Supabase gekoppeld: aanvragen worden opgeslagen"
git push
```

## Stap 5 — Testen & aanvragen bekijken

1. Vul het formulier op je website in
2. In Supabase: **Table Editor** → tabel `aanvragen` → daar staat je aanvraag! 🎉
3. (De WhatsApp-knop werkt trouwens óók nog steeds — de database vangt alles op,
   WhatsApp is voor direct contact)

---

## 🚀 Later uitbreiden (wanneer je eraan toe bent)

| Wens | Supabase-tool |
|---|---|
| E-mail krijgen bij nieuwe aanvraag | Database Webhooks → Edge Function |
| Zelf inloggen om aanvragen te beheren | Supabase Auth + dashboard |
| Status bijhouden ("teruggebeld" ✓) | Extra kolom + eigen admin-pagina |
| Bestanden/foto's opslaan | Supabase Storage |

**Gratis tier** (500 MB database, 50.000 gebruikers/maand) is voor een lokaal bedrijf
ruim voldoende — je betaalt pas bij écht veel verkeer.

## 🆘 Problemen?

| Probleem | Oplossing |
|---|---|
| Aanvraag verschijnt niet in tabel | Check of RLS-policy uit stap 2 is aangemaakt |
| Foutmelding `401` in browser-console | Verkeerde ANON_KEY — kopieer opnieuw uit Settings → API |
| Foutmelding `404` | Controleer of de URL eindigt op `.supabase.co` (geen `/rest/v1` erachter) |
