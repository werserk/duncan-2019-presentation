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
    return format(Decimal(value).normalize(), 'f').replace('-', '−').replace('.', ',')

def scientific(value):
    """HTML scientific notation for the educational p-value table."""
    value = Decimal(value)
    exponent = value.adjusted()
    mantissa = value.scaleb(-exponent)
    prefix = '' if mantissa == 1 else number(mantissa) + ' × '
    return prefix + '10<sup>' + str(exponent).replace('-', '−') + '</sup>'

def table_row(cells):
    return '<tr>' + ''.join('<td>' + str(cell) + '</td>' for cell in cells) + '</tr>'

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
construction = reported['construction']
thresholds = construction['ld_thresholds']
references = construction['ld_references']
pc = construction['pc_example']
values.update({
    'DATA_GENOTYPE_N': str(construction['reported_genotype_n']),
    'DATA_LD_WINDOW': str(construction['ld_window_kb']),
    'DATA_LD_THRESHOLDS': ' · '.join(number(x) for x in thresholds),
    'DATA_LD_REFERENCES': ' · '.join(references),
    'DATA_LD_LOOSE': number(thresholds[0]),
    'DATA_LD_TIGHT': number(thresholds[-1]),
    'DATA_FIG3_COMBINATIONS': str(len(thresholds) * len(references) * len(construction['figure3_p_thresholds'])),
    'DATA_PC_EARLY': f'{pc["early"][0]}–{pc["early"][-1]}',
    'DATA_PC_LATER': ' и PC'.join(str(x) for x in pc['later']),
})

# The existing three-SNP example supplies all inputs for 12a and 12b.
ld = inputs['ld']
def toy_clump(ab_r2, cutoff):
    """One-window teaching case: AB has the supplied LD, AC/BC use unlinked_r2."""
    remaining = sorted(snps, key=lambda s: s['p'])
    selected = []
    while remaining:
        index = remaining.pop(0)
        selected.append(index)
        remaining = [s for s in remaining if
                     (ab_r2 if {index['id'], s['id']} == {'A', 'B'} else ld['unlinked_r2']) <= cutoff]
    return selected

ld_cases = [('X', ld['reference_x_ab_r2'], ld['cutoff']),
            ('Y', ld['reference_y_ab_r2'], ld['cutoff']),
            ('Y', ld['reference_y_ab_r2'], ld['stricter_cutoff'])]
ld_results = []
ld_rows = []
for label, association, cutoff in ld_cases:
    selected = toy_clump(association, cutoff)
    result = sum(s['beta'] * s['g'] for s in selected)
    ld_results.append(result)
    ld_rows.append(table_row([label, number(association), number(cutoff),
                             ', '.join(s['id'] for s in selected), '<strong>' + number(result) + '</strong>']))
threshold_rows, threshold_results = [], []
for threshold in inputs['inclusion_thresholds']:
    selected = [s for s in snps if s['p'] < threshold]
    result = sum(s['beta'] * s['g'] for s in selected)
    threshold_results.append(result)
    terms = ' + '.join(number(s['beta'] * s['g']) if s['beta'] >= 0
                       else '(' + number(s['beta'] * s['g']) + ')' for s in selected)
    threshold_rows.append(table_row([scientific(threshold), ', '.join(s['id'] for s in selected),
                                    terms, '<strong>' + number(result) + '</strong>']))
values.update({
    'TEACH_SNP_ROWS': ''.join(table_row([s['id'], scientific(s['p']), number(s['beta']),
                                      s['g'], number(s['beta'] * s['g'])]) for s in snps),
    'TEACH_LD_ROWS': ''.join(ld_rows),
    'TEACH_LD_X': number(ld['reference_x_ab_r2']),
    'TEACH_LD_Y': number(ld['reference_y_ab_r2']),
    'TEACH_LD_CUTOFF': number(ld['cutoff']),
    'TEACH_LD_STRICT': number(ld['stricter_cutoff']),
    'TEACH_LD_SCORE_X': number(ld_results[0]),
    'TEACH_LD_SCORE_Y': number(ld_results[1]),
    'TEACH_LD_SCORE_STRICT': number(ld_results[2]),
    'TEACH_THRESHOLD_ROWS': ''.join(threshold_rows),
    'TEACH_THRESHOLD_FIRST': number(threshold_results[0]),
    'TEACH_THRESHOLD_MIDDLE': number(threshold_results[1]),
    'TEACH_THRESHOLD_LAST': number(threshold_results[2]),
})
for snp in snps:
    values[f'TEACH_{snp["id"]}_CONTRIBUTION'] = number(snp['beta'] * snp['g'])
values['TEACH_P_VALUES'] = ' · '.join(s['id'] + ' = ' + scientific(s['p']) for s in snps)

# Ordinary OLS for the four-person confounding example; no fitted values are hardcoded.
confounding = inputs['confounding']
g, y, z = [list(map(Decimal, confounding[key])) for key in ('g', 'y', 'group')]
if not len(g) == len(y) == len(z) or len(g) < 3:
    raise ValueError('Confounding example needs aligned observations')
g_mean, y_mean = sum(g) / len(g), sum(y) / len(y)
cross = sum((a - g_mean) * (b - y_mean) for a, b in zip(g, y))
gss = sum((a - g_mean) ** 2 for a in g)
design = [[Decimal(1), a, group] for a, group in zip(g, z)]
normal = [[sum(row[i] * row[j] for row in design) for j in range(3)] +
          [sum(row[i] * response for row, response in zip(design, y))] for i in range(3)]
for column in range(3):
    pivot = next((r for r in range(column, 3) if normal[r][column] != 0), None)
    if pivot is None:
        raise ValueError('Confounding model is rank deficient')
    normal[column], normal[pivot] = normal[pivot], normal[column]
    divisor = normal[column][column]
    normal[column] = [value / divisor for value in normal[column]]
    for row in range(3):
        if row != column:
            factor = normal[row][column]
            normal[row] = [a - factor * b for a, b in zip(normal[row], normal[column])]
coefficients = [row[-1] for row in normal]
values.update({
    'TEACH_CONFOUNDING_ROWS': ''.join(table_row([i, number(group), number(a), number(b)])
                                    for i, (a, b, group) in enumerate(zip(g, y, z), 1)),
    'TEACH_OLS_NAIVE': number(cross / gss),
    'TEACH_OLS_INTERCEPT': number(coefficients[0]),
    'TEACH_OLS_ADJUSTED': number(coefficients[1]),
    'TEACH_OLS_GROUP': number(coefficients[2]),
    'TEACH_G_MEAN': number(g_mean), 'TEACH_Y_MEAN': number(y_mean),
    'TEACH_OLS_CROSS': number(cross), 'TEACH_OLS_GSS': number(gss),
})
source = SOURCE.read_text()
for key,value in values.items():
    marker = f'<!-- {key} -->'
    if (key.startswith('EXAMPLE_') and source.count(marker) != 1) or source.count(marker) < 1:
        raise ValueError(f'Expected one placeholder: {key}')
    source = source.replace(marker,value)
if any('<!-- ' + prefix in source for prefix in ('EXAMPLE_', 'DATA_', 'TEACH_')):
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
