#!/usr/bin/env python3
"""Copy the cyber-range FTUE prototypes into public/training/proto with client branding removed.

Usage: python3 scripts/build-training-prototypes.py /path/to/source-prototypes
Client names live in scripts/brand-terms.local.json (git-ignored), for example:
  {"product": "Product Name", "short": "Name", "owner": "Company", "neutral": "Cyber Range"}
Re-run whenever the source prototypes change.
"""
import json, re, shutil, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else sys.exit(__doc__)
OUT = HERE.parent / 'public' / 'training' / 'proto'
TERMS = json.loads((HERE / 'brand-terms.local.json').read_text(encoding='utf-8'))
P, S, O, N = (re.escape(TERMS['product']), re.escape(TERMS['short']), re.escape(TERMS['owner']), TERMS['neutral'])

# Files and folders to ship. Root-level files are the original globe flow.
ROOT_FILES = ['01-choose.html', '02-paths.html', '02-programs.html', '03-briefing.html', '04-map.html',
              'styles.css', 'overwatch.css', 'personal.css', 'personal.js', 'responsive.css']
FOLDERS = ['assets', 'soc-direct', 'ftue-world-map', 'ftue-v2']
TEXT_EXT = {'.html', '.css', '.js', '.json'}

HIDE_CSS = ('[class*="logo" i] img,[class*="range-mark"],[class*="range-logo"],[class*="logo--range"],'
            '[class*="range-sig-mark"]{visibility:hidden!important}')

DATA_URI = re.compile(r'data:[^"\'\s)&]+')
NAMES = f'(?:{S}|{O})'
IMG_ALT = [re.compile(r'<img[^>]*alt="[^"]*' + NAMES + r'[^"]*"[^>]*>', re.I),
           re.compile(r'&lt;img(?:(?!&gt;).)*?alt=&quot;[^&]*' + NAMES + r'[^&]*&quot;(?:(?!&gt;).)*?&gt;', re.I | re.S)]
WORD = N.split()[-1]
TEXT_RULES = [
    (re.compile(r'©\s*\d{4}\s*' + O + r'\s*·?\s*' + P), ''),
    (re.compile(P, re.I), lambda m: N.upper() if m.group(0).isupper() else N),
    (re.compile(S.upper() + r' (?=ORBITAL)'), ''),
    (re.compile(O, re.I), ''),
    (re.compile(r'(?<![A-Za-z])' + S.upper() + r'(?![A-Za-z])'), WORD.upper()),
    (re.compile(r'(?<![A-Za-z])' + S + r'(?![A-Za-z])'), WORD),
    (re.compile(r'(?<![A-Za-z])' + S.lower() + r'(?![A-Za-z])'), WORD.lower()),
    # Product generation label: neutral version tag everywhere (class names and text).
    (re.compile(r'(?<![A-Za-z])gen ?3(?![0-9])', re.I), lambda m: 'V3' if m.group(0)[0].isupper() else 'v3'),
]
# Skip the "not the final layout" reviewer gate; this is a portfolio embed.
GATE_RULES = [("acknowledgementKey)==='yes'", "acknowledgementKey)==='yes'||true"),
              ('acknowledgementKey)===&#x27;yes&#x27;', 'acknowledgementKey)===&#x27;yes&#x27;||true')]


def scrub(text: str) -> str:
    for rx in IMG_ALT:
        text = rx.sub('', text)
    # Protect base64 payloads from text replacement.
    parts, last, out = [], 0, []
    for m in DATA_URI.finditer(text):
        parts.append((text[last:m.start()], m.group(0)))
        last = m.end()
    parts.append((text[last:], ''))
    for plain, data in parts:
        for rx, rep in TEXT_RULES:
            plain = rx.sub(rep, plain)
        out.append(plain + data)
    text = ''.join(out)
    # "All examples" links point at the source gallery; send them back to the training page.
    text = re.sub(r'href="(?:\.\./)?index\.html"', 'href="/training/#prototypes" target="_top"', text)
    for a, b in GATE_RULES:
        text = text.replace(a, b)
    # Inject the logo-hiding style into every document, including srcdoc copies.
    text = text.replace('&lt;head&gt;', '&lt;head&gt;&lt;style&gt;' + HIDE_CSS.replace('"', '&quot;') + '&lt;/style&gt;')
    text = re.sub(r'<head>', '<head><style>' + HIDE_CSS + '</style>', text, count=1)
    return text


def copy(src: Path, dst: Path):
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.suffix.lower() in TEXT_EXT:
        dst.write_text(scrub(src.read_text(encoding='utf-8')), encoding='utf-8')
    elif src.name.lower().startswith(('license', 'readme')) or 'pip' in src.name.lower():
        return
    else:
        shutil.copy2(src, dst)


if OUT.exists():
    shutil.rmtree(OUT)
for f in ROOT_FILES:
    copy(SRC / f, OUT / 'globe' / f) if f.endswith('.html') else copy(SRC / f, OUT / 'globe' / f)
for folder in FOLDERS:
    target = OUT / ('globe/assets' if folder == 'assets' else folder)
    for p in (SRC / folder).rglob('*'):
        if p.is_file() and p.name != 'README.md':
            copy(p, target / p.relative_to(SRC / folder))

# The flows link back to a gallery index; send that to the training page.
redirect = ('<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex">'
            '<meta http-equiv="refresh" content="0;url=/training/#prototypes"><title>Prototypes</title>'
            '<a href="/training/#prototypes">Back to prototypes</a>')
for d in ['', 'globe', 'soc-direct', 'ftue-world-map', 'ftue-v2']:
    idx = OUT / d / 'index.html'
    idx.parent.mkdir(parents=True, exist_ok=True)
    idx.write_text(redirect, encoding='utf-8')

# Final check: nothing branded left outside base64 payloads.
leaks = []
for p in OUT.rglob('*'):
    if p.suffix.lower() in TEXT_EXT:
        body = DATA_URI.sub('', p.read_text(encoding='utf-8'))
        if re.search(r'(?<![A-Za-z])' + S + r'(?![A-Za-z])|' + O + r'|(?<![A-Za-z])gen ?3(?![0-9])', body, re.I):
            leaks.append(str(p.relative_to(OUT)))
print('Built', OUT, '| leaks:', leaks or 'none')
