# Archive of things not to do lol

This folder is an evidence index, **not runtime source**.

Black Hole Museum V2 temporarily accumulated multiple correction layers while staging `.6` through `.8` was being visually debugged. Those layers helped reveal real problems, but they are explicitly not architecture to inherit.

The exact historical code remains recoverable through Git history and the immutable staging releases, so it is intentionally **not duplicated as active CSS/JavaScript here**. Duplicating those files would create a second copy that could later be mistaken for supported source. Immutable release directories are also not moved because their pinned jsDelivr URLs and rollback contract depend on their existing paths.

## Archived active-source patterns

| Former active source | Historical blob SHA | Why it must not return |
|---|---|---|
| `experience-layer.css` | `3ac5547c9fc3802afab41833977196a715c5d9a4` | Became a second presentation authority over `presentation.css`. |
| `stabilization.css` | `d7b7c7f68fc838f7186bbea051ab322c3bc802bb` | Emergency visual corrections became permanent cascade authority. |
| `normalization.css` | `d13ad3068673afc6bef2113ed1d6d1a58beaa22f` | Added another global scale/layout override instead of fixing the owning rules. |
| `stabilization.js` | `94bfd8534493467ef32588572968f0fb18ce6684` | Repaired renderer/component state after mount instead of letting the component own its correct state. |

## Immutable evidence checkpoints

- `.6` is the first staging release that established the successful maximum-shelf visual direction.
- `.7` records the stabilization-layer experiment.
- `.8` records the normalization-layer experiment and is the direct rollback checkpoint for the consolidated successor.

Do not edit or relocate those immutable `dist/` releases.

## Lessons preserved here

1. **One presentation owner.** V2 has one canonical `presentation.css`; Amadeus compatibility remains separate and structural only.
2. **No post-render compositor or fixer.** Interaction state belongs inside `interactions.js`; station structure belongs inside `renderer.js`; lifecycle belongs inside `runtime.js`.
3. **Do not use sub-1rem values for meaningful museum microcopy.** `rem` resolves against the WordPress document root, not the V2 mount root. This caused labels believed to be ~17–18px to render around 14px on desktop.
4. **Human scale does not mean thumbnail scale.** Reading measure should be capped; major scientific artifacts may and should occupy large portions of a 1400–1600px local museum composition.
5. **Do not hand-package staging wrappers that `@import` or dynamically import source from another commit.** The release must directly own the files it serves.
6. **Code review is not visual QA.** A candidate must be rendered at the reference desktop and responsive viewports before it is handed to a human reviewer.

The canonical rationale and defect history live in:

`docs/evidence/black-hole-v2-human-visual-audit.md`

If future work starts recreating any pattern above, stop and read that audit before adding another layer.
