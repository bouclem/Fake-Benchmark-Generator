# PROJECT.md — Model-Benchmark-Gen

## What it is

A zero-dependency Node.js (CommonJS) library that generates AI model benchmark
charts as SVG strings/files. Published to npm as `model-benchmark-gen`.

## Architecture

```
src/
  index.js          public API: { generateChart, generateScatterChart, generateColors }
  generateChart.js  grouped bar chart (0-100 score axis, dark theme)
  scatterChart.js   log-scale scatter chart (params vs intelligence), port of old *.py scripts
  colors.js         golden-ratio hue palette generator
  utils.js          escapeXml, niceStep helpers
test/smoke.test.js  node:test smoke tests (no deps)
examples/           runnable usage example + sample data
```

## Design decisions

- **SVG output, no rasterizer.** The previous version piped SVG through `sharp`
  to emit PNG. The package is now dependency-free; callers who need PNG can
  convert the SVG themselves (sharp, resvg, Inkscape, a browser).
- **Sync API.** No I/O beyond an optional `writeFileSync`; generators return
  the SVG string and write only when `outputPath` is passed.
- **Two input shapes for `generateChart`:** full `{ title, benchmarks }` and
  shorthand `{ benchmarkName, models: [{ name, percentage }] }` (from the old
  `data.json`), normalized then validated in one place.
- **Scatter auto-limits** mirror the Python originals: x padded x2 / /2 on a
  log scale, y padded -10/+15.

## Direction

Keep it small and dependency-free. Possible future work is tracked in
docs/TODO.md.
