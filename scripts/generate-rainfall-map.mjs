import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = path.join(root, "scripts/source-data/lebanon-mean-annual-rainfall-vertigo.png");
const overlayPath = path.join(root, "public/data/lebanon-rainfall-zones.png");
const gridPath = path.join(root, "src/data/rainfall-grid.generated.ts");
const boundaryPath = path.join(root, "public/data/lebanon-governorates.geojson");

// Figure 3 palette, ordered exactly as its legend (200–300 mm through >1400 mm).
const palette = [
  [182, 237, 240], [161, 218, 237], [138, 198, 235], [117, 180, 233],
  [92, 163, 229], [65, 146, 227], [31, 132, 224], [33, 111, 211],
  [35, 89, 198], [29, 68, 185], [26, 50, 172], [20, 31, 159], [10, 10, 144],
];
const bandChars = "0123456789ABC";

// Georeferencing from the coordinate ticks printed on the source figure.
const sourceReference = { longitude: 36, x: 478, latitude: 34, y: 503 };
const pixelsPerDegree = { x: 451.875, y: 537 };
const crop = { left: 64, top: 58, width: 719, height: 956 };
const bounds = {
  west: sourceReference.longitude + (crop.left - sourceReference.x) / pixelsPerDegree.x,
  east: sourceReference.longitude + (crop.left + crop.width - 1 - sourceReference.x) / pixelsPerDegree.x,
  north: sourceReference.latitude - (crop.top - sourceReference.y) / pixelsPerDegree.y,
  south: sourceReference.latitude - (crop.top + crop.height - 1 - sourceReference.y) / pixelsPerDegree.y,
};

const { data, info } = await sharp(sourcePath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const colorAt = (x, y) => {
  const offset = (y * info.width + x) * info.channels;
  return [data[offset], data[offset + 1], data[offset + 2]];
};
const exactBandAt = (x, y) => {
  const [r, g, b] = colorAt(x, y);
  let best = -1;
  let bestDistance = Infinity;
  for (let index = 0; index < palette.length; index += 1) {
    const [pr, pg, pb] = palette[index];
    const distance = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (distance < bestDistance) { best = index; bestDistance = distance; }
  }
  return bestDistance <= 12 ** 2 ? best : -1;
};
const nearestBandAt = (x, y) => {
  const direct = exactBandAt(x, y);
  if (direct >= 0) return direct;
  for (let radius = 1; radius <= 18; radius += 1) {
    const counts = new Array(palette.length).fill(0);
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        const px = x + dx;
        const py = y + dy;
        if (px < 0 || py < 0 || px >= info.width || py >= info.height) continue;
        const band = exactBandAt(px, py);
        if (band >= 0) counts[band] += 1;
      }
    }
    const maximum = Math.max(...counts);
    if (maximum > 0) return counts.indexOf(maximum);
  }
  return -1;
};

const overlay = Buffer.alloc(crop.width * crop.height * 4);
const rowSpans = Array.from({ length: crop.height }, (_, y) => {
  const sourceY = crop.top + y;
  let first = -1;
  let last = -1;
  for (let x = 0; x < crop.width; x += 1) {
    const sourceX = crop.left + x;
    const inPrintedLegend = sourceX >= 540 && sourceY >= 700;
    if (!inPrintedLegend && exactBandAt(sourceX, sourceY) >= 0) {
      if (first < 0) first = x;
      last = x;
    }
  }
  return [first, last];
});

const spanAt = (y) => {
  if (rowSpans[y]?.[0] >= 0) return [...rowSpans[y], y];
  for (let distance = 1; distance < 40; distance += 1) {
    if (rowSpans[y - distance]?.[0] >= 0) return [...rowSpans[y - distance], y - distance];
    if (rowSpans[y + distance]?.[0] >= 0) return [...rowSpans[y + distance], y + distance];
  }
  return [-1, -1, y];
};
const edgeBandAt = (y, side) => {
  const counts = new Array(palette.length).fill(0);
  for (let dy = -12; dy <= 12; dy += 1) {
    const span = rowSpans[y + dy];
    if (!span || span[0] < 0) continue;
    const [first, last] = span;
    const start = side === "left" ? first : Math.max(first, last - 28);
    const end = side === "left" ? Math.min(last, first + 28) : last;
    for (let x = start; x <= end; x += 1) {
      const band = exactBandAt(crop.left + x, crop.top + y + dy);
      if (band >= 0) counts[band] += 1;
    }
  }
  const maximum = Math.max(...counts);
  return maximum > 0 ? counts.indexOf(maximum) : -1;
};
const edgeBands = Array.from({ length: crop.height }, (_, y) => ({ left: edgeBandAt(y, "left"), right: edgeBandAt(y, "right") }));
const bandForOverlayPixel = (x, y) => {
  const [first, last, sourceRow] = spanAt(y);
  if (first < 0) return -1;
  if (x < first) return edgeBands[sourceRow].left;
  if (x > last) return edgeBands[sourceRow].right;
  return nearestBandAt(crop.left + x, crop.top + sourceRow);
};

// Render the exact same OCHA boundary geometry used by Leaflet as the raster alpha mask.
// This guarantees that the rainfall surface meets the visible national border everywhere.
const boundaries = JSON.parse(await readFile(boundaryPath, "utf8"));
const project = ([longitude, latitude]) => [
  ((longitude - bounds.west) / (bounds.east - bounds.west)) * (crop.width - 1),
  ((bounds.north - latitude) / (bounds.north - bounds.south)) * (crop.height - 1),
];
const ringPath = (ring) => {
  const projected = ring.map(project);
  const simplified = projected.filter(([x, y], index) => {
    if (index === 0 || index === projected.length - 1) return true;
    const [previousX, previousY] = projected[index - 1];
    return Math.hypot(x - previousX, y - previousY) >= 0.35;
  });
  return simplified.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join("") + "Z";
};
const geometryPath = (geometry) => {
  if (geometry.type === "Polygon") return geometry.coordinates.map(ringPath).join("");
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flatMap((polygon) => polygon.map(ringPath)).join("");
  return "";
};
const boundaryPaths = boundaries.features.map(({ geometry }) => `<path d="${geometryPath(geometry)}" fill="#fff" stroke="#fff" stroke-width="0.5" stroke-linejoin="round" fill-rule="evenodd"/>`).join("");
const maskSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${crop.width}" height="${crop.height}" viewBox="0 0 ${crop.width} ${crop.height}">${boundaryPaths}</svg>`);
const { data: mask, info: maskInfo } = await sharp(maskSvg).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const maskAlphaAt = (x, y) => mask[(y * crop.width + x) * maskInfo.channels + 3];

for (let y = 0; y < crop.height; y += 1) {
  for (let x = 0; x < crop.width; x += 1) {
    const alpha = maskAlphaAt(x, y);
    const band = alpha ? bandForOverlayPixel(x, y) : -1;
    const offset = (y * crop.width + x) * 4;
    if (band < 0) continue;
    const [r, g, b] = palette[band];
    overlay[offset] = r;
    overlay[offset + 1] = g;
    overlay[offset + 2] = b;
    overlay[offset + 3] = Math.round((alpha / 255) * 225);
  }
}

await mkdir(path.dirname(overlayPath), { recursive: true });
await sharp(overlay, { raw: { width: crop.width, height: crop.height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(overlayPath);

const step = 0.005;
const columns = Math.round((bounds.east - bounds.west) / step) + 1;
const rows = Math.round((bounds.north - bounds.south) / step) + 1;
const grid = [];
for (let row = 0; row < rows; row += 1) {
  const latitude = bounds.north - row * step;
  let encoded = "";
  for (let column = 0; column < columns; column += 1) {
    const longitude = bounds.west + column * step;
    const x = Math.round(sourceReference.x + (longitude - sourceReference.longitude) * pixelsPerDegree.x);
    const y = Math.round(sourceReference.y - (latitude - sourceReference.latitude) * pixelsPerDegree.y);
    const localX = Math.max(0, Math.min(crop.width - 1, x - crop.left));
    const localY = Math.max(0, Math.min(crop.height - 1, y - crop.top));
    const insideLebanon = maskAlphaAt(localX, localY) >= 128;
    const band = insideLebanon ? bandForOverlayPixel(localX, localY) : -1;
    encoded += band < 0 ? "-" : bandChars[band];
  }
  grid.push(encoded);
}

const generated = `// Generated by scripts/generate-rainfall-map.mjs from VertigO/OpenEdition Figure 3.\n` +
  `export const RAINFALL_GRID_STEP = ${step} as const;\n` +
  `export const RAINFALL_GRID_BOUNDS = ${JSON.stringify(bounds)} as const;\n` +
  `export const RAINFALL_GRID_BAND_CHARS = ${JSON.stringify(bandChars)} as const;\n` +
  `export const RAINFALL_GRID_ROWS = ${JSON.stringify(grid, null, 2)} as const;\n`;
await writeFile(gridPath, generated, "utf8");

console.log(`Generated ${path.relative(root, overlayPath)} and ${path.relative(root, gridPath)} (${columns} × ${rows} cells).`);
