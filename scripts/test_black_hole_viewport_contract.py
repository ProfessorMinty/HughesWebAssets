#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = (ROOT / 'apps' / 'black-hole-museum' / 'src' / 'page.css').read_text(encoding='utf-8')
BREAKOUT = (ROOT / 'apps' / 'black-hole-museum' / 'src' / 'viewport-breakout.css').read_text(encoding='utf-8')
CSS = BASE.rstrip() + '\n\n' + BREAKOUT.lstrip()


def last_block(selector: str) -> str:
    matches = re.findall(re.escape(selector) + r'\s*\{([^}]*)\}', CSS, re.S)
    if not matches:
        raise AssertionError(f'Missing CSS block: {selector}')
    return matches[-1]


root = last_block('#hrv-black-hole-museum-root.bhm-mounted')
museum = last_block('#hrv-black-hole-museum-root .bhm-museum')

required_root_rules = (
    'width:100vw',
    'max-width:none!important',
    'position:relative',
    'left:50%',
    'margin-left:-50vw',
    'margin-right:-50vw',
    'transform:none',
)

normalized_root = root.replace(' ', '')
for rule in required_root_rules:
    if rule not in normalized_root:
        raise AssertionError(f'Viewport breakout contract missing from effective mount-root rule: {rule}')

normalized_museum = museum.replace(' ', '')
if 'width:100vw' in normalized_museum or 'width:100dvw' in normalized_museum:
    raise AssertionError('Effective .bhm-museum rule still owns viewport width; breakout belongs on the mount root.')
if 'margin-inline:calc(50%-50vw)' in normalized_museum or 'margin-inline:calc(50%-50dvw)' in normalized_museum:
    raise AssertionError('Effective .bhm-museum rule still contains child-level viewport breakout margins.')
if 'width:100%' not in normalized_museum or 'margin:0' not in normalized_museum:
    raise AssertionError('Effective .bhm-museum rule must fill the broken-out root with width:100% and margin:0.')

print('PASS: Black Hole Museum effective CSS uses the proven repo-layout-lab root-level viewport breakout contract.')
