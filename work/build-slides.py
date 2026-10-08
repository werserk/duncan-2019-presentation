"""Resolve canonical example data, package offline slides and export speaker notes."""
from pathlib import Path
from decimal import Decimal
from html import escape
import importlib.util
import json
from bs4 import BeautifulSoup
from bs4.element import NavigableString, TemplateString

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'work/slides/slides.html'
SKILL = ROOT / 'vendor/html-slide-builder'
spec = importlib.util.spec_from_file_location('slide_packager', SKILL/'build.py')
packager = importlib.util.module_from_spec(spec)
spec.loader.exec_module(packager)

def number(value):
    return format(value.normalize(), 'f').replace('-', '−').replace('.', ',')

inputs = json.loads((ROOT/'work/presentation-example-data.json').read_text(), parse_float=Decimal)
snps = inputs['snps']
contributions = [s['beta'] * s['g'] for s in snps]
score = sum(contributions)
changed = next(s for s in snps if s['id'] == 'B')
changed_g = changed['g'] + 1
changed_score = score + changed['beta']
terms = [f"({number(s['beta'])}) × {s['g']}" if s['beta'] < 0 else f"{number(s['beta'])} × {s['g']}" for s in snps]
rows = ''.join('<tr>'+''.join(f'<td>{escape(v)}</td>' for v in [s['id'],number(s['beta']),str(s['g']),number(c)])+'</tr>' for s,c in zip(snps,contributions))
calculation = ' + '.join(terms)
subtotals = ' + '.join(number(c) if c >= 0 else f'({number(c)})' for c in contributions)
values = {
    'EXAMPLE_ROWS': rows,
    'EXAMPLE_SUBSTITUTION': escape(calculation) + '<br>= ' + escape(subtotals),
    'EXAMPLE_RESULT': number(score),
    'EXAMPLE_CHANGE': f"g<sub>1B</sub>: {changed['g']} → {changed_g}. PGS: {number(score)} → <strong class=\"accent\">{number(changed_score)}</strong>.",
    'EXAMPLE_NOTE': escape('Вклад каждого SNP равен весу, умноженному на число копий выбранного аллеля. Подставляем: '+calculation+' = '+number(score)+'. При дополнительной копии у B получаем '+number(changed_score)+'.'),
}
source = SOURCE.read_text()
for key,value in values.items():
    marker = f'<!-- {key} -->'
    if source.count(marker) != 1:
        raise ValueError(f'Expected one placeholder: {key}')
    source = source.replace(marker,value)
if '<!-- EXAMPLE_' in source:
    raise ValueError('Unresolved example placeholder')
parser = packager.Packager(SOURCE.parent)
parser.feed(source)
parser.close()
page = ''.join(parser.output)
licence = ROOT.joinpath('vendor/coal-theme/fonts/OFL.txt').read_text()
page = page.replace('FONT_LICENSE', escape(licence))
soup = BeautifulSoup(source, 'html.parser')
notes = ['# Duncan et al. — первые пять слайдов и пример 3a\n']
for slide in soup.select('.sheet'):
    notes += [f"## {slide['data-folio']}. {slide['aria-label']}\n", f"Ориентир по времени: {slide['data-time']}.\n"]
    paragraphs = [p.get_text(' ',strip=True,types=(NavigableString,TemplateString))
                  for p in slide.select('template.speaker-notes p')]
    if not paragraphs or any(not text for text in paragraphs):
        raise ValueError(f"Missing speaker-note text in {slide['id']}")
    notes.extend(text+'\n' for text in paragraphs)
notes += ['Источник: https://www.nature.com/articles/s41467-019-11112-0\n']
# Resolve/validate both products before replacing either output.
output = ROOT/'outputs/duncan-2019-slides.html'
notes_output = ROOT/'outputs/duncan-2019-speaker-notes.md'
output.write_text(page)
notes_output.write_text('\n'.join(notes))
print(f'Built {output.name}: {output.stat().st_size} bytes; 5 main + 1 optional; speaker notes exported')
