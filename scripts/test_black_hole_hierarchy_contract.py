#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS = (ROOT / 'apps' / 'black-hole-museum' / 'src' / 'maximum-shelf-composition.css').read_text(encoding='utf-8')
NORMAL = CSS.replace(' ', '').replace('\n', '')


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)
    print('PASS:', message)


require('primary=onedominantscientificartifactorinteraction' in NORMAL,
        'composition contract explicitly distinguishes a primary exhibit')
require('secondary=onesupportingobservation/reference' in NORMAL,
        'composition contract explicitly distinguishes supporting evidence')
require('tertiary=interpretationandcontrols' in NORMAL,
        'composition contract explicitly makes interpretation tertiary')

require('grid-template-areas:"storyhero""referencehero"' in NORMAL,
        'evidence gallery stacks story/reference beside one dominant network')
require('#hrv-black-hole-museum-root.bhm-network-layout' in NORMAL and
        'grid-template-areas:"storyglobe""referenceglobe"' in NORMAL,
        'Earth telescope gallery makes the globe the dominant exhibit')
require('grid-template-areas:"herostory""heroreference"' in NORMAL,
        'reconstruction gallery reverses the composition for visual rhythm')

require('.bhm-lab-media>.bhm-media-card:nth-child(1)' in NORMAL and
        'grid-row:1/span2' in NORMAL,
        'Warped Light media wall promotes one reference artifact above the rest')
require('.bhm-lab-media>.bhm-media-card:nth-child(4)' in NORMAL and
        'grid-column:2/4' in NORMAL,
        'Warped Light media wall gives the rotating visualization a secondary wide bay')

require('.bhm-credit-list' in NORMAL and 'repeat(3,minmax(0,1fr))!important' in NORMAL,
        'credits are a quieter three-column ledger rather than another hero wall')
require('.bhm-credit-item' in NORMAL and 'box-shadow:none!important' in NORMAL,
        'credit cards are visually demoted')

require('.bhm-max-chamber-identity' in NORMAL and 'opacity:calc(.09*var(--ambient-strength,1))' in NORMAL,
        'ghost chamber identity is orientation, not a competing focal point')

require('@media(max-width:767px)' in NORMAL and 'grid-template-columns:1fr!important' in NORMAL,
        'single-column composition is intentionally reserved for mobile')

print('\nBlack Hole Museum visual hierarchy contract passed.')
