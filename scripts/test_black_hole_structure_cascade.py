#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'apps' / 'black-hole-museum' / 'src'
BUILD = (ROOT / 'scripts' / 'build_black_hole.py').read_text(encoding='utf-8')
PREFLIGHT = (SRC / 'maximum-shelf-structure-preflight.css').read_text(encoding='utf-8')


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)
    print('PASS:', message)


normalized = PREFLIGHT.replace(' ', '')

require('.bhm-evidence-layout' in PREFLIGHT and '.bhm-network-layout' in PREFLIGHT and '.bhm-reconstruction-layout' in PREFLIGHT,
        'legacy named-grid stations are explicitly covered')
require('grid-template-areas:none!important' in normalized,
        'legacy named grid areas are cleared after structural recomposition')
require('grid-area:auto!important' in normalized,
        'legacy child grid-area assignments are cleared')
require('.bhm-lab-media>.bhm-media-card{' in normalized and
        'grid-column:auto!important' in normalized and
        'grid-row:auto!important' in normalized,
        'laboratory cards clear inherited explicit placement before the final spread')
require('.bhm-lab-media>.bhm-media-card:nth-child(1)' in normalized and
        'grid-column:span7!important' in normalized and
        'grid-row:span2!important' in normalized,
        'laboratory first reference remains the dominant supporting artifact')
require('.bhm-lab-media>.bhm-media-card:nth-child(4)' in normalized and
        'grid-column:1/-1!important' in normalized,
        'laboratory motion reference becomes a clean full-width closing row')
require('.bhm-site' in PREFLIGHT and 'font-size:.82rem!important' in normalized,
        'Earth observatory labels no longer use prototype microtype on desktop')
require('.bhm-clue-text' in PREFLIGHT and 'font-size:.96rem!important' in normalized,
        'evidence clue expansion text has a readable floor')
require('.bhm-evidence-center' in PREFLIGHT and 'font-size:.9rem!important' in normalized,
        'evidence center label has a readable floor')

structure_pos = BUILD.find('maximum-shelf-structure.css')
preflight_pos = BUILD.find('maximum-shelf-structure-preflight.css')
theme_pos = BUILD.find('theme-amadeus.css')
require(structure_pos >= 0 and preflight_pos > structure_pos and theme_pos > preflight_pos,
        'durable build applies cascade preflight after structure and before route-scoped theme adapter')

print('\nBlack Hole Museum structure cascade preflight passed.')
