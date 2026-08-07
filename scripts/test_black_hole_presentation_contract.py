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

# Live-page performance contract: current chamber + one ahead only.
require("const RUNTIME_WINDOW = 'current-plus-one-ahead'" in RUNTIME,
        'runtime declares the current-plus-one-ahead scroll budget')
require('installRuntimeWindow' in RUNTIME and "'is-runtime-dormant'" in RUNTIME,
        'runtime assigns live, next, and dormant chamber states')
require("video.preload = 'none'" in RUNTIME and 'video.pause()' in RUNTIME,
        'dormant chamber videos are paused and not preloaded')
require('simplifyControls' in RUNTIME,
        'maximum-shelf runtime removes redundant laboratory controls')
require('fixRotundaControls' in RUNTIME,
        'rotunda comparison controls are normalized for the maximum-shelf edition')

# Desktop is a horizontal museum canvas. Only mobile is allowed to collapse to the receipt-printer layout.
normalized_wide = WIDE.replace(' ', '')
require('--bhm-wide:none' in normalized_wide,
        'wide presentation removes the old centered museum-width ceiling')
require('width:100%!important' in normalized_wide and 'max-width:none!important' in normalized_wide,
        'desktop presentation explicitly consumes the available viewport')
require('grid-template-columns:minmax(25rem,.52fr)minmax(34rem,1.05fr)minmax(25rem,.72fr)!important' in normalized_wide,
        'evidence gallery uses a three-lane desktop exhibit')
require('grid-template-columns:minmax(25rem,.48fr)minmax(32rem,1.05fr)minmax(27rem,.8fr)!important' in normalized_wide,
        'Earth telescope gallery uses story, globe, and map lanes side by side')
require('grid-template-columns:repeat(4,minmax(0,1fr))' in normalized_wide,
        'wide laboratory and credits can use multi-bay artifact walls')
require('@media(max-width:767px)' in normalized_wide,
        'wide layer retains a dedicated mobile collapse')
require('grid-template-columns:1fr' in normalized_wide,
        'mobile layout explicitly returns multi-column artifacts to a single column')
require('content-visibility:auto' in normalized_wide,
        'dormant chambers use browser content-visibility to reduce scroll work')
require('backdrop-filter:none!important' in normalized_wide,
        'performance pass removes expensive blur from high-frequency museum surfaces')
require('word-break:normal!important' in normalized_wide and 'hyphens:none!important' in normalized_wide,
        'exhibit headings cannot be broken into janky mid-word wraps')

# Simulated YouTube Media Center contract.
normalized_media = MEDIA.replace(' ', '')
require('bhm-media-center-grid' in MEDIA and 'repeat(2,minmax(0,1fr))' in normalized_media,
        'Media Center places both YouTube selections side by side on desktop')
require('@media(max-width:767px)' in normalized_media and 'grid-template-columns:1fr' in normalized_media,
        'Media Center collapses to a single video column only on mobile')
require("youtubeId: 'kOEDG3j1bjs'" in RUNTIME and "youtubeId: 'qZWPBKULkdQ'" in RUNTIME,
        'Media Center contains the two researched prototype YouTube selections')
require('youtube-nocookie.com/embed/' in RUNTIME,
        'Media Center uses YouTube privacy-enhanced embeds')
require('autoplay=0' in RUNTIME and 'controls=1' in RUNTIME,
        'YouTube players explicitly disable autoplay and keep standard controls')
require('IntersectionObserver' in RUNTIME and "rootMargin: '100% 0px 100% 0px'" in RUNTIME,
        'YouTube players wake only when the Media Center approaches the viewport')
require('deactivateYouTubeFrame' in RUNTIME and 'iframe.remove()' in RUNTIME,
        'distant Media Center players are removed to stop playback and release overhead')
require('SIMULATED MEDIA SELECTION' in RUNTIME,
        'prototype Media Center does not falsely claim Ms. Hughes approval')

# Finishing layer remains a small fallback layer, not another design system.
require('.bhm-max-corridor-frame:nth-child(4)' in FINISHING,
        'cross-browser threshold-depth fallback remains present')

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
require('.site-content > .container' in AMADEUS and 'max-width:none!important' in AMADEUS.replace(' ', ''),
        'adapter removes the Amadeus centered container as a layout authority')
require('.content-area' in AMADEUS and 'float:none!important' in AMADEUS.replace(' ', ''),
        'adapter neutralizes the theme content-area width and float')

# Build order is part of the contract: base, breakout, experience, environment, finishing, wide/performance, media center, theme adapter.
order = [
    'page.css',
    'viewport-breakout.css',
    'maximum-shelf.css',
    'maximum-shelf-enhancements.css',
    'maximum-shelf-finishing.css',
    'maximum-shelf-wide-performance.css',
    'maximum-shelf-media-center.css',
    'theme-amadeus.css',
]
positions = [BUILD.find(name) for name in order]
require(all(pos >= 0 for pos in positions), 'all eight style modules are included by the build')
require(positions == sorted(positions), 'style modules are composed in the required cascade order')
require("maximum-shelf-runtime.js',DIST/'black-hole-museum.js" in BUILD,
        'build publishes the maximum-shelf runtime entry point')

# Guard against regressing to one giant base stylesheet.
require('maximum-shelf.css' not in BASE and 'theme-amadeus.css' not in BASE,
        'base stylesheet remains a separable foundation rather than swallowing compatibility layers')

print('\nBlack Hole Museum presentation contract passed.')
