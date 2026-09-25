const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { generateChart, generateScatterChart, generateColors } = require('../src/index');

const barData = {
  title: 'Model Evaluation Suite',
  benchmarks: [
    { name: 'MMLU', models: [{ name: 'VoidGPT 1.1', score: 67.6 }] },
    { name: 'BoolQ', models: [{ name: 'VoidGPT 1.1', score: 85.3 }] }
  ]
};

const scatterModels = [
  { name: 'VoidGPT-3', params: 7, intelligence: 82 },
  { name: 'VoidGPT-4', params: 70, intelligence: 96 }
];

test('generateChart returns an SVG string with title and benchmark names', () => {
  const svg = generateChart(barData);
  assert.match(svg, /^<svg/);
  assert.match(svg, /<\/svg>$/);
  assert.ok(svg.includes('Model Evaluation Suite'));
  assert.ok(svg.includes('MMLU'));
  assert.ok(svg.includes('VoidGPT 1.1'));
});

test('generateChart writes the SVG to a file when outputPath is given', () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'mbg-')), 'nested', 'chart.svg');
  const svg = generateChart(barData, out);
  assert.strictEqual(fs.readFileSync(out, 'utf8'), svg);
});

test('generateChart accepts the { benchmarkName, models } shorthand', () => {
  const svg = generateChart({
    benchmarkName: 'My Bench',
    models: [{ name: 'A', percentage: 68.1 }]
  });
  assert.ok(svg.includes('My Bench'));
  assert.ok(svg.includes('68.1'));
});

test('generateChart escapes XML in labels', () => {
  const svg = generateChart({
    title: 'A & B <test>',
    benchmarks: [{ name: 'X', models: [{ name: 'M<M', score: 50 }] }]
  });
  assert.ok(svg.includes('A &amp; B &lt;test&gt;'));
  assert.ok(!svg.includes('M<M'));
});

test('generateChart throws on invalid input', () => {
  assert.throws(() => generateChart(null), TypeError);
  assert.throws(() => generateChart({}), TypeError);
  assert.throws(() => generateChart({ benchmarks: [] }), TypeError);
  assert.throws(() => generateChart({ benchmarks: [{ name: 'X', models: [] }] }), TypeError);
  assert.throws(
    () => generateChart({ benchmarks: [{ name: 'X', models: [{ name: 'M', score: 'high' }] }] }),
    TypeError
  );
});

test('generateScatterChart returns an SVG with model names', () => {
  const svg = generateScatterChart(scatterModels);
  assert.match(svg, /^<svg/);
  assert.ok(svg.includes('VoidGPT-3'));
  assert.ok(svg.includes('Intelligence'));
});

test('generateScatterChart accepts an options object as second arg', () => {
  const svg = generateScatterChart(scatterModels, { xLabel: 'Parameters (Millions)' });
  assert.ok(svg.includes('Parameters (Millions)'));
});

test('generateScatterChart throws on invalid input', () => {
  assert.throws(() => generateScatterChart([]), TypeError);
  assert.throws(() => generateScatterChart([{ name: 'A', params: -1, intelligence: 50 }]), TypeError);
  assert.throws(() => generateScatterChart([{ name: 'A', params: 5 }]), TypeError);
});

test('generateColors returns distinct hex colors', () => {
  const colors = generateColors(5);
  assert.strictEqual(colors.length, 5);
  assert.strictEqual(new Set(colors).size, 5);
  colors.forEach(c => assert.match(c, /^#[0-9a-f]{6}$/));
});
