"""Bygger TikZ-figurene i denne mappen til SVG som kan limes inline i HTML.

Krever latex og dvisvgm (MiKTeX eller TeX Live). Kjør fra denne mappen:
    python build.py            # alle .tex-filer
    python build.py tre-x.tex  # én fil
Resultatet er <navn>.svg ved siden av .tex-filen. SVG-en tilpasses siden:
  * svart blir currentColor, så figuren følger lyst og mørkt tema
  * farge acc (#FF0000 i .tex) får klassen tikz-acc (= --accent i CSS)
  * id-ene får filnavnet som prefiks, så flere figurer kan stå på samme side
  * bredden settes i em ut fra punktstørrelsen, så teksten får brødtekststørrelse
"""
import os, re, subprocess, sys, tempfile

EM_PER_PT = 1 / 8.5   # 10 pt LaTeX-tekst ≈ 1.18em, omtrent brødtekst

def build(tex):
    name = os.path.splitext(os.path.basename(tex))[0]
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(['latex', '-interaction=nonstopmode', '-output-directory', tmp, tex],
                       check=True, stdout=subprocess.DEVNULL)
        out = os.path.join(tmp, name + '.svg')
        subprocess.run(['dvisvgm', '--no-fonts', '--exact-bbox', '-o', out,
                        os.path.join(tmp, name + '.dvi')], check=True, stderr=subprocess.DEVNULL)
        svg = open(out, encoding='utf-8').read()
    svg = re.sub(r'<\?xml[^>]*>\s*|<!--.*?-->\s*', '', svg, flags=re.S)
    w = float(re.search(r"width='([\d.]+)pt'", svg).group(1))
    svg = re.sub(r"\swidth='[^']*'\sheight='[^']*'", '', svg, count=1)
    svg = svg.replace('<svg ', f"<svg class='tikz' role='img' style='width:{w * EM_PER_PT:.1f}em' "
                      "fill='currentColor' stroke='currentColor' ", 1)
    svg = svg.replace("stroke='#000'", "stroke='currentColor'").replace("fill='#000'", "fill='currentColor'")
    svg = svg.replace("fill='#f00'", "class='tikz-acc'").replace("stroke='#f00'", "class='tikz-acc'")
    svg = re.sub(r"(id='|xlink:href='#|url\(#)", lambda m: m.group(1) + name + '-', svg)
    # stroke='currentColor' på roten skal ikke gi omriss rundt tekst og fylte former
    svg = re.sub(r"<(use|path|rect)(?![^>]*stroke=)", r"<\1 stroke='none'", svg)
    open(name + '.svg', 'w', encoding='utf-8', newline='\n').write(svg.strip() + '\n')
    print(name + '.svg')

os.chdir(os.path.dirname(os.path.abspath(__file__)))
for f in sys.argv[1:] or sorted(x for x in os.listdir('.') if x.endswith('.tex')):
    build(f)
