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

# Maximum-shelf atmosphere/accessibility remain available around the human-scale composition.
normalized_max = MAXIMUM.replace(' ', '')
require('color:#fff!important' in normalized_max,
        'museum explicitly owns high-contrast heading color')
require('@media (prefers-reduced-motion:reduce)' in MAXIMUM,
        'Still Museum reduced-motion treatment remains present')
require('.bhm-max-transition' in ENHANCEMENTS and '.bhm-max-lightfield' in ENHANCEMENTS,
        'environmental transitions and ambient depth remain present')
require('@media (forced-colors:active)' in ENHANCEMENTS,
        'decorative environment withdraws in forced-colors mode')
require('.bhm-max-corridor-frame:nth-child(4)' in FINISHING,
        'cross-browser threshold-depth fallback remains present')

# Live-page performance rules remain unchanged.
require("const RUNTIME_WINDOW = 'current-plus-one-ahead'" in RUNTIME,
        'runtime keeps the current-plus-one-ahead scroll budget')
require("video.preload = 'none'" in RUNTIME and 'video.pause()' in RUNTIME,
        'dormant native videos are paused and not preloaded')
require('IntersectionObserver' in RUNTIME and "rootMargin: '100% 0px 100% 0px'" in RUNTIME,
        'YouTube Media Center wakes only near the viewport')
require('autoplay=0' in RUNTIME and 'controls=1' in RUNTIME,
        'YouTube players never autoplay and retain normal controls')

# The viewport remains available. No centered master content shell is allowed back in.
normalized_wide = WIDE.replace(' ', '')
require('--bhm-wide:none' in normalized_wide,
        'desktop presentation removes the old museum-width ceiling')
require('width:100%!important' in normalized_wide and 'max-width:none!important' in normalized_wide,
        'desktop presentation can consume the available viewport')
require('content-visibility:auto' in normalized_wide,
        'dormant chambers retain content-visibility optimization')
require('word-break:normal!important' in normalized_wide and 'hyphens:none!important' in normalized_wide,
        'theme inheritance cannot split ordinary exhibit words')

# Runtime composition is now story-aware rather than one universal station template.
require("import { mountBlackHoleMuseum as mountMaximumShelfMuseum } from './maximum-shelf-runtime.js'" in COMPOSED_RUNTIME,
        'composed runtime preserves the verified maximum-shelf runtime')
require('recomposeBlackHoleMuseum(args.mount)' in COMPOSED_RUNTIME,
        'composed runtime restructures the mounted museum after verified rendering')
require("const STRUCTURE_VERSION = 'story-clusters-2026.08.07.2'" in STRUCTURE_JS,
        'story-cluster DOM has an explicit version marker')
for name in [
    'threshold-cluster', 'interactive-pair', 'evidence-cluster', 'media-story-pair',
    'telescope-cluster', 'three-stage-process', 'comparison-pair',
    'interactive-gallery', 'myth-grid', 'knowledge-split'
]:
    require(name in STRUCTURE_JS, f'named composition exists: {name}')
require('composeHero' in STRUCTURE_JS and 'bhm-hero-visual' in STRUCTURE_JS,
        'page hero receives a dedicated composed visual')
require('buildSectionIntro' in STRUCTURE_JS and 'bhm-section-intro' in STRUCTURE_JS,
        'every station receives a compact section entrance')
require('bhm-clue-grid' in STRUCTURE_JS and "network.querySelectorAll('.bhm-clue')" in STRUCTURE_JS,
        'gravity clues are grouped as evidence cards instead of orbiting a giant canvas')
require('bhm-observatory-stack' in STRUCTURE_JS and 'bhm-observatory-chip' in STRUCTURE_JS,
        'EHT observatory sites receive a compact supporting group')
require('bhm-process-row' in STRUCTURE_JS and 'bhm-process-card' in STRUCTURE_JS,
        'reconstruction exposes three adjacent process stages')
require('bhm-lab-companion' in STRUCTURE_JS and 'bhm-support-gallery' in STRUCTURE_JS,
        'Warped Light separates its companion reference from the supporting gallery')
require("case '01'" in STRUCTURE_JS and "case '10'" in STRUCTURE_JS,
        'all ten numbered stations are routed through the story compositor')

# Human-scale layout doctrine.
normalized_structure = re.sub(r'\s+', '', STRUCTURE)
require('font-size:clamp(18px,.15vw+16px,20px)!important' in normalized_structure,
        'desktop reading base stays human-scale')
require('min-height:auto!important' in normalized_structure,
        'content height replaces the old room-height mandate')
require('min-height:90vh' not in STRUCTURE and 'min-height:110vh' not in STRUCTURE and 'min-height:130vh' not in STRUCTURE and 'min-height:150vh' not in STRUCTURE,
        'story-grid layer contains no giant generic chamber heights')
require('grid-template-columns:minmax(0,7fr)minmax(18rem,5fr)' in normalized_structure,
        'opening hero uses a purposeful 7/5 composition')
require('min-height:clamp(32rem,60svh,44rem)!important' in normalized_structure,
        'hero is substantial but capped for a normal desktop')
require('font-size:clamp(2.5rem,3.25vw,4rem)!important' in normalized_structure,
        'station headings stay readable without becoming room-scale billboards')
require('.bhm-story-exhibit' in STRUCTURE and 'max-width:none!important' in normalized_structure,
        'full-width availability belongs to the exhibit canvas, not a centered container')
require('grid-template-columns:repeat(12,minmax(0,1fr))' in normalized_structure,
        'desktop story system uses a flexible twelve-column composition grid')

# Specific relationship layouts from the approved paper plan.
require('.bhm-clue-grid' in STRUCTURE and 'grid-template-columns:repeat(2,minmax(0,1fr))' in normalized_structure,
        'Gravity Leaves Clues groups evidence cards together')
require('.bhm-telescope-cluster>.bhm-media-card' in normalized_structure and 'grid-column:1/span5!important' in normalized_structure,
        'Earth telescope room gives the real map five columns')
require('.bhm-telescope-cluster.bhm-earth-stage' not in normalized_structure,
        'telescope selectors preserve real descendant relationships')
require('.bhm-telescope-cluster .bhm-earth-stage' in STRUCTURE and 'grid-column:6/span4!important' in normalized_structure,
        'Earth visualization receives four purposeful columns')
require('.bhm-telescope-cluster .bhm-observatory-stack' in STRUCTURE and 'grid-column:10/-1' in normalized_structure,
        'observatory stack receives the remaining three columns')
require('.bhm-process-row' in STRUCTURE and 'grid-template-columns:repeat(3,minmax(0,1fr))' in normalized_structure,
        'reconstruction process presents three comparable stages')
require('max-width:34rem' in STRUCTURE and '.bhm-comparison-pair' in STRUCTURE,
        'Twin-Ring cards are capped at human viewing scale')
require('.bhm-interactive-gallery .bhm-accretion-stage' in STRUCTURE and 'grid-column:1/span7!important' in normalized_structure,
        'Warped Light gives the interactive seven columns rather than the whole screen')
require('.bhm-interactive-gallery .bhm-lab-companion' in STRUCTURE and 'grid-column:8/-1!important' in normalized_structure,
        'Warped Light companion reference occupies the remaining five columns')
require('.bhm-support-gallery' in STRUCTURE and 'grid-template-columns:repeat(3,minmax(0,1fr))!important' in normalized_structure,
        'Warped Light supporting references form a compact three-card gallery')
require('.bhm-myth-grid' in STRUCTURE and 'grid-template-columns:repeat(2,minmax(0,1fr))' in normalized_structure,
        'myth corrections form a visible 2x2 relationship cluster')
require('.bhm-story-media-center .bhm-media-center-intro' in STRUCTURE and 'grid-column:1/span3' in normalized_structure,
        'Media Center intro is compact signage rather than a third giant card')
require('.bhm-story-media-center .bhm-media-center-grid' in STRUCTURE and 'grid-column:4/-1' in normalized_structure,
        'Media Center gives the paired videos the remaining lounge space')
require('.bhm-evidence-pullback' in STRUCTURE and 'grid-template-columns:repeat(3,minmax(0,1fr))!important' in normalized_structure,
        'closing evidence pullback keeps three related artifacts visible together')

# Phone is the intentional linear edition. Desktop is not.
require('@media(max-width:700px)' in normalized_structure,
        'phone edition has an explicit collapse threshold')
require('grid-template-columns:1fr!important' in normalized_structure,
        'phone edition stacks semantic groups into one readable column')
require('aspect-ratio:16/9' in normalized_structure,
        'embedded media preserves normal video proportions rather than giant viewport heights')

# Media Center remains simulated and safe.
normalized_media = MEDIA.replace(' ', '')
require('repeat(2,minmax(0,1fr))' in normalized_media,
        'base Media Center supports two videos side by side on desktop')
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

# Durable build order.
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
        'durable build publishes the story-composed runtime entry point')

# Base renderer remains separable and authoritative for science/interactions.
require('maximum-shelf.css' not in BASE and 'theme-amadeus.css' not in BASE and 'maximum-shelf-structure.css' not in BASE,
        'base renderer styling remains separable from presentation and theme adapters')

print('\nBlack Hole Museum human-scale story-grid contract passed.')
