"""Genererer .tex-filene for figurene som lages fra data (ikke hendelsestrærne).

    python assets/tikz/figurer.py        # skriver .tex
    python assets/tikz/build.py          # bygger SVG og legger dem inn i sidene
Rediger tallene her og kjør begge på nytt; .tex-filene skal ikke redigeres for hånd.
"""
from normal import figure as nf, Dist, fmt


def navn(items, nu=None):
    """Etiketter over kurvetoppene: [(mu, sigma, tekst, farge)].

    Med to kurver forankres navnene utover (venstre kurve mot venstre, høyre mot høyre),
    så de ikke kolliderer når toppene står tett."""
    D = Dist(nu)
    peak = max(D.pdf(mu, mu, s) for mu, s, _, _ in items)
    mus = [mu for mu, _, _, _ in items]
    out = ''
    for mu, s, t, col in items:
        anchor = 'above'
        if len(items) > 1:
            anchor = 'above left' if mu == min(mus) else 'above right'
        out += r'\node[font=\small%s, %s, inner xsep=1pt] at (axis cs:%s,%s) {%s};' % (
            ', text=' + col if col else '', anchor, fmt(mu), fmt(D.pdf(mu, mu, s) + 0.02 * peak), t) + '\n'
    return out

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


# ---- 08 Hypotesetesting -----------------------------------------------------
# Regler for plassering: bare grensene står som tall under aksen; forventningene står
# som navn over kurvetoppene. alpha og p står ute i halen, stablet, med ledelinje.
def test(name, alt, mu0, se, k, xbar, side, lo, hi, xlab=r'\bar x', p=None, plab=None,
         alab=r'$\alpha=0.05$', klab=None, width='10cm'):
    d = 1 if side == '>' else -1
    xl = k + d * 1.35 * se
    rej = (mu0, se, k, None, 'acc', alab, (xl, 0.26)) if d > 0 else (mu0, se, None, k, 'acc', alab, (xl, 0.26))
    areas = [rej]
    if p is not None:   # p-verdien skraveres fra observert verdi og utover
        pa = (mu0, se, xbar, None, 'hi', plab, (xl, 0.52)) if d > 0 else (mu0, se, None, xbar, 'hi', plab, (xl, 0.52))
        inner = abs(xbar - mu0) < abs(k - mu0)          # det største arealet tegnes først
        areas = [pa, rej] if inner else [rej, pa]
    nf(name, alt, lo, hi, [(mu0, se, '')], areas,
       [(mu0, None, None), (k, klab or 'k=%s' % fmt(round(k, 2)), None)],
       obs=[(xbar, r'$%s=%s$' % (xlab, fmt(xbar)))],
       extra=navn([(mu0, se, r'$H_0:\ \mu_0=%s$' % fmt(mu0), '')]), width=width)


def styrke(name, alt, mu0, mu1, se, k, side, lo, hi, gam, width='10cm'):
    d = 1 if side == '>' else -1
    if d > 0:
        areas = [(mu0, se, k, None, 'hi', r'$\alpha$', (k - 1.0 * se, 0.5)),
                 (mu1, se, k, None, 'acc', r'$\gamma(%s)=%s$' % (fmt(mu1), gam), (mu1 + 2.2 * se, 0.55))]
    else:
        areas = [(mu0, se, None, k, 'hi', r'$\alpha$', (k + 1.0 * se, 0.5)),
                 (mu1, se, None, k, 'acc', r'$\gamma(%s)=%s$' % (fmt(mu1), gam), (mu1 - 2.2 * se, 0.55))]
    nf(name, alt, lo, hi, [(mu0, se, 'mut'), (mu1, se, '')], areas,
       [(mu0, None, None), (k, 'k=%s' % fmt(round(k, 2)), None), (mu1, None, None)],
       extra=navn([(mu0, se, r'$H_0:\ \mu_0=%s$' % fmt(mu0), 'mut'), (mu1, se, r'$\mu=%s$' % fmt(mu1), '')]),
       width=width)


nf('ht-styrke-prinsipp', 'Forkastingsområdet til høyre for k: under H0 er arealet alfa, under den sanne fordelingen er arealet teststyrken gamma, og resten beta',
   -3.2, 5.8, [(0, 1, 'mut'), (2.6, 1, '')],
   [(0, 1, 1.645, None, 'hi', r'$\alpha$', (0.55, 0.52)), (2.6, 1, 1.645, None, 'acc', r'$\gamma$', (3.2, 0.3))],
   [(0, None, None), (1.645, 'k', None), (2.6, None, None)],
   extra=navn([(0, 1, r'$H_0:\ \mu=\mu_0$', 'mut'), (2.6, 1, r'sann: $\mu=\mu_1$', '')])
   + r'\node[font=\small] at (axis cs:1.22,0.045) {$\beta$};' '\n', width='10.5cm')

se = 5 / 7 ** 0.5; k = 20 + 1.645 * se
test('ht-ved-test', 'Z-test for fuktprosent: forkastingsområdet over k = 23.11, og gjennomsnittet 23.7 ligger i det',
     20, se, k, 23.7, '>', 14, 27.5)
styrke('ht-ved-styrke', 'Teststyrke for fuktprosent: arealet over k = 23.11 under kurven med forventning 25 er 0.84',
       20, 25, se, k, '>', 14, 31.5, '0.84')

se = 4.3 / 20 ** 0.5; k = 35 - 1.645 * se
test('ht-testtid-test', 'Venstresidig Z-test for testtid: forkastingsområdet under k = 33.42, og gjennomsnittet 33.1 ligger i det',
     35, se, k, 33.1, '<', 30.8, 38.8)
styrke('ht-testtid-styrke', 'Teststyrke for testtid: arealet under k = 33.42 når forventningen er 32 er 0.93',
       35, 32, se, k, '<', 28.6, 38.6, '0.93')

se = 20 / 20 ** 0.5; k = 100 + 1.645 * se
test('ht-hotell-test', 'Z-test for hotellpris: gjennomsnittet 120 ligger langt inne i forkastingsområdet over k = 107.36',
     100, se, k, 120, '>', 84, 123)
styrke('ht-hotell-styrke', 'Teststyrke for hotellpris: arealet over k = 107.36 når forventningen er 110 er 0.72',
       100, 110, se, k, '>', 84, 126, '0.72')

test('ht-kjottdeig-test', 'Z-test for fettinnhold: p-verdien 0.075 er arealet over 15.44, større enn alfa = 0.05 over k = 15.645',
     14, 1, 14 + 1.645, 15.44, '>', 10.4, 18.2, p=0.075, plab=r'$p=0.075$', klab='k=15.645')

se = 0.5; k = 33.5 - 1.645 * se
test('ht-hand-test', 'Venstresidig Z-test for håndtemperatur: gjennomsnittet 31.01 ligger langt under k = 32.68',
     33.5, se, k, 31.01, '<', 30.5, 35.4)
styrke('ht-hand-styrke', 'Teststyrke for håndtemperatur: arealet under k = 32.68 når forventningen er 32 er 0.91',
       33.5, 32, se, k, '<', 30.1, 35.4, '0.91')

nf('ht-husky-t', 'T-test med 11 frihetsgrader: t = 1.73 ligger under den kritiske verdien 2.201, så H0 beholdes',
   -4.2, 4.6, [(0, 1, '')], [(0, 1, 2.201, None, 'acc', r'$0.025$', (3.5, 0.26))],
   [(0, '0', None), (2.201, 't_{0.025}=2.201', None)], obs=[(1.73, '$t=1.73$')], nu=11)
nf('ht-endret-t', 'Tosidig T-test med 8 frihetsgrader: t = -1.25 ligger godt innenfor grensene pluss minus 3.355',
   -5, 5, [(0, 1, '')],
   [(0, 1, None, -3.355, 'acc', r'$0.005$', (-4.2, 0.22)), (0, 1, 3.355, None, 'acc', r'$0.005$', (4.2, 0.22))],
   [(-3.355, '-3.355', None), (0, '0', None), (3.355, '3.355', None)], obs=[(-1.25, '$t=-1.25$')], nu=8)

se = (0.6 * 0.4 / 100) ** 0.5; k = 0.6 + 1.645 * se
test('ht-medisin-test', 'Test for andel: forkastingsområdet over k = 0.681 har areal 0.05, p-verdien over 0.70 er 0.021',
     0.6, se, k, 0.70, '>', 0.43, 0.80, xlab=r'\hat p', p=0.021, plab=r'$p=0.021$', klab='k=0.681')

nf('ht-mynt', 'Tosidig test med 100 000 kast: H0 beholdes mellom 49 690 og 50 310; under p = 0.496 er arealet der 0.28',
   49060, 50560, [(50000, 158.1, 'mut'), (49600, 158.0, '')],
   [(49600, 158.0, 49690, 50310, 'acc', r'$0.28$', (49860, 0.3))],
   [(49600, None, None), (49690, '49\\,690', None), (50000, None, None), (50310, '50\\,310', None)],
   extra=navn([(50000, 158.1, r'$H_0:\ p=0.5$', 'mut'), (49600, 158.0, r'$p=0.496$', '')]),
   width='11cm')

se = 2 / 5 ** 0.5
nf('ht-resistans-test', 'Tosidig Z-test for resistans: gjennomsnittet 50.4 ligger godt innenfor grensene 48.25 og 51.75',
   46.5, 53.5, [(50, se, '')],
   [(50, se, None, 50 - 1.96 * se, 'acc', r'$0.025$', (47.2, 0.26)), (50, se, 50 + 1.96 * se, None, 'acc', r'$0.025$', (52.8, 0.26))],
   [(50 - 1.96 * se, '48.25', '-1.96'), (50, r'\mu_0=50', None), (50 + 1.96 * se, '51.75', '1.96')],
   obs=[(50.4, r'$\bar x=50.4$')])

# ---- Quiz 4 ---------------------------------------------------------------
se = 50 / 12 ** 0.5; k = 200 + 1.645 * se
test('ht-radon-test', 'Z-test for radon: gjennomsnittet 215.42 ligger under k = 223.74; p-verdien er 0.142',
     200, se, k, 215.42, '>', 150, 262, p=0.142, plab=r'$p=0.142$')
styrke('ht-radon-styrke', 'Teststyrke for radon: arealet over k = 223.74 når forventningen er 226 er 0.564',
       200, 226, se, k, '>', 150, 276, '0.564')
se = (0.43 * 0.57 / 500) ** 0.5; k = 0.43 - 1.645 * se
test('ht-fart-test', 'Venstresidig test for andel: p-verdien 0.087 er arealet under 0.40, større enn alfa = 0.05',
     0.43, se, k, 0.40, '<', 0.335, 0.51, xlab=r'\hat p', p=0.087, plab=r'$p=0.087$', klab='k=0.394')


# ---- 06 Sentralgrenseteoremet: heltallskorreksjon --------------------------
# Søylene er de eksakte sannsynlighetene; kurven er normaltilnærmingen.
from math import comb, exp, factorial, sqrt
from normal import stolper


def binom(n, p):
    return {k: comb(n, k) * p ** k * (1 - p) ** (n - k) for k in range(n + 1)}


def poisson(lam, kmax):
    return {k: exp(-lam) * lam ** k / factorial(k) for k in range(kmax + 1)}


def sumfordeling(enkel, n):
    """Fordelingen til summen av n uavhengige kopier av {verdi: sannsynlighet}."""
    tot = {0: 1.0}
    for _ in range(n):
        ny = {}
        for a, pa in tot.items():
            for b, pb in enkel.items():
                ny[a + b] = ny.get(a + b, 0) + pa * pb
        tot = ny
    return tot


stolper('sg-prinsipp', 'Binomisk fordeling med n = 20 og p = 0.4: søylene 0 til 6 dekker 0 til 6.5 på aksen, så normalarealet tas med til 6.5',
        binom(20, 0.4), 0, 16, 8, sqrt(20 * 0.4 * 0.6), 6.5, '<',
        [(0, '0'), (4, '4'), (6.5, '6.5'), (8, '8'), (12, '12'), (16, '16')],
        lab=r'$P(X\le 6)$', labpos=(2.2, 0.62), width='9.5cm')
stolper('sg-tunnel', 'Binomisk fordeling med n = 1000 og p = 0.76 rundt 800: minst 800 biler svarer til arealet over 799.5',
        binom(1000, 0.76), 712, 818, 760, sqrt(1000 * 0.76 * 0.24), 799.5, '>',
        [(720, '720'), (740, '740'), (760, '760'), (780, '780'), (799.5, '799.5')],
        lab=r'$P(X\ge 800)$', labpos=(810, 0.3))
stolper('sg-mynt', 'Binomisk fordeling med n = 1000 og p = 0.5 rundt 476: 476 eller færre kron svarer til arealet under 476.5',
        binom(1000, 0.5), 445, 555, 500, sqrt(250), 476.5, '<',
        [(450, '450'), (476.5, '476.5'), (500, '500'), (525, '525'), (550, '550')],
        lab=r'$P(X\le 476)$', labpos=(456, 0.62))
stolper('sg-terninger', 'Summen av 200 terninger rundt 670: høyst 670 øyne svarer til arealet under 670.5',
        sumfordeling({i: 1 / 6 for i in range(1, 7)}, 200), 616, 784, 700, sqrt(200 * 35 / 12), 670.5, '<',
        [(620, '620'), (650, '650'), (670.5, '670.5'), (700, '700'), (740, '740'), (780, '780')],
        lab=r'$P(Y\le 670)$', labpos=(632, 0.62))
stolper('sg-poisson', 'Poissonfordeling med forventning 50: høyst 40 svarer til arealet under 40.5',
        poisson(50, 90), 26, 74, 50, sqrt(50), 40.5, '<',
        [(30, '30'), (40.5, '40.5'), (50, '50'), (60, '60'), (70, '70')],
        lab=r'$P(X\le 40)$', labpos=(31, 0.62))

# ---- Quiz 3 O1 --------------------------------------------------------------
stolper('sg-biler', 'Summen av biler i 100 husstander rundt 120: høyst 120 biler svarer til arealet under 120.5',
        sumfordeling({0: 0.18, 1: 0.54, 2: 0.25, 3: 0.03}, 100), 88, 138, 113, sqrt(53.31), 120.5, '<',
        [(90, '90'), (100, '100'), (113, '113'), (120.5, '120.5'), (130, '130')],
        lab=r'$P(S\le 120)$', labpos=(95, 0.75))


