#!/usr/bin/env python3
"""Sloučí data/facts/*.json do js/facts.js a zkontroluje schéma.

Použití:  python3 tools/build-facts.py
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'data', 'facts')
OUT = os.path.join(ROOT, 'js', 'facts.js')
REQUIRED = ['id', 'category', 'question', 'answer', 'unit', 'fact', 'sourceTitle', 'sourceUrl', 'sourceQuote']

facts, errors, ids = [], [], set()
for path in sorted(glob.glob(os.path.join(SRC, '*.json'))):
    cat = os.path.splitext(os.path.basename(path))[0]
    with open(path, encoding='utf-8') as fh:
        try:
            items = json.load(fh)
        except json.JSONDecodeError as e:
            errors.append(f'{path}: neplatný JSON ({e})'); continue
    for i, f in enumerate(items):
        where = f'{cat}[{i}]'
        for k in REQUIRED:
            if k not in f: errors.append(f'{where}: chybí pole {k}')
        if f.get('category') != cat: errors.append(f'{where}: category "{f.get("category")}" neodpovídá souboru {cat}')
        if not isinstance(f.get('answer'), int) or isinstance(f.get('answer'), bool) or f.get('answer') < 0:
            errors.append(f'{where}: answer musí být nezáporné celé číslo')
        u = f.get('unit')
        if not isinstance(u, dict) or any(k not in u for k in ('one', 'few', 'many')):
            errors.append(f'{where}: unit musí mít tvary one/few/many')
        if not str(f.get('question', '')).strip().endswith('?'): errors.append(f'{where}: otázka nekončí otazníkem')
        if not re.match(r'^https?://', str(f.get('sourceUrl', ''))): errors.append(f'{where}: sourceUrl není http(s) URL')
        if f.get('id') in ids: errors.append(f'{where}: duplicitní id {f.get("id")}')
        ids.add(f.get('id'))
        f.setdefault('answerNote', '')
        f.setdefault('confidence', 'high')
        en = f.get('en')
        if not isinstance(en, dict) or not en.get('question') or not en.get('fact') or not isinstance(en.get('unit'), dict) or any(k not in en['unit'] for k in ('one', 'other')):
            errors.append(f'{where}: chybí nebo je neúplný anglický překlad (en.question, en.fact, en.unit.one/other)')
        elif not str(en['question']).strip().endswith('?'):
            errors.append(f'{where}: anglická otázka nekončí otazníkem')
        facts.append(f)

if errors:
    print('CHYBY:'); [print(' -', e) for e in errors]; sys.exit(1)

facts.sort(key=lambda f: (f['category'], f['id']))
with open(OUT, 'w', encoding='utf-8') as fh:
    fh.write('/* GENEROVÁNO – needituj ručně. Upravuj data/facts/*.json a spusť: python3 tools/build-facts.py */\n')
    fh.write('window.FACTS = ')
    fh.write(json.dumps(facts, ensure_ascii=False, indent=2))
    fh.write(';\n')

by_cat = {}
for f in facts: by_cat[f['category']] = by_cat.get(f['category'], 0) + 1
print(f'OK: {len(facts)} faktů → {os.path.relpath(OUT, ROOT)}')
for c, n in sorted(by_cat.items()): print(f'  {c:12s} {n}')
