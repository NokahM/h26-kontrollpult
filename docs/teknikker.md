# Teknikker og mønstre fra H26-kontrollpulten

Notat fra arbeidsøkta 15. september 2026. Det beskriver hva som ble bygd på
studiesiden (`site/`, https://nokahm.github.io/h26-kontrollpult/) og, viktigst,
*hvordan*, slik at teknikkene kan gjenbrukes i andre prosjekter.

Siden er en statisk nettside: ren HTML, CSS og JavaScript uten byggesteg,
publisert med GitHub Pages. Alt under fungerer uten rammeverk.

---

## 1. Hva vi bygde, i rekkefølge

| # | Leveranse | Kjerneidé |
|---|-----------|-----------|
| 1 | Første redesign («ringperm med skilleark») | Forkastet etter test: brukeren ville ha noe renere |
| 2 | Kontekstuell sidemeny | Én felles liste (`SUBJECTS`) bygger menyen; inne i et emne vises bare emnets sider |
| 3 | Teknisk/matematisk stil | Barlow + Literata, hårstreker, tabellsifre, nummererte avsnitt |
| 4 | Høyrekolonne | Tittelfelt (som på tekniske tegninger) + «På denne siden» med scroll-markering |
| 5 | Bredere hovedkolonne | Målte formler som ble kuttet, justerte kolonnebredder til alt fikk plass |
| 6 | Cache-busting | `?v=N` på alle skript- og stilarklenker |
| 7 | Status på oppgaver og kapitler | 4 statuser, `localStorage`, oversikt per emne, eksport/import |
| 8 | Lyst tema + temavelger | Kontrastutregnede farger, sol/måne-ikoner, ingen blinking ved lasting |
| 9 | Formelpanel | Σ-knapp/`F`-tast, halvgjennomsiktig panel, hele pensum med LaTeX og Venn-diagrammer |
| 10 | Festede regler | Klikk på en regel → flyttbart, justerbart kort som huskes mellom sider |
| 11 | Symboloversikt | Alle symboler i emnet med forklaring, øverst i panelet |
| 12 | Innholdskontroll | Sjekket en mistenkt feil mot offisielt løsningsforslag og rettet fremgangsmåten |

---

## 2. Arkitektur: statisk side med én datakilde

### 2.1 Manifest i JavaScript i stedet for duplisert HTML

Opprinnelig lå sidemenyen kopiert i hver av 26 HTML-filer. Den ble erstattet av
én liste i `assets/js/main.js`, som bygger meny, forsideoversikt, tittelfelt og
statusoversikter:

```js
var SUBJECTS = [
  {
    id: 'statistikk', code: 'PB2030', course: 'PB2030', kind: 'konte',
    name: 'Statistikk',
    formulas: 'subjects/statistikk/formler.html',     // valgfritt: formelpanel
    href: 'subjects/statistikk/index.html',
    groups: [
      { label: 'Oppgaver etter tema', items: [
        { n: '5', title: 'Normalfordeling', meta: '11', tasks: 11, track: 'tasks',
          part: 'Oppgaver med løsning', href: 'subjects/statistikk/oppgaver/05-normalfordeling.html' }
      ] }
    ]
  }
];
```

HTML-sidene har bare et tomt skall (`<aside class="sidebar"></aside>`), og
JavaScript fyller det.

**Gjenbruk:** når samme navigasjon eller metadata går igjen på mange sider i en
statisk side, legg dataene i én JS-liste og bygg DOM-en derfra.

### 2.2 Finne rotadressen uansett hvor siden ligger

Siden må virke både på `file://`, `localhost` og `https://bruker.github.io/repo/`.
Løsningen er å lese adressen til skriptet selv:

```js
var BASE = document.currentScript.src.replace(/assets\/js\/main\.js([?#].*)?$/, '');
function abs(href) { return /^https?:/.test(href) ? href : BASE + href; }
function bare(u) { return decodeURI(u.split('#')[0].split('?')[0]); }
var HERE = bare(location.href);
function isHere(href) { return bare(abs(href)) === HERE; }
```

`document.currentScript` må leses mens skriptet kjører, ikke i en callback.

### 2.3 Liten DOM-bygger i stedet for `innerHTML`

```js
function h(tag, attrs, kids) {            // h('a.navlink', { href: … }, [barn])
  var parts = tag.split('.');
  var el = document.createElement(parts[0]);
  if (parts.length > 1) el.className = parts.slice(1).join(' ');
  for (var k in attrs || {}) {
    if (attrs[k] == null || attrs[k] === false) continue;
    if (k === 'text') el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]);
  }
  [].concat(kids || []).forEach(function (c) {
    if (c != null) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return el;
}
```

Tekst settes med `textContent`, så innhold aldri tolkes som HTML.

### 2.4 Flere skript som samarbeider

- `main.js` eksponerer det andre trenger: `window.H26 = { SUBJECTS, subject, page, abs, h, … }`.
- Når `main.js` er ferdig, sender det `document.dispatchEvent(new CustomEvent('h26:ready'))`.
- `status.js` og `formler.js` starter på den hendelsen:

```js
if (window.H26 && window.H26.ready) start();
else document.addEventListener('h26:ready', start);
```

Da spiller rekkefølgen og tidspunktet skriptene lastes på ingen rolle.

### 2.5 Innhold i egne HTML-fragmenter

Formelpanelet henter `subjects/statistikk/formler.html` med `fetch`, parser det
med `DOMParser` og setter inn `.fp-content`. Fordelen er at innholdet kan
redigeres for hånd. Ulempen er at `fetch` ikke virker fra `file://`, så siden
må åpnes via http (localhost eller GitHub Pages). Samme teknikk brukes på
emnesiden, som henter alle oppgavesidene for å liste oppgaver uten status.

---

## 3. Layout og design

### 3.1 Designprosess

- **Metode:** designferdigheten (`frontend-design`) ble brukt med to runder: først en plan med farger, typer, layout og prinsipper, deretter en kritisk sjekk mot generiske AI-standarder.
- **Standarder vi unngikk:** kremfarget bakgrunn med terrakotta, mørk bakgrunn med neonaksent, etiketter i store bokstaver og monospace, `·`-skilletegn og `→` bak lenker.
- **Én dristig ting:** resten skal være stille. Her ble det tittelfeltet fra tekniske tegninger.
- **Iterasjon:** første redesign (ringperm) ble testet og forkastet. Brukeren ville ha «rent, stilig, ingeniør/matematikk». Test tidlig, og vær villig til å kaste.

### 3.2 Flytende skala etter tilgjengelig bredde

Første versjon skalerte rotskriften med skjermbredden (`vw`) med tak på 20 px,
og hovedkolonnen hadde fast maksbredde. Resultatet var mye tomrom på store
skjermer og når sidemenyen var lukket. Målt tomrom på hver side før endringen:
157 px ved 1920 med meny og 568 px ved 2560 uten meny.

Løsningen er å skalere etter bredden som faktisk er tilgjengelig for innholdet,
og la hovedkolonnen fylle resten:

```css
html {
  --sidebar-px: clamp(240px, 16vw, 440px);        /* sidemenyen i px/vw, IKKE rem (unngår sirkelreferanse) */
  --avail: calc(100vw - var(--sidebar-px));
  font-size: clamp(14px, calc(4px + var(--avail) / 100), 26px);
}
html[data-sidebar="collapsed"] { --avail: 100vw; }   /* lukket meny → frigjort plass brukes */

.content.has-rail {
  grid-template-columns: minmax(0, 1fr) var(--rail-w);  /* hovedkolonnen fyller */
  max-width: 92rem; margin-inline: auto;                 /* tak for ultrabrede skjermer */
}
```

- **Alt i rem:** tekst, kolonner og luft vokser i samme forhold, så siden ser lik ut på 1280, 1440, 1920 og 2560 px, bare større. Etter endringen er tomrommet bare den vanlige innrykksmargen.
- **Den faste delen (`4px`):** gjør at Ctrl + og Ctrl − fortsatt forstørrer. Ren `vw`-skalering ville opphevet zoom.
- **16:9 mot 16:10:** skalaen følger bredden, så samme bredde gir samme oppsett. 16:9 viser bare litt mindre i høyden.
- **Windows-skalering:** 125 % på en 1920×1080-skjerm gir 1536 CSS-piksler, og oppsettet følger det.
- **Lesbar linjelengde:** vanlig tekst holder `--measure` (46rem), mens oppgaver, tabeller og brede formler bruker hele kolonnen. Visningsformler som får plass innenfor tekstbredden, sentreres over teksten via en `pageReady`-krok i MathJax som setter klassen `formula-in-measure`.
- **Paneler og kort** med bredde i både `rem` og `vw` må ha romslig `vw`-del (`min(40rem, 56vw)`), ellers blir de relativt smalere når skriften vokser.
- **Lange ord i smale kolonner:** `overflow-wrap: anywhere; hyphens: auto`.

### 3.3 Tre kolonner, sentrert i ledig plass

```css
.content.has-rail {
  display: grid;
  grid-template-columns: minmax(0, var(--main-w)) var(--rail-w);
  justify-content: center;
  column-gap: 2.5rem;
}
/* Løpende tekst holder lesbar linjelengde, formler/tabeller/oppgaver bruker hele bredden */
.prose > p:not(:has(mjx-container[display="true"])) { max-width: var(--measure); }
```

`:has()` skiller avsnitt som bare inneholder en visningsformel fra vanlig tekst.

### 3.4 Høyrekolonne som følger med

- **Klistrer seg fast:** `position: sticky; align-self: start; max-height: calc(100vh - …); overflow-y: auto`.
- **Innholdsfortegnelsen:** genereres fra `.section__label`, `.prose h2` og `.task`, og mangler et element id, får det en slug-id.
- **Markering av avsnittet du leser:** på `scroll` (strupet med `requestAnimationFrame`) markeres det siste elementet med `getBoundingClientRect().top <= 120`.
- **Nummererte avsnitt:** CSS-tellere, `counter-reset: sec` på kolonnen og `counter-increment` i `h2::before`.

### 3.5 Temaer: lys, mørk og systemstandard

Tokens i `:root`. Det mørke settet ligger to steder, slik at et valg overstyrer
systemet i begge retninger:

```css
:root { --bg: #f4f5f7; --ink: #16202c; /* … */ color-scheme: light; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --bg: #15191e; --ink: #e3e7ec; /* … */ color-scheme: dark; }
}
:root[data-theme="dark"] { --bg: #15191e; --ink: #e3e7ec; /* … */ color-scheme: dark; }
```

For å unngå at siden blinker i feil tema ved lasting, settes valget i `<head>`
før stilarket:

```html
<script>try{var t=localStorage.getItem('h26-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
```

Emnefarge per side: `body.theme-mos, [data-subject="mos"] { --accent: var(--c-mos); }`.
Samme variabel fungerer for både hele siden og enkeltelementer.

### 3.6 Kontrast regnet ut, ikke gjettet

Farger i det lyse temaet ble justert til WCAG-krav: minst 4,5:1 for tekst og
minst 3:1 for grafikk. Utregningen:

```python
def lum(h):
    c = [int(h.lstrip('#')[i:i+2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
def cr(a, b):
    hi, lo = sorted([lum(a), lum(b)], reverse=True)
    return (hi + .05) / (lo + .05)
```

Sjekk fargene mot *alle* bakgrunner de brukes på (side, sidemeny, hover), ikke
bare hovedbakgrunnen.

### 3.7 Ikoner som passer stilen

Enkle inline-SVG-er med tynne streker som arver fargen: `fill: none; stroke:
currentColor; stroke-width: 1.6; stroke-linecap: round`. Knapper med fast
høyde, slik at raden de står i ikke endrer høyde. Kontrollmål i nettleseren:
toppfelt 52 px, knapp 34 px.

---

## 4. Tilstand i nettleseren

### 4.1 `localStorage` trygt

All lagring pakkes i `try/catch`, fordi den kan være blokkert (privat modus):

```js
function storeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function storeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
```

Nøkler som ble brukt:

| Nøkkel | Innhold |
|--------|---------|
| `h26-sidebar` | sidemenyen åpen eller skjult |
| `h26-theme` | `light`/`dark` (mangler = følg systemet) |
| `h26-status` | `{ version, items: { nøkkel: { s, t, label, title } } }` |
| `h26-formler-open` | formelpanelet åpent |
| `h26-formler-pins-<emne>` | festede kort: `[{ id, x, y, w, h }]` |
| `h26-formler-scroll-<emne>` | scrollposisjon i panelet (`sessionStorage`) |

**Viktig:** lagringen er knyttet til adressen (origin). `localhost:8000` og
GitHub Pages har hver sin. Gi derfor alltid brukeren eksport og import av en
JSON-fil som sikkerhetskopi.

### 4.2 Stabile nøkler

- **Oppgaver:** `statistikk/oppgaver/05-normalfordeling#mai2026`, altså sidens sti pluss `id`.
- **Kapitler:** sidens sti.
- **Festede regler:** seksjonens id pluss slug av overskriften.

Konsekvensen er at id-er og filnavn ikke må endres etter at brukeren har
begynt å lagre data.

### 4.3 Enkel publish/subscribe for oppdatering av grensesnittet

```js
var listeners = [];
function onChange(fn) { listeners.push(fn); }
function emit() { listeners.forEach(function (fn) { fn(); }); }
window.addEventListener('storage', function (e) {   // endringer fra en annen fane
  if (e.key === STORE) { data = load(); emit(); }
});
```

Hver visning (velger, sidemeny, høyrekolonne, oversikt) registrerer sin egen
`render`, så alt holder seg synkront når én status endres.

### 4.4 Statusvelger uten å utløse `<details>`

Velgeren skulle stå på samme rad som «Løsningsforslag» (`<summary>`). Knapper
inne i `<summary>` ville også åpnet løsningen. Løsningen er å legge `<details>`
og velgeren i en felles omslagsboks med `position: relative`, og plassere
velgeren absolutt over raden.

---

## 5. Formelpanel og festede kort

### 5.1 Panel som ikke blokkerer

- **Plassering:** `position: fixed` under toppfeltet, uten bakteppe eller fokusfelle. Siden bak kan fortsatt brukes.
- **Gjennomsiktighet:** `background: color-mix(in srgb, var(--bg) 74%, transparent); backdrop-filter: blur(4px)`. Siden bak skimtes, men formlene er lesbare. Ren gjennomsiktighet uten uskarphet ga uleselig tekst over tekst.
- **Når panelet er lukket:** `inert` og `visibility: hidden`, så det ikke kan få fokus.
- **Tastatur:** hurtigtast `F` (ikke når brukeren skriver i et felt), `Esc` lukker.

### 5.2 MathJax i innhold som lastes inn senere

- **Last ved behov:** er MathJax ikke på siden, lastes `math.js` inn dynamisk, og koden venter på `MathJax.startup.promise`.
- **Unngå dobbelt tegning:** lastet vi MathJax selv, har oppstarten allerede tegnet det nye innholdet. Sjekk `if (body.querySelector('mjx-container')) return;` før `MathJax.typesetPromise([body])`. Uten sjekken ble alle formlene tegnet to ganger.
- **Kloning:** allerede tegnede formler (CHTML) kan klones med `cloneNode(true)` inn i et kort, fordi stilene ligger globalt.
- **Delimitere:** `math.js` må skrive dem med doble omvendte skråstreker (`'\\('`), ellers blir vanlige parenteser matematikk.
- **`<` og `>`:** skriv `&lt;` og `&gt;` inne i formler i HTML.

### 5.3 Formler som får plass i et smalt panel

- **Stable ledd:** flere formler på én linje stables med `\begin{gathered} … \\ … \end{gathered}`.
- **Måling:** et testskript fant alle `mjx-container[display="true"]` med `scrollWidth > clientWidth` og viste nøyaktig hvilke som måtte brytes.

### 5.4 Flyttbare og justerbare kort

**Flytte (Pointer Events):**

```js
handle.addEventListener('pointerdown', function (e) {
  drag = { dx: e.clientX - p.x, dy: e.clientY - p.y, id: e.pointerId };
  handle.setPointerCapture(e.pointerId);   // fortsetter selv om pekeren forlater håndtaket
  e.preventDefault();
});
handle.addEventListener('pointermove', function (e) {
  if (!drag || e.pointerId !== drag.id) return;
  p.x = e.clientX - drag.dx; p.y = e.clientY - drag.dy; clamp(p);
});
```

`touch-action: none` på håndtaket. Posisjonen klemmes innenfor
`document.documentElement.clientWidth/Height`. Bruk ikke `innerWidth`, den tar
med rullefeltet.

**Endre størrelse:** eget hjørnehåndtak med samme mønster. Piltaster når
håndtaket har fokus, dobbeltklikk nullstiller.

**Innhold som tilpasser seg bredden (container queries):**

```css
.pin-card { container-type: inline-size; }
.pin-card__body { font-size: clamp(13px, calc(9.5px + 1.35cqi), 21px); }
.pin-card .rule__text { font-size: .9375em; }            /* em i stedet for rem → skalerer */
.pin-card .symbols { grid-template-columns: repeat(auto-fill, minmax(14em, 1fr)); }
```

**Formler som fortsatt er for brede** skaleres ned, til minst 60 %, med en
`ResizeObserver`:

```js
function fitFormulas(el) {
  el.querySelectorAll('mjx-container[display="true"]').forEach(function (m) {
    m.style.fontSize = '';
    if (m.scrollWidth > m.clientWidth + 1)
      m.style.fontSize = (Math.max(0.6, m.clientWidth / m.scrollWidth) * 96).toFixed(1) + '%';
  });
}
```

**Tilgjengelighet:** regler i panelet har `role="button"` og `tabindex="0"`
(Enter fester). Kortenes overskrift og håndtak kan få fokus og styres med
piltaster. Ikoner har `aria-label`.

### 5.5 Venn-diagrammer i ren SVG

- **Komplement:** `fill-rule="evenodd"` på en sti med rektangel og sirkel.
- **Snitt:** `clipPath` med den ene sirkelen, fylt med den andre.
- **Farger:** `color-mix(in srgb, var(--accent) 24%, transparent)` for skravering, så de følger tema og emnefarge.

---

## 6. Vedlikehold av en statisk side

### 6.1 Cache-busting

Etter en endring ga nettleseren en tom sidemeny, fordi den brukte en gammel,
cachet `main.js` med ny HTML. Serverloggen avslørte det: `main.js` ble aldri
hentet. Løsningen:

```html
<link rel="stylesheet" href="../../assets/css/main.css?v=14">
<script src="../../assets/js/main.js?v=14"></script>
```

Øk `v` ved hver endring i CSS eller JS. Det gjelder også GitHub Pages.

### 6.2 Masseendringer i mange HTML-filer

Python-skript med `glob` over alle sider og strenge kontroller:

```python
for f in ['index.html'] + glob.glob('subjects/**/*.html', recursive=True):
    t = open(f, encoding='utf-8').read()
    t, n = re.subn(pattern, replacement, t)
    assert n == 1, f          # stopp hvis mønsteret ikke traff akkurat én gang
    open(f, 'w', encoding='utf-8', newline='\n').write(t)
```

Lærdommer:
- **Skriv idempotente skript** som tåler å kjøres to ganger, for de stopper av og til midt i.
- **Legg skript med LaTeX eller regex i en egen `.py`-fil**, i stedet for heredoc i skallet. Omvendte skråstreker ble spist flere ganger (`\b` ble til backspace i README).
- **`assert s.count(a) == 1` før hver erstatning** fanger feil mål med én gang.

### 6.3 Git

- **Arbeidsflyt:** én feature-branch per leveranse (`style/skilleark`, `feat/oppgavestatus`, `feat/formelpanel`), små konvensjonelle commits (`feat:`, `fix:`, `style:`, `docs:`, `refactor:`).
- **Merge:** fast-forward til `main` (`git merge --ff-only`) og push først når brukeren har testet og sagt ja.
- **`core.autocrlf=true` på Windows:** advarslene om LF og CRLF er ufarlige når indeksen har LF.

---

## 7. Testing uten testrammeverk

### 7.1 Skjermbilder med Edge i headless-modus

```bash
E="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
"$E" --headless=new --disable-gpu --hide-scrollbars \
     --blink-settings=preferredColorScheme=1 \        # 1 = lyst, ellers følger den Windows
     --window-size=1440,900 --virtual-time-budget=8000 \
     --screenshot=ut.png "http://localhost:8000/side.html"
```

- **Zoom:** `--force-device-scale-factor=2`, og beskjær med PIL for å se små ikoner tydelig.
- **Test i 16:10:** 1440×900, 1680×1050 og 1920×1200.
- **Vedvarende lagring mellom kjøringer:** `--user-data-dir=<mappe>`.

### 7.2 Testside i iframe for funksjonstester

Headless-modus kan ikke klikke, men en midlertidig testside på *samme origin*
kan styre siden i en iframe:

```html
<pre id="out">running</pre><iframe id="f" style="width:1440px;height:900px"></iframe>
<script>
(async function () {
  localStorage.setItem('h26-formler-open', '1');                 // forbered tilstand
  await load('subjects/statistikk/oppgaver/05-normalfordeling.html');
  var d = f.contentDocument;
  d.querySelector('.formula-btn').click();                        // handling
  d.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true }));
  el.dispatchEvent(new PointerEvent('pointermove', { clientX: 400, clientY: 300, pointerId: 1 }));
  out.push('kort=' + d.querySelectorAll('.pin-card').length);    // kontroll
  document.getElementById('out').textContent = out.join('\n');
})();
</script>
```

Kjør med `--dump-dom` og les `<pre id="out">`. Slett testsidene (`_t.html`)
før commit.

Dette ble testet på denne måten:
- **Lagring:** status lagres, overlever ny lasting og tilbakestilles riktig.
- **Oversikter:** tellinger i sidemeny, høyrekolonne og emneoversikt stemmer.
- **Formelpanelet:** lastes, formlene tegnes uten feil (`mjx-merror`) og uten dobbel tegning.
- **Bredde:** ingen formler, kodeblokker eller tabeller er for brede ved 1440 og 1920 piksler.
- **Kortene:** flytting og størrelsesendring virker, og posisjon og størrelse lagres.
- **Tema:** bytte mellom lyst og mørkt gir riktig beregnet bakgrunnsfarge.

### 7.3 Andre kontroller

- **JS-syntaks:** `node -e "new Function(require('fs').readFileSync('fil.js','utf8'))"`.
- **Innhold i PDF:** `pdftotext -layout` for å sammenligne med offisielle løsningsforslag.
- **Tallkontroll:** Python eller `scipy.stats` for kvantiler, for eksempel $\chi^2_{0.025}$ med 80 frihetsgrader.

### 7.4 Hente emneplaner fra USN

Emneplansiden (`usn.no/studier/studie-og-emneplaner/#/emne/…`) er en
enkeltsideapplikasjon som tegner innholdet i en shadow DOM, så den lar seg
verken hente med en vanlig HTTP-forespørsel eller lese ut av `--dump-dom`.
Webkomponenten bak henter dataene fra et åpent JSON-endepunkt:

```bash
curl "https://s293.usn.no/v2/emneplan/TSD3050_1_2026_H%C3%98ST"   # s294 er reserven
```

Svaret har `emneplandata[]` med én oppføring per språk (`B` bokmål, `E`
engelsk). `metadata` inneholder studiepoeng, semester, institutt og
`updateTime`, mens hele planteksten ligger som HTML i `metadata.infotyper`.
Endepunktet ble funnet ved å spore `<usn-study>` til webpack-biten
`webcomponents-study.module.*.js` og lese `_endpoints` der.

---

## 8. Innhold for læring

- **Fremgangsmåte foran fasit:** det viktigste er at fremgangsmåten er riktig for eksamen. Små tallavvik er mindre viktige. Feil som lærer bort feil metode (frihetsgrader, tabellvalg, testretning) rettes, også når det offisielle løsningsforslaget har dem. Husky-oppgaven ble rettet fra 79 til $n-1=80$ frihetsgrader, med en merknad om avviket fra løsningsforslaget.
- **Samme notasjon overalt:** som på eksamens formelark, for eksempel $N(\mu,\sigma)$ med standardavvik, $G(z)$ og $z_\alpha$.
- **Hver regel i formelpanelet:** formel, én setning på vanlig norsk og et utregnet eksempel. Eksemplene regnes ut på nytt før de publiseres.
- **Kjente feller** som korte merknader: $P(A\mid B)$ mot $P(B\mid A)$, disjunkt mot uavhengig, $\sqrt n$ mot $n$.

---

## 9. Sjekkliste for neste prosjekt

- [ ] Én datakilde (manifest) for navigasjon og metadata
- [ ] Rotadresse fra `document.currentScript`, virker på `file://`, localhost og Pages
- [ ] Flytende skala etter *tilgjengelig* bredde (`clamp` + `vw` minus faste paneler), hovedkolonne `1fr` med tak
- [ ] Tema-tokens med lys, mørk og systemstandard, pluss skript i `<head>` mot blinking
- [ ] Kontrast regnet ut mot alle bakgrunner
- [ ] `?v=N` på alle skript og stilark, økes ved hver endring
- [ ] `localStorage` i `try/catch`, stabile nøkler, eksport og import
- [ ] Ikke-blokkerende paneler og kort, tastaturstøtte og `aria-label`
- [ ] Container queries (`cqi`, `em`) for innhold i komponenter som kan endre størrelse
- [ ] Headless-skjermbilder i målstørrelsene, i begge temaer
- [ ] Testside i iframe for funksjonstester, slettes før commit
- [ ] Masseendringer som idempotente Python-skript med `assert` på antall treff
