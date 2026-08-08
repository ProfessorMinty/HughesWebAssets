#!/usr/bin/env python3
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]


def text(path: str) -> str:
    return (ROOT / path).read_text(encoding='utf-8')


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f'FAIL: {message}')
    print(f'PASS: {message}')


renderer = text('apps/black-hole-museum/src/v2/renderer.js')
interactions = text('apps/black-hole-museum/src/v2/interactions.js')
runtime = text('apps/black-hole-museum/src/v2/runtime.js')
presentation = text('apps/black-hole-museum/src/v2/presentation.css')
experience = text('apps/black-hole-museum/src/v2/experience-layer.css')
stabilization_css = text('apps/black-hole-museum/src/v2/stabilization.css')
stabilization_js = text('apps/black-hole-museum/src/v2/stabilization.js')
normalization = text('apps/black-hole-museum/src/v2/normalization.css')
amadeus = text('apps/black-hole-museum/src/v2/amadeus-compat.css')
loader = text('docs/deployment/black-hole-v2-edublogs-javascript.js')
builder = text('scripts/build_black_hole_v2.py')
release = json.loads(text('dist/v0.2.0-black-hole-v2-lab.8/release.json'))
channel = json.loads(text('channels/black-hole-v2-lab.json'))

legacy_markers = [
    'maximumShelf', 'recomposeBlackHoleMuseum', 'bhm-chamber',
    'page.css', 'maximum-shelf.css', 'maximum-shelf-structure.css',
    'maximum-shelf-runtime.js', 'maximum-shelf-composed-runtime.js'
]
combined_v2 = '\n'.join([
    renderer, interactions, runtime, presentation, experience,
    stabilization_css, stabilization_js, normalization, amadeus
])
for marker in legacy_markers:
    require(marker not in combined_v2, f'V2 source does not inherit legacy presentation marker: {marker}')

for function_name in [
    'buildOpeningRecap', 'buildLensing', 'buildEvidence', 'buildOrbit', 'buildTelescope',
    'buildReconstruction', 'buildComparison', 'buildWarpedLight', 'buildAnatomy',
    'buildMediaCenter', 'buildBoundary', 'buildCredits'
]:
    require(f'function {function_name}' in renderer, f'fresh renderer directly constructs {function_name}')

require("RUNTIME_WINDOW = 'current-plus-one-ahead'" in runtime, 'current-plus-one-ahead runtime budget is preserved')
require("video.preload = 'none'" in runtime and 'video.pause()' in runtime, 'dormant native video is paused and cold')
require('youtube-nocookie.com' in runtime and 'autoplay=0' in runtime and 'controls=1' in runtime, 'YouTube stays privacy-enhanced, lazy, controlled, and non-autoplay')
require('IntersectionObserver' in runtime, 'viewport-proximity runtime behavior uses observers where appropriate')
require('pauseRunningAnimations' in runtime and 'getAnimations({ subtree: true })' in runtime and 'animation.pause()' in runtime, 'explicit motion pause also controls ambient CSS animations')

normalized_css = presentation.replace(' ', '')
require('#hrv-black-hole-v2-root.bhv2-mounted' in presentation and 'width:100vw' in normalized_css, 'V2 mount root owns viewport breakout')
require('margin-left:-50vw' in normalized_css and 'margin-right:-50vw' in normalized_css, 'root breakout remains symmetric')
require('--bhv2-zone-max:1220px' in normalized_css and '--bhv2-zone-max:1380px' in normalized_css and '--bhv2-zone-max:1500px' in normalized_css, 'local composition zones vary by content instead of one global container')
require('width:min(100%,760px)' in normalized_css, 'feature modules are capped at human scale')
require('width:min(100%,520px)' in normalized_css, 'standard modules are capped at human scale')
require('width:min(100%,340px)' in normalized_css, 'small modules are capped at human scale')
require('aspect-ratio:16/9' in normalized_css, 'normal video proportions are preserved')
require('@media(max-width:700px)' in normalized_css, 'phone edition has an explicit linear collapse threshold')
require('@media(prefers-reduced-motion:reduce)' in normalized_css, 'reduced-motion edition is explicit')
require("font-family:'AtkinsonHyperlegible',sans-serif" in normalized_css, 'V2 presentation owns the readable Atkinson body baseline')
require("font-family:'NunitoSans',sans-serif!important" in normalized_css, 'V2 presentation owns the Nunito Sans heading baseline')
require('color:var(--bhv2-text)!important' in normalized_css, 'V2 presentation explicitly owns heading foreground color on the dark canvas')
for giant in ['min-height:90vh', 'min-height:110vh', 'min-height:130vh', 'min-height:150vh']:
    require(giant not in normalized_css, f'no generic giant room-height mandate: {giant}')

require('EXHIBIT ' in experience and 'data-station="10"' in experience, 'experience layer provides distinct station thresholds through exhibit 10')
require('bhv2-chamber-light' in experience and 'bhv2-star-drift' in experience, 'maximum-shelf atmosphere includes controlled ambient motion')
require('@media (hover:hover) and (pointer:fine)' in experience, 'hover depth is limited to hover-capable fine pointers')
require('@media (prefers-reduced-motion:reduce)' in experience, 'experience-layer motion has a reduced-motion escape hatch')

require('overflow:hidden' in stabilization_css and '.bhv2-media-card::after' in stabilization_css and 'display:none!important' in stabilization_css, 'stabilization contains runaway sheen and excludes scientific media from synthetic shimmer')
require('[data-station="04"] .bhv2-orbit-overlay' in stabilization_css and 'aspect-ratio:16 / 9' in stabilization_css, 'orbit overlay is registered to the observation viewport')
require('[aria-pressed="true"]' in stabilization_css and 'font-weight:850' in stabilization_css, 'selected tool states are visually unmistakable')
require('stabilizeWarpedLight' in stabilization_js and 'stabilizeAnatomy' in stabilization_js and 'stabilizeEarthNetwork' in stabilization_js, 'stabilization helper synchronizes interactive tool feedback')
require('buttons[0].click()' in stabilization_js, 'anatomy tool initializes into a real first layer')
require("reveal.textContent = allOpen ? 'All clues revealed' : 'Reveal all clues'" in stabilization_js, 'evidence reveal control has an explicit closed-state label')
require("clue.setAttribute('aria-expanded', 'false')" in stabilization_js and "aria-hidden', 'true'" in stabilization_js, 'evidence clues begin semantically concealed')
require("label.textContent = 'Trace the orbit'" in stabilization_js and 'bhv2-tool-instruction' in stabilization_js, 'orbit tool explains its purpose in the interface')

require('.bhv2-prototype-warning' in normalization and 'font-size:clamp(.9rem' in normalization, 'normalization raises prototype/microcopy readability floor')
require('[data-station="03"] .bhv2-evidence-cluster' in normalization and '1.12fr' in normalization, 'station 03 uses a substantial evidence/reference composition')
require('[data-station="03"] .bhv2-clue-copy' in normalization and 'max-height:0' in normalization, 'station 03 clue details are visually concealed until reveal')
require('[data-station="04"] .bhv2-observation-pair' in normalization and 'minmax(330px,.72fr)' in normalization, 'station 04 gives the observation tool real exhibit scale')
require('[data-station="05"] .bhv2-observatory-stack' in normalization and 'grid-column:1 / -1' in normalization, 'station 05 explanation spans beneath the two primary exhibits')
require('[data-station="06"] .bhv2-reconstruction-pair' in normalization and 'repeat(2,minmax(0,1fr))' in normalization, 'station 06 uses a balanced interactive/reference pair')
require('@media (max-width:1100px)' in normalization and 'grid-template-columns:1fr' in normalization, 'normalized feature compositions collapse before cramped desktop widths')

normalized_amadeus = amadeus.replace(' ', '')
require('html.hrv-route-black-hole-v2-ready' in amadeus, 'Amadeus neutralization is route-ready scoped')
require('.site-content > .container' in amadeus and '.content-area' in amadeus, 'minimal adapter neutralizes proven width/float constraints')
require('margin:0!important' in normalized_amadeus and 'padding:0!important' in normalized_amadeus, 'proven Amadeus page-entry spacing is fully neutralized')
require('.site-footer' in amadeus and 'display:none!important' in normalized_amadeus, 'duplicate native footer is suppressed only after successful V2 mount')
require('background:' not in amadeus and 'color:' not in amadeus and 'font-family' not in amadeus, 'Amadeus adapter remains structural and does not repaint theme or V2 typography')
require('bhm-' not in amadeus, 'minimal adapter does not import legacy presentation selectors')

require('DOMContentLoaded' in loader, 'Edublogs JavaScript tab loader is DOM-ready safe')
require("root.dataset.hrvPage !== PAGE_ID" in loader and "root.dataset.hrvPageSystem !== PAGE_SYSTEM" in loader, 'loader validates semantic mount identity')
for forbidden in ['window.location', '.pathname', 'data-path', 'wp-post', 'page-id']:
    require(forbidden not in loader, f'loader has no slug or WordPress identity dependency: {forbidden}')
require('RELEASE_MANIFEST' in loader and '987069eb6194ecc86c6287b6f7d25d00cdc7ec4c' in loader, 'page-local loader pins the exact current V2 staging manifest')
require('fallback preserved' in loader.lower(), 'loader failure path explicitly preserves native fallback')
require(loader.index('const [content, assets, experience, module] = await Promise.all') < loader.index('await loadStyle(system.style.url)'), 'enhanced CSS loads only after data/module requests succeed')

system = release['pageSystems']['black-hole-museum-v2']
require(release['releasePurpose'] == 'unpublished-v2-staging', 'current V2 release is explicitly staging-only')
require(release['dataFoundation']['mode'] == 'temporary-pinned-seed', 'verified black-hole .2 data is recorded as temporary pinned staging input')
require('v0.1.0-black-hole-lab.2' in system['content']['url'], 'current staging release intentionally seeds from verified black-hole .2 content')
require(release['rollbackRelease'] == '0.2.0-black-hole-v2-lab.7', 'staging .8 rolls back to immutable V2 staging .7')
require(channel['channel'] == 'black-hole-v2-lab', 'V2 has its own isolated channel')
require(channel['currentRelease']['id'] == release['release'], 'V2 staging channel points at current V2 staging release')
require(channel['previousRelease']['id'] == '0.2.0-black-hole-v2-lab.7', 'V2 staging channel retains .7 as its previous checkpoint')

require('v2-owned-copy' in builder, 'future V2 builder publishes V2-owned data copies')
require('black-hole-v2-lab.2' in builder, 'builder examples remain in the V2 release namespace')
require("channels/black-hole-lab.json" not in builder, 'V2 builder cannot write the legacy black-hole-lab channel')
require('v0.1.0-black-hole-lab.2' not in builder, 'future V2 release architecture has no permanent black-hole .2 dependency')

print('\nBlack Hole Museum V2 consequential contract passed.')
