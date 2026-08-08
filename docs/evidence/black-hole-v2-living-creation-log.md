# Black Hole Museum V2 — Living Creation Log

**Purpose:** canonical chronological implementation log for the Arctic Preferred Black Hole repository prototype.  
**Status:** active living document. Update this file whenever the page changes in a way that teaches us something reusable for future Hughes Room Views repository pages.  
**Current staging release:** `0.2.0-black-hole-v2-lab.10`  
**Immediate rollback:** `0.2.0-black-hole-v2-lab.9`  
**Current branch:** `feature/black-hole-presentation-v2`  
**Exact clean-room base:** `c18a87560ff529eb7d5ad496522b9f5020bc688a`

This document is not the architecture specification and not the defect ledger. It records how the page was actually built, what failed in real browsers, what was learned, which repairs succeeded, and what future repository pages should inherit from the experiment.

Related authoritative records:

- `docs/architecture/black-hole-museum-v2.md` — architecture and ownership contract.
- `docs/evidence/black-hole-v2-human-visual-audit.md` — canonical human-visible defect ledger and acceptance gates.
- `docs/evidence/black-hole-v2-consolidation-result.md` — implementation response that produced consolidated staging `.9`.
- `apps/black-hole-museum/src/v2/Archive of things not to do lol/README.md` — anti-pattern index for the `.6`–`.8` patch-layer period.

---

## 1. Why this prototype exists

The Black Hole Museum is the maximum-shelf Arctic Preferred prototype for Hughes Room Views. It has two jobs:

1. demonstrate the fullest creative expression the repository page system can support;
2. stress-test the repository architecture while remaining scientifically accurate, accessible, responsive, performant, reversible, and maintainable.

It is intentionally not the production-default ornament level for every classroom page. It is the upper-bound experiment from which calmer future pages can scale downward.

The governing presentation doctrine remains:

> **FULL WIDTH BELONGS TO ATMOSPHERE. HUMAN-SCALE COMPOSITIONS LIVE INSIDE IT.**

A full-width page does not mean every card, paragraph, image, player, or interaction should be full-width. Atmosphere may occupy the viewport. Content should be composed intentionally at a scale appropriate to its job.

---

## 2. Foundation decisions that must remain stable

### 2.1 Native Amadeus baseline

The native theme layer is intentionally calm and readable:

- body: Atkinson Hyperlegible;
- headings: Nunito Sans;
- native body size target: 20px;
- light neutral background;
- dark slate/teal text palette.

The repository may establish page-specific atmosphere and foreground colors inside its own application island, but should preserve the underlying readability philosophy unless a page intentionally earns a different typographic treatment.

### 2.2 Clean V2 ownership

The active architecture is intentionally small:

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
- layout fixes implemented as global theme hacks;
- unknown integration defects hidden with global overflow rules.

### 2.3 Verified science/data foundation

The verified `.2` Black Hole content/assets remain reusable pinned staging input only. They are not permanent V2 release architecture.

Production-capable V2 builds must publish validated V2-owned copies.

---

## 3. Release chronology and reusable lessons

### `.1`–`.3` — clean-room skeleton and delivery proof

These releases proved the new repository renderer/runtime and page-local Edublogs loader without importing the old presentation stack.

Important wins:

- semantic native fallback;
- tiny fallback-only Edublogs CSS;
- page-local JavaScript loader pinned to an immutable release;
- no slug, WordPress page ID, or pathname identity requirement;
- current-plus-one media lifecycle;
- privacy-enhanced YouTube with no autoplay;
- reduced motion and explicit motion pause;
- minimal Amadeus structural neutralization.

**Lesson:** architecture correctness is necessary but not sufficient. A technically clean page can still fail the visual brief.

### `.4`–`.5` — Amadeus typography/color collision

The real Edublogs preview showed the intentional dark Amadeus heading color surviving on the near-black repository canvas.

The corrected boundary became:

- Amadeus compatibility owns structural neutralization;
- V2 presentation explicitly owns foreground colors and repository-island typography.

**Lesson:** know the intended native theme contract before layering a repository experience over it. Do not assume the theme is random legacy debris.

### `.6` — visual-direction breakthrough

`.6` was the first version that visually approached the maximum-shelf brief.

It introduced distinct chamber lighting, exhibit thresholds, stronger surfaces, controlled gloss, motion, color progression, and station-specific atmosphere.

**Lesson:** strong visual hierarchy comes from contrast between surfaces, spatial staging, lighting, transitions, and exhibit identity, not merely from brighter colors or larger headings.

### `.7`–`.8` — patch-layer anti-pattern

Real-browser defects in `.6` led to temporary `stabilization`, `normalization`, and secondary experience presentation layers.

They corrected real symptoms but fragmented ownership. The page became the result of multiple style systems negotiating with each other.

**Lesson:** fix the owning component or canonical rule. Do not accumulate corrective layers.

The old patterns are indexed in `Archive of things not to do lol`; immutable `.6`–`.8` releases remain rollback/evidence only.

### `.9` — consolidation and human-render preflight

`.9` removed the patch-layer architecture and returned V2 to one canonical presentation authority.

#### Critical typography discovery

A Chromium render proved that `rem` values inside the V2 island resolve against the document `<html>` root, not the museum mount root.

Values assumed to be roughly 17–18px were actually rendering near 14px in the WordPress-shaped browser environment.

The canonical presentation adopted explicit meaningful-text floors:

- body: 20px;
- support: 19px;
- UI: 18px;
- meaningful labels/classifications: 17px;
- lead copy: 22px.

**Lesson:** source-code scale intuition is not human visual QA. Measure browser-computed pixels.

#### Human-scale correction

Generic 340/520/760px major-module caps were removed. Reading measure remains controlled, but major scientific artifacts may occupy broad local composition space.

**Lesson:** human scale means readable composition, not thumbnail scale.

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

#### Scientific-media enlargement

Large-view access for labeled scientific diagrams proved valuable because labels baked into source imagery cannot be repaired through HTML typography.

**Lesson:** scientific-media readability is part of the layout contract.

---

## 4. `.9` real-Edublogs forensic review

A full unpublished Edublogs recording established that `.9` had finally become a foundation worth refining rather than rebuilding.

### Confirmed strengths

- desktop body/support/UI text was comfortably readable;
- chamber hierarchy was successful;
- scientific artifacts had appropriate physical presence;
- Gravity communicated an evidence-network metaphor;
- Earth Becomes One Telescope became understandable and memorable;
- Warped Light and Anatomy became meaningful interactive exhibits;
- diagram enlargement was useful and should remain.

### Confirmed defects that drove `.10`

#### Orbit interaction locality

The visitor had to scroll below the observation to reach controls, activate an overlay, and scroll back up to see the consequence.

This produced the reusable rule:

> **A control and its primary visual consequence should normally be perceivable together without scroll travel.**

#### Disclosure layout turbulence

Gravity clue cards, Reconstruction explanations, Warped Light explanations, and Myth accordions changed surrounding document height while being used.

Reusable rule:

> **Interactive explanation should usually replace content inside reserved geometry rather than repeatedly grow the document.**

#### Inline scientific-image enlargement

The large view was valuable, but inline expansion changed page geometry and risked losing visual position.

Desired replacement: viewport-local modal dialog with focus restoration and no page reflow.

#### Vertical overextension

Typography should remain readable. Condensation should come from structure and chrome, not smaller type.

#### Real Edublogs horizontal overflow

The real page displayed a horizontal scrollbar even though the isolated `.9` Chromium harness did not.

This became an integration-ownership problem, not permission for `body { overflow-x:hidden; }`.

#### Unrelated teal Explorations navigation after the museum

After repository credits, unrelated Explorations Hub / Previous / Next / Nav content appeared.

Repository search found no matching copy inside `HughesWebAssets`, while the existing Amadeus adapter already suppressed `.site-footer`. The exact Edublogs/global owner remains unknown pending real-DOM diagnostics.

#### Media Center embed degradation

Viewport-triggered YouTube activation replaced authored cards with YouTube's gray authentication/bot-check surface.

Reusable rule:

> **Third-party embeds are guests. Preserve authored presentation until explicit visitor intent.**

---

## 5. `.10` Refinement and Interaction Locality Pass

### Status

**Implemented and cut as unpublished staging release `0.2.0-black-hole-v2-lab.10`. Real Edublogs integration revalidation is still pending.**

Immediate rollback is `.9`.

No new presentation layer, fixer script, emergency compositor, or archived file was introduced.

### 5.1 Interaction ownership changes

All behavior remains in `interactions.js`.

#### Gravity

- clue card geometry remains reserved while details are concealed;
- reveal changes semantic/visual visibility rather than removing copy from layout;
- individual and reveal-all states remain directly component-owned.

Local Chromium result: clue height unchanged and document shift `0px`.

#### Orbit

- overlay state remains owned by the Orbit component;
- local status readout now describes all active explanatory overlays;
- overlay geometry is attached to the actual observation viewport by the renderer.

#### Reconstruction

- old growing explainer stack removed;
- “Why several versions?” and “Why orange?” now share one stable detail tray.

Local Chromium result: explanation switching document shift `0px`.

#### Warped Light

- old growing explanatory block removed;
- Viewing angle, Brightness, and Shadow-vs-horizon notes use one stable tray;
- tray reserves enough height for the longest approved explanation.

Local Chromium result after preflight correction: explanation switching document shift `0px`.

#### Anatomy/Myths

- Anatomy still initializes a valid selected layer directly;
- myths are now a selector plus one stable detail region rather than multiple expanding accordions.

Local Chromium result: myth switching document shift `0px`.

### 5.2 Orbit theater locality repair

The observation overlay is now placed inside the media frame it describes.

The theater was condensed without reducing the `.9` typography floor:

- maximum theater width: `64rem`;
- compact observation caption treatment retains title, classification, credit, and source;
- three overlay controls form an attached shelf immediately below the screen;
- status remains part of the same instrument.

Local Chromium at 1920×1032 measured the complete theater at approximately `862.875px` tall, allowing the observation and controls to coexist within the reference viewport.

The real Edublogs preview remains the final locality verification.

### 5.3 Viewport-local scientific media dialogs

Scientific enlargement now uses native modal-dialog semantics rather than inline document expansion.

Implemented behavior:

- centered viewport-local viewer;
- backdrop;
- explicit Close control;
- native Escape behavior;
- opener remembered;
- focus moves into the viewer;
- focus returns to the opener with `preventScroll`;
- document geometry remains stable.

Twin-Ring galaxy-context and relative-scale views use the same model instead of creating huge alternate-state acreage in the rotunda.

Local Chromium result: dialog document shift `0px`; test scroll position was restored exactly after close.

### 5.4 Structural condensation without typography regression

The explicit `.9` human-readable type tokens remain unchanged.

Condensation came from geometry instead:

- Orbit screen/console treated as one instrument;
- Earth map-to-network transition tightened and forced map height reduced;
- Earth network and synchronization strip condensed;
- Reconstruction process cards converted into a slimmer process rail;
- Reconstruction workbench geometry tightened;
- Twin-Ring alternate context artifacts moved to modal viewers while monumental default remains;
- Warped Light explanation geometry stabilized;
- Myth Gallery converted to selector + fixed detail region.

### 5.5 Root-width correction

The `.9` root still used `width:100vw` plus `left:50%` and negative `50vw` margins, a breakout technique originally needed before Amadeus's parent container was properly neutralized.

Because the current route-scoped Amadeus adapter already gives the repository parent full width with zero page-entry spacing, `.10` now uses:

- `width:100%`;
- normal positioning;
- zero breakout margins.

This removes a known class of viewport-scrollbar-width overflow without adding a global overflow-hiding rule.

Local Chromium reports no horizontal overflow at the tested viewports.

**Unknown until real Edublogs preview:** whether this also removes the production-like horizontal scrollbar, or whether another Edublogs/global element remains an overflow owner.

### 5.6 Poster-first Media Center

The Media Center no longer creates YouTube iframes merely because the visitor scrolls near it.

Current behavior:

- authored poster and Play control render first;
- scrolling into the lounge keeps iframe count at zero;
- explicit Play creates only that selected privacy-enhanced iframe;
- autoplay remains disabled;
- normal controls remain enabled;
- an external YouTube link remains available outside the iframe;
- when a player sleeps, its original authored poster is restored;
- focus-aware lifecycle protection remains.

Local Chromium result:

- iframes before Play: `0`;
- iframes after one explicit Play: `1`.

### 5.7 Integration ownership diagnostics

The teal Explorations tail cannot currently be traced to repository source. Exact phrase searches found no owner in `HughesWebAssets`.

The unpublished `.10` Edublogs loader therefore includes a **read-only** integration diagnostic.

It records:

- viewport/client/scroll width and overflow delta;
- visible elements whose bounding rectangles exceed the viewport;
- the Black Hole mount ancestor chain;
- previous/next siblings at each ancestor level;
- DOM elements containing text clues such as “Explorations Hub Home” and “Next Exploration”.

The report is stored at:

`window.__HRV_BLACK_HOLE_V2_DIAGNOSTICS__`

and logged to the console.

The diagnostic does **not** hide elements, change overflow, resize theme wrappers, or apply a visual correction.

Reusable lesson:

> **When ownership is unknown, instrument the boundary before changing it.**

---

## 6. `.10` local Chromium preflight evidence

The `.10` source was exercised as a rendered interaction journey, not only inspected as code.

Reference environments checked:

- 1920×1032;
- 1440×900;
- 960×900, including narrow/reflow-equivalent conditions;
- 390×844.

Confirmed local measurements/results:

| Check | Result |
|---|---|
| Desktop body | 20px |
| Meaningful label/classification | 17px |
| Figure caption | 18px |
| Horizontal overflow | none in local harness |
| Orbit theater at 1920×1032 | ~862.875px tall |
| Gravity reveal document shift | 0px |
| Reconstruction detail document shift | 0px |
| Warped Light detail document shift | 0px |
| Myth detail document shift | 0px |
| Dialog document shift | 0px |
| Media Center iframes before explicit Play | 0 |
| Page errors in tested interaction run | none observed |

Additional journey checks performed locally:

- Orbit trace state changed in-place and local status updated;
- Gravity individual reveal preserved card height;
- Reconstruction explanation swap preserved document height;
- Warped Light explanation swap preserved document height after tray-height correction;
- Myth selection preserved document height;
- scientific dialog opened and closed without changing document height or scroll position;
- Media Center remained poster-only on scroll and created an iframe only after Play;
- phone-width base layout had no horizontal overflow in the fixture.

### Evidence boundary

The Chromium fixture is not Edublogs/Amadeus itself.

Therefore the following are **not yet closed**:

1. real Edublogs horizontal overflow;
2. ownership/removal of the teal Explorations tail;
3. real Edublogs confirmation that Orbit control and consequence coexist as intended under the live admin/theme chrome;
4. real third-party YouTube behavior after explicit Play.

---

## 7. `.10` release architecture

`.10` remains clean-source-pinned staging.

- payload snapshot: `b4eef573a9f11a5f54ce99cfe60e2bc63059d271`;
- immutable release manifest commit: `e658e5e74950380772fc456fdb3f24a064eed730`;
- current V2 channel: `.10`;
- previous/rollback: `.9`;
- verified `.2` content/assets remain temporary staging seed;
- `.10` owns its truthful V2 experience JSON.

The release does not contain wrapper JavaScript or presentation `@import` chaining.

The manifest's renderer, interactions, runtime, presentation, and compatibility blob identities were re-fetched from the payload snapshot and matched the recorded source blobs.

### Contract-test status

`scripts/test_black_hole_v2_contract.py` has been updated to protect the `.10` architecture and behavior, including:

- no retired patch-layer files;
- renderer version and blueprint-specific compositions;
- viewport dialog semantics;
- Orbit overlay locality;
- stable Reconstruction/Warped/Myth detail patterns;
- poster-first explicit-play YouTube;
- preserved human-readable typography tokens;
- removal of the old `100vw/-50vw` breakout math;
- read-only Edublogs integration diagnostics;
- `.10 → .9` release/channel relationship.

**Important verification boundary:** the revised contract file has not been executed from a fresh repository checkout in this environment. Do not record it as a passed test run until it is actually executed.

---

## 8. Reusable rules for future Arctic Preferred repository pages

1. **Render before asking a human to review.** Source values are not visual evidence.
2. **Theme contract first.** Know the native site's fonts, colors, width rules, and ownership before layering a repository experience over it.
3. **One presentation authority.** Avoid late override layers even when the symptom is real.
4. **Controls belong near consequences.** Interactive travel distance is a UX metric.
5. **Stable details beat growing accordions.** Reserve explanation geometry and swap content in place when practical.
6. **Dialogs beat document reflow for inspectable scientific media.** Preserve the visitor's place.
7. **Scientific diagrams need physical readability.** Provide meaningful display size or a proper large-view mechanism.
8. **Condense chrome before content.** Do not solve page length by shrinking text or turning major artifacts into thumbnails.
9. **Full-width atmosphere, local composition.** Preserve immersion without abandoning human reading scale.
10. **Third-party embeds are guests.** Keep authored posters until explicit visitor intent.
11. **Integration problems have owners.** Do not hide unknown WordPress/Edublogs/global-runtime defects from inside page-specific styling.
12. **Instrument unknown boundaries before changing them.** Diagnostics are preferable to guessed selectors.
13. **Immutable staging releases are evidence.** Keep rollback checkpoints, but do not treat historical staging architecture as current doctrine.
14. **The living log is part of the page system.** Update it after consequential visual, browser, architecture, or integration discoveries so future pages inherit verified lessons instead of repeating the experiment.

---

## 9. Next required gate

The next evidence must come from one fresh unpublished Edublogs Preview using the `.10` HTML/CSS/JavaScript deployment tabs.

That review should evaluate the existing defect ledger rather than asking the human reviewer to rediscover the page from scratch.

Required real-preview checks:

- typography remains at `.9` readability quality;
- Orbit controls and consequences coexist without scroll travel;
- Gravity reveals do not jump card geometry;
- Reconstruction/Warped/Myth explanations remain spatially stable;
- scientific dialogs do not move the underlying page;
- Twin-Ring context viewers do not create empty rotunda acreage;
- Media Center stays authored/poster-first until Play;
- horizontal scrollbar is absent, or the diagnostic identifies the remaining owner;
- teal Explorations tail is absent, or the diagnostic identifies its actual owner;
- repository credits/closing remain visually coherent;
- no new Amadeus typography/color/width collisions appear.

Only after that real integration review should the corresponding human-visible defects be marked closed or the owner-specific final integration correction be planned.