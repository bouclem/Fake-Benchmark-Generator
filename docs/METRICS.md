# METRICS.md

## 2026-09-25 — v1.0.0 (npm package restructure)

| Metric | Value | Notes |
|---|---|---|
| Runtime dependencies | 0 | sharp removed (was the only dep, uninstalled) |
| Source LOC | 330 | src/{colors,generateChart,index,scatterChart,utils}.js |
| Test LOC | 88 | test/smoke.test.js (node:test) |
| Example LOC | 41 | examples/example.js |
| Tests | 9 passing / 0 failing | `npm test` |
| npm tarball size | 5.9 kB packed / 17.3 kB unpacked | `npm pack --dry-run`, 8 files |
| Public API surface | 3 functions | generateChart, generateScatterChart, generateColors |

Previous state (pre-package): no package.json, 1 declared-but-uninstalled dep
(sharp), 1 broken require path (`./codes/generateChart` in src/data.js),
2 untested Python scripts duplicating functionality. No baseline metrics existed.
