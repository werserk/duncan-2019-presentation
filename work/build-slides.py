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
reported = json.loads((ROOT/'work/presentation-source-data.json').read_text(), parse_float=Decimal)
purcell = reported['purcell_2009']
afr = purcell['african_variance_explained']
eur = purcell['european_variance_explained']
if not (0 <= afr <= 1 and 0 < eur <= 1):
    raise ValueError('Invalid reported explained-variance inputs')
medians = reported['median_relative_metrics_percent']
stat = reported['african_reported_test']
values.update({
    'DATA_MATCHED_COUNT': str(reported['matched_publications']),
    'DATA_PURCELL_AFR': number(afr * 100),
    'DATA_PURCELL_EUR': number(eur * 100),
    'DATA_PURCELL_RATIO': number(afr / eur * 100),
    'DATA_MEDIAN_AFR': str(medians['AFR']),
    'DATA_MEDIAN_SAS': str(medians['SAS']),
    'DATA_MEDIAN_EAS': str(medians['EAS']),
    'DATA_AFR_T': number(stat['t']),
    'DATA_AFR_DF': str(stat['df']),
    'DATA_AFR_P': number(stat['p'] / Decimal('1e-6')) + ' × 10⁻⁶',
})
source = SOURCE.read_text()
for key,value in values.items():
    marker = f'<!-- {key} -->'
    if (key.startswith('EXAMPLE_') and source.count(marker) != 1) or source.count(marker) < 1:
        raise ValueError(f'Expected one placeholder: {key}')
    source = source.replace(marker,value)
if '<!-- EXAMPLE_' in source or '<!-- DATA_' in source:
    raise ValueError('Unresolved example placeholder')
soup = BeautifulSoup(source, 'html.parser')
slides = soup.select('.sheet')
main_slides = [slide for slide in slides if not slide.has_attr('data-optional')]
nav = ''.join(f'<a href="#{escape(slide["id"])}">{escape(slide["data-folio"])}</a>' for slide in main_slides)
if source.count('<!-- MAIN_TOC -->') != 1:
    raise ValueError('Expected one canonical TOC placeholder')
source = source.replace('<!-- MAIN_TOC -->', nav)
parser = packager.Packager(SOURCE.parent)
parser.feed(source)
parser.close()
page = ''.join(parser.output)
licence = ROOT.joinpath('vendor/coal-theme/fonts/OFL.txt').read_text()
page = page.replace('FONT_LICENSE', escape(licence))
notes = ['# Duncan et al. — текст спикера\n']
for slide in slides:
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
print(f'Built {output.name}: {output.stat().st_size} bytes; {len(main_slides)} main + {len(slides) - len(main_slides)} optional; speaker notes exported')
