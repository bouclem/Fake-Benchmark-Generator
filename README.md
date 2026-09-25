# model-benchmark-gen

Generate AI model benchmark charts as SVG. **Zero dependencies.**

Two chart types:

- **Grouped bar chart** — benchmark scores per model (OpenAI/Anthropic style, dark theme)
- **Log-scale scatter chart** — model intelligence vs parameter count

Requires Node.js 18+.

## Install

```bash
npm install model-benchmark-gen
```

Or use it locally from this repo — `require('./src/index')` works as-is, no build step.

## Usage

### Bar chart

```js
const { generateChart } = require('model-benchmark-gen');

const svg = generateChart({
  title: 'Model Evaluation Suite',
  benchmarks: [
    { name: 'MMLU',     models: [{ name: 'VoidGPT 1.1', score: 67.6 }] },
    { name: 'BoolQ',    models: [{ name: 'VoidGPT 1.1', score: 85.3 }] },
    { name: 'Hellaswag', models: [
      { name: 'VoidGPT 1.1', score: 87.9 },
      { name: 'AlexLM 2.0',  score: 84.2 }
    ]}
  ]
}, 'output/benchmark.svg');
// returns the SVG string; passing a path also writes the file
```

Shorthand for a single benchmark:

```js
generateChart({
  benchmarkName: 'My SWE Benchmark',
  models: [
    { name: 'Model A', percentage: 68.1 },
    { name: 'Model B', percentage: 64.3 }
  ]
}, 'output/bench.svg');
```

### Scatter chart

```js
const { generateScatterChart } = require('model-benchmark-gen');

generateScatterChart([
  { name: 'VoidGPT-3', params: 7,  intelligence: 82 },
  { name: 'VoidGPT-4', params: 70, intelligence: 96 }
], 'output/scatter.svg', {
  title: 'AI Model Intelligence vs Parameters',
  xLabel: 'Parameters (Billions)',
  yLabel: 'Intelligence'
});
```

`options` may also be passed as the second argument (`generateScatterChart(models, { xLabel: '...' })`), with `outputPath` inside it.

### API

| Function | Input | Output |
|---|---|---|
| `generateChart(data, [outputPath])` | `{ title, benchmarks: [{ name, models: [{ name, score }] }] }` or `{ benchmarkName, models: [{ name, percentage }] }` | SVG string |
| `generateScatterChart(models, [outputPath], [options])` | `[{ name, params, intelligence }]` — `params` must be > 0 (log scale) | SVG string |
| `generateColors(count)` | number | array of `#rrggbb` colors |

Scores in the bar chart are rendered on a fixed 0–100 axis and clamped visually; the label always shows the real value.

## Development

```bash
npm test          # node:test smoke tests
npm run example   # writes example SVGs to examples/output/
```

## License

MIT
