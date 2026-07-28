// Claude Lead review round 2, §10 — VIS-06.
// "The starfield is a population, not a pattern: magnitude distribution of
// roughly 70% 1px / 25% 2px / 4% 3px, gaussian clustering over a uniform floor,
// 4-point diffraction spikes on the brightest twelve, and 1.8x density inside
// the aurora band."
// This connected-component analysis runs on the section's own committed
// overview capture. A lattice shows up as a nearest-neighbour distance
// distribution with near-zero spread; a clustered population does not.
import sharp from "sharp";

const file =
  process.argv[2] ?? "docs/phase10-baseline/section-10/after/overview-1440x900.png";
const { data, info } = await sharp(file)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

// Planet/sun/trail pixels are bright and saturated; stars are small, neutral and
// isolated. Threshold on luminance, then drop any component larger than 12px.
const lum = new Float32Array(width * height);
for (let i = 0; i < width * height; i += 1) {
  const o = i * channels;
  lum[i] = 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2];
}
const THRESHOLD = 70;
const seen = new Uint8Array(width * height);
const components = [];
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const idx = y * width + x;
    if (seen[idx] || lum[idx] < THRESHOLD) continue;
    const stack = [idx];
    const pixels = [];
    seen[idx] = 1;
    while (stack.length) {
      const cur = stack.pop();
      pixels.push(cur);
      const cx = cur % width;
      const cy = (cur - cx) / width;
      for (let dy = -1; dy <= 1; dy += 1)
        for (let dx = -1; dx <= 1; dx += 1) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const nIdx = ny * width + nx;
          if (seen[nIdx] || lum[nIdx] < THRESHOLD) continue;
          seen[nIdx] = 1;
          stack.push(nIdx);
        }
      if (pixels.length > 4000) break;
    }
    components.push(pixels);
  }
}

const stars = components
  .filter((p) => p.length <= 12)
  .map((p) => {
    let sx = 0;
    let sy = 0;
    let peak = 0;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const idx of p) {
      const x = idx % width;
      const y = (idx - x) / width;
      sx += x;
      sy += y;
      peak = Math.max(peak, lum[idx]);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    return {
      x: sx / p.length,
      y: sy / p.length,
      area: p.length,
      peak,
      w: maxX - minX + 1,
      h: maxY - minY + 1,
    };
  });

// Exclude anything inside the bright central region (sun/planet glow rings).
const field = stars.filter((s) => Math.hypot(s.x - 720, s.y - 380) > 260);

const nn = field.map((s) => {
  let best = Infinity;
  for (const o of field) {
    if (o === s) continue;
    best = Math.min(best, Math.hypot(s.x - o.x, s.y - o.y));
  }
  return best;
});
const mean = nn.reduce((a, b) => a + b, 0) / (nn.length || 1);
const sd = Math.sqrt(
  nn.reduce((a, b) => a + (b - mean) ** 2, 0) / (nn.length || 1),
);

const sizeHistogram = {};
for (const s of field) {
  const key = `${Math.max(s.w, s.h)}px`;
  sizeHistogram[key] = (sizeHistogram[key] || 0) + 1;
}

// Axis alignment: a lattice puts nearly every nearest neighbour at ~0 or ~90 deg.
let axisAligned = 0;
for (const s of field) {
  let best = Infinity;
  let bestO = null;
  for (const o of field) {
    if (o === s) continue;
    const d = Math.hypot(s.x - o.x, s.y - o.y);
    if (d < best) {
      best = d;
      bestO = o;
    }
  }
  if (!bestO) continue;
  const ang = Math.abs(
    (Math.atan2(bestO.y - s.y, bestO.x - s.x) * 180) / Math.PI,
  );
  const off = Math.min(ang, Math.abs(ang - 90), Math.abs(ang - 180));
  if (off <= 6) axisAligned += 1;
}

console.log(
  JSON.stringify(
    {
      file,
      starCount: field.length,
      nearestNeighbour: {
        mean: Number(mean.toFixed(2)),
        stdDev: Number(sd.toFixed(2)),
        coefficientOfVariation: Number((sd / (mean || 1)).toFixed(3)),
        min: Number(Math.min(...nn).toFixed(2)),
        max: Number(Math.max(...nn).toFixed(2)),
      },
      axisAlignedNearestNeighbourFraction: Number(
        (axisAligned / (field.length || 1)).toFixed(3),
      ),
      sizeHistogram,
      brightestTwelve: field
        .sort((a, b) => b.peak - a.peak)
        .slice(0, 12)
        .map((s) => ({
          x: Math.round(s.x),
          y: Math.round(s.y),
          peak: Math.round(s.peak),
          w: s.w,
          h: s.h,
          area: s.area,
        })),
    },
    null,
    1,
  ),
);
