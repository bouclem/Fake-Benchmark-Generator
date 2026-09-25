// Generates visually distinct colors for any number of models.
// Uses golden-ratio hue distribution with varying saturation/lightness.

function generateColors(count) {
  const colors = [];
  const goldenRatio = 0.618033988749895;

  for (let i = 0; i < count; i++) {
    const hue = ((i * goldenRatio * 360) % 360);
    const saturation = 55 + ((i * 13) % 25); // 55-80
    const lightness = 45 + ((i * 7) % 15);   // 45-60
    colors.push(hslToHex(hue, saturation, lightness));
  }

  return colors;
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

module.exports = { generateColors };
