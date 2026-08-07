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
FINISHING = (SRC / 'maximum-shelf-finishing.css').read_text(encoding='utf-8')
WIDE = (SRC / 'maximum-shelf-wide-performance.css').read_text(encoding='utf-8')
MEDIA = (SRC / 'maximum-shelf-media-center.css').read_text(encoding='utf-8')
STRUCTURE = (SRC / 'maximum-shelf-structure.css').read_text(encoding='utf-8')
STRUCTURE_JS = (SRC / 'maximum-shelf-structure.js').read_text(encoding='utf-8')
COMPOSED_RUNTIME = (SRC / 'maximum-shelf-composed-runtime.js').read_text(encoding='utf-8')
RUNTIME = (SRC / 'maximum-shelf-runtime.js').read_text(encoding='utf-8')
AMADEUS = (SRC / 'theme-amadeus.css').read_text(encoding='utf-8')


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)
    print('PASS:', message)


# Proven viewport contract from the historical layout laboratory.
normalized_viewport = VIEWPORT.replace(' ', '')
require('#hrv-black-hole-museum-root.bhm-mounted' in VIEWPORT,
        'mount root owns viewport breakout')
require('width:100vw' in normalized_viewport and
        'margin-left:-50vw' in normalized_viewport and
        'margin-right:-50vw' in normalized_viewport,
        'full-width route keeps the proven root-level 100vw breakout')

# Maximum-shelf atmosphere and accessibility contracts remain intact.
normalized_max = MAXIMUM.replace(' ', '')
require('color:#fff!important' in normalized_max,
        'museum explicitly owns high-contrast heading color')
require('@media (max-width:767px)' in MAXIMUM,
        'phone pocket-museum treatment remains present')
require('@media (prefers-reduced-motion:reduce)' in MAXIMUM,
        'Still Museum reduced-motion treatment remains present')
require('.bhm-max-transition' in ENHANCEMENTS and '.bhm-max-lightfield' in ENHANCEMENTS,
        'environmental transitions and ambient depth remain present')
require('@media (forced-colors:active)' in ENHANCEMENTS,
        'decorative environment withdraws in forced-colors mode')
require('.bhm-max-corridor-frame:nth-child(4)' in FINISHING,
        'cross-browser threshold depth fallback remains present')

# Performance/runtime contracts from the live browser tests.
require("const RUNTIME_WINDOW = 'current-plus-one-ahead'" in RUNTIME,
        'runtime keeps the current-plus-one-ahead scroll budget')
require("video.preload = 'none'" in RUNTIME and 'video.pause()' in RUNTIME,
        'dormant native videos are paused and not preloaded')
require('IntersectionObserver' in RUNTIME and "rootMargin: '100% 0px 100% 0px'" in RUNTIME,
        'YouTube Media Center wakes only near the viewport')
require('autoplay=0' in RUNTIME and 'controls=1' in RUNTIME,
        'YouTube players never autoplay and retain normal controls')

# The viewport is available to the exhibit. Text gets local reading limits instead.
normalized_wide = WIDE.replace(' ', '')
require('--bhm-wide:none' in normalized_wide,
        'desktop presentation removes the old centered museum-width ceiling')
require('width:100%!important' in normalized_wide and 'max-width:none!important' in normalized_wide,
        'desktop presentation can consume the available viewport')
require('content-visibility:auto' in normalized_wide,
        'dormant chambers retain content-visibility optimization')
require('word-break:normal!important' in normalized_wide and 'hyphens:none!important' in normalized_wide,
        'theme inheritance cannot split ordinary exhibit words')

# New structural contract: renderer logic is preserved, DOM anatomy is recomposed after mount.
require("import { mountBlackHoleMuseum as mountMaximumShelfMuseum } from './maximum-shelf-runtime.js'" in COMPOSED_RUNTIME,
        'composed runtime preserves the verified maximum-shelf runtime')
require('recomposeBlackHoleMuseum(args.mount)' in COMPOSED_RUNTIME,
        'composed runtime restructures the mounted museum after verified rendering')
require("const STRUCTURE_VERSION = 'structured-exhibit-2026.08.07.1'" in STRUCTURE_JS,
        'structured exhibit DOM has an explicit version marker')
require('buildSceneHeader' in STRUCTURE_JS and 'bhm-scene-header' in STRUCTURE_JS,
        'every station can receive a real scene entrance/header')
require("REVERSE_HEADER_STATIONS = new Set(['04', '06', '09'])" in STRUCTURE_JS,
        'selected stations deliberately reverse composition rhythm')
require('composeThreshold' in STRUCTURE_JS and 'composeRotunda' in STRUCTURE_JS and 'composeBoundary' in STRUCTURE_JS,
        'threshold, rotunda, and boundary receive specialized scene anatomy')
require("case '02'" in STRUCTURE_JS and "case '10'" in STRUCTURE_JS,
        'all numbered stations are handled by the structural compositor')

# Structured CSS must create hierarchy without recreating a centered content box.
normalized_structure = STRUCTURE.replace(' ', '')
require('.bhm-chamber{\n  display:block!important' in STRUCTURE or '.bhm-chamber{display:block!important' in normalized_structure,
        'rooms flow as scene header plus exhibit rather than vertically centered widget grids')
require('grid-template-areas:' in STRUCTURE and '"title summary"' in STRUCTURE,
        'desktop scene headers have explicit title/summary/action roles')
require('font-size:clamp(3.4rem,5.4vw,7rem)!important' in normalized_structure,
        'station titles are exhibit-scale and readable')
require('font-size:clamp(20px,.28vw+15px,23px)!important' in normalized_structure,
        'base museum reading text is sized for a real desktop display')
require('.bhm-lensing.bhm-stage-grid' not in normalized_structure,
        'structure layer does not invent a descendant breakout container')
require('.bhm-lensing .bhm-stage-grid' in STRUCTURE and 'display:block !important' in STRUCTURE,
        'Sky Atrium becomes one dominant full-width exhibit below its header')
require('grid-template-columns:minmax(0,1.55fr)minmax(22rem,.45fr)!important' in normalized_structure,
        'Evidence room has one primary interaction and one supporting reference')
require('grid-template-columns:minmax(0,1.4fr)minmax(24rem,.6fr)!important' in normalized_structure,
        'Earth room has a dominant instrument and supporting map')
require('grid-template-columns:repeat(12,minmax(0,1fr))!important' in normalized_structure,
        'Warped Light supporting media uses an editorial twelve-column spread')
require('.bhm-structured-media-center.bhm-media-center-inner' not in normalized_structure,
        'Media Center structure remains scoped through its real descendant relationship')
require('.bhm-structured-media-center .bhm-media-center-inner' in STRUCTURE and 'display:block !important' in STRUCTURE,
        'Media Center title becomes a room header above the videos')
require('@media (max-width:767px)' in STRUCTURE and 'grid-template-columns:1fr !important' in STRUCTURE,
        'single-column presentation is reserved for the phone edition')

# Media Center still contains the simulated, non-autoplay classroom-safe selections.
normalized_media = MEDIA.replace(' ', '')
require('repeat(2,minmax(0,1fr))' in normalized_media,
        'Media Center keeps two videos side by side on desktop')
require('SIMULATED MEDIA SELECTION' in RUNTIME,
        'prototype Media Center does not falsely claim Ms. Hughes approval')

# Theme compatibility remains route-scoped only.
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
require('.site-content > .container' in AMADEUS and 'max-width:none!important' in AMADEUS.replace(' ', ''),
        'Amadeus centered container is not a layout authority on the enhanced route')
require('.content-area' in AMADEUS and 'float:none!important' in AMADEUS.replace(' ', ''),
        'theme content-area width and float remain neutralized')

# Durable build order: foundation -> viewport -> atmosphere -> performance/media -> structure -> theme adapter.
order = [
    'page.css',
    'viewport-breakout.css',
    'maximum-shelf.css',
    'maximum-shelf-enhancements.css',
    'maximum-shelf-finishing.css',
    'maximum-shelf-wide-performance.css',
    'maximum-shelf-media-center.css',
    'maximum-shelf-structure.css',
    'theme-amadeus.css',
]
positions = [BUILD.find(name) for name in order]
require(all(pos >= 0 for pos in positions), 'all nine style modules are included by the durable build')
require(positions == sorted(positions), 'style modules are composed in the required cascade order')
require("maximum-shelf-composed-runtime.js',DIST/'black-hole-museum.js" in BUILD,
        'durable build publishes the structured composed runtime entry point')

# Base renderer remains separable and authoritative for science/interactions.
require('maximum-shelf.css' not in BASE and 'theme-amadeus.css' not in BASE and 'maximum-shelf-structure.css' not in BASE,
        'base renderer styling remains separable from presentation and theme adapters')

print('\nBlack Hole Museum structured presentation contract passed.')
