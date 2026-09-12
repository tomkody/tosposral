# Tos posral! 💩

Mobilní párty hra pro 2–6 hráčů na jednom telefonu, postavená na principu hry
**Tos přehnal!** (TLAMA games): otázka s číselnou odpovědí, hráči přihazují
stále vyšší čísla a kdo si myslí, že předchozí hráč přestřelil, zmáčkne
**„Tos posral!“**. Kdo se splete, dostává 💩. Vyhrává ten, kdo jich má nejmíň.

Všechna fakta jsou **ověřená a zazdrojovaná** – u každé odpovědi se zobrazí
odkaz na zdroj (Wikipedia, Guinness World Records, NASA, oficiální weby…).

## Jazyky

Aplikace je dvojjazyčná (čeština / angličtina). Jazyk se přepíná tlačítkem
CS/EN na úvodní obrazovce, výchozí se volí podle jazyka prohlížeče a volba se
pamatuje. Texty rozhraní jsou v objektu `I18N` v `js/app.js`, každý fakt má
anglickou verzi v poli `en` (otázka, jednotka, zajímavost, poznámka). Anglický
název hry (`BRAND.en`) se ještě doladí.

## Spuštění

Je to čistě statická webová aplikace (HTML + CSS + JS, bez build kroku).

Lokálně:

```bash
python3 -m http.server 8765
```

a otevři `http://localhost:8765` (na telefonu ve stejné Wi-Fi pak
`http://<IP-počítače>:8765`).

Nasazení: nahraj obsah složky kamkoli, kde se servírují statické soubory.
Doporučená cesta s nulovými náklady je **GitHub + GitHub Pages**:

```bash
git init && git add -A && git commit -m "Tos posral!"
gh repo create tosposral --public --source=. --push
```

a pak v repozitáři Settings → Pages → Source: „Deploy from a branch“, větev
`main`, složka `/ (root)`. Za minutu aplikace běží na
`https://<uzivatel>.github.io/tosposral/`. Každý další `git push` ji nasadí
znovu (nezapomeň zvýšit verzi `CACHE` v `sw.js`).

Alternativy se stejnou nulou na faktuře: Cloudflare Pages nebo Netlify
(propojí se s repozitářem a nasazují automaticky). Vercel funguje také, ale
pro čistě statickou stránku nepřináší nic navíc. Supabase (databáze + auth
zdarma do 500 MB) dává smysl až pro sdílenou historii otázek napříč telefony.
Aplikace je PWA – na telefonu jde přidat na plochu a funguje i offline.

## Historie otázek

Aplikace si v prohlížeči (localStorage) pamatuje dvě věci:

- které otázky se na tomto telefonu už hrály (`tosposral.used.v1`),
- které otázky viděl každý hráč podle jména (`tosposral.seen.v1`, jméno bez
  ohledu na velikost písmen).

Při nové hře se nejdřív nabízejí otázky, které nikdo ze zadané party ještě
neviděl. Když jich zbývá méně než kol, nastavení to ukáže oranžově a před
startem se objeví dialog („Otázky se budou opakovat“ / „Všechny otázky už jste
hráli“). Opakovaná otázka má ve hře štítek 🔁. Historii lze vynulovat tlačítkem
v nastavení hry.

## Struktura

| Cesta | Co to je |
| --- | --- |
| `index.html` | vstupní stránka |
| `css/style.css` | vzhled (mobile-first, tmavé téma) |
| `js/app.js` | herní logika a vykreslování obrazovek |
| `js/facts.js` | **generovaný** soubor s fakty (needituj ručně) |
| `data/facts/*.json` | zdrojová data – jeden soubor na kategorii |
| `tools/build-facts.py` | sloučí a zkontroluje JSONy → `js/facts.js` |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA (ikona, offline cache) |

## Přidání nebo úprava faktů

1. Uprav nebo přidej záznam v `data/facts/<kategorie>.json`:

```json
{
  "id": "zvirata-11",
  "category": "zvirata",
  "question": "Kolik kilogramů vážilo srdce plejtváka obrovského…?",
  "answer": 180,
  "unit": { "one": "kilogram", "few": "kilogramy", "many": "kilogramů" },
  "fact": "Zajímavost, která se ukáže po odhalení odpovědi.",
  "sourceTitle": "Wikipedia (EN): Blue whale",
  "sourceUrl": "https://en.wikipedia.org/wiki/Blue_whale",
  "sourceQuote": "Doslovná citace ze zdroje obsahující číslo.",
  "answerNote": "Upřesnění měření / roku (nepovinné).",
  "confidence": "high"
}
```

   Odpověď musí být celé číslo; `unit` má tři české tvary (1 metr / 2 metry / 5 metrů).
   Ke každému faktu patří i anglická verze:

```json
  "en": {
    "question": "How many kilograms did the heart of a blue whale…?",
    "unit": { "one": "kilogram", "other": "kilograms" },
    "fact": "The fun fact shown after the answer is revealed.",
    "answerNote": "Measurement basis / year (optional)."
  }
```

   Build bez ní skončí chybou.

2. Spusť build (zkontroluje schéma, duplicitní id apod.):

```bash
python3 tools/build-facts.py
```

3. Při nasazení nové verze zvyš číslo `CACHE` v `sw.js`, aby si telefony
   stáhly nová data.

Novou kategorii přidáš vytvořením `data/facts/<id>.json` a doplněním názvu
a emoji do objektu `CATEGORIES` v `js/app.js`.

## Přejmenování

Název hry, text tlačítka pro obvinění i trestný symbol jsou v objektu `BRAND`
na začátku `js/app.js` (a název ještě v `index.html` a `manifest.webmanifest`).

## Pravidla ve zkratce

1. Přečtěte si otázku – odpověď je vždy číslo.
2. První hráč zadá tip; snaží se být co nejblíž, ale nesmí přestřelit.
3. Další hráč buď přihodí vyšší číslo, nebo zmáčkne „Tos posral!“.
4. Odhalí se odpověď. Kdo se spletl (přestřelil, nebo obvinil neprávem),
   dostává 💩. Obviňující hráč začíná další kolo.
5. Po posledním kole vyhrává hráč s nejmenším počtem 💩.
