# H26 — semesterkontrollpult

Statisk studieside (HTML/CSS/vanilla JS, ingen byggesteg) for høstsemesteret
2026 ved USN. Fire emner: MoS, TSD3060, Statistikk (PB2030, konte) og Fysikk 2
(FYS2-EL, konte). Brukeren følger fremdriften sin på oppgaver og kapitler her.

- **Repo:** NokahM/h26-kontrollpult, publisert med GitHub Pages:
  https://nokahm.github.io/h26-kontrollpult/
- **Språk:** innhold, kommentarer og svar til brukeren på norsk. Commit-meldinger
  på engelsk (conventional commits).
- **Kjøre lokalt:** `python -m http.server` i `site/` (emnesiden trenger http,
  ikke `file://`).

## Dokumentasjon

- `README.md` — struktur, legge til sider og ressurser, status på oppgaver,
  formelpanel, design. Les denne først.
- `docs/teknikker.md` — arkitektur, mønstre, cache-busting, testing med
  headless Edge og sjekklister.
- Toppkommentarene i `assets/js/*.js` — hvert skripts ansvar.
  `SUBJECTS` i `assets/js/main.js` er eneste kilde til emner og sider.

## Regler som ikke må brytes

- **Status-nøkler:** ikke endre `id` på eksisterende `<article class="task">`
  eller filnavn på sider med `track` i `SUBJECTS`. Lagret fremdrift går tapt.
- **Cache-busting:** etter endringer i CSS/JS, øk `?v=N` på asset-lenkene i
  alle HTML-sidene.
- **Kun desktop** (16:10). Ingen mobil-layout.
- **Kursmateriell** (`assets/resources/*/*`) er med vilje utenfor git.
- **Studieinnhold:** riktig fremgangsmåte slik den forventes på eksamen er
  viktigere enn eksakt svar.
