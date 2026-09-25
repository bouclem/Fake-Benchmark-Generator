const fs = require('fs');
const path = require('path');
const { generateColors } = require('./colors');
const { escapeXml } = require('./utils');

const FONT = 'Segoe UI, Helvetica, Arial, sans-serif';

/**
 * Generates a grouped bar chart benchmark image (OpenAI/Anthropic style).
 * @param {object} data - { title, benchmarks: [{ name, models: [{ name, score }] }] }
 *                        or shorthand { benchmarkName, models: [{ name, percentage }] }
 * @param {string} [outputPath] - if set, writes the SVG to this file
 * @returns {string} the chart as an SVG string
 */
function generateChart(data, outputPath) {
  const { title, benchmarks } = normalizeData(data);
  const modelNames = [...new Set(benchmarks.flatMap(b => b.models.map(m => m.name)))];
  const colors = generateColors(modelNames.length);
  const colorMap = {};
  modelNames.forEach((name, i) => { colorMap[name] = colors[i]; });

  // --- Layout constants ---
  const W = 1200;
  const H = 720;
  const padL = 80;
  const padR = 40;
  const padT = 90;
  const padB = 120;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const groupCount = benchmarks.length;
  const barCount = modelNames.length;
  const groupGap = 28;
  const barGap = 4;
  const groupW = (chartW - groupGap * (groupCount - 1)) / groupCount;
  const barW = (groupW - barGap * (barCount - 1)) / barCount;

  // --- Build SVG ---
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;

  // Background
  svg += `<rect width="${W}" height="${H}" fill="#0d1117"/>`;

  // Title
  svg += `<text x="${W / 2}" y="48" text-anchor="middle" fill="#e6edf3" font-family="${FONT}" font-size="26" font-weight="700">${escapeXml(title)}</text>`;
  svg += `<text x="${W / 2}" y="72" text-anchor="middle" fill="#7d8590" font-family="${FONT}" font-size="14">Higher is better</text>`;

  // Y-axis grid lines + labels
  const ySteps = [0, 20, 40, 60, 80, 100];
  for (const step of ySteps) {
    const y = padT + chartH - (step / 100) * chartH;
    svg += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#21262d" stroke-width="1"/>`;
    svg += `<text x="${padL - 12}" y="${y + 4}" text-anchor="end" fill="#7d8590" font-family="${FONT}" font-size="12">${step}</text>`;
  }

  // Y-axis label
  svg += `<text x="28" y="${padT + chartH / 2}" text-anchor="middle" fill="#7d8590" font-family="${FONT}" font-size="13" transform="rotate(-90 28 ${padT + chartH / 2})">Score (%)</text>`;

  // Bars
  benchmarks.forEach((bench, gi) => {
    const groupX = padL + gi * (groupW + groupGap);

    bench.models.forEach((model, mi) => {
      const clamped = Math.max(0, Math.min(100, model.score));
      const barH = (clamped / 100) * chartH;
      const barX = groupX + mi * (barW + barGap);
      const barY = padT + chartH - barH;
      const color = colorMap[model.name];

      // Bar with rounded top
      const r = Math.min(4, barW / 2);
      svg += `<rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" fill="${color}" rx="${r}" ry="${r}" opacity="0.9"/>`;

      // Score label above bar
      svg += `<text x="${barX + barW / 2}" y="${barY - 6}" text-anchor="middle" fill="#e6edf3" font-family="${FONT}" font-size="11" font-weight="600">${model.score.toFixed(1)}</text>`;
    });

    // Benchmark name under group
    svg += `<text x="${groupX + groupW / 2}" y="${padT + chartH + 22}" text-anchor="middle" fill="#e6edf3" font-family="${FONT}" font-size="13" font-weight="600">${escapeXml(bench.name)}</text>`;
  });

  // X-axis line
  svg += `<line x1="${padL}" y1="${padT + chartH}" x2="${W - padR}" y2="${padT + chartH}" stroke="#30363d" stroke-width="1.5"/>`;

  // Legend
  const legendY = H - 45;
  let legendX = padL;
  modelNames.forEach((name, i) => {
    const color = colors[i];
    svg += `<rect x="${legendX}" y="${legendY - 10}" width="14" height="14" fill="${color}" rx="3" ry="3"/>`;
    svg += `<text x="${legendX + 20}" y="${legendY + 1}" fill="#e6edf3" font-family="${FONT}" font-size="13">${escapeXml(name)}</text>`;
    legendX += 20 + name.length * 7.5 + 30;
  });

  svg += `</svg>`;

  if (outputPath) writeFile(outputPath, svg);
  return svg;
}

// Accepts the full shape ({ title, benchmarks }) or the shorthand
// ({ benchmarkName, models: [{ name, percentage }] }), validates it,
// and returns { title, benchmarks }.
function normalizeData(data) {
  if (!data || typeof data !== 'object') {
    throw new TypeError('generateChart: data must be an object');
  }

  let title;
  let benchmarks;
  if (Array.isArray(data.benchmarks)) {
    title = data.title;
    benchmarks = data.benchmarks;
  } else if (Array.isArray(data.models)) {
    title = data.title || data.benchmarkName;
    benchmarks = [{
      name: data.benchmarkName || 'Score',
      models: data.models.map(m => ({
        name: m && m.name,
        score: m && (m.score !== undefined ? m.score : m.percentage)
      }))
    }];
  } else {
    throw new TypeError('generateChart: data must have a "benchmarks" array or a "models" array');
  }

  if (benchmarks.length === 0) {
    throw new TypeError('generateChart: data.benchmarks must be a non-empty array');
  }
  benchmarks.forEach((bench, i) => {
    if (typeof bench.name !== 'string' || !bench.name) {
      throw new TypeError(`generateChart: benchmarks[${i}].name must be a non-empty string`);
    }
    if (!Array.isArray(bench.models) || bench.models.length === 0) {
      throw new TypeError(`generateChart: benchmarks[${i}].models must be a non-empty array`);
    }
    bench.models.forEach((model, j) => {
      if (!model || typeof model.name !== 'string' || !model.name) {
        throw new TypeError(`generateChart: benchmarks[${i}].models[${j}].name must be a non-empty string`);
      }
      if (typeof model.score !== 'number' || !Number.isFinite(model.score)) {
        throw new TypeError(`generateChart: benchmarks[${i}].models[${j}].score must be a finite number`);
      }
    });
  });

  return { title: title || 'Benchmark', benchmarks };
}

function writeFile(outputPath, svg) {
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outputPath, svg);
}

module.exports = { generateChart };
