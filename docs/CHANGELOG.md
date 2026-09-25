# CHANGELOG.md

## 1.0.0 — 2026-09-25

Initial release as `model-benchmark-gen`.

- Restructured the loose script collection into a real npm package
  (`package.json`, `main: src/index.js`, `files: ["src"]`, MIT license).
- `generateChart(data, [outputPath])` — grouped bar chart, now returns the SVG
  string and validates input with clear `TypeError`s.
- `generateScatterChart(models, [outputPath], [options])` — new; JavaScript
  port of `pyb.py` / `pym.py` (log-scale params vs intelligence scatter).
- Shorthand input `{ benchmarkName, models: [{ name, percentage }] }` accepted
  alongside the full `{ title, benchmarks }` shape.
- Removed the `sharp` dependency — output is SVG, zero runtime deps.
- Removed `src/data.js` (broken `./codes/generateChart` require), `src/data.json`,
  `src/pyb.py`, `src/pym.py`; equivalents live under `examples/`.
- Added `node:test` smoke tests (`npm test`) and `examples/example.js`.
