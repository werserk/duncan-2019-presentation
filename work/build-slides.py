"""Resolve canonical example data, package offline slides and export speaker notes."""
from pathlib import Path
from html import escape
import importlib.util
from bs4 import BeautifulSoup
from bs4.element import NavigableString, TemplateString

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'work/slides/slides.html'
SKILL = ROOT / 'vendor/html-slide-builder'
spec = importlib.util.spec_from_file_location('slide_packager', SKILL/'build.py')
packager = importlib.util.module_from_spec(spec)
spec.loader.exec_module(packager)

from slide_data import source

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
