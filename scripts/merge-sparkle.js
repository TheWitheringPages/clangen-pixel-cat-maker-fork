/*
  One-off merge of new sprite groups from the pixel-cat-maker-sparkle
  repo into this repo's spritesheets.

  Usage: node scripts/merge-sparkle.js <path-to-sparkle-repo>

  For sheets we don't have, the whole file is copied. For sheets we do
  have (whose layouts have diverged from sparkle's), each new group's
  150x350 tile is cut from sparkle's sheet and appended below our
  sheet, so existing art and offsets are never touched.
*/
import sharp from "sharp";
import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  existsSync,
} from "node:fs";

const TILE_W = 150;
const TILE_H = 350;

const sparkleRoot = process.argv[2];
if (!sparkleRoot) {
  console.error("Usage: node scripts/merge-sparkle.js <path-to-sparkle-repo>");
  process.exit(1);
}

const ourIndexPath = "src/assets/spritesIndex.json";
const ourIndex = JSON.parse(readFileSync(ourIndexPath, "utf8"));
const spIndex = JSON.parse(
  readFileSync(`${sparkleRoot}/src/assets/spritesIndex.json`, "utf8"),
);

const newKeys = Object.keys(spIndex).filter((k) => !(k in ourIndex));
const bySheet = {};
for (const k of newKeys) {
  (bySheet[spIndex[k].spritesheet] ??= []).push(k);
}

for (const [sheet, keys] of Object.entries(bySheet)) {
  const ourPath = `public/sprites/${sheet}.png`;
  const spPath = `${sparkleRoot}/public/sprites/${sheet}.png`;

  if (!existsSync(ourPath)) {
    copyFileSync(spPath, ourPath);
    for (const k of keys) {
      ourIndex[k] = spIndex[k];
    }
    console.log(`copied ${sheet}.png (+${keys.length} groups)`);
    continue;
  }

  const spMeta = await sharp(spPath).metadata();
  const meta = await sharp(ourPath).metadata();
  const cols = Math.floor(meta.width / TILE_W);
  const composites = [];
  let placed = 0;

  for (const k of keys) {
    const entry = spIndex[k];
    const left = Math.round(entry.xOffset);
    const top = Math.round(entry.yOffset);
    if (left + TILE_W > spMeta.width || top + TILE_H > spMeta.height) {
      console.warn(`SKIPPED ${k}: tile out of bounds on sparkle ${sheet}.png`);
      continue;
    }
    const tile = await sharp(spPath)
      .extract({ left, top, width: TILE_W, height: TILE_H })
      .toBuffer();
    const x = (placed % cols) * TILE_W;
    const y = meta.height + Math.floor(placed / cols) * TILE_H;
    composites.push({ input: tile, left: x, top: y });
    ourIndex[k] = { spritesheet: sheet, xOffset: x, yOffset: y };
    placed++;
  }

  if (placed === 0) {
    continue;
  }
  const addedRows = Math.ceil(placed / cols);
  const out = await sharp(ourPath)
    .extend({
      bottom: addedRows * TILE_H,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .composite(composites)
    .png()
    .toBuffer();
  writeFileSync(ourPath, out);
  console.log(`extended ${sheet}.png (+${placed} groups)`);
}

writeFileSync(ourIndexPath, JSON.stringify(ourIndex, null, 4));
console.log(`done: ${newKeys.length} new groups`);
