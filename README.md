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
| STAT      | Statistikk                         | kontefag — 88 eksamensoppgaver med løsning |
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
  index.html                    landingsside
  subjects/<emne>/index.html    én side per emne
  subjects/<emne>/guides/       temasider (MoS, TSD3060)
  subjects/statistikk/oppgaver/ eksamensoppgaver etter tema, med løsningsforslag
  assets/css/main.css           delt stilark + tema-tokens per emne
  assets/js/main.js             emneliste (SUBJECTS) → sidemeny, tittelfelt, innholdsfortegnelse, forside
  assets/js/status.js           status på oppgaver og kapitler (lagres i nettleseren)
  assets/js/formler.js          formelpanelet (Σ-knappen i toppfeltet)
  subjects/statistikk/formler.html  innholdet i formelpanelet for statistikk
  assets/js/math.js             laster MathJax fra CDN (kun statistikk-sidene)
  assets/resources/<emne>/      ressursfiler (IKKE i git, se .gitignore)
```

## Legge til ressurser

**Ny side i et emne**: legg den inn i riktig gruppe i `SUBJECTS` øverst i
`assets/js/main.js`. Sidemenyen, forsideoversikten og «Blad x av y» i
tittelfeltet bygges fra den listen. Innholdsfortegnelsen i høyrekolonnen lages
automatisk fra `.section__label`, `.prose h2` og `.task` på siden. Sett
`data-updated="ÅÅÅÅ-MM-DD"` på `<body>` for datoen i tittelfeltet.

**MoS**: filene i `assets/resources/mos/` er kopiert fra `../MoS/` i
prosjektroten. Legg nye filer i mappen og en tilhørende rad i
`subjects/mos/index.html` sin ressursliste.

**Statistikk**: `subjects/statistikk/oppgaver/` inneholder 88 oppgaver fra 13
tidligere PB2030-eksamenssett (juni 2020 – mai 2026), gruppert etter tema i
stedet for etter sitting, hver med et løsningsforslag som ligger skjult i et
`<details class="sol">`-element. Eksamens-PDF-ene ligger i
`assets/resources/statistikk/` (utenfor git, se under).

Sidene er vanlig, håndredigerbar HTML — legg til en ny oppgave ved å kopiere en
eksisterende `<article class="task">`-blokk. Matematikken skrives som LaTeX
mellom `\(…\)` (inline) og `\[…\]` (blokk), og rendres av MathJax som lastes
av `assets/js/math.js`. **Husk å skrive `&lt;` og `&gt;` i stedet for `<` og `>`
inne i formler** — nettleseren parser HTML før MathJax kjører, så en rå `<`
foran en bokstav blir tolket som starten på en tag og spiser resten av formelen.

**Desimaltall skrives med punktum** (`0.05`, `1.645`), også i norsk prosa, fordi
alle eksamenssettene fra 2023 og senere gjør det. Intervaller og
fordelingsparametre skilles derfor med komma: `[20.6, 26.8]`, `N(57.9, 14.0)`.

**Fysikk 2**: siden har fortsatt en tom-tilstand (`.empty`-komponenten) frem til
pensum er klart. Når ressurser er klare: legg filene i
`assets/resources/fysikk2/` og bytt ut `.empty`-blokken med
`.section`/`.reslist`-mønsteret som på MoS-siden.

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

## Status på oppgaver og kapitler

Hver statistikkoppgave og hvert kapittel eller hver uke i MoS og TSD3060 kan få
en av fire statuser: ikke gjort (standard), forstått, må repeteres og ikke
forstått. Det styres av `track` i `SUBJECTS` i `main.js`: `track: 'page'` gir
siden én status, og `track: 'tasks'` gir hver `<article class="task" id="…">` på
siden egen status. Oppgavens `id` er nøkkelen, så ikke endre id-en på en
oppgave som allerede har fått status.

Du setter status i oppgaveboksen eller øverst og nederst på kapittelsiden.
Oversikten vises flere steder:

- **Høyrekolonnen:** fremdrift for siden. Klikk på en status for å filtrere
  innholdslisten.
- **Sidemenyen:** en fremdriftsstolpe per tema eller kapittel.
- **Emnesiden:** fire kolonner med lenker til nøyaktig hvilke oppgaver og
  kapitler som har hver status.
- **Forsiden:** en fremdriftslinje per emne.

Statusene lagres i nettleserens `localStorage` (`h26-status`). Lagringen er
knyttet til adressen, så localhost og GitHub Pages har hver sin. Bruk «Last ned
statusfil» og «Hent statusfil» nederst på forsiden for sikkerhetskopi eller
flytting. Emnesiden henter oppgavesidene for å liste oppgaver uten status, og
det virker bare over http (localhost eller GitHub Pages), ikke fra `file://`.

## Formelpanel

Emner med `formulas` i `SUBJECTS` (`main.js`) får en Σ-knapp i toppfeltet. Den
åpner et halvgjennomsiktig panel fra høyre med formler, korte forklaringer og
eksempler. Panelet blokkerer ikke siden bak, så du kan jobbe med en oppgave
mens det er åpent. Tastatur: `F` åpner og lukker, `Esc` lukker. Om panelet var
åpent, huskes mellom sidene.

Klikk på en regel i panelet for å **feste** den. Panelet lukkes, og regelen blir
liggende i et flytende, halvgjennomsiktig kort oppe til høyre. Kortet kan dras
etter overskriften, eller flyttes med piltastene når overskriften har fokus, og
fjernes med ×. Størrelsen endres med håndtaket nede til høyre (dra, eller
piltaster når håndtaket har fokus; dobbeltklikk nullstiller). Skrift og
Venn-diagram skalerer med bredden, symbolboksen får flere kolonner når kortet
blir bredt, og formler som ikke får plass skaleres ned. Du kan feste flere
regler samtidig. Festede regler med posisjon og
størrelse huskes per emne (`h26-formler-pins-<emne>`). Regelens id bygger på
seksjonens id og regelens overskrift, så endrer du en overskrift i formelfila,
forsvinner et kort som var festet med den gamle.

Innholdet ligger i en egen fil per emne, for statistikk
`subjects/statistikk/formler.html`. Hver `<section id="…" data-short="…">` blir
en hopp-lenke, og hver regel er en `<div class="rule">` med overskrift, formel
(`\[ … \]`), forklaring og eventuelt eksempel. Flere formler i samme regel
stables med `\begin{gathered} … \\ … \end{gathered}` så de får plass i
panelet. For å gi fysikk 2 et formelpanel senere: lag
`subjects/fysikk2/formler.html` og sett `formulas` på emnet. Filen hentes med
`fetch`, så panelet virker via localhost og GitHub Pages, ikke fra `file://`.

## Design

Laget for PC-skjerm i 16:10. Rotskriften skalerer med skjermbredden (16 px ved
1440 piksler, rundt 18 px ved 1920), så hele layouten vokser jevnt med skjermen.

Oppsettet har tre kolonner: sidemeny med sidene i gjeldende emne, en lesekolonne
på omtrent 44rem, og en høyrekolonne med tittelfelt og «På denne siden».
Tittelfeltet (emne, del, omfang, blad, oppdatert) er lånt fra tekniske tegninger.

Hver side setter `<body class="theme-…">`, som velger emnefargen `--accent` i
`assets/css/main.css`. Fargen brukes kun som tekst: kode, nummer, markering av
gjeldende side.

Temaet velges med sol- og måneknappene oppe til høyre i toppfeltet. Uten et
valg følger siden systemets innstilling.
Valget lagres i `localStorage` (`h26-theme`) og settes av et lite skript i
`<head>`, så siden ikke blinker ved lasting. Det lyse temaet har lysegrå bunn
(`#f4f5f7`), og emne- og statusfargene er mørkere enn i det mørke temaet slik at
teksten holder minst 4,5:1 i kontrast.

Skrift: Barlow og Barlow Semi Condensed til grensesnitt og titler, Literata til
lesetekst. Formlene rendres av MathJax.
