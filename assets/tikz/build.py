"""Bygger TikZ-figurene i denne mappen til SVG og legger dem inn i sidene.

Krever latex og dvisvgm (MiKTeX eller TeX Live). Kjør fra hvor som helst:
    python assets/tikz/build.py              # alle .tex-filer
    python assets/tikz/build.py tre-x.tex    # én eller flere filer

For hver <navn>.tex lages <navn>.svg, og SVG-en limes inn i alle HTML-sider
under subjects/ mellom markørene

    <!-- tikz:<navn> -->  …  <!-- /tikz:<navn> -->

Figuren tilpasses siden:
  * svart blir currentColor, så figuren følger lyst og mørkt tema
  * fargene acc, mut og hi fra felles.tex blir CSS-variabler (se COLORS)
  * id-ene får filnavnet som prefiks, så flere figurer kan stå på samme side
  * bredden settes i em ut fra punktstørrelsen, så teksten får brødtekststørrelse
  * linja «% alt: …» i .tex-filen blir aria-label
"""
import glob, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(os.path.dirname(HERE))
EM_PER_PT = 1 / 8.5   # 10 pt LaTeX-tekst ≈ 1.18em, omtrent brødtekst
COLORS = {            # farge i felles.tex -> verdi i CSS
    '#000': 'currentColor',
    '#f00': 'var(--accent)',     # acc: det figuren handler om
    '#0f0': 'var(--muted)',      # mut: hjelpelinjer, sekundær kurve
    '#00f': 'var(--st-forstatt)',  # hi: en annen fremhevet mengde (teststyrke)
}


def recolor(tag):
    """Flytter kjente farger i fill/stroke over i et style-attributt."""
    styles = []
    def swap(m):
        attr, val = m.group(1), m.group(2).lower()
        if val in COLORS and COLORS[val] != 'currentColor':
            styles.append(f'{attr}:{COLORS[val]}')
            return ''
        return f" {attr}='{COLORS.get(val, val)}'"
    tag = re.sub(r"\s(fill|stroke)='([^']*)'", swap, tag)
    if styles:
        tag = re.sub(r'(/?>)$', f" style='{';'.join(styles)}'" + r'\1', tag)
    return tag


def build(tex):
    name = os.path.splitext(os.path.basename(tex))[0]
    src = open(os.path.join(HERE, tex), encoding='utf-8').read()
    alt = re.search(r'^% alt:\s*(.+)$', src, re.M)
    with tempfile.TemporaryDirectory() as tmp:
        r = subprocess.run(['latex', '-interaction=nonstopmode', '-output-directory', tmp, tex],
                           cwd=HERE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, errors='replace')
        if r.returncode:
            sys.exit(f'latex feilet for {tex}:\n' + '\n'.join(l for l in r.stdout.splitlines() if l.startswith('!'))[:2000])
        out = os.path.join(tmp, name + '.svg')
        subprocess.run(['dvisvgm', '--no-fonts', '--exact-bbox', '-o', out,
                        os.path.join(tmp, name + '.dvi')], check=True, stderr=subprocess.DEVNULL)
        svg = open(out, encoding='utf-8').read()
    svg = re.sub(r'<\?xml[^>]*>\s*|<!--.*?-->\s*', '', svg, flags=re.S)
    w = float(re.search(r"width='([\d.]+)pt'", svg).group(1))
    svg = re.sub(r"\swidth='[^']*'\sheight='[^']*'", '', svg, count=1)
    label = f" aria-label='{alt.group(1).strip()}'" if alt else ''
    svg = svg.replace('<svg ', f"<svg class='tikz' role='img'{label} style='width:{w * EM_PER_PT:.1f}em' "
                      "fill='currentColor' stroke='currentColor' ", 1)
    svg = re.sub(r'<(?!svg)[a-z]+\b[^>]*>', lambda m: recolor(m.group(0)), svg)
    svg = re.sub(r"(id='|xlink:href='#|url\(#)", lambda m: m.group(1) + name + '-', svg)
    # stroke='currentColor' på roten skal ikke gi omriss rundt tekst og fylte former
    svg = re.sub(r"<(use|path|rect)\b(?![^>]*stroke[=:])", r"<\1 stroke='none'", svg)
    svg = svg.strip()
    open(os.path.join(HERE, name + '.svg'), 'w', encoding='utf-8', newline='\n').write(svg + '\n')
    return name, svg


def embed(name, svg):
    pat = re.compile(r'(<!-- tikz:' + re.escape(name) + r' -->).*?(<!-- /tikz:' + re.escape(name) + r' -->)', re.S)
    hits = []
    for page in glob.glob(os.path.join(SITE, 'subjects', '**', '*.html'), recursive=True):
        html = open(page, encoding='utf-8').read()
        new, n = pat.subn(lambda m: m.group(1) + svg + m.group(2), html)
        if n:
            hits.append(os.path.relpath(page, SITE))
            if new != html:
                open(page, 'w', encoding='utf-8', newline='\n').write(new)
    return hits


files = sys.argv[1:] or sorted(f for f in os.listdir(HERE) if f.endswith('.tex') and f != 'felles.tex')
for f in files:
    name, svg = build(os.path.basename(f))
    hits = embed(name, svg)
    print(f"{name}.svg -> {', '.join(hits) if hits else 'IKKE BRUKT på noen side'}")
