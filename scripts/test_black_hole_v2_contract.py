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
release = json.loads(text('dist/v0.2.0-black-hole-v2-lab.9/release.json'))
experience = json.loads(text('dist/v0.2.0-black-hole-v2-lab.9/content/black-hole-experience.json'))
channel = json.loads(text('channels/black-hole-v2-lab.json'))

# Active-source ownership: one renderer, one interaction file, one runtime,
# one presentation stylesheet, and one narrow compatibility stylesheet.
for required in ['renderer.js', 'interactions.js', 'runtime.js', 'presentation.css', 'amadeus-compat.css']:
    require((SRC / required).is_file(), f'active V2 source owns required file: {required}')
for obsolete in ['experience-layer.css', 'stabilization.css', 'normalization.css', 'stabilization.js']:
    require(not (SRC / obsolete).exists(), f'obsolete patch layer is absent from active V2 source: {obsolete}')
require('multiple correction layers' in archive and 'post-render' in archive, 'anti-pattern archive records why patch layering must not return')

# Renderer owns structure directly, including station-local recovery.
require("RENDERER_VERSION = 'black-hole-v2-0.2.0'" in renderer, 'renderer version identifies consolidated V2 architecture')
for marker in [
    'bhv2-threshold-zone', 'bhv2-atrium-zone', 'bhv2-evidence-gallery',
    'bhv2-theater', 'bhv2-map-wall', 'bhv2-process-track',
    'bhv2-rotunda-bays', 'bhv2-lab-bench', 'bhv2-anatomy-cluster',
    'bhv2-knowledge-boundary', 'bhv2-return-sequence', 'bhv2-quiet-bench'
]:
    require(marker in renderer, f'renderer directly constructs blueprint-specific composition: {marker}')
require('stationFallback' in renderer and 'buildStation' in renderer, 'one failed station can fall back without erasing the entire museum')
require('attachZoomDialog' in renderer and 'Open diagram larger' in renderer, 'labeled scientific diagrams have a readable enlargement path')
require('stabilizeBlackHoleV2' not in renderer, 'renderer has no post-render stabilizer dependency')

# Interaction state belongs to components, not a fixer after mount.
require('copy.hidden = true' in interactions and 'copy.hidden = !expanded' in interactions, 'evidence clues genuinely begin concealed and own their reveal state')
require('bhv2-orbit-trace"><path' in interactions, 'orbit tool uses a traced explanatory path rather than a generic centered ellipse as the primary overlay')
require("classList.toggle('show-comparison')" in interactions, 'orbit comparison overlay is directly owned by the orbit component')
require("const networkControls = el('div', 'bhv2-network-controls')" in interactions, 'Earth network owns its controls and state directly')
require('Compare shadow and horizon' in interactions and 'Doppler beaming' in interactions, 'Warped Light exposes the intended explanatory tools directly')
require('setLayer(0)' in interactions, 'anatomy opens in a valid selected state without post-render repair')

# Runtime preserves the proven performance/accessibility lifecycle.
require("RUNTIME_WINDOW = 'current-plus-one-ahead'" in runtime, 'current-plus-one-ahead runtime budget is preserved')
require("video.preload = 'none'" in runtime and 'video.pause()' in runtime, 'dormant native video is cold and paused')
require('youtube-nocookie.com' in runtime and 'autoplay=0' in runtime and 'controls=1' in runtime, 'YouTube remains privacy-enhanced, lazy, controlled, and non-autoplay')
require('center.contains(activeElement)' in runtime, 'lazy YouTube lifecycle does not destroy a player while focus is inside the Media Center')
require('getAnimations({ subtree: true })' in runtime and 'animation.pause()' in runtime, 'Pause Motion controls ambient Web Animations as well as video')

# Presentation is one canonical authority and carries an explicit human-readable floor.
require('@import' not in presentation, 'canonical V2 presentation contains no nested stylesheet imports')
for token in ['--bhv2-type-body:20px', '--bhv2-type-support:19px', '--bhv2-type-ui:18px', '--bhv2-type-label:17px']:
    require(token in presentation, f'canonical presentation defines human-readable token: {token}')
for old_micro in ['font-size:.68rem', 'font-size:.72rem', 'font-size:.75rem', 'font-size:.76rem', 'font-size:.78rem', 'font-size:.82rem']:
    require(old_micro not in presentation, f'known sub-document-root microtype regression is absent: {old_micro}')
for old_cap in ['width:min(100%,340px)', 'width:min(100%,520px)', 'width:min(100%,760px)']:
    require(old_cap not in presentation.replace(' ', ''), f'old generic module cap is absent: {old_cap}')
require('width:100vw' in presentation.replace(' ', ''), 'repository root still owns the full-width environmental canvas')
require('bhv2-media-dialog' in presentation and 'dialog::backdrop' not in presentation, 'diagram enlargement is styled inside the owned museum surface')
require('@media (max-width:900px)' in presentation and '@media (max-width:700px)' in presentation, 'desktop compositions have explicit responsive collapse editions')
require('@media (prefers-reduced-motion:reduce)' in presentation, 'reduced-motion edition remains explicit')

# Compatibility remains narrow and structural.
require('html.hrv-route-black-hole-v2-ready' in amadeus, 'Amadeus compatibility activates only after successful V2 mount')
require('.site-content > .container' in amadeus and '.content-area' in amadeus, 'adapter neutralizes the proven Amadeus structural constraints')
require('font-family' not in amadeus and 'bhv2-' not in amadeus, 'Amadeus adapter does not own V2 typography or component presentation')

# Experience configuration says only what the current prototype actually supports.
require('reducedData: false' in experience_source and 'profileSelector: false' in experience_source, 'friendly-source experience capabilities no longer advertise unwired controls')
require(experience['publicControls']['motionPause'] is True, 'release experience exposes the implemented motion control')
require(experience['publicControls']['reducedData'] is False, 'release experience does not advertise unimplemented reduced-data control')
require(experience['optionalDiscoveries'] == [], 'release experience does not advertise unimplemented optional discoveries')

# Builder refuses architectural relapse and emits direct owned assets.
for obsolete in ['experience-layer.css', 'stabilization.css', 'normalization.css', 'stabilization.js']:
    require(obsolete in builder and 'Obsolete layered V2 source' in builder, f'builder rejects obsolete active source: {obsolete}')
require("copy(SRC / 'presentation.css', dist / 'black-hole-museum.css')" in builder, 'builder directly copies the canonical presentation stylesheet')
require("copy(SRC / 'amadeus-compat.css', dist / 'amadeus-compat.css')" in builder, 'builder directly owns the narrow compatibility stylesheet')
require("'compatStyle':" in builder, 'release builder declares compatibility CSS explicitly instead of hiding it in presentation CSS')
require('channels/black-hole-lab.json' not in builder, 'V2 builder cannot write the legacy Black Hole channel')

# Edublogs loader and fallback contract.
require("EXPECTED_RELEASE = '0.2.0-black-hole-v2-lab.9'" in loader, 'page-local loader expects consolidated staging .9')
require('6072e7f02f098eb8fe858af7df57b004c822ca70' in loader, 'loader pins the exact immutable .9 release manifest')
require('system?.compatStyle?.url' in loader, 'loader requires the explicit compatibility asset')
require("loadStyle(system.style.url, 'presentation')" in loader and "loadStyle(system.compatStyle.url, 'compatibility')" in loader, 'loader applies presentation then compatibility deliberately')
require(loader.index('const [content, assets, experience, module] = await Promise.all') < loader.index("loadStyle(system.style.url, 'presentation')"), 'enhanced CSS still waits for successful data/module prerequisites')
require('font-size:20px' in fallback_css and 'Atkinson Hyperlegible' in fallback_css and 'Nunito Sans' in fallback_css, 'native fallback matches the intended readable Amadeus typography baseline')

# Current staging release is cleanly pinned and rollback-safe.
system = release['pageSystems']['black-hole-museum-v2']
require(release['releasePurpose'] == 'unpublished-v2-consolidated-staging', 'release identifies itself as consolidated unpublished staging')
require(release['deliveryMode'] == 'clean-source-pinned-staging', 'staging delivery is explicitly immutable clean-source direct, not wrapper/import layering')
require('/apps/black-hole-museum/src/v2/renderer.js' in system['script']['url'], 'staging renderer is the direct consolidated module')
require('/apps/black-hole-museum/src/v2/presentation.css' in system['style']['url'], 'staging presentation is the direct canonical stylesheet')
require('/apps/black-hole-museum/src/v2/amadeus-compat.css' in system['compatStyle']['url'], 'staging compatibility is the direct narrow stylesheet')
require('v0.1.0-black-hole-lab.2' in system['content']['url'] and 'v0.1.0-black-hole-lab.2' in system['assets']['url'], 'verified .2 content/assets remain explicit temporary staging seed')
require('v0.2.0-black-hole-v2-lab.9/content/black-hole-experience.json' in system['experience']['url'], 'V2 staging owns its truthful experience manifest')
require(release['rollbackRelease'] == '0.2.0-black-hole-v2-lab.8', 'consolidated .9 rolls back to immutable .8')
require(channel['currentRelease']['id'] == '0.2.0-black-hole-v2-lab.9', 'V2 channel points at consolidated .9')
require(channel['previousRelease']['id'] == '0.2.0-black-hole-v2-lab.8', 'V2 channel retains .8 as immediate rollback')

print('\nBlack Hole Museum V2 consolidated contract passed.')
