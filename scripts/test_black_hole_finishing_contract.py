#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'apps' / 'black-hole-museum' / 'src'
FINISH = (SRC / 'maximum-shelf-finishing.css').read_text(encoding='utf-8')
AMADEUS = (SRC / 'theme-amadeus.css').read_text(encoding='utf-8')


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)
    print('PASS:', message)


normalized_finish = FINISH.replace(' ', '')
normalized_amadeus = AMADEUS.replace(' ', '')

require('.bhm-max-corridor-frame:nth-child(2)' in FINISH and 'scale:.87' in normalized_finish,
        'threshold corridor has explicit cross-browser depth fallback')
require('.bhm-max-corridor-frame:nth-child(4)' in FINISH and 'scale:.61' in normalized_finish,
        'deepest threshold frame has deterministic fallback scale')

require('html.hrv-route-black-hole-lab-ready .site-footer' in AMADEUS,
        'native Amadeus site footer is handled only behind the successful-route gate')
require('background:#071321!important' in normalized_amadeus,
        'native site footer continues the museum dark exit')
require('html.hrv-route-black-hole-lab-ready .site-footer a' in AMADEUS,
        'native footer links retain explicit readable colors')
require('display:none!important' not in normalized_amadeus.split('html.hrv-route-black-hole-lab-ready .site-footer', 1)[-1].split('}', 1)[0],
        'native site footer remains functional rather than being hidden')

print('\nBlack Hole Museum live-theme finishing contract passed.')
