# LESSONS.md

## 2026-09-25 — npm package restructuring

- `src/data.js` required `./codes/generateChart`, a directory that never existed —
  the demo script was dead code. Always trace `require` paths when inheriting scripts.
- The project kept two parallel implementations (JS bar chart, Python scatter
  plots) with duplicated model data. Porting the Python side to JS removed the
  matplotlib dependency and unified the API.
- `sharp` was only used to rasterize SVG → PNG. Dropping it (user requirement:
  zero deps) made the package synchronous and install-free — SVG output is also
  sharper than the PNG it replaced.
- npm package names must be lowercase: `Model-Benchmark-Gen` is published as
  `model-benchmark-gen`.
