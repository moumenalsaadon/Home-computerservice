# 🏠 HOME Computerservice — Website

De officiële website van **HOME Computerservice** — computerhulp aan huis in Beugen & regio.
Statische site: supersnel, gratis te hosten op GitHub Pages, met Supabase-database voor aanvragen.

## ✨ Kenmerken

- 📱 **Volledig responsive** (mobiel-first, breakpoints 640/900/1150px)
- 🌊 **3D bewegende achtergrond** (parallax-lagen, zwevende blobs, stijgende deeltjes)
- 🃏 **3D-tilt kaarten** die meebewegen met je muis
- 💬 **WhatsApp + e-mail geïntegreerd** — formulieren zonder backend versturen via WhatsApp/mail
- 🗄️ **Supabase-database** — aanvragen worden automatisch opgeslagen (zie `docs/03`)
- ♿ Toegankelijk: skip-link, ARIA, toetsenbordfocus, reduced-motion ondersteuning

## 📁 Structuur

```
home-computerservice/
├── index.html              → De complete landingspagina
├── css/style.css           → Alle styling (mobiel-first)
├── js/
│   ├── main.js             → Menu, formulieren, animaties, database
│   └── supabase-config.js  → ← hier vul je je database-sleutels in
├── images/                 → hero.jpg, homam.jpg
└── docs/
    └── 03-database-en-supabase.md → Database stap-voor-stap koppelen
```

## ▶️ Lokaal bekijken

Open `index.html` in je browser, of:

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

## ☁️ Live zetten (gratis)

1. Maak een repo op GitHub, bijv. `home-computerservice`
2. Push de code:
   ```bash
   git remote add origin https://github.com/JOUWNAAM/home-computerservice.git
   git branch -M main
   git push -u origin main
   ```
3. GitHub → **Settings → Pages** → branch `main` → live op
   `https://JOUWNAAM.github.io/home-computerservice/`
4. Later: koppel je eigen domein (bijv. `homecomputerservice.nl`) via Settings → Pages → Custom domain

## 🗄️ Database instellen

Lees **[docs/03-database-en-supabase.md](docs/03-database-en-supabase.md)** —
in ±10 minuten staan alle formulieraanvragen netjes in je eigen Supabase-database.

## 📷 Foto's vervangen

De huidige foto's zijn AI-gegenereerde placeholders. Zet de echte foto van Homam als
`images/homam.jpg` (en eventueel `images/hero.jpg`) in de map — de website pakt ze automatisch op.

---

*Gebouwd met ❤️ — statisch, snel en zonder maandelijkse kosten.*
