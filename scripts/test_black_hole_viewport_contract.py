#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CSS = (ROOT / 'apps' / 'black-hole-museum' / 'src' / 'page.css').read_text(encoding='utf-8')


def block(selector: str) -> str:
    match = re.search(re.escape(selector) + r'\s*\{([^}]*)\}', CSS, re.S)
    if not match:
        raise AssertionError(f'Missing CSS block: {selector}')
    return match.group(1)


root = block('#hrv-black-hole-museum-root.bhm-mounted')
museum = block('#hrv-black-hole-museum-root .bhm-museum')

required_root_rules = (
    'width:100vw',
    'max-width:none!important',
    'position:relative',
    'left:50%',
    'margin-left:-50vw',
    'margin-right:-50vw',
    'transform:none',
)

for rule in required_root_rules:
    if rule not in root.replace(' ', ''):
        raise AssertionError(f'Viewport breakout contract missing from mount root: {rule}')

normalized_museum = museum.replace(' ', '')
if 'width:100vw' in normalized_museum or 'width:100dvw' in normalized_museum:
    raise AssertionError('Viewport breakout must not be implemented on .bhm-museum; it belongs on the mount root.')
if 'margin-inline:calc(50%-50vw)' in normalized_museum or 'margin-inline:calc(50%-50dvw)' in normalized_museum:
    raise AssertionError('Child-level viewport breakout margin detected on .bhm-museum.')
if 'width:100%' not in normalized_museum or 'margin:0' not in normalized_museum:
    raise AssertionError('.bhm-museum must fill the already-broken-out root with width:100% and margin:0.')

print('PASS: Black Hole Museum uses the proven repo-layout-lab root-level viewport breakout contract.')
