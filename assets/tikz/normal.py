"""Lager .tex for normalfordelingsfigurer (kurve med skraverte arealer).

Brukes av figurer.py. Hver figur beskrives med
  name, alt   filnavn og aria-label
  lo, hi      x-område som tegnes
  curves      [(mu, sigma, farge)]  farge: '' (tekst) eller 'mut'
  areas       [(mu, sigma, a, b, farge, etikett[, (x, y)])]
              a/b = None betyr helt ut til kanten; farge 'acc' eller 'hi';
              (x, y) plasserer etiketten for hånd, y som andel av toppen
  ticks       [(x, tekst, z)]  z=None gir ingen z-linje, tekst=None gir bare hjelpelinje
Resultatet skrives som <name>.tex i denne mappen; bygg deretter med build.py.
"""
import math, os

HERE = os.path.dirname(os.path.abspath(__file__))


def g(x, mu, s):
    return math.exp(-((x - mu) ** 2) / (2 * s * s)) / (s * math.sqrt(2 * math.pi))


def Phi(z):
    return 0.5 * (1 + math.erf(z / math.sqrt(2)))


def erfinv(y):
    """Invers feilfunksjon ved halvering (nok for plassering av etiketter)."""
    lo, hi = -6.0, 6.0
    for _ in range(80):
        mid = (lo + hi) / 2
        if math.erf(mid) < y:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def fmt(v):
    return ('%.5f' % v).rstrip('0').rstrip('.')


def label(body, col, x, y, text):
    body.append(r'\node[font=\small, text=%s] at (axis cs:%s,%s) {%s};' % (col, fmt(x), fmt(y), text))


def figure(name, alt, lo, hi, curves, areas, ticks, width='10cm', note=None, extra=''):
    peak = max(g(mu, mu, s) for mu, s, _ in curves)
    body = []
    for mu, s, a, b, col, lab, *_ in areas:
        a = lo if a is None else a
        b = hi if b is None else b
        body.append(r'\addplot[%s, domain=%s:%s] {gauss(%s,%s)} \closedcycle;'
                    % ('areal' if col == 'acc' else 'areal2', fmt(a), fmt(b), fmt(mu), fmt(s)))
    for mu, s, col in curves:
        body.append(r'\addplot[%sdomain=%s:%s] {gauss(%s,%s)};'
                    % (col + ', ' if col else '', fmt(lo), fmt(hi), fmt(mu), fmt(s)))
    for x, _, _ in ticks:
        top = max(g(x, mu, s) for mu, s, _ in curves)
        body.append(r'\draw[hjelp] (axis cs:%s,0) -- (axis cs:%s,%s);' % (fmt(x), fmt(x), fmt(top)))
    for mu, s, a, b, col, lab, *pos in areas:
        a2 = lo if a is None else a
        b2 = hi if b is None else b
        mass = Phi((b2 - mu) / s) - Phi((a2 - mu) / s)
        # Hjelpelinjene deler arealet i biter. Etiketten står på medianen i biten
        # med mest masse, så den havner midt i fargen og ikke oppå en linje.
        cuts = sorted({a2, b2} | {x for x, _, _ in ticks if a2 < x < b2})
        pieces = [(Phi((q - mu) / s) - Phi((p - mu) / s), p, q) for p, q in zip(cuts, cuts[1:])]
        _, p, q = max(pieces)
        zmid = (Phi((p - mu) / s) + Phi((q - mu) / s)) / 2
        xc = mu + s * math.sqrt(2) * erfinv(2 * zmid - 1)
        gc = g(xc, mu, s)
        col = 'acc' if col == 'acc' else 'hi'
        if pos:
            label(body, col, pos[0][0], pos[0][1] * peak, lab)
        elif mass > 0.2 and gc > 0.35 * peak:
            label(body, col, xc, 0.38 * gc, lab)
        else:           # smalt areal: etikett over kurven med strek ned
            ly = gc + 0.22 * peak
            body.append(r'\draw[%s, line width=0.4pt] (axis cs:%s,%s) -- (axis cs:%s,%s);'
                        % (col, fmt(xc), fmt(0.45 * gc), fmt(xc), fmt(ly)))
            body.append(r'\node[font=\small, text=%s, above] at (axis cs:%s,%s) {%s};' % (col, fmt(xc), fmt(ly), lab))
    shown = [(x, t, z) for x, t, z in ticks if t is not None]
    xt = ','.join(fmt(x) for x, _, _ in shown)
    xl = ','.join('{$%s$%s}' % (t, (r'\\[-1pt]{\footnotesize$z=%s$}' % z) if z is not None else '') for _, t, z in shown)
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
'''.format(note=note or name, alt=alt, width=width, lo=fmt(lo), hi=fmt(hi), ymax=fmt(1.3 * peak),
           xt=xt, xl=xl, body='\n'.join(body), extra=extra)
    open(os.path.join(HERE, name + '.tex'), 'w', encoding='utf-8', newline='\n').write(src)
    return name
