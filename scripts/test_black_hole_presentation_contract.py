#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'apps' / 'black-hole-museum' / 'src'
BUILD = (ROOT / 'scripts' / 'build_black_hole.py').read_text(encoding='utf-8')
BASE = (SRC / 'page.css').read_text(encoding='utf-8')
VIEWPORT = (SRC / 'viewport-breakout.css').read_text(encoding='utf-8')
MAXIMUM = (SRC / 'maximum-shelf.css').read_text(encoding='utf-8')
ENHANCEMENTS = (SRC / 'maximum-shelf-enhancements.css').read_text(encoding='utf-8')
RUNTIME = (SRC / 'maximum-shelf-runtime.js').read_text(encoding='utf-8')
AMADEUS = (SRC / 'theme-amadeus.css').read_text(encoding='utf-8')


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)
    print('PASS:', message)


# Historical lab contracts carried forward.
require('#hrv-black-hole-museum-root.bhm-mounted' in VIEWPORT,
        'mount root owns viewport breakout')
require('width:100vw' in VIEWPORT.replace(' ', ''),
        'viewport contract uses the proven 100vw breakout')
require('margin-left:-50vw' in VIEWPORT.replace(' ', '') and
        'margin-right:-50vw' in VIEWPORT.replace(' ', ''),
        'viewport contract keeps the proven symmetric negative margins')

# Maximum-shelf visual layer must explicitly neutralize theme heading paint.
normalized_max = MAXIMUM.replace(' ', '')
require('.bhm-museum:where(h1,h2,h3,h4,h5,h6)' in normalized_max or
        '.bhm-museum:where(h1,h2,h3,h4,h5,h6,' in normalized_max,
        'maximum-shelf layer explicitly owns museum heading presentation')
require('color:#fff!important' in normalized_max,
        'maximum-shelf layer contains explicit high-contrast heading color')
require('min-height:min(94svh,68rem)' in normalized_max,
        'museum prologue is intentionally full-scale rather than card-sized')
require('.bhm-rotunda' in MAXIMUM and '.bhm-laboratory' in MAXIMUM and '.bhm-boundary' in MAXIMUM,
        'signature rotunda, laboratory, and boundary chambers receive distinct presentation')
require('@media (max-width:767px)' in MAXIMUM,
        'vertical pocket-museum responsive treatment exists')
require('@media (prefers-reduced-motion:reduce)' in MAXIMUM,
        'Still Museum reduced-motion treatment exists')

# Environmental runtime is decorative and layered on the verified renderer.
require('mountVerifiedMuseum(args)' in RUNTIME,
        'maximum-shelf runtime delegates scientific rendering to the verified renderer first')
require("setAttribute('aria-hidden', 'true')" in RUNTIME,
        'environmental nodes are hidden from the accessibility tree')
require('addChamberIdentity' in RUNTIME and 'addEarthNetwork' in RUNTIME and 'addScrollProgress' in RUNTIME,
        'environmental runtime provides chamber identity, telescope-network staging, and journey progress')
require('mount.__bhmDestroy' in RUNTIME,
        'environmental runtime participates in the renderer cleanup lifecycle')
require('.bhm-max-transition' in ENHANCEMENTS and '.bhm-max-lightfield' in ENHANCEMENTS,
        'environmental stylesheet provides visual transitions and continuous ambient depth')
require('@media (prefers-reduced-motion:reduce)' in ENHANCEMENTS,
        'environmental animation has a Still Museum equivalent')
require('@media (forced-colors:active)' in ENHANCEMENTS,
        'decorative maximum-shelf layers withdraw in forced-colors mode')

# Compatibility adapter is allowed to touch the theme only behind the route-ready gate.
amadeus_without_comments = re.sub(r'/\*.*?\*/', '', AMADEUS, flags=re.S)
for raw_selector in re.findall(r'([^{}]+)\{', amadeus_without_comments):
    text = raw_selector.strip()
    if not text or text.startswith('@'):
        continue
    for part in text.split(','):
        candidate = part.strip()
        if candidate and not candidate.startswith('html.hrv-route-black-hole-lab-ready'):
            raise AssertionError('Unscoped Amadeus selector: ' + candidate)
print('PASS: every Amadeus compatibility selector is route-scoped')

require('.entry-header' in AMADEUS,
        'adapter suppresses the native page-title wrapper after successful enhancement')
require('.entry-footer' in AMADEUS,
        'adapter prevents native entry footer chrome from interrupting the museum exit')
require('.page .hentry' in AMADEUS and 'padding:0!important' in AMADEUS.replace(' ', ''),
        'adapter neutralizes confirmed Amadeus page-card padding')

# Build order is part of the contract: base, breakout, experience, environment, theme adapter.
order = [
    "page.css",
    "viewport-breakout.css",
    "maximum-shelf.css",
    "maximum-shelf-enhancements.css",
    "theme-amadeus.css",
]
positions = [BUILD.find(name) for name in order]
require(all(pos >= 0 for pos in positions), 'all five style modules are included by the build')
require(positions == sorted(positions), 'style modules are composed in the required cascade order')
require("maximum-shelf-runtime.js',DIST/'black-hole-museum.js" in BUILD,
        'build publishes the maximum-shelf runtime entry point')

# Guard against regressing to one giant base stylesheet.
require('maximum-shelf.css' not in BASE and 'theme-amadeus.css' not in BASE,
        'base stylesheet remains a separable foundation rather than swallowing compatibility layers')

print('\nBlack Hole Museum presentation contract passed.')
