# H26 — semesterkontrollpult

Statisk nettside (ren HTML/CSS/JS, ingen build-steg) som samler ressurser for
høstsemesterets emner ett sted: en landingsside med oversikt, og en egen
temaside per emne.

**Live:** https://nokahm.github.io/h26-kontrollpult/ (GitHub Pages, deployes
automatisk fra `main`).

## Emner

| Kode      | Emne                              | Status |
|-----------|------------------------------------|--------|
| MoS       | Maskinvare og sikkerhet            | aktiv — ressurser lokalt |
| TSD3060   | Utvikling av sikre webtjenester    | aktiv — ressurser hos ekstern kilde |
| STAT      | Statistikk                         | kontefag — ressurser kommer |
| FYS2-EL   | Fysikk 2, elektrisitetslære        | kontefag — ressurser kommer |

## Kjøre lokalt

Ingen build nødvendig — åpne `index.html` direkte i nettleseren, eller kjør
en enkel lokal server fra `site/`-mappen (unngår ev. `file://`-særtilfeller):

```
python -m http.server 8000
```

og åpne `http://localhost:8000`.

## Struktur

```
site/
  index.html                 landingsside
  subjects/<emne>/index.html én side per emne
  assets/css/main.css        delt stilark + tema-tokens per emne
  assets/js/main.js          sidepanel: skjul/vis, lagres i localStorage
  assets/resources/<emne>/   ressursfiler (IKKE i git, se .gitignore)
```

## Legge til ressurser

**MoS**: filene i `assets/resources/mos/` er kopiert fra `../MoS/` i
prosjektroten. Legg nye filer i mappen og en tilhørende rad i
`subjects/mos/index.html` sin ressursliste.

**Statistikk / Fysikk 2**: sidene har en tom-tilstand
(`.empty`-komponenten) frem til pensum er klart. Når ressurser er klare:
legg filene i riktig `assets/resources/<emne>/`-mappe og bytt ut
`.empty`-blokken med `.section`/`.reslist`-mønsteret som på MoS-siden.

**TSD3060**: ressursene ligger på et eksternt, passordbeskyttet
kurssystem (debbie.usn.no). Innlogging er *bevisst* ikke lagt inn i denne
nettsiden eller i git — se den lokale filen `TSD3060-nettside.txt` i
`H26`-mappen (ett nivå over `site/`).

## Hvorfor ressursfilene ikke er i git

`assets/resources/*/*` er ekskludert i `.gitignore`. Kursmateriell
(forelesningsslides, lab-PDF-er, bokkapittel) er opphavsrettsbeskyttet —
det bør ikke havne i et repo som pushes til en offentlig GitHub
Pages-side. Lenkene på MoS-siden fungerer lokalt og i et privat repo, men
filene følger ikke med i en offentlig publisering med mindre du bevisst
velger noe annet (privat repo, eller fjerne filene fra `.gitignore`).

## Tema per emne

Hver side setter `<body class="theme-…">`, som bytter ut et sett
CSS-variabler i `assets/css/main.css` (`--bg`, `--surface`, `--accent`,
osv.). Sidepanelet (`.sidebar`) holder seg i et nøytralt "konsoll"-tema på
tvers av hele siden — det er kun innholdsområdet på hver side, samt
forhåndsvisning av "modulene" på landingssiden, som bytter farge per emne.
