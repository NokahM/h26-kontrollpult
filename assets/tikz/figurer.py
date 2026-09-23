"""Genererer .tex-filene for figurene som lages fra data (ikke hendelsestrærne).

    python assets/tikz/figurer.py        # skriver .tex
    python assets/tikz/build.py          # bygger SVG og legger dem inn i sidene
Rediger tallene her og kjør begge på nytt; .tex-filene skal ikke redigeres for hånd.
"""
from normal import figure as nf

# ---- 05 Normalfordeling ---------------------------------------------------
nf('nf-g-av-z', 'Standard normalkurve: G(z) er arealet til venstre for z, 1 minus G(z) arealet til høyre',
   -3.6, 3.6, [(0, 1, '')],
   [(0, 1, None, 1.2, 'acc', '$G(z)$'), (0, 1, 1.2, None, 'hi', '$1-G(z)$', (2.45, 0.28))],
   [(0, '0', None), (1.2, 'z', None)], width='9cm')
nf('nf-motstander', 'N(50, 0.8): a) arealet over 51.2 er 0.0668, b) arealet under c = 47.53 er 0.001',
   47.0, 53.0, [(50, 0.8, '')],
   [(50, 0.8, 51.2, None, 'acc', 'a) $0.0668$'), (50, 0.8, None, 47.528, 'hi', 'b) $0.001$')],
   [(47.528, 'c=47.53', '-3.090'), (50, '50', None), (51.2, '51.2', '1.50')])
nf('nf-appelsiner-a', 'N(270, 15): arealet mellom 255 og 300 er 0.82',
   220, 320, [(270, 15, '')], [(270, 15, 255, 300, 'acc', '$0.82$')],
   [(255, '255', '-1.00'), (270, '270', None), (300, '300', '2.00')])
nf('nf-appelsiner-b', 'N(270, 15): de 10 prosent letteste veier under k = 250.8',
   220, 320, [(270, 15, '')], [(270, 15, None, 250.77, 'acc', '$0.10$')],
   [(250.77, 'k=250.8', '-1.282'), (270, '270', None)])
nf('nf-stempel', 'N(10, 0.03): arealet mellom 9.95 og 10.05 er 0.905, symmetrisk om forventningen',
   9.89, 10.11, [(10, 0.03, '')], [(10, 0.03, 9.95, 10.05, 'acc', '$0.905$')],
   [(9.95, '9.95', '-1.67'), (10, '10', None), (10.05, '10.05', '1.67')])
nf('nf-garanti', 'N(144, 30) måneder: 5 prosent av motorene ryker før k = 94.65 måneder',
   36, 252, [(144, 30, '')], [(144, 30, None, 94.65, 'acc', '$0.05$')],
   [(94.65, 'k=94.65', '-1.645'), (144, '144', None)])
nf('nf-teposer', 'N(1.30, 0.05): arealet over 1.32 gram er 0.3446',
   1.12, 1.48, [(1.30, 0.05, '')], [(1.30, 0.05, 1.32, None, 'acc', '$0.3446$')],
   [(1.30, None, None), (1.32, '1.32', '0.40')])
nf('nf-mandel', 'N(38, 8): arealet under 50 gram er 0.9332',
   9, 67, [(38, 8, '')], [(38, 8, None, 50, 'acc', '$0.9332$')],
   [(38, '38', None), (50, '50', '1.50')])
nf('nf-kaffe', 'N(220, 3): a) under 215 er 0.048, b) mellom 218 og 220 er 0.25, c) over 229.3 er 0.001',
   210.5, 231, [(220, 3, '')],
   [(220, 3, None, 215, 'acc', 'a) $0.048$'), (220, 3, 218, 220, 'hi', 'b) $0.25$', (213.6, 0.82)),
    (220, 3, 229.27, None, 'acc', 'c) $0.001$')],
   [(215, '215', '-1.67'), (218, '218', '-0.67'), (220, '220', None), (229.27, 'v=229.3', '3.090')],
   width='11.5cm', extra=r'\draw[hi, line width=0.4pt] (axis cs:214.9,0.1) -- (axis cs:218.9,0.07);' '\n')
nf('nf-stoy', 'N(40, 10): a) over 60 dB er 0.023, b) mellom 50 og 60 dB er 0.136',
   10, 76, [(40, 10, '')],
   [(40, 10, 60, None, 'acc', 'a) $0.023$'), (40, 10, 50, 60, 'hi', 'b) $0.136$')],
   [(40, '40', None), (50, '50', '1.00'), (60, '60', '2.00')], width='11cm')
nf('nf-stoy-c', 'Forventningen flyttes fra 40 til 37.2 dB slik at 90 prosent av målingene er under 50 dB',
   1.2, 76, [(40, 10, 'mut'), (37.2, 10, '')], [(37.2, 10, None, 50, 'acc', '$0.90$')],
   [(37.2, r'\mu=37.2', None), (50, '50', '1.282')])
nf('nf-resistans', 'Samme intervall 49 til 51: 0.38 for én motstand, 0.74 for gjennomsnittet av fem',
   43, 57, [(50, 2, 'mut'), (50, 0.894, '')],
   [(50, 2, 49, 51, 'hi', 'a) $0.38$', (54.6, 0.16)), (50, 0.894, 49, 51, 'acc', 'b) $0.74$', (46.9, 0.62))],
   [(49, '49', None), (50, '50', None), (51, '51', None)], extra=
   r'\node[font=\small, text=mut] at (axis cs:46.0,0.095) {$R$};' '\n'
   r'\node[font=\small] at (axis cs:51.35,0.36) {$\bar R$};' '\n'
   r'\draw[acc, line width=0.4pt] (axis cs:47.8,0.26) -- (axis cs:49.5,0.15);' '\n'
   r'\draw[hi, line width=0.4pt] (axis cs:53.9,0.07) -- (axis cs:50.8,0.04);' '\n')
nf('nf-eksamen', 'N(57.9, 14): arealet over 60 prosent riktig er 0.44',
   7.5, 108.3, [(57.9, 14, '')], [(57.9, 14, 60, None, 'acc', '$0.44$')],
   [(57.9, None, None), (60, '60', '0.15')])
nf('nf-kylling-a', 'N(1.8, 0.3): arealet mellom 1.6 og 2.0 kg er 0.497',
   0.9, 2.7, [(1.8, 0.3, '')], [(1.8, 0.3, 1.6, 2.0, 'acc', '$0.497$', (1.905, 0.36))],
   [(1.6, '1.6', '-0.67'), (1.8, '1.8', None), (2.0, '2.0', '0.67')])
nf('nf-kylling-b', 'Med forventning 1.85 kg veier 80 prosent over 1.6 kg og 20 prosent under',
   0.77, 2.93, [(1.85, 0.3, '')],
   [(1.85, 0.3, None, 1.6, 'hi', '$0.20$'), (1.85, 0.3, 1.6, None, 'acc', '$0.80$')],
   [(1.6, '1.6', '-0.842'), (1.85, r'\mu=1.85', None)])
nf('nf-handtemp', 'N(33.5, 1.5): arealet mellom 31.0 og 34.0 grader er 0.582, ikke symmetrisk',
   28.1, 38.9, [(33.5, 1.5, '')], [(33.5, 1.5, 31.0, 34.0, 'acc', '$0.582$')],
   [(31.0, '31.0', '-1.67'), (33.5, None, None), (34.0, '34.0', '0.33')])

# ---- Quiz 3 ---------------------------------------------------------------
nf('nf-co2', 'N(930, 290): 1) over 1020 ppm er 0.378, 2) de øverste 6 prosent ligger over 1381 ppm',
   0, 1860, [(930, 290, '')],
   [(930, 290, 1020, None, 'acc', '1) $0.378$', (1190, 0.25)), (930, 290, 1380.9, None, 'hi', '2) $0.06$')],
   [(930, None, None), (1020, '1020', '0.31'), (1380.9, 'x=1381', '1.555')])
