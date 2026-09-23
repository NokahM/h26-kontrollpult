"""Lager .tex for fordelingsfigurer: normal- eller t-kurver med skraverte arealer.

Brukes av figurer.py. Hver figur beskrives med
  name, alt   filnavn og aria-label
  lo, hi      x-område som tegnes
  curves      [(mu, sigma, farge)]  farge: '' (tekst) eller 'mut'
  areas       [(mu, sigma, a, b, farge, etikett[, (x, y)])]
              a/b = None betyr helt ut til kanten; farge 'acc' eller 'hi';
              (x, y) plasserer etiketten for hånd, y som andel av toppen
  ticks       [(x, tekst, z)]  z=None gir ingen andrelinje, tekst=None gir bare hjelpelinje
  obs         [(x, etikett)]  observert verdi: heltrukket strek med etikett over
  nu          frihetsgrader: tegner t-fordelingen (mu=0, sigma=1) i stedet for normal
  zname       navnet på den standardiserte verdien under merkene ('z' eller 't')
Resultatet skrives som <name>.tex i denne mappen; bygg deretter med build.py.
"""
import math, os

HERE = os.path.dirname(os.path.abspath(__file__))


def fmt(v):
    return ('%.5f' % v).rstrip('0').rstrip('.')


class Dist:
    """Normal- eller t-fordeling med tetthet, fordelingsfunksjon og pgfplots-uttrykk."""

    def __init__(self, nu=None):
        self.nu = nu
        if nu:
            self.c = math.exp(math.lgamma((nu + 1) / 2) - math.lgamma(nu / 2)) / math.sqrt(nu * math.pi)

    def pdf(self, x, mu, s):
        u = (x - mu) / s
        if self.nu:
            return self.c * (1 + u * u / self.nu) ** (-(self.nu + 1) / 2) / s
        return math.exp(-u * u / 2) / (s * math.sqrt(2 * math.pi))

    def cdf(self, x, mu, s):
        u = (x - mu) / s
        if self.nu:   # numerisk integrasjon fra -40 (godt nok til plassering og kontroll)
            n, a = 4000, -40.0
            h = (u - a) / n
            tot = self.pdf(a, 0, 1) + self.pdf(u, 0, 1) + sum(
                (4 if i % 2 else 2) * self.pdf(a + i * h, 0, 1) for i in range(1, n))
            return tot * h / 3
        return 0.5 * (1 + math.erf(u / math.sqrt(2)))

    def icdf(self, p, mu, s):
        lo, hi = mu - 50 * s, mu + 50 * s
        for _ in range(70):
            mid = (lo + hi) / 2
            if self.cdf(mid, mu, s) < p:
                lo = mid
            else:
                hi = mid
        return (lo + hi) / 2

    def expr(self, mu, s):
        if self.nu:
            return 'tdens(%s,%s)' % (self.nu, fmt(self.c))
        return 'gauss(%s,%s)' % (fmt(mu), fmt(s))


def stolper(name, alt, pmf, lo, hi, mu, s, cut, side, ticks, width='10cm', note=None, lab=None, labpos=None):
    """Søylediagram for en heltallsvariabel med normaltilnærmingen oppå.

    pmf       {k: P(X=k)}; søylene k i [lo, hi] tegnes med bredde 1 rundt k
    cut       grensen med heltallskorreksjon (for eksempel 476.5)
    side      '<' fyller søylene under cut, '>' søylene over
    ticks     [(x, tekst)] under aksen; cut får alltid en stiplet linje
    lab       tekst for hendelsen, labpos (x, y som andel av toppen) med ledelinje
    """
    D = Dist()
    peak = max(max(pmf[k] for k in range(lo, hi + 1)), D.pdf(mu, mu, s))
    body = []
    for k in range(lo, hi + 1):
        inside = k < cut if side == '<' else k > cut
        body.append(r'\draw[%s, line width=0.4pt] (axis cs:%s,0) rectangle (axis cs:%s,%s);'
                    % ('mut, fill=acc, fill opacity=0.35' if inside else 'mut', fmt(k - 0.5), fmt(k + 0.5), fmt(pmf[k])))
    body.append(r'\addplot[domain=%s:%s] {%s};' % (fmt(lo - 0.5), fmt(hi + 0.5), D.expr(mu, s)))
    body.append(r'\draw[hjelp, acc, line width=0.8pt] (axis cs:%s,0) -- (axis cs:%s,%s);'
                % (fmt(cut), fmt(cut), fmt(1.12 * peak)))
    if lab:
        px, py = labpos
        kin = int(cut - 1.5) if side == '<' else int(cut + 1.5)
        body.append(r'\draw[acc, line width=0.4pt] (axis cs:%s,%s) -- (axis cs:%s,%s);'
                    % (fmt(px), fmt(py * peak), fmt(kin), fmt(0.5 * pmf[kin])))
        body.append(r'\node[font=\small, text=acc, above] at (axis cs:%s,%s) {%s};' % (fmt(px), fmt(py * peak), lab))
    xt = ','.join(fmt(x) for x, _ in ticks)
    xl = ','.join('{$%s$}' % t for _, t in ticks)
    src = r'''%% {note}
%% alt: {alt}
\documentclass[tikz,border=2pt]{{standalone}}
\input{{felles}}
\begin{{document}}
\begin{{tikzpicture}}
\begin{{axis}}[kurve, width={width}, xmin={lo}, xmax={hi}, ymax={ymax},
  xtick={{{xt}}}, xticklabels={{{xl}}}]
{body}
\end{{axis}}
\end{{tikzpicture}}
\end{{document}}
'''.format(note=note or name, alt=alt, width=width, lo=fmt(lo - 0.6), hi=fmt(hi + 0.6), ymax=fmt(1.3 * peak),
           xt=xt, xl=xl, body='\n'.join(body))
    open(os.path.join(HERE, name + '.tex'), 'w', encoding='utf-8', newline='\n').write(src)
    return name


def spredning(name, alt, xs, ys, a, b, xlabel, ylabel, lo, hi, ci=None, pred=None, ylim=None,
              width='9cm', note=None, linelab=None):
    """Spredningsplott med minste kvadraters linje y = a + b x.

    ci        (b_lav, b_høy): tegner to svake linjer gjennom (x̄, ȳ) med disse stigningstallene
    pred      x-verdi for prognose: punkt på linja med prikkede hjelpelinjer til aksene
    """
    xm, ym = sum(xs) / len(xs), sum(ys) / len(ys)
    body = []
    if ci:
        for bb in ci:
            body.append(r'\addplot[mut, dashed, line width=0.5pt, domain=%s:%s] {%s+%s*(x-%s)};'
                        % (fmt(lo), fmt(hi), fmt(ym), fmt(bb), fmt(xm)))
    body.append(r'\addplot[acc, line width=0.9pt, domain=%s:%s] {%s+%s*x};' % (fmt(lo), fmt(hi), fmt(a), fmt(b)))
    body.append(r'\addplot[only marks, mark=*, mark size=1.8pt] coordinates {%s};'
                % ' '.join('(%s,%s)' % (fmt(x), fmt(y)) for x, y in zip(xs, ys)))
    if pred is not None:   # krever ylim, så hjelpelinjene vet hvor aksene går
        yp = a + b * pred
        body.append(r'\draw[mut, densely dotted, line width=0.7pt] (axis cs:%s,%s) -- (axis cs:%s,%s) -- (axis cs:%s,%s);'
                    % (fmt(pred), fmt(ylim[0]), fmt(pred), fmt(yp), fmt(lo), fmt(yp)))
        body.append(r'\addplot[only marks, mark=o, mark size=2.6pt, acc, line width=0.8pt] coordinates {(%s,%s)};' % (fmt(pred), fmt(yp)))
    if linelab:
        body.append(r'\node[font=\small, text=acc, %s] at (axis cs:%s,%s) {%s};' % linelab)
    ylo, yhi = ylim if ylim else (None, None)
    src = r'''%% {note}
%% alt: {alt}
\documentclass[tikz,border=2pt]{{standalone}}
\input{{felles}}
\begin{{document}}
\begin{{tikzpicture}}
\begin{{axis}}[plott, width={width}, xmin={lo}, xmax={hi}{ylims},
  xlabel={{{xlabel}}}, ylabel={{{ylabel}}}]
{body}
\end{{axis}}
\end{{tikzpicture}}
\end{{document}}
'''.format(note=note or name, alt=alt, width=width, lo=fmt(lo), hi=fmt(hi), xlabel=xlabel, ylabel=ylabel,
           ylims='' if ylo is None else ', ymin=%s, ymax=%s' % (fmt(ylo), fmt(yhi)), body='\n'.join(body))
    open(os.path.join(HERE, name + '.tex'), 'w', encoding='utf-8', newline='\n').write(src)
    return name


def label(body, col, x, y, text):
    body.append(r'\node[font=\small, text=%s] at (axis cs:%s,%s) {%s};' % (col, fmt(x), fmt(y), text))


def figure(name, alt, lo, hi, curves, areas, ticks, width='10cm', note=None, extra='',
           obs=(), nu=None, zname='z'):
    D = Dist(nu)
    peak = max(D.pdf(mu, mu, s) for mu, s, _ in curves)
    top = lambda x: max(D.pdf(x, mu, s) for mu, s, _ in curves)
    body = []
    for mu, s, a, b, col, lab, *_ in areas:
        a = lo if a is None else a
        b = hi if b is None else b
        body.append(r'\addplot[%s, domain=%s:%s] {%s} \closedcycle;'
                    % ('areal' if col == 'acc' else 'areal2', fmt(a), fmt(b), D.expr(mu, s)))
    for mu, s, col in curves:
        body.append(r'\addplot[%sdomain=%s:%s] {%s};' % (col + ', ' if col else '', fmt(lo), fmt(hi), D.expr(mu, s)))
    for x, _, _ in ticks:
        body.append(r'\draw[hjelp] (axis cs:%s,0) -- (axis cs:%s,%s);' % (fmt(x), fmt(x), fmt(top(x))))
    for x, lab in obs:
        h = max(0.72 * peak, top(x) + 0.12 * peak)
        body.append(r'\draw[line width=0.9pt] (axis cs:%s,0) -- (axis cs:%s,%s);' % (fmt(x), fmt(x), fmt(h)))
        body.append(r'\node[font=\small, above] at (axis cs:%s,%s) {%s};' % (fmt(x), fmt(h), lab))
    for mu, s, a, b, col, lab, *pos in areas:
        a2 = lo if a is None else a
        b2 = hi if b is None else b
        mass = D.cdf(b2, mu, s) - D.cdf(a2, mu, s)
        # Hjelpelinjene deler arealet i biter. Etiketten står på medianen i biten
        # med mest masse, så den havner midt i fargen og ikke oppå en linje.
        cuts = sorted({a2, b2} | {x for x, _, _ in ticks if a2 < x < b2} | {x for x, _ in obs if a2 < x < b2})
        pieces = [(D.cdf(q, mu, s) - D.cdf(p, mu, s), p, q) for p, q in zip(cuts, cuts[1:])]
        _, p, q = max(pieces)
        xc = D.icdf((D.cdf(p, mu, s) + D.cdf(q, mu, s)) / 2, mu, s)
        gc = D.pdf(xc, mu, s)
        col = 'acc' if col == 'acc' else 'hi'
        if pos:
            px, py = pos[0][0], pos[0][1] * peak
            if a2 < px < b2 and py < 0.8 * D.pdf(px, mu, s):
                label(body, col, px, py, lab)            # inne i fargen
            else:                                        # utenfor: ledelinje ned til arealet
                body.append(r'\draw[%s, line width=0.4pt] (axis cs:%s,%s) -- (axis cs:%s,%s);'
                            % (col, fmt(px), fmt(py), fmt(xc), fmt(0.5 * gc)))
                body.append(r'\node[font=\small, text=%s, above] at (axis cs:%s,%s) {%s};' % (col, fmt(px), fmt(py), lab))
        elif mass > 0.2 and gc > 0.35 * peak:
            label(body, col, xc, 0.38 * gc, lab)
        else:           # smalt areal: etikett over kurven med strek ned
            ly = gc + 0.22 * peak
            body.append(r'\draw[%s, line width=0.4pt] (axis cs:%s,%s) -- (axis cs:%s,%s);'
                        % (col, fmt(xc), fmt(0.45 * gc), fmt(xc), fmt(ly)))
            body.append(r'\node[font=\small, text=%s, above] at (axis cs:%s,%s) {%s};' % (col, fmt(xc), fmt(ly), lab))
    shown = [(x, t, z) for x, t, z in ticks if t is not None]
    xt = ','.join(fmt(x) for x, _, _ in shown)
    xl = ','.join('{$%s$%s}' % (t, (r'\\[-1pt]{\footnotesize$%s=%s$}' % (zname, z)) if z is not None else '')
                  for _, t, z in shown)
    src = r'''%% {note}
%% alt: {alt}
\documentclass[tikz,border=2pt]{{standalone}}
\input{{felles}}
\begin{{document}}
\begin{{tikzpicture}}
\begin{{axis}}[kurve, width={width}, xmin={lo}, xmax={hi}, ymax={ymax},
  xtick={{{xt}}}, xticklabels={{{xl}}}, xticklabel style={{align=center}}]
{body}
{extra}\end{{axis}}
\end{{tikzpicture}}
\end{{document}}
'''.format(note=note or name, alt=alt, width=width, lo=fmt(lo), hi=fmt(hi), ymax=fmt(1.35 * peak),
           xt=xt, xl=xl, body='\n'.join(body), extra=extra)
    open(os.path.join(HERE, name + '.tex'), 'w', encoding='utf-8', newline='\n').write(src)
    return name
