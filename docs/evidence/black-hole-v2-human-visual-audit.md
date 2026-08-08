# Black Hole Museum V2 — Canonical Human Visual Audit and Defect Ledger

**Audit date:** 2026-08-08  
**Branch:** `feature/black-hole-presentation-v2`  
**Current staging baseline:** `0.2.0-black-hole-v2-lab.8`  
**Audit status:** **IMPLEMENTATION FREEZE — DO NOT CUT `.9` UNTIL THE P0/P1 EXIT GATES IN THIS DOCUMENT ARE SATISFIED**  
**Purpose:** Replace screenshot-by-screenshot patching with one durable source of truth for visual, interaction, architectural, accessibility, packaging, and blueprint-conformance defects.

---

## 0. Why this document exists

The Black Hole Museum reached a useful visual direction in staging `.6`, but subsequent `.7` and `.8` work was handled as a sequence of local corrections. That process allowed known systemic problems to survive and created new overlapping override layers.

This document ends that workflow.

From this point forward:

1. A problem is not considered solved because a CSS value changed.
2. A problem is solved only when the **rendered page**, at the target human viewing conditions, satisfies the acceptance condition recorded here.
3. User-provided preview evidence is treated as primary integration evidence. Code inspection is supporting evidence, not a substitute for seeing the rendered result.
4. No new presentation override layer may be added to solve this ledger.
5. The next implementation pass must consolidate the current presentation stack and repair root ownership before aesthetic refinement resumes.
6. The user should not have to rediscover and relist defects that are already recorded here.

---

## 1. Governing authorities

This audit uses the following project authorities, in order of responsibility:

### 1.1 Revised Arctic Preferred Maximum-Shelf Experience Blueprint

Controls the intended emotional journey, chamber identity, maximum-shelf visual experience, station-specific behavior, desktop/tablet/phone behavior, and signature moments.

Key controlling statements:

- The page should feel like a private wing inside a major science museum, **not an article decorated with animated cards**.
- The full-width environmental canvas is continuous.
- Reading widths stay comfortable while environmental staging and major artifacts may use broad space.
- Real observations are major artifacts.
- Stations are distinct rooms with different spatial scale, light, and evidence type.
- Signature moments are separated by quieter areas.

### 1.2 Black Hole Research and Creative Planning Package

Controls scientific claims, media classifications, asset identity, credit, and the distinction among observation, scientific visualization, diagram, creative interpretation, and proposed effect.

### 1.3 Repository Architecture and Manifest Standard

Controls ownership, fallback, compatibility boundaries, release generation, testing, visual evidence, accessibility, and rollback.

Especially relevant to this audit:

- Repository foundation/component/page/compatibility responsibilities must remain distinct.
- Compatibility styling is theme-specific and narrow.
- Emergency overrides are temporary and should be removed in the next proper release.
- Distribution files are generated artifacts.
- Visual evidence is part of the acceptance package.
- A test is not a reusable standard until it survives real failure and accessibility tests.

### 1.4 Native Amadeus baseline

The intentional native foundation is:

- body: Atkinson Hyperlegible
- headings: Nunito Sans
- native body size target: 20px
- light neutral native surfaces
- dark teal native headings/text

Repository pages own their complete presentation inside the runtime root, but should preserve the readability philosophy of the native foundation.

---

## 2. Evidence set and truth labels

### 2.1 Private integration evidence

The following evidence was supplied during real Edublogs preview testing and is **not committed to the public repository** because captures include account/admin chrome:

- **E1 — staging `.6` full-page video**, approximately 1920×1032 viewport capture, 116.6 seconds.
- **E2 — staging `.7` annotated screenshots**, identifying tiny text, prematurely revealed clue content, undersized scientific media, unclear tools, and awkward station composition.
- **E3 — staging `.8` user report**, confirming that some text became perceptually smaller and that previously discussed problems continued to slip through local fixes.

### 2.2 Source evidence

- **S1:** Revised Arctic Preferred Maximum-Shelf Experience Blueprint.
- **S2:** Black Hole Research and Creative Planning Package.
- **S3:** Repository Architecture and Manifest Standard.
- **S4:** Current V2 renderer, interactions, runtime, styles, release wrappers, builder, tests, channel, and architecture documentation.

### 2.3 Evidence labels used in this ledger

- **CONFIRMED-RENDER:** directly visible in private preview evidence.
- **CONFIRMED-SOURCE:** directly verifiable in current repository source/configuration.
- **USER-CURRENT:** reported by the user against the current `.8` preview but not yet independently captured in a new full-page `.8` recording.
- **INFERENCE:** a reasoned conclusion from confirmed rendering plus confirmed source. Must be validated in the next preview.

---

## 3. Primary root causes

These are not cosmetic defects. They are the reasons local corrections kept failing to produce a stable page.

### RC-01 — Presentation authority is fragmented across four overlapping CSS systems

**Severity:** P0  
**Evidence:** CONFIRMED-SOURCE

Current `.8` CSS loads, in order:

1. `presentation.css`
2. `experience-layer.css`
3. `stabilization.css`
4. `normalization.css`
5. `amadeus-compat.css`

The first four files all change page/component presentation. They repeatedly target the same selectors, sometimes with `!important`.

This means `.8` is not one deliberate presentation system. It is the result of four style authorities negotiating through cascade order.

**Why this matters to humans:** A value can be numerically increased in one file while the final visual proportion becomes worse because another layer changes container size, spacing, weight, contrast, or a more specific rule. Code review alone becomes unreliable.

**Required correction:** Fold all verified presentation decisions into one canonical V2 presentation/component system. `stabilization.css` and `normalization.css` must cease to be permanent styling authorities. The Amadeus adapter remains separate and structural.

**Exit criterion:** The generated release has one canonical repository presentation stylesheet plus one narrow compatibility stylesheet. No emergency presentation override layer is required.

---

### RC-02 — A post-render JavaScript patcher has reappeared

**Severity:** P0  
**Evidence:** CONFIRMED-SOURCE

`stabilization.js` mutates the finished page after the clean renderer mounts. It:

- changes Orbit labels,
- inserts Orbit helper text,
- resets clue states,
- initializes Anatomy by programmatically clicking a control,
- watches Earth state,
- synchronizes Warped Light controls.

This is small compared with the legacy compositor, but it recreates the same ownership smell: renderer/component behavior is incomplete, then repaired after render.

**Required correction:** Move each behavior to the component that owns it in `interactions.js` or to direct renderer construction. Retire `stabilization.js` as a post-render correction layer.

**Exit criterion:** Renderer output is already in its correct initial semantic and visual state before runtime helpers attach.

---

### RC-03 — “Human scale” was interpreted as aggressive component caps rather than readable spatial composition

**Severity:** P0  
**Evidence:** CONFIRMED-RENDER + CONFIRMED-SOURCE

The clean rebuild intentionally introduced caps such as approximately 340px, 520px, and 760px. In practice, those caps turned major scientific artifacts into support-sized objects on a ~1920px desktop.

Examples from source:

- generic standard module cap: 520px
- small module cap: 340px
- Twin-Ring artifact cards: 34rem max
- telescope map: originally 600px max
- evidence reference: originally forced into a 260–390px column

The doctrine **“full width belongs to atmosphere; human-scale compositions live inside it”** was sound, but its implementation became too restrictive.

**Revised interpretation:**

- prose has a human reading measure;
- controls have ergonomic bounds;
- **major artifacts are allowed to be large**;
- a full-width museum may devote 50–80% of a local 1400–1500px composition zone to a primary artifact when the blueprint calls for it;
- human scale does not mean thumbnail scale.

**Exit criterion:** No signature scientific artifact reads as a thumbnail or small card at the reference desktop viewport.

---

### RC-04 — The implementation uses a repeated “header plaque + card grid” grammar where the blueprint requires different rooms

**Severity:** P0  
**Evidence:** CONFIRMED-RENDER + S1

The `.6` full-page capture shows many stations using the same visual grammar:

- thin `EXHIBIT NN` banner,
- large rectangular section header plaque,
- rectangular cards below,
- similar radii/borders/material treatment.

Background color changes, but spatial storytelling changes much less.

The blueprint explicitly rejects an article decorated with animated cards and specifies a threshold, atrium, evidence gallery, theater, planetary hall, reconstruction corridor, rotunda, laboratory, quiet gallery, and boundary chamber.

**Required correction:** Keep shared accessibility and material tokens, but give each station a composition primitive appropriate to its role. Repetition should create continuity, not flatten every room into the same template.

**Exit criterion:** A grayscale/full-page screenshot still makes Stations 02–10 visibly distinguishable by spatial composition, not merely color.

---

### RC-05 — The blueprint/component map is only partially implemented

**Severity:** P0  
**Evidence:** CONFIRMED-SOURCE + S1

The earlier component map named meaningful station components and global capabilities. Many were never implemented, or were collapsed into generic cards.

Examples:

- no real `ReducedDataControl`
- no `DiagnosticsDock`
- no implemented profile selector despite profiles 0–5 being present in the experience manifest
- no `StationErrorBoundary` / per-station static fallback
- no real optional discovery system
- incomplete Orbit toolset
- incomplete EHT observatory detail/synchronization behavior
- incomplete reconstruction explanations and transition
- incomplete Twin-Ring rotunda controls and quiet-bench behavior
- incomplete Warped Light explanatory overlays
- incomplete final boundary/return-to-observers architecture

**Exit criterion:** Each station’s required component list is reconciled explicitly as Implemented / Intentionally Deferred / Replaced by approved equivalent. No silent omission.

---

### RC-06 — The experience manifest currently advertises capabilities the renderer does not implement

**Severity:** P1  
**Evidence:** CONFIRMED-SOURCE

`black-hole-experience.source.yaml` declares:

- profiles 0–5,
- maximum-shelf default profile,
- motion pause,
- reduced data,
- station navigation,
- lab profile selector,
- forced reduced motion,
- reflection disabling,
- essential mode,
- diagnostics,
- optional discoveries.

The renderer currently uses `defaultProfile` primarily as a data attribute. Most declared capabilities are not wired into behavior.

This is dangerous because configuration looks authoritative while the browser does something else.

**Required correction:** Either implement the declared controls/capabilities or simplify the manifest to truthful implemented capability until they exist.

**Exit criterion:** No experience-manifest control exists without a corresponding implemented and tested behavior.

---

### RC-07 — Release packaging bypassed the intended builder and is not self-contained

**Severity:** P0 architecture/reliability  
**Evidence:** CONFIRMED-SOURCE

The canonical builder currently knows only the original clean V2 source set and combines only `presentation.css + amadeus-compat.css`.

Staging `.8` was hand-packaged instead:

- its CSS artifact is a short list of CDN `@import`s into source files;
- its JS artifact is a wrapper that imports renderer and stabilization code from the source commit.

Consequences:

- the release manifest hashes the wrapper files, not the full nested dependency content;
- multiple additional CDN requests are required;
- partial nested-import failure can produce a partially styled page;
- builder verification does not represent the actual staging architecture;
- the intended generated-release discipline has drifted.

**Required correction:** Update the builder to generate the actual final V2 package. Build a self-owned release from friendly source, not hand-authored dist wrappers.

**Exit criterion:** One reproducible builder invocation produces every V2 runtime/style/data artifact used by the preview, and verification hashes cover the delivered artifacts directly.

---

### RC-08 — Current automated checks validate code strings, not what a human sees

**Severity:** P0 process  
**Evidence:** CONFIRMED-SOURCE

The contract test checks selectors, source markers, release ids, and architecture assertions. It does not render the page and judge:

- perceived text size,
- artifact dominance,
- dead space,
- baked-in diagram label legibility,
- overlap/clipping,
- visual hierarchy,
- section rhythm.

Worse, later tests were updated to require the stabilization/normalization layers instead of treating those layers as temporary debt. The guardrail began preserving the workaround.

**Required correction:** Add deterministic rendered visual QA as a release gate. Contract tests remain, but cannot approve visual readiness alone.

**Exit criterion:** A release candidate has captured and reviewed reference renders at desktop/tablet/phone plus zoom/reflow states before it is handed to the user.

---

### RC-09 — Typography has been judged by numeric CSS values instead of perceived desktop readability

**Severity:** P0 visual/readability  
**Evidence:** CONFIRMED-RENDER + USER-CURRENT + CONFIRMED-SOURCE

At a 1920px-wide viewport, the root formula is approximately 18.69 CSS px. This makes common rem sizes approximately:

| Rule | Approx. rendered size at 1920px |
|---|---:|
| `.72rem` | 13.5px |
| `.76rem` | 14.2px |
| `.78rem` | 14.6px |
| `.82rem` | 15.3px |
| `.84rem` | 15.7px |
| `.86rem` | 16.1px |
| `.90rem` | 16.8px |
| `.94rem` | 17.6px |
| `1rem` | 18.7px |

The native Amadeus baseline was intentionally set to 20px body. The V2 museum currently allows important labels, classifications, captions, wayfinding, and site controls far below that perceptual baseline.

Concrete remaining example after `.8`: `.bhv2-site` is still forced to `.72rem!important` in `stabilization.css`, approximately 13.5px at this viewport.

**Important:** This is a project readability failure, not a claim that WCAG specifies a minimum font size. WCAG does not provide a universal minimum font-size number.

**Required correction:** Establish a human-reviewed typographic scale for the target desktop viewing distance. Essential labels/classifications must not be treated as micro-garnish.

**Exit criterion:** At the controlled desktop reference viewport and 100% browser zoom, every meaningful label/caption/control is comfortably readable without leaning toward the screen or zooming the browser.

---

### RC-10 — Scientific media with baked-in labels are being treated like ordinary responsive images

**Severity:** P1 visual/scientific comprehension  
**Evidence:** CONFIRMED-RENDER + CONFIRMED-SOURCE

Some authoritative diagrams contain important labels inside the image itself. CSS can enlarge the DOM caption but cannot enlarge those embedded labels independently.

Displaying these assets at 390–500px can make their internal annotations unreadable despite loading high-resolution derivatives.

**Required correction:** Each labeled scientific diagram must have one of:

- a sufficiently large pedestal,
- a deliberate zoom/detail viewer,
- an accessible cropped/detail sequence,
- or a companion DOM explanation that reproduces essential label meaning.

**Exit criterion:** Embedded labels that are needed for understanding can actually be read at normal desktop viewing conditions, or the same information is provided adjacent in readable HTML.

---

### RC-11 — Architecture documentation is stale and contradicts the running staging system

**Severity:** P1  
**Evidence:** CONFIRMED-SOURCE

`docs/architecture/black-hole-museum-v2.md` still documents `.5` as current and lists only the original clean source island. It does not document the later experience/stabilization/normalization stack.

It also describes the compatibility adapter as not affecting the site footer, while the current adapter intentionally suppresses `.site-footer` on the V2 route after successful mount.

**Required correction:** After the consolidation pass, rewrite architecture documentation to describe the architecture that actually ships, not the architecture that used to exist.

---

## 4. Human visual acceptance protocol

This protocol is deliberately separate from code/unit tests.

### 4.1 Reference desktop view

Primary visual review target:

- viewport: approximately **1920×1032 CSS pixels** or the closest repeatable browser viewport
- browser zoom: **100%**
- normal desktop viewing distance
- enhanced V2 mounted successfully
- motion enabled for default pass

A second desktop check should use approximately 1440×900 to catch overly optimistic large-screen composition.

### 4.2 Human readability rule

Pass only if:

- body/support copy is immediately readable;
- classification badges can be read without zoom;
- prototype/dummy-content warnings are clearly readable because they are meaningful provenance;
- media captions/credits are readable;
- control labels are readable and states obvious;
- no important text relies on tiny all-caps treatment;
- no diagram depends on baked-in labels that are unreadable at its staged size.

### 4.3 Spatial hierarchy rule

For every station, a reviewer should be able to answer within roughly two seconds:

1. What is the primary artifact or action?
2. What is supporting explanation?
3. Where does the next section begin?

Fail if the eye first lands on empty space, generic framing, or a minor metadata element.

### 4.4 Primary artifact rule

When the blueprint calls an item a major artifact, theater screen, world map, rotunda object, or centerpiece, it must visibly dominate its station.

Fail if a historically/scientifically important image is staged like a thumbnail or support card.

### 4.5 Zoom and reflow rule

WCAG 2.2 requires text to resize to 200% without loss of content/functionality, and ordinary content to reflow without two-dimensional scrolling at the equivalent narrow viewport. W3C also documents clipping/truncation from `overflow:hidden` and constrained containers as a failure pattern.

References:

- https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
- https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- https://www.w3.org/WAI/WCAG22/Techniques/failures/F69.html
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

Project test:

- 100% visual reference
- 200% zoom/text resize, no clipped or lost text/function
- 400%/320-CSS-px-equivalent reflow check where applicable
- keyboard-only
- reduced motion
- reduced data once implemented

### 4.6 User QA burden rule

The user is not the defect-discovery system.

Before presenting a new staging release for feedback, the implementer must review the entire page against this ledger and report remaining known defects. User feedback should be used for final judgment/taste and newly discovered integration behavior, not to repeatedly rediscover already documented failures.

---

## 5. Global visual/component defect ledger

Status values: `OPEN`, `BLOCKED BY CONSOLIDATION`, `VERIFY AFTER CONSOLIDATION`, `PASS`.

| ID | Severity | Defect | Evidence | Owner | Acceptance | Status |
|---|---|---|---|---|---|---|
| G-01 | P0 | Meaningful microcopy is too small at desktop scale | E1/E2/E3 + source | Typography system | All meaningful text comfortably readable at reference desktop | OPEN |
| G-02 | P0 | Too many primary artifacts are capped to support-card dimensions | E1/E2 + source | Composition system | Major artifacts visually dominate intended stations | OPEN |
| G-03 | P0 | Repeated plaque/card grammar flattens distinct chambers | E1 + blueprint | Page composition | Stations distinguishable by spatial structure, not only color | OPEN |
| G-04 | P1 | `EXHIBIT NN` banner plus section-number plaque duplicates hierarchy | E1 | Section architecture | One intentional station threshold system; no redundant competing numbering | OPEN |
| G-05 | P1 | Wayfinding is tiny numeric-only navigation | E1 + source | Navigation | Legible progress/navigation without relying on hover `title` | OPEN |
| G-06 | P1 | Motion control floats separately and looks detached | E1 | Museum utility controls | Unified, readable utility dock/spine | OPEN |
| G-07 | P1 | Repeated `Look deeper` control creates monotonous template rhythm | E1 | Section copy pattern | Deeper material appears where useful, not mechanically identical in every station | OPEN |
| G-08 | P1 | Card material vocabulary overused; major media still looks like generic cards | E1/E2 | Component materials | Distinguish plaque, pedestal, theater, bay, console, wall label, bench | OPEN |
| G-09 | P1 | Embedded-label diagrams become unreadable when staged small | E2 + asset source | Scientific media viewer | Embedded labels readable or equivalently reproduced in HTML | OPEN |
| G-10 | P1 | Current CSS uses hidden/clipped regions that need zoom testing | source + W3C | Accessibility | 200% text resize and reflow tests pass without clipped content | OPEN |
| G-11 | P1 | No rendered visual regression/acceptance harness | source | Test system | Deterministic desktop/tablet/phone render review exists | OPEN |
| G-12 | P1 | Fallback CSS uses 17px rather than intended 20px native readability baseline | source | Fallback | Fallback is comfortably readable and consistent with native baseline | OPEN |

---

## 6. Station-by-station blueprint audit

### Station 01 — Classroom Threshold

**Blueprint:** A compact classroom recap plaque inside a much larger museum threshold. The classroom wall should feel as though it has opened into the gallery. A next-station aperture/preview creates discovery.

**Current:** Large hero, then a repeated section header and four equal recap cards.

**Defects:**

- **01-01 P1:** Simulated-content warning is visually too small for meaningful provenance. `OPEN`
- **01-02 P1:** Four equal recap cards read as a content grid rather than one threshold plaque. `OPEN`
- **01-03 P1:** No strong gallery aperture / next-chamber preview. `OPEN`
- **01-04 P2:** Threshold transition is more hero-to-section than classroom-wall-to-museum. `OPEN`

**Acceptance:** The recap reads as one familiar classroom object entering a larger environment; provenance is readable; the next chamber is visually promised.

---

### Station 02 — Invisible Sky Atrium

**Blueprint:** Broad, tall, nearly empty chamber. Absence is monumental. Stable title outside distortion area. Explicit controlled lensing reveal; effect settles rather than churns.

**Current:** Stronger than many other stations. Story panel + canvas interactive. It still reads as two modules in a grid more than a large atrium.

**Defects:**

- **02-01 P1:** The atrium interactive does not command enough spatial scale relative to the room concept. `OPEN`
- **02-02 P1:** Classification/effect label is too small in private evidence. `OPEN`
- **02-03 P2:** State change is mostly instantaneous; no purposeful reveal/settle choreography. `OPEN`
- **02-04 P2:** Static explanatory comparison for reduced-motion/clarity is not implemented as a distinct component. `OPEN`

**Acceptance:** The empty center feels like the chamber’s subject; labels remain readable; interaction states are obvious and scientifically framed.

---

### Station 03 — Gravity Leaves Clues

**Blueprint:** **Not an ordinary card grid.** Three major illuminated clue exhibits occupy different positions around an invisible center. A fourth smaller gravitational-wave wall label supports them. Selected clues illuminate and connect back to the center, gradually creating an evidence network.

**Current:** 2×2 equal clue button grid plus one scientific media card.

**Defects:**

- **03-01 P0:** Composition fundamentally contradicts blueprint by using an ordinary 2×2 card grid. `OPEN`
- **03-02 P0:** Evidence-network light connections are missing. `OPEN`
- **03-03 P1:** Three primary clues and the smaller gravitational-wave fact do not have different visual roles. `OPEN`
- **03-04 P1:** Scientific visualization was visibly too small in E2. `.8` changed dimensions but has not been visually verified. `VERIFY AFTER CONSOLIDATION`
- **03-05 P1:** Reveal behavior was patched after render instead of owned by the interaction component. `BLOCKED BY CONSOLIDATION`

**Acceptance:** Desktop uses broad asymmetrical clue placement; selected evidence clearly relates to the invisible center; the fourth clue is supporting rather than equal; reveal state begins genuinely dim/closed.

---

### Station 04 — Star-Orbit Theater

**Blueprint:** Dark theater. Real ESO/MPE time-lapse is brightest artifact. Large theater screen. Toolset includes trace selected star, invisible-center marker, and static/orbit comparison; media remains paused/manual. Time compression is clearly labeled. Theater may dim on playback.

**Current:** Video plus one generic ellipse overlay toggle and sidecar.

**Defects:**

- **04-01 P0:** Orbit overlay is a generic ellipse, not a featured-star tracing experience tied clearly to the observation. `OPEN`
- **04-02 P1:** No featured-star selector. `OPEN`
- **04-03 P1:** No center-marker toggle. `OPEN`
- **04-04 P1:** No static orbit comparison / dated still sequence. `OPEN`
- **04-05 P1:** Tool instructions were added by post-render stabilization code. `BLOCKED BY CONSOLIDATION`
- **04-06 P1:** Side tool in E2 looked like an orphan card rather than an integrated theater console. `OPEN`
- **04-07 P2:** Playback-linked theater-light response not implemented. `OPEN`

**Acceptance:** The observational artifact dominates; tool and artifact feel physically connected; the child can clearly see what changed and why; explanatory overlay is unmistakably separate from the observation.

---

### Station 05 — Earth Becomes One Telescope

**Blueprint:** Second major maximum-shelf signature moment. A dark Earth / world map is the center of a **planetary hall**. Observatory lights activate across continents, with synchronized lines/patterns and contributions to a larger measurement story. Map spans the gallery width. Details are anchored panels, not tiny floating tooltips. Complete-network action produces a wide light-spill moment and settles.

**Current:** Real map card + separate circular abstract Earth with tiny site buttons + explanatory sidecard. `.8` attempts to move explanation under two-column layout, but current visual result is not yet verified.

**Defects:**

- **05-01 P0:** Station does not yet read as a planetary hall / signature moment. `OPEN`
- **05-02 P0:** Map is treated as a normal media card instead of a broad primary map wall. `OPEN`
- **05-03 P1:** Site controls remain forced to `.72rem!important` in current stabilization CSS, approximately 13.5px at the reference 1920px root size. `OPEN`
- **05-04 P1:** No observatory detail panel per selected site. `OPEN`
- **05-05 P1:** Selected observatories do not visibly contribute distinct measurement patterns. `OPEN`
- **05-06 P1:** Synchronization explanation is not a real three-step diagram/component. `OPEN`
- **05-07 P1:** Complete-network state lacks the blueprint’s major room-wide light-spill/settle signature. `OPEN`
- **05-08 P1:** E2 showed awkward sidecard placement. `.8` changes layout but has no visual confirmation. `VERIFY AFTER CONSOLIDATION`

**Acceptance:** The map/network is unmistakably one of the page’s major moments, labels are readable, touch targets are comfortable, and “many places become one instrument” is understandable before reading a paragraph.

---

### Station 06 — Reconstruction Corridor

**Blueprint:** Narrower corridor of measurement fragments, timing/frequency marks, representative reconstructions, and progressive image formation. Three conceptual stages. Explicit controls: **Why are there several versions?** and **Why orange?** Signature transition resolves toward the real historic ring.

**Current:** Three process cards, procedural CSS visual with three states, one reference image.

**Defects:**

- **06-01 P0:** Current generic cards + two-panel layout does not create a reconstruction corridor/progression. `OPEN`
- **06-02 P1:** “Why are there several versions?” control missing. `OPEN`
- **06-03 P1:** “Why orange?” control missing. `OPEN`
- **06-04 P1:** Measurement/timing/frequency visual vocabulary largely missing. `OPEN`
- **06-05 P1:** Signature resolve toward historic ring missing. `OPEN`
- **06-06 P1:** Procedural reconstruction state can be mistaken for scientific data unless its creative/simplified role is made more explicit. `OPEN`
- **06-07 P1:** E2 showed stranded/awkward pair placement. `.8` changes to equal columns but is not visually verified. `VERIFY AFTER CONSOLIDATION`

**Acceptance:** The child experiences a clear data → possible reconstructions → published result story and can answer both “why several?” and “why orange?” without hunting.

---

### Station 07 — Twin-Ring Rotunda

**Blueprint:** Largest and most ceremonial chamber. M87* and Sgr A* are **monumental illuminated bays**, not thumbnails/cards. Default view gives each artifact room. Quiet bench follows. Optional controls include separate/compare/context/date/wavelength/scale/why-SgrA-hard/why-orange.

**Current:** Two media cards capped at ~34rem plus comparison controls and small optional context/scale cards.

**Defects:**

- **07-01 P0:** Historic observations are staged as medium cards rather than monumental scientific artifacts. CONFIRMED in E1. `OPEN`
- **07-02 P0:** Rotunda does not use the broad ceremonial space described by blueprint. `OPEN`
- **07-03 P1:** No quiet-bench/still viewing beat. `OPEN`
- **07-04 P1:** Observation date control missing. `OPEN`
- **07-05 P1:** Radio wavelength control missing. `OPEN`
- **07-06 P1:** Why Sgr A* was harder to image control missing. `OPEN`
- **07-07 P1:** Why orange control missing. `OPEN`
- **07-08 P1:** Optional context/scale media are capped to small-module dimensions and risk unreadable embedded labels. `OPEN`

**Acceptance:** At desktop scale, the two EHT observations feel like the artifacts the entire earlier narrative earned. Neither reads as a thumbnail. The chamber includes a calm viewing state.

---

### Station 08 — Warped Light Laboratory

**Blueprint:** Richest interactive station. Technical laboratory with angle controls, photon paths, Doppler explanation, shadow/event-horizon overlay, persistent scientific-visualization classification, and optics transformation.

**Current:** Angle slider/presets, simplified accretion model, photon-path toggle, one companion diagram, three small support gallery cards.

**Defects:**

- **08-01 P1:** Doppler-beaming explanation/tool is missing as a distinct interaction/explanation. `OPEN`
- **08-02 P1:** Shadow vs event-horizon overlay is missing. `OPEN`
- **08-03 P1:** Optics diagram transformation is not implemented as the blueprint’s explanatory transition. `OPEN`
- **08-04 P1:** Support gallery is visually small at desktop scale in E1. `OPEN`
- **08-05 P1:** Companion labeled diagram may have unreadable baked-in labels at current card scale. `OPEN`
- **08-06 P2:** Preset/slider state synchronization was repaired post-render and must move into component ownership. `BLOCKED BY CONSOLIDATION`

**Acceptance:** This is visibly the richest working laboratory, but comprehension increases with interaction rather than merely adding spectacle.

---

### Station 09 — Shadow and Myth Gallery

**Blueprint:** Quieter clarity chamber. Anatomy layer viewer plus myth corrections. Lower intensity after Warped Light. Clear distinction among event horizon, photon region, apparent shadow, and bright emission.

**Current:** Anatomy CSS diagram + 2×2 myth details grid.

**Defects:**

- **09-01 P1:** Myth grid is visually dense/small in E1. `OPEN`
- **09-02 P1:** Current anatomy initialization is repaired through stabilization JS. `BLOCKED BY CONSOLIDATION`
- **09-03 P1:** Layer legend/static explanatory sequence is weak or absent. `OPEN`
- **09-04 P2:** The chamber still reads strongly as cards rather than a calmer interpretation gallery. `OPEN`

**Acceptance:** Anatomy is immediately understandable, myth corrections are easy to scan, and the chamber feels calmer without feeling visually abandoned.

---

### Media Center

**Blueprint/architecture intent:** Optional normal 16:9 players, no autoplay, lounge treatment, never the primary climax.

**Current:** Two privacy-enhanced lazy YouTube players, normal aspect, no autoplay, lounge styling.

**Defects:**

- **MC-01 P2:** Typography/readability must be included in global scale audit. `OPEN`
- **MC-02 P2:** Verify lazy iframe removal/recreation does not create disruptive focus/state loss. `OPEN`

**Acceptance:** Comfortable optional stop; readable metadata; no autoplay; keyboard/focus behavior stable.

---

### Station 10 — Edge of the Known / Return to Observers

**Blueprint:** Boundary chamber where architecture itself marks observational limits, followed by a cosmic pullback and a return to real observers/telescope dishes. Closing emotion is humility and human curiosity, not another card grid.

**Current:** Known/unknown panels rendered as many pill-like paragraphs, three small evidence media cards, closing line, then credits.

**Defects:**

- **10-01 P0:** Luminous event-horizon/knowledge boundary architecture is missing. `OPEN`
- **10-02 P0:** Cosmic pullback is not a strong visual transition. `OPEN`
- **10-03 P0:** Return-to-observers photographic ending is not staged as a signature closing pedestal/moment. `OPEN`
- **10-04 P1:** Known/unknown content is presented as many small pills, which reduces readability and gravity of the section. `OPEN`
- **10-05 P1:** Evidence pullback media are small-module cards. `OPEN`
- **10-06 P1:** Ending currently flows into dense credits without enough emotional decompression. `OPEN`

**Acceptance:** The page visibly reaches a boundary, then pulls back to human observation. The closing is memorable before credits begin.

---

### Credits ledger

**Role:** Calm provenance, not another high-density exhibit.

**Defects:**

- **CR-01 P1:** Three-column credit cards produce dense small text on desktop in E1. `OPEN`
- **CR-02 P1:** Evidence classifications inside every credit card add visual density after they already appeared at exhibit locations. `OPEN`
- **CR-03 P2:** Credits need a calmer progressive disclosure/grouping strategy while keeping all rights/source information available. `OPEN`

**Acceptance:** All credits remain complete and linked, but the final page does not end in a wall of tiny equal-weight cards.

---

## 7. Interaction and semantic defect ledger

| ID | Severity | Defect | Acceptance | Status |
|---|---|---|---|---|
| I-01 | P0 | Evidence initial/reveal state belongs to post-render patch | Component creates correct closed state directly | OPEN |
| I-02 | P1 | Orbit trace is generic and not a full featured-star tool | Clear selected-star trace + center explanation | OPEN |
| I-03 | P1 | Earth site selection lacks detail/contribution model | Each site has readable anchored detail and visible contribution | OPEN |
| I-04 | P1 | Reconstruction lacks explanatory why-several/why-orange controls | Both explanations directly accessible | OPEN |
| I-05 | P1 | Comparison feature implements only subset of blueprint controls | Reconcile required controls explicitly | OPEN |
| I-06 | P1 | Warped Light lacks key explanatory overlays | Doppler + shadow/horizon + optics explanation available | OPEN |
| I-07 | P1 | Experience profiles/controls are declared but mostly inert | Manifest and behavior truthful and synchronized | OPEN |
| I-08 | P1 | No per-station error boundary/static station fallback | One broken station does not collapse whole enhanced experience | OPEN |
| I-09 | P1 | No reduced-data user control despite declared support | Reduced-data edition is implemented or declaration removed | OPEN |
| I-10 | P1 | No diagnostics dock despite lab declaration | Lab can expose release/resource/runtime diagnostics without public clutter | OPEN |

---

## 8. Accessibility/readability risks requiring explicit tests

These are **risks**, not claims of WCAG failure until tested.

### A-01 — Text resize clipping risk

Current CSS uses `overflow:hidden`, absolute overlays, and reveal `max-height` constraints. W3C identifies clipped/truncated content after text resize as a failure pattern.

**Test:** 200% text resize/zoom across all stations, especially clue reveals, sidecars, chips, controls, captions, and credits.

### A-02 — Reflow risk

Complex multi-column grids and sticky utility controls need 320-CSS-px-equivalent reflow validation.

**Test:** 400% zoom / equivalent narrow viewport, no essential two-dimensional scrolling.

### A-03 — Contrast

Current palette generally appears high contrast, but every muted text/accent/background combination must be measured in final consolidated CSS. WCAG AA requires at least 4.5:1 for ordinary text and 3:1 for large-scale text.

### A-04 — Motion

Pause Motion and `prefers-reduced-motion` support exist, but the final consolidated system must test every ambient animation and interaction-triggered motion. No essential information may depend on motion.

### A-05 — Focus after dynamic media lifecycle

YouTube iframes are created/removed by proximity. Verify that keyboard focus is not unexpectedly destroyed if a player sleeps.

### A-06 — Hover-only affordance

Hover gloss is decorative and acceptable as optional feedback, but all essential state/interaction information must remain visible by touch and keyboard.

---

## 9. Packaging, documentation, and test defects

| ID | Severity | Defect | Acceptance | Status |
|---|---|---|---|---|
| P-01 | P0 | `.8` CSS uses nested source `@import`s rather than a generated final stylesheet | Builder emits direct final CSS artifact | OPEN |
| P-02 | P0 | `.8` JS wrapper imports source modules rather than being produced by canonical builder shape | Builder emits reproducible runtime package | OPEN |
| P-03 | P0 | Builder is stale relative to staging source layers | Builder represents actual source architecture | OPEN |
| P-04 | P1 | Release hashes do not cover nested imports as delivered content | Manifest hashes direct delivered artifacts | OPEN |
| P-05 | P1 | Architecture doc still says current release is `.5` | Documentation updated after consolidation | OPEN |
| P-06 | P1 | Architecture doc source map omits later override layers | Documentation describes actual final source owners | OPEN |
| P-07 | P1 | Contract test was changed to preserve temporary stabilization/normalization layers | Tests enforce consolidated target architecture instead | OPEN |
| P-08 | P0 | No rendered visual release gate | Visual QA evidence required before staging handoff | OPEN |

---

## 10. Next implementation plan — no patch layers

This is the required sequence after this audit. Do not skip directly to visual tweaking.

### Phase A — Consolidate ownership

1. Treat `.8` as evidence, not architecture to extend.
2. Fold accepted experience-layer visuals into canonical `presentation.css` / deliberate component sections.
3. Fold any legitimate stabilization/normalization rules into the owning canonical selectors.
4. Remove `stabilization.css` and `normalization.css` from release authority.
5. Keep `amadeus-compat.css` separate and structural.

**No fifth presentation layer.**

### Phase B — Restore direct component behavior

1. Move evidence initial/reveal logic into `createEvidenceInteractive`.
2. Move Warp preset/path state ownership into `createWarpedLightInteractive`.
3. Initialize Anatomy directly in `createAnatomyInteractive`.
4. Make Orbit labels/instructions direct renderer/component output.
5. Make Earth completion state direct component behavior.
6. Retire post-render `stabilization.js`.

### Phase C — Reconcile blueprint components before styling details

For every station, mark each blueprint component:

- Implement now
- Intentionally defer with reason
- Replace with approved equivalent

P0 station mismatches (03, 04, 05, 06, 07, 10) must be structurally corrected before fine polish.

### Phase D — Establish one human visual scale

Build one canonical token scale for:

- body
- supporting body
- caption
- classification
- utility label
- controls
- headings
- primary/secondary artifact dimensions
- reading measure

Do not approve tokens from code alone. Render at reference desktop and adjust from the actual image.

### Phase E — Make media staging evidence-aware

Classify each media use as:

- monumental artifact
- primary explanatory diagram
- supporting evidence
- optional detail

Labeled diagrams get minimum staged size/zoom treatment.

### Phase F — Wire truthful experience capabilities

Either implement or remove/defer the currently declared:

- reduced-data control
- diagnostics
- profile selector / magic profiles
- forced reduced motion lab control
- reflection disabling
- essential mode
- optional discoveries

### Phase G — Repair builder and release pipeline

1. Builder consumes the consolidated source.
2. Builder emits self-owned CSS/JS/data/assets.
3. Contract tests run against generated release.
4. Visual harness captures candidate.
5. Only then cut the next immutable staging release.

### Phase H — Human visual release gate

Before asking the user to inspect the next release, the implementer must personally review:

- full desktop page at reference viewport
- every station 01–10
- Media Center
- credits
- hover/active states
- initial hidden/reveal states
- 1440 desktop
- tablet
- phone
- 200% text/zoom
- reduced motion
- keyboard path

Report known remaining issues proactively.

---

## 11. P0/P1 exit gate before next staging release

The next release may be cut only when all of the following are true:

- [ ] One canonical presentation system replaces the 4-layer override stack.
- [ ] Post-render stabilization JS is retired.
- [ ] Builder represents and generates the real package.
- [ ] Visual QA exists and is used before user handoff.
- [ ] Desktop text/readability scale passes human review.
- [ ] Major scientific artifacts no longer read as thumbnails.
- [ ] Station 03 uses actual evidence-gallery composition rather than generic equal cards.
- [ ] Station 04 is a real observation theater/tool, not video + orphan sidecar.
- [ ] Station 05 reads as the planetary EHT signature moment.
- [ ] Station 06 communicates reconstruction as a progression/corridor.
- [ ] Station 07 presents M87* and Sgr A* monumentally.
- [ ] Station 10 provides the boundary and return-to-observers ending.
- [ ] Experience manifest is truthful about implemented capabilities.
- [ ] No meaningful baked-in diagram labels are unreadable at staged size.
- [ ] 200% text resize does not clip essential content.
- [ ] Responsive/reflow checks do not create essential two-dimensional reading.
- [ ] Architecture/test documentation is updated to final consolidated architecture.

---

## 12. Things that are working and should not be casually discarded

The audit is not a reset of the entire project. Preserve these proven strengths while fixing ownership and composition:

- clean V2 branch separation from legacy `.12`
- semantic Edublogs fallback + page-local mount contract
- immutable staging/rollback discipline
- verified `.2` science/media seed as temporary staging input
- source-based media classifications and credits
- full-width repository root breakout
- Atkinson/Nunito typographic direction
- brightened `.6` chamber palette and differentiated light families
- exhibit threshold concept
- controlled star/disk/chamber ambient motion direction
- Pause Motion control and reduced-motion awareness
- current-plus-one media budget
- lazy privacy-enhanced YouTube with no autoplay
- basic lensing, evidence, Earth, reconstruction, comparison, Warped Light, and Anatomy interaction concepts
- contained gloss direction after the runaway `.6` shimmer defect was identified
- route-scoped Amadeus compatibility rather than global theme repainting

These are the foundation to consolidate, not excuses to preserve the current override stack.

---

## 13. Audit conclusion

The Black Hole Museum does **not** need another rebuild from zero, but it also does **not** need another patch release.

The central problem is now clear:

> The project found its visual direction in `.6`, then tried to repair structural and perceptual problems by layering corrections over an implementation that was still missing major blueprint components and a human-rendered QA gate.

The correct next move is consolidation plus station-level conformance, followed by rendered visual validation.

The page should not advance beyond `.8` until this ledger is used as the implementation contract.
