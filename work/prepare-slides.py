"""Prepare the canonical scientific source for the shared Reveal compiler."""
import os
from bs4 import BeautifulSoup
from slide_data import source, SOURCE, ROOT

soup = BeautifulSoup(source, 'html.parser')
for tbody in soup.select('[data-row-steps]'):
    steps = [int(n) for n in tbody['data-row-steps'].split(',')]
    rows = tbody.find_all('tr', recursive=False)
    if len(rows) != len(steps):
        raise ValueError('Reveal row map does not match canonical computed rows')
    for row, step in zip(rows, steps):
        row['data-step'] = str(step)
    del tbody['data-row-steps']
for element in soup.select('link[href], img[src]'):
    attr = 'href' if element.name == 'link' else 'src'
    value = element[attr]
    if not value.startswith(('http:', 'https:', 'data:', '#')):
        element[attr] = os.path.relpath((SOURCE.parent / value).resolve(), ROOT / '.generated')
toc = soup.find(string=lambda text: text and 'MAIN_TOC' in text)
if toc is None:
    raise ValueError('Missing canonical TOC placeholder')
toc.replace_with('')
output = ROOT / '.generated/slides.html'
output.parent.mkdir(exist_ok=True)
output.write_text(str(soup))
print('Prepared all canonical Decimal data and explicit computed-row reveals.')
