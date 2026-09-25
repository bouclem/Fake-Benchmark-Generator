// =====================================================
//  Model-Benchmark-Gen — usage example
//  Run from the package root: node examples/example.js
// =====================================================

const { generateChart, generateScatterChart } = require('../src/index');
const path = require('path');

// --- Grouped bar chart (full shape) ---
const benchmarkData = {
  title: 'Model Evaluation Suite',
  benchmarks: [
    { name: 'Hellaswag', models: [{ name: 'VoidGPT 1.1', score: 87.9 }] },
    { name: 'PIQA', models: [{ name: 'VoidGPT 1.1', score: 94.3 }] },
    { name: 'ArithMark-3.0', models: [{ name: 'VoidGPT 1.1', score: 91.9 }] },
    { name: 'ARC Easy', models: [{ name: 'VoidGPT 1.1', score: 90.7 }] },
    { name: 'ARC Challenge', models: [{ name: 'VoidGPT 1.1', score: 72.5 }] },
    { name: 'BoolQ', models: [{ name: 'VoidGPT 1.1', score: 85.3 }] },
    { name: 'MMLU', models: [{ name: 'VoidGPT 1.1', score: 67.6 }] }
  ]
};

const barOut = path.join(__dirname, 'output', 'benchmark.svg');
generateChart(benchmarkData, barOut);
console.log(`Bar chart written to ${barOut}`);

// --- Log-scale scatter chart (params vs intelligence) ---
const models = [
  { name: 'Bold-1.0 12M', params: 11.9, intelligence: 7.2 },
  { name: 'AlexLM-1.0 15M', params: 15.1, intelligence: 9.8 },
  { name: 'VoidGPT-1.1', params: 21.3, intelligence: 11.2 },
  { name: 'VoidGPT-1.5', params: 28.5, intelligence: 24.9 },
  { name: 'AlexLM-1.0 80M', params: 80.8, intelligence: 44.3 },
  { name: 'Bold 1.0 125M', params: 125.4, intelligence: 53.8 },
  { name: 'VoidGPT 1.6', params: 139.8, intelligence: 75.9 },
  { name: 'VoidGPT 1.7', params: 210.2, intelligence: 94.2 }
];

const scatterOut = path.join(__dirname, 'output', 'scatter.svg');
generateScatterChart(models, scatterOut, { xLabel: 'Parameters (Millions)' });
console.log(`Scatter chart written to ${scatterOut}`);
