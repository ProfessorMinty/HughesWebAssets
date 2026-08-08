# Black Hole Museum V2 — Living Creation Log

**Purpose:** canonical chronological implementation log for the Arctic Preferred Black Hole repository prototype.  
**Status:** active living document. Update this file whenever the page changes in a way that teaches us something reusable for future Hughes Room Views repository pages.  
**Current staging release at start of this entry:** `0.2.0-black-hole-v2-lab.9`  
**Current branch:** `feature/black-hole-presentation-v2`  
**Exact clean-room base:** `c18a87560ff529eb7d5ad496522b9f5020bc688a`

This document is not the architecture specification and not the defect ledger. It records the story of how this page was actually built, what failed in the real browser, what was learned, and which lessons should influence future repository pages.

Related authoritative records:

- `docs/architecture/black-hole-museum-v2.md` — current architecture and ownership contract.
- `docs/evidence/black-hole-v2-human-visual-audit.md` — canonical human-visible defect ledger and acceptance gates.
- `docs/evidence/black-hole-v2-consolidation-result.md` — implementation response that produced consolidated staging `.9`.
- `apps/black-hole-museum/src/v2/Archive of things not to do lol/README.md` — anti-pattern index for the `.6`–`.8` patch-layer period.

---

## 1. Why this prototype exists

The Black Hole Museum is the maximum-shelf Arctic Preferred prototype for Hughes Room Views. It has two jobs:

1. demonstrate the fullest creative expression the repository page system can support;
2. stress-test the repository architecture while remaining scientifically accurate, accessible, responsive, performant, reversible, and maintainable.

It is intentionally not the production-default level of ornament for every classroom page. It is the upper-bound experiment from which calmer future pages can scale downward.

The governing presentation doctrine remains:

> **FULL WIDTH BELONGS TO ATMOSPHERE. HUMAN-SCALE COMPOSITIONS LIVE INSIDE IT.**

A full-width page does not mean every card, paragraph, image, or player should be full-width. Atmosphere may occupy the viewport. Content should be composed intentionally at a scale appropriate to its job.

---

## 2. Foundation decisions that must remain stable

### 2.1 Native Amadeus baseline

The native theme layer is intentionally calm and readable:

- body: Atkinson Hyperlegible;
- headings: Nunito Sans;
- native body size target: 20px;
- light neutral background;
- dark slate/teal text palette.

The repository is allowed to establish page-specific atmosphere and foreground colors inside its own application island, but should preserve the underlying readability philosophy unless a page intentionally earns a different typographic treatment.

### 2.2 V2 clean-room ownership

V2 was deliberately branched from `c18a87560ff529eb7d5ad496522b9f5020bc688a` rather than inheriting the old maximum-shelf implementation stack.

The active clean architecture after consolidation is:

- `renderer.js` — station/document structure;
- `interactions.js` — interaction state and behavior;
- `runtime.js` — lifecycle, current-plus-one media budget, YouTube lifecycle, motion control;
- `presentation.css` — one canonical page presentation authority;
- `amadeus-compat.css` — narrow route-scoped structural compatibility only.

Forbidden return patterns:

- secondary presentation override stylesheets;
- post-render compositors/fixers;
- old maximum-shelf inheritance;
- generic giant `vh` chambers;
- hand-packaged release wrappers that import another commit's source;
- layout fixes implemented as global theme hacks.

### 2.3 Verified science/data foundation

The verified `.2` Black Hole content/assets remain reusable pinned staging input only. They are not permanent V2 release architecture.

Production-capable V2 builds must publish validated V2-owned copies.

---

## 3. Chronology and lessons

### `.1`–`.3`: clean-room skeleton and delivery proof

The early V2 releases proved the new renderer/runtime/Edublogs page-local loader approach without importing the legacy presentation stack.

Important wins:

- semantic fallback in the Edublogs HTML tab;
- tiny fallback-only Edublogs CSS;
- page-local JavaScript loader pinned to an immutable release;
- no slug, WordPress page ID, or pathname identity requirement;
- current-plus-one media lifecycle;
- privacy-enhanced lazy YouTube with no autoplay;
- reduced motion and explicit motion pause;
- minimal Amadeus width/entry neutralization.

Important lesson:

A technically clean page can still fail the visual brief. Architecture correctness is necessary but not sufficient.

### `.4`–`.5`: Amadeus typography/color collision

The real Edublogs preview showed dark Amadeus heading colors bleeding into the near-black repository canvas.

The key discovery was that the Amadeus baseline itself was intentional, not random legacy debris. The correct boundary became:

- Amadeus adapter owns structural neutralization;
- V2 presentation explicitly owns its dark-canvas foreground colors and repository-island typography.

Lesson for future pages:

**Do not treat the theme as hostile by default. Know the intended native theme contract before layering a repository experience over it.**

### `.6`: visual direction breakthrough

`.6` was the first version that visually approached the maximum-shelf brief.

It introduced distinct chamber lighting, exhibit thresholds, stronger card/material surfaces, controlled gloss, motion, color progression, and station-specific atmosphere.

This was the first release worth refining instead of replacing.

Lesson:

Maximum-shelf hierarchy comes from **contrast between surfaces, spatial staging, lighting, transitions, and clear exhibit identity**, not merely from larger fonts or brighter colors.

### `.7`–`.8`: the patch-layer mistake

Real-browser defects in `.6` led to the creation of:

- `stabilization.css`;
- `stabilization.js`;
- `normalization.css`;
- the existing `experience-layer.css` increasingly acting as another presentation authority.

These layers corrected real symptoms, but active ownership fragmented. The page became the emergent result of multiple style systems negotiating with each other.

This period also revealed a critical human-scale problem: important exhibits had been reduced to small support-card widths in the name of avoiding giant layouts.

Lesson:

**Fix the owning component or canonical presentation rule. Do not accumulate corrective layers.**

Historical anti-pattern details are preserved in `Archive of things not to do lol` and immutable `.6`–`.8` staging releases.

### `.9`: consolidation and human-render preflight

`.9` removed the patch-layer architecture and returned V2 to one canonical presentation authority.

Major discoveries and corrections:

#### The `rem` root mistake

A real Chromium render proved that `rem` values inside the V2 island resolve against the document `<html>` root, not the museum mount root.

Values that looked like 17–18px in source were rendering around 14px in the actual browser.

The canonical presentation therefore adopted explicit human-readable tokens:

- body: 20px;
- support: 19px;
- UI: 18px;
- meaningful label/classification: 17px;
- lead copy: 22px.

Reusable lesson:

**Code-scale intuition is not human visual QA. Browser-computed values must be measured.**

#### Human-scale correction

Generic 340/520/760px major-module caps were removed. Reading measure remains constrained, but major scientific media and signature interactions may occupy broad local composition space.

Reusable lesson:

**Human scale means readable composition, not thumbnail scale.**

#### Structural station differentiation

Stations became distinct spatial experiences rather than repeated “header + equal cards” sections:

- threshold;
- lensing atrium;
- evidence gallery;
- observation theater;
- planetary telescope hall;
- reconstruction corridor;
- twin-ring rotunda;
- Warped Light laboratory;
- anatomy/myth gallery;
- final known/unknown boundary and observer return.

#### Diagram enlargement

Large-view access for labeled scientific diagrams proved valuable because labels baked into source imagery cannot be repaired through HTML/CSS typography alone.

Reusable lesson:

**Scientific media readability is part of the layout contract. A high-resolution image displayed too small is still inaccessible information.**

#### Local Chromium preflight

The consolidated candidate was rendered at 1920, 1440, 960, and 390 widths before Edublogs handoff. This caught typography, overflow, and control-style problems that source review had missed.

Reusable lesson:

**A repository page cannot be considered ready for human review until it has been rendered and inspected as pixels.**

---

## 4. Current `.9` real-Edublogs forensic review

A full 5:12 unpublished Edublogs preview recording was reviewed after `.9` deployment.

### Confirmed strengths

- body/support/UI text is now comfortably readable at desktop viewing distance;
- major chamber hierarchy is successful;
- scientific artifacts have appropriate physical presence;
- Gravity Leaves Clues now communicates an evidence-network metaphor rather than a generic card grid;
- Earth Becomes One Telescope is understandable and visually memorable;
- Warped Light and Anatomy are meaningful interactive exhibits rather than decorative controls;
- enlarged scientific diagrams are useful and should be preserved;
- the overall foundation is now worth refining rather than rebuilding.

### Confirmed remaining systemic defects

#### 4.1 Interaction locality failure — Orbit

The Orbit theater is vertically too tall for its screen and controls to coexist at the reference desktop viewport.

Observed journey:

1. visitor sees the observation;
2. visitor scrolls downward until the observation is mostly gone;
3. visitor presses an overlay control;
4. visitor scrolls back upward to see the result.

This violates the interaction-locality requirement.

Acceptance rule for future pages:

> **A control and its primary visual consequence should normally be perceivable together without scroll travel.**

For the Orbit station specifically, the observation and its control shelf must coexist at 1920×1032.

#### 4.2 Reveal/disclosure layout turbulence

Several interactions still use document growth as their explanation mechanism:

- Gravity clue cards resize as content appears;
- Reconstruction explanations add vertical panels;
- Warped Light explanations add large disclosure blocks;
- Myth explanations alter stack height.

The correct museum pattern is a stable detail region whose content changes in place, not an accordion that keeps making the document taller.

Reusable lesson:

> **Interactive explanation should usually replace content inside a reserved detail tray rather than push the surrounding museum through document reflow.**

#### 4.3 Diagram enlargement changes page geometry

The ability to inspect diagrams larger is correct. The inline expansion mechanic is not ideal because it changes document geometry and can disorient the visitor.

Desired pattern:

- viewport-centered dialog/lightbox;
- stable underlying document;
- Escape/Close support;
- focus moves into the viewer and returns to the opener;
- no lost scroll position.

#### 4.4 Some rooms are vertically overextended

Typography should remain at `.9` scale. Condensation should come from structure, not smaller text.

Most important candidates:

- Station 04 Orbit — substantial condensation and attached controls;
- Station 05 Earth — reduce redundant vertical presentation while preserving map and network prominence;
- Station 06 Reconstruction — replace three large concept cards with a compact process rail and stable detail tray;
- Station 07 Twin Ring — preserve monumental default but avoid alternate states that create large unused acreage;
- Station 08 Warped Light — stable explanation tray instead of stacking disclosures;
- Station 09 Myths — compact selector plus one stable explanation region.

Stations 01 and 02 need little or no structural change.

#### 4.5 Real Edublogs horizontal overflow

The real preview still shows a horizontal scrollbar.

The isolated Chromium harness did not.

Therefore this is an integration-specific problem and must be diagnosed from the actual rendered ownership boundary rather than hidden globally.

Possible causes include the viewport breakout and/or unrelated theme/global page chrome, but no fix should be made until the overflowing element is identified.

Reusable lesson:

**Do not use `overflow-x:hidden` to conceal an unidentified integration defect. Find the owner.**

#### 4.6 Unrelated teal Explorations navigation appears after the museum

After the repository-owned credits, the real preview falls into an unrelated teal navigation area containing Explorations Hub/Previous/Next/Nav content.

The current Amadeus adapter already suppresses `.site-footer`, so this appears to be a separate global Explorations/theme/widget owner rather than the footer selector already handled.

The correct fix is to identify and correct that system's page ownership/gating. Do not add a mysterious Black Hole selector merely to hide it.

Reusable lesson:

**Route ownership failures must be repaired at the owner, not cosmetically hidden by the page that happened to expose them.**

#### 4.7 Media Center iframe degradation

YouTube players visually degrade into “Sign in to confirm you're not a bot” screens after iframe activation.

The museum should therefore remain poster-first. Do not instantiate third-party players merely because a section approaches the viewport.

Preferred behavior:

- museum poster/thumbnail remains until explicit Play action;
- iframe is created only after user intent;
- if embed playback fails, preserve the exhibit and provide an external-watch fallback rather than replacing the whole card with a gray authentication panel.

Reusable lesson:

**Third-party embeds should not be allowed to replace authored page design until the visitor explicitly asks to use them.**

---

## 5. Active implementation plan — `.10 Refinement and Interaction Locality Pass`

**Status:** approved to begin after this living log is committed.

No secondary correction stylesheet or fixer script may be created. All work must remain inside the canonical owners established by `.9`.

### Phase 1 — real integration ownership forensics

1. Identify the actual horizontal-overflow owner.
2. Identify the exact owner of the teal Explorations navigation after museum credits.
3. Correct ownership at the responsible source/system.
4. Do not apply generic `body/html overflow-x:hidden` or page-local mystery selectors.

If unpublished Edublogs DOM cannot be inspected directly from the development environment, reproduce the relevant Amadeus/wrapper conditions locally where possible and defer only the owner-specific integration assertion to the next real preview.

### Phase 2 — Orbit interaction locality

Recompose Station 04 as one observation-theater instrument:

- retain a dominant 16:9 observation;
- attach a compact control shelf directly to the screen;
- keep overlay status/readout local;
- ensure trace, center, and comparison effects are visible without scrolling at 1920×1032;
- preserve real-observation vs explanatory-overlay classification.

### Phase 3 — stable detail-tray interaction system

Introduce one reusable interaction pattern owned by existing components, not a new framework layer.

Use one reserved detail region for:

- Reconstruction explanatory questions;
- Warped Light explanatory notes;
- Myth Gallery explanation selection.

The tray changes content in place rather than stacking panels.

Gravity remains a special spatial reveal system but should stabilize card geometry during reveal.

Reduced-motion mode swaps content without animated transitions.

### Phase 4 — diagram lightbox/dialog

Replace inline page-reflow enlargement with a reusable accessible viewer:

- native dialog semantics where practical;
- viewport-centered image;
- maximum useful viewport size;
- dark backdrop;
- Close button;
- Escape support;
- focus trap/managed focus;
- focus restored to opener;
- scroll position preserved;
- no document reflow.

Use for all labeled scientific diagrams that currently provide “Open diagram larger.”

### Phase 5 — structural condensation without typography regression

Preserve `.9` readability floors.

Condense by reducing redundant chrome and improving composition:

- Station 01: minor spacing only;
- Station 02: preserve;
- Station 03: preserve scale, stabilize clue reveal;
- Station 04: major vertical condensation through theater composition;
- Station 05: tighten map-to-network transition and reduce redundant vertical height;
- Station 06: compact process rail + primary interactive/reference pair + detail tray;
- Station 07: preserve monumental rotunda but remove empty alternate-state acreage;
- Station 08: retain laboratory scale, replace stacked disclosures with tray;
- Station 09: compact myth selector + stable explanation panel;
- Station 10/credits: preserve unless integration cleanup requires ownership changes.

### Phase 6 — Media Center poster-first lifecycle

Change runtime/player behavior so:

- scrolling near Media Center does not create YouTube iframes;
- explicit visitor Play creates the player;
- no autoplay;
- focus-aware lifecycle remains intact;
- failures retain authored poster/exhibit treatment and expose an external-watch fallback.

### Phase 7 — interaction-centered visual QA

Before `.10` release handoff, test the actual user journeys rather than static component presence.

Reference checks:

- 1920×1032 desktop;
- 1440 desktop;
- tablet/narrow desktop;
- 390 phone;
- keyboard only;
- reduced motion;
- 200% zoom/reflow.

Mandatory journey checks:

- Orbit control consequence visible without scroll;
- every diagram opens/closes without moving the page;
- every Gravity clue state;
- all Reconstruction states and explanations;
- all Earth network states;
- all Warped Light controls/explanations;
- Anatomy layer initialization and switching;
- Myth detail switching;
- Media Center explicit Play lifecycle;
- absolute page bottom;
- no horizontal overflow;
- no non-V2 navigation/chrome after repository credits.

### Release gate

Do not cut `.10` unless:

- typography remains at `.9` readability quality;
- controls and consequences are locally visible;
- disclosures do not cause major layout jumps;
- diagram enlargement is viewport-local;
- Media Center is poster-first;
- horizontal overflow is absent in the candidate environment and investigated in real integration;
- the museum ending is actually the end of the page system;
- architecture remains one presentation stylesheet, one renderer, one interaction owner, one runtime, and one narrow compatibility adapter.

No `.10-fixes.css`. No emergency compositor. No resurrected archive files.

---

## 6. Reusable rules for future Arctic Preferred repository pages

1. **Render before asking a human to review.** Source values are not visual evidence.
2. **Theme contract first.** Know the native site's fonts, colors, width rules, and ownership before layering a repository experience over it.
3. **One presentation authority.** Avoid late override layers even when the symptom is real.
4. **Controls belong near consequences.** Interactive travel distance is a UX metric.
5. **Stable details beat growing accordions.** Museum interactions should not repeatedly shove the rest of the page downward.
6. **Scientific diagrams need physical readability.** Provide meaningful display size or a proper large-view mechanism.
7. **Condense chrome before content.** Do not solve page length by shrinking text or turning major artifacts into thumbnails.
8. **Full-width atmosphere, local composition.** Preserve visual immersion without abandoning human reading scale.
9. **Third-party embeds are guests.** Keep authored posters until explicit visitor intent.
10. **Integration problems have owners.** Do not hide unknown WordPress/Edublogs/global-runtime defects from inside a page-specific stylesheet.
11. **Immutable staging releases are evidence.** Keep rollback checkpoints, but do not treat their architecture as current doctrine.
12. **The living log is part of the page system.** Update this file after every consequential visual/architectural discovery so future page builders inherit verified lessons instead of repeating the experiment.

---

## 7. Next update trigger

Update this log when the `.10` implementation reaches either:

- a new staging release ready for real Edublogs preview; or
- a consequential discovery that changes the implementation plan before release.

The next entry must record what was changed, what was rendered/tested, what remains unverified, and what lessons should be promoted into the general repository-page architecture standard.