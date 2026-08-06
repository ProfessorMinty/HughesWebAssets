# Hughes Room Views Layout, Readability & Resilience Laboratory

Build: `2026.08.05.2`

This laboratory is deliberately separate from the known-good runtime capability proof at `test/repo-runtime-lab/` build `2026.08.05.1`. It measures the Edublogs theme container, compares native/safe-wide/full-viewport modes, tests readable inner columns, and rehearses graceful external-asset failure.

## Upload destination

Upload this entire directory to:

```text
test/repo-layout-lab/
```

Do not replace or edit `test/repo-runtime-lab/`.

## Complete Edublogs Custom HTML block

```html
<div id="hrv-layout-lab">
  <div
    data-hrv-layout-static-fallback
    role="status"
    style="padding:24px;border:2px solid #5b4fd6;border-radius:18px;background:#f3f1ff;color:#2c2667;font:600 17px/1.55 system-ui,sans-serif"
  >
    <strong style="display:block;font-size:1.2em;margin-bottom:8px">
      Hughes Room Views layout test is loading.
    </strong>
    <span>
      If the interactive files cannot load, this Edublogs-hosted fallback remains visible.
    </span>
  </div>
</div>

<script
  src="https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@main/test/repo-layout-lab/bootstrap.js?v=2026.08.05.2"
  data-build="2026.08.05.2"
  data-mount="hrv-layout-lab">
</script>
```

## Test order

1. Open the published page in a normal browser and incognito.
2. Record native width.
3. Select Safe wide and copy the report.
4. Select Viewport breakout and copy the report.
5. Confirm there is no horizontal scrollbar.
6. Test at 100% browser zoom, a narrower desktop window, and a phone.
7. Toggle light/dark/high contrast and judge readability.
8. Run the health endpoint test.
9. Run the controlled data outage test.
10. Copy the cold-start failure URL and open it in a new tab. The static Edublogs fallback should remain visible.

## Monitoring endpoint

```text
https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets@main/test/repo-layout-lab/health.json?v=2026.08.05.2
```

Expected marker:

```text
HRV_LAYOUT_LAB_HEALTHY
```

## Rollback

Remove the Edublogs block for this laboratory and delete only `test/repo-layout-lab/`. The successful build `2026.08.05.1` remains untouched.
