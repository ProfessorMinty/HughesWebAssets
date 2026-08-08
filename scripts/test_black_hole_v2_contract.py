#!/usr/bin/env python3
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'apps/black-hole-museum/src/v2'


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
amadeus = text('apps/black-hole-museum/src/v2/amadeus-compat.css')
archive = text('apps/black-hole-museum/src/v2/Archive of things not to do lol/README.md')
builder = text('scripts/build_black_hole_v2.py')
loader = text('docs/deployment/black-hole-v2-edublogs-javascript.js')
fallback_css = text('docs/deployment/black-hole-v2-edublogs-css.css')
experience_source = text('apps/black-hole-museum/content/black-hole-experience.source.yaml')
release = json.loads(text('dist/v0.2.0-black-hole-v2-lab.10/release.json'))
experience = json.loads(text('dist/v0.2.0-black-hole-v2-lab.10/content/black-hole-experience.json'))
channel = json.loads(text('channels/black-hole-v2-lab.json'))

# Active-source ownership remains consolidated.
for required in ['renderer.js', 'interactions.js', 'runtime.js', 'presentation.css', 'amadeus-compat.css']:
    require((SRC / required).is_file(), f'active V2 source owns required file: {required}')
for obsolete in ['experience-layer.css', 'stabilization.css', 'normalization.css', 'stabilization.js']:
    require(not (SRC / obsolete).exists(), f'obsolete patch layer is absent from active V2 source: {obsolete}')
require('multiple correction layers' in archive and 'post-render' in archive, 'anti-pattern archive records why patch layering must not return')

# Renderer owns the .10 spatial refinement directly.
require("RENDERER_VERSION = 'black-hole-v2-0.3.0'" in renderer, 'renderer version identifies .10 interaction-locality architecture')
for marker in [
    'bhv2-threshold-zone', 'bhv2-atrium-zone', 'bhv2-evidence-gallery',
    'bhv2-theater', 'bhv2-map-wall', 'bhv2-process-track',
    'bhv2-rotunda-bays', 'bhv2-lab-bench', 'bhv2-anatomy-cluster',
    'bhv2-knowledge-boundary', 'bhv2-return-sequence', 'bhv2-quiet-bench'
]:
    require(marker in renderer, f'renderer directly constructs blueprint-specific composition: {marker}')
require('stationFallback' in renderer and 'buildStation' in renderer, 'one failed station can fall back without erasing the entire museum')
require("document.createElement('dialog')" in renderer and 'showModal()' in renderer, 'scientific-media enlargement uses a true viewport dialog')
require('opener?.focus?.({ preventScroll: true })' in renderer, 'dialog close restores focus without moving the underlying page')
require("observation.querySelector('.bhv2-media-frame')?.append(orbit.overlay)" in renderer, 'Orbit overlay is physically owned by the observation viewport')
require('bhv2-myth-controls' in renderer and 'bhv2-myth-detail' in renderer, 'myths use selector plus one stable detail region instead of growing accordions')
require('bhv2-youtube-poster' in renderer and 'bhv2-youtube-play' in renderer, 'Media Center renders authored posters before any third-party iframe')
require('stabilizeBlackHoleV2' not in renderer, 'renderer has no post-render stabilizer dependency')

# Interaction state belongs to components and avoids document-growth explainers.
require('createDetailTray' in interactions, 'reusable stable detail tray is owned inside the interaction layer')
require("copy.setAttribute('aria-hidden', String(!expanded))" in interactions, 'evidence clue disclosure preserves geometry while exposing semantic state')
require('copy.hidden' not in interactions, 'evidence clue reveal no longer removes copy from layout and resizes the card')
require('syncStatus' in interactions and 'Explanatory overlay active' in interactions, 'Orbit reports the combined explanatory overlay state locally')
require('bhv2-reconstruction-details' in interactions and 'Why several versions?' in interactions and 'Why orange?' in interactions, 'Reconstruction explanations share one stable detail tray')
require('bhv2-reconstruction-explainers' not in interactions, 'old Reconstruction expanding explainer stack is absent')
require('bhv2-warp-details' in interactions and 'Viewing angle' in interactions and 'Brightness' in interactions and 'Shadow vs horizon' in interactions, 'Warped Light explanations share one stable detail tray')
require('bhv2-lab-explainer' not in interactions, 'old Warped Light expanding explainer is absent')
require('setLayer(0)' in interactions, 'Anatomy opens in a valid selected state without post-render repair')

# Runtime preserves performance/motion behavior and requires explicit Play for YouTube.
require("RUNTIME_WINDOW = 'current-plus-one-ahead'" in runtime, 'current-plus-one-ahead native-media budget is preserved')
require("video.preload = 'none'" in runtime and 'video.pause()' in runtime, 'dormant native video is cold and paused')
require('youtube-nocookie.com' in runtime and 'autoplay=0' in runtime and 'controls=1' in runtime, 'YouTube remains privacy-enhanced, controlled, and non-autoplay')
require("play.addEventListener('click', onPlay)" in runtime, 'YouTube iframe creation requires explicit visitor Play action')
require('activateFrame(frame)' in runtime and 'entry.isIntersecting &&' not in runtime, 'viewport proximity does not auto-create YouTube iframes')
require('frame.__bhv2Poster' in runtime and 'restorePoster(frame)' in runtime, 'authored poster is restorable after a sleeping player')
require('center.contains(activeElement)' in runtime, 'player lifecycle does not destroy an iframe while focus is inside the Media Center')
require('getAnimations({ subtree: true })' in runtime and 'animation.pause()' in runtime, 'Pause Motion controls ambient Web Animations as well as video')

# Presentation remains one canonical authority, keeps .9 readability, and fixes .10 geometry at the owner.
require('@import' not in presentation, 'canonical V2 presentation contains no nested stylesheet imports')
for token in ['--bhv2-type-body:20px', '--bhv2-type-support:19px', '--bhv2-type-ui:18px', '--bhv2-type-label:17px']:
    require(token in presentation, f'canonical presentation preserves readable token: {token}')
normalized = presentation.replace(' ', '')
require('width:100%;' in normalized, 'repository root fills its already-neutralized Amadeus parent')
require('width:100vw' not in normalized and 'margin-left:-50vw' not in normalized and 'margin-right:-50vw' not in normalized, 'viewport breakout math that can create WordPress scrollbar overflow is absent')
require('.bhv2-theater{width:min(100%,64rem)' in normalized, 'Orbit theater is bounded so controls and consequence coexist at reference desktop')
require('.bhv2-orbit-overlay{position:absolute;inset:0;width:100%;height:100%' in normalized, 'Orbit overlay is registered to the actual media viewport')
require('.bhv2-detail-tray' in presentation and '.bhv2-warp-details .bhv2-detail-tray' in presentation, 'stable explanation trays reserve geometry instead of growing the document')
require('.bhv2-clue.is-open .bhv2-clue-copy' in presentation and 'visibility:visible' in presentation, 'Gravity reveal swaps visibility inside fixed clue geometry')
require('.bhv2-media-dialog' in presentation and 'position:fixed' in presentation and '::backdrop' in presentation, 'diagram/context dialogs are viewport-local and top-layer styled')
require('.bhv2-youtube-poster' in presentation and '.bhv2-youtube-play' in presentation, 'Media Center poster-first state is fully styled')
for old_micro in ['font-size:.68rem', 'font-size:.72rem', 'font-size:.75rem', 'font-size:.76rem', 'font-size:.78rem', 'font-size:.82rem']:
    require(old_micro not in presentation, f'known sub-document-root microtype regression is absent: {old_micro}')
require('@media (max-width:900px)' in presentation and '@media (max-width:700px)' in presentation, 'desktop compositions retain explicit responsive collapse editions')
require('@media (prefers-reduced-motion:reduce)' in presentation, 'reduced-motion edition remains explicit')

# Compatibility remains narrow and structural.
require('html.hrv-route-black-hole-v2-ready' in amadeus, 'Amadeus compatibility activates only after successful V2 mount')
require('.site-content > .container' in amadeus and '.content-area' in amadeus, 'adapter neutralizes the proven Amadeus structural constraints')
require('font-family' not in amadeus and 'bhv2-' not in amadeus, 'Amadeus adapter does not own V2 typography or component presentation')

# Experience configuration remains truthful.
require('reducedData: false' in experience_source and 'profileSelector: false' in experience_source, 'friendly-source experience capabilities do not advertise unwired controls')
require(experience['publicControls']['motionPause'] is True, 'release experience exposes the implemented motion control')
require(experience['publicControls']['reducedData'] is False, 'release experience does not advertise unimplemented reduced-data control')
require(experience['optionalDiscoveries'] == [], 'release experience does not advertise unimplemented optional discoveries')

# Builder refuses architectural relapse and emits direct owned assets.
for obsolete in ['experience-layer.css', 'stabilization.css', 'normalization.css', 'stabilization.js']:
    require(obsolete in builder and 'Obsolete layered V2 source' in builder, f'builder rejects obsolete active source: {obsolete}')
require("copy(SRC / 'presentation.css', dist / 'black-hole-museum.css')" in builder, 'builder directly copies the canonical presentation stylesheet')
require("copy(SRC / 'amadeus-compat.css', dist / 'amadeus-compat.css')" in builder, 'builder directly owns the narrow compatibility stylesheet')
require("'compatStyle':" in builder, 'release builder declares compatibility CSS explicitly')
require('channels/black-hole-lab.json' not in builder, 'V2 builder cannot write the legacy Black Hole channel')

# Edublogs loader and fallback contract, including read-only integration evidence.
require("EXPECTED_RELEASE = '0.2.0-black-hole-v2-lab.10'" in loader, 'page-local loader expects staging .10')
require('e658e5e74950380772fc456fdb3f24a064eed730' in loader, 'loader pins the exact immutable .10 release manifest')
require('system?.compatStyle?.url' in loader, 'loader requires the explicit compatibility asset')
require("loadStyle(system.style.url, 'presentation')" in loader and "loadStyle(system.compatStyle.url, 'compatibility')" in loader, 'loader applies presentation then compatibility deliberately')
require(loader.index('const [content, assets, experience, module] = await Promise.all') < loader.index("loadStyle(system.style.url, 'presentation')"), 'enhanced CSS still waits for successful data/module prerequisites')
require('__HRV_BLACK_HOLE_V2_DIAGNOSTICS__' in loader and 'overflowElements' in loader and 'ownershipTextMatches' in loader, 'unpublished loader records integration ownership evidence without a visual patch')
require('Explorations Hub Home' in loader and 'Next Exploration' in loader, 'diagnostic explicitly searches for the unexplained teal Explorations tail')
require('style.overflow' not in loader and "classList.add('hrv-route-black-hole-v2-ready')" in loader, 'diagnostic does not hide overflow or mutate third-party chrome')
require('font-size:20px' in fallback_css and 'Atkinson Hyperlegible' in fallback_css and 'Nunito Sans' in fallback_css, 'native fallback matches intended readable Amadeus typography baseline')

# Current staging release is cleanly pinned and rollback-safe.
system = release['pageSystems']['black-hole-museum-v2']
require(release['releasePurpose'] == 'unpublished-v2-refinement-staging', 'release identifies itself as .10 refinement staging')
require(release['deliveryMode'] == 'clean-source-pinned-staging', 'staging delivery stays direct and immutable, not wrapper/import layering')
require(release['commit'] == release['immutableRef'] == 'b4eef573a9f11a5f54ce99cfe60e2bc63059d271', 'release provenance points to the exact .10 payload snapshot')
require('/apps/black-hole-museum/src/v2/renderer.js' in system['script']['url'], 'staging renderer is the direct canonical module')
require('/apps/black-hole-museum/src/v2/presentation.css' in system['style']['url'], 'staging presentation is the direct canonical stylesheet')
require('/apps/black-hole-museum/src/v2/amadeus-compat.css' in system['compatStyle']['url'], 'staging compatibility is the direct narrow stylesheet')
require('v0.1.0-black-hole-lab.2' in system['content']['url'] and 'v0.1.0-black-hole-lab.2' in system['assets']['url'], 'verified .2 content/assets remain explicit temporary staging seed')
require('v0.2.0-black-hole-v2-lab.10/content/black-hole-experience.json' in system['experience']['url'], 'V2 .10 owns its truthful experience manifest')
require(release['visualPreflight']['orbitTheaterHeightPxAt1920x1032'] < 900, 'release records an Orbit theater that fits within the reference desktop viewport')
for metric in ['gravityRevealDocumentShiftPx', 'reconstructionDetailDocumentShiftPx', 'warpedLightDetailDocumentShiftPx', 'mythDetailDocumentShiftPx', 'dialogDocumentShiftPx']:
    require(release['visualPreflight'][metric] == 0, f'local Chromium preflight records zero document shift for {metric}')
require(release['visualPreflight']['mediaCenterIframesBeforeExplicitPlay'] == 0, 'local Chromium preflight records poster-first Media Center')
require(release['rollbackRelease'] == '0.2.0-black-hole-v2-lab.9', '.10 rolls back directly to immutable .9')
require(channel['currentRelease']['id'] == '0.2.0-black-hole-v2-lab.10', 'V2 channel points at .10')
require(channel['currentRelease']['immutableRef'] == 'e658e5e74950380772fc456fdb3f24a064eed730', 'V2 channel pins the immutable .10 manifest')
require(channel['previousRelease']['id'] == '0.2.0-black-hole-v2-lab.9', 'V2 channel retains .9 as immediate rollback')

print('\nBlack Hole Museum V2 .10 refinement contract passed.')
