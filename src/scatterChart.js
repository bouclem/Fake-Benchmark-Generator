const fs = require('fs');
const path = require('path');
const { generateColors } = require('./colors');
const { escapeXml, niceStep } = require('./utils');

const FONT = 'Segoe UI, Helvetica, Arial, sans-serif';

/**
 * Generates a log-scale scatter chart: model intelligence vs parameter count.
 * JavaScript port of the original matplotlib scripts (pyb.py / pym.py).
 * @param {Array<{name: string, params: number, intelligence: number}>} models
 * @param {string|object} [outputPath] - file path to write, or an options object
 * @param {object} [options] - { title, xLabel, yLabel, width, height, outputPath }
 * @returns {string} the chart as an SVG string
 */
function generateScatterChart(models, outputPath, options = {}) {
  if (outputPath && typeof outputPath === 'object') {
    options = outputPath;
    outputPath = options.outputPath;
  }
  validateModels(models);

  const W = options.width || 1200;
  const H = options.height || 750;
  const padL = 90;
  const padR = 40;
  const padT = 80;
  const padB = 80;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const title = options.title || 'AI Model Intelligence vs Parameters';
  const xLabel = options.xLabel || 'Parameters (Billions)';
  const yLabel = options.yLabel || 'Intelligence';

  // Auto axis limits, mirroring the Python originals:
  // x is log-scaled and padded by 2x on each side; y gets -10/+15 headroom.
  const allParams = models.map(m => m.params);
  const allIntel = models.map(m => m.intelligence);
  const xMin = Math.min(...allParams) / 2;
  const xMax = Math.max(...allParams) * 2;
  const yMin = Math.min(0, Math.min(...allIntel) - 10);
  const yMax = Math.max(...allIntel) + 15;

  const logMin = Math.log10(xMin);
  const logSpan = Math.log10(xMax) - logMin;
  const xToPx = v => padL + ((Math.log10(v) - logMin) / logSpan) * chartW;
  const yToPx = v => padT + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;

  // Background + title
  svg += `<rect width="${W}" height="${H}" fill="#0d1117"/>`;
  svg += `<text x="${W / 2}" y="45" text-anchor="middle" fill="#e6edf3" font-family="${FONT}" font-size="24" font-weight="700">${escapeXml(title)}</text>`;

  // Vertical grid + x tick labels at powers of 10
  for (let e = Math.ceil(logMin); e <= Math.floor(Math.log10(xMax)); e++) {
    const v = Math.pow(10, e);
    const x = xToPx(v);
    svg += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + chartH}" stroke="#21262d" stroke-width="1"/>`;
    svg += `<text x="${x}" y="${padT + chartH + 20}" text-anchor="middle" fill="#7d8590" font-family="${FONT}" font-size="12">${formatTick(v)}</text>`;
  }

  // Horizontal grid + y tick labels at nice steps
  const step = niceStep((yMax - yMin) / 5);
  for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) {
    const y = yToPx(v);
    svg += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#21262d" stroke-width="1"/>`;
    svg += `<text x="${padL - 10}" y="${y + 4}" text-anchor="end" fill="#7d8590" font-family="${FONT}" font-size="12">${Math.round(v * 100) / 100}</text>`;
  }

  // Axes
  svg += `<line x1="${padL}" y1="${padT + chartH}" x2="${W - padR}" y2="${padT + chartH}" stroke="#30363d" stroke-width="1.5"/>`;
  svg += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + chartH}" stroke="#30363d" stroke-width="1.5"/>`;
  svg += `<text x="${padL + chartW / 2}" y="${H - 25}" text-anchor="middle" fill="#7d8590" font-family="${FONT}" font-size="14">${escapeXml(xLabel)}</text>`;
  svg += `<text x="30" y="${padT + chartH / 2}" text-anchor="middle" fill="#7d8590" font-family="${FONT}" font-size="13" transform="rotate(-90 30 ${padT + chartH / 2})">${escapeXml(yLabel)}</text>`;

  // Points + name labels
  const colors = generateColors(models.length);
  models.forEach((m, i) => {
    const x = xToPx(m.params);
    const y = yToPx(m.intelligence);
    svg += `<circle cx="${x}" cy="${y}" r="6" fill="${colors[i]}" opacity="0.9"/>`;
    svg += `<text x="${x + 9}" y="${y - 7}" fill="#e6edf3" font-family="${FONT}" font-size="12">${escapeXml(m.name)}</text>`;
  });

  svg += `</svg>`;

  if (outputPath) {
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outputPath, svg);
  }
  return svg;
}

// Formats a power-of-10 tick without floating point noise.
function formatTick(v) {
  return String(Number(v.toPrecision(v < 1 ? 1 : 2)));
}

function validateModels(models) {
  if (!Array.isArray(models) || models.length === 0) {
    throw new TypeError('generateScatterChart: models must be a non-empty array');
  }
  models.forEach((m, i) => {
    if (!m || typeof m.name !== 'string' || !m.name) {
      throw new TypeError(`generateScatterChart: models[${i}].name must be a non-empty string`);
    }
    if (typeof m.params !== 'number' || !Number.isFinite(m.params) || m.params <= 0) {
      throw new TypeError(`generateScatterChart: models[${i}].params must be a positive finite number`);
    }
    if (typeof m.intelligence !== 'number' || !Number.isFinite(m.intelligence)) {
      throw new TypeError(`generateScatterChart: models[${i}].intelligence must be a finite number`);
    }
  });
}

module.exports = { generateScatterChart };
