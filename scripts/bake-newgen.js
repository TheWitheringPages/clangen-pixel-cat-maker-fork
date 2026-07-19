/*
  Bakes new-generation ClanGen (dev branch) sprite art down into this
  repo's old-format sheets.

  Usage: node scripts/bake-newgen.js <path-to-clangen-repo>

  New-gen groups are 200x400 tiles (4x8 grid of 50px sprites, pose
  order from sprites/dicts/pose_sprite_data.json). Old-format groups
  are 150x350 tiles (3x7 grid, poses 0-20). Each baked tile is built
  by copying the 21 old poses out of the new tile one sprite at a
  time.

  What gets baked:
  - Freckled pelt in all colours -> new freckledcolours.png sheet
  - Eye colours we don't already have -> cgneweyes.png/cgneweyes2.png
    (heterochromia versions are cut with the new heterochromiamask)
  - White patches / points / vitiligo: names we already have get
    their art replaced in place (clarity updates); new names are
    appended to whitepatches.png
*/
import sharp from "sharp";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const clangenRoot = process.argv[2];
if (!clangenRoot) {
  console.error("Usage: node scripts/bake-newgen.js <path-to-clangen-repo>");
  process.exit(1);
}

const DEV_TILE_W = 200;
const DEV_TILE_H = 400;
const OLD_TILE_W = 150;
const OLD_TILE_H = 350;
const S = 50; // sprite size

const readJSON = (p) => JSON.parse(readFileSync(p, "utf8"));
const devDict = (name) =>
  readJSON(`${clangenRoot}/sprites/dicts/${name}.json`);
const devSheet = (name) => `${clangenRoot}/sprites/${name}.png`;

const poseData = devDict("pose_sprite_data");
const devPoses = poseData.poses;

// old pose number (0-20) -> new-gen pose name
const OLD_TO_DEV = [
  "kitten0", "kitten1", "kitten2",
  "adolescent_short0", "adolescent_short1", "adolescent_short2",
  "adult_short0", "adult_short1", "adult_short2",
  "adult_long0", "adult_long1", "adult_long2",
  "senior0", "senior1", "senior2",
  "para_adult_short0", "para_adult_long0", "para_young0",
  "sick_adult0", "sick_adolescent0", "newborn0",
];

const ourIndexPath = "src/assets/spritesIndex.json";
const ourIndex = readJSON(ourIndexPath);

// cache raw sheet buffers so we only decode each once
const sheetCache = {};
async function rawSheet(path) {
  if (!sheetCache[path]) {
    const img = sharp(path).ensureAlpha();
    const meta = await img.metadata();
    sheetCache[path] = {
      data: await img.raw().toBuffer(),
      width: meta.width,
      height: meta.height,
    };
  }
  return sheetCache[path];
}

function copySprite(src, sx, sy, dst, dx, dy, dstWidth) {
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const si = ((sy + y) * src.width + sx + x) * 4;
      const di = ((dy + y) * dstWidth + dx + x) * 4;
      dst[di] = src.data[si];
      dst[di + 1] = src.data[si + 1];
      dst[di + 2] = src.data[si + 2];
      dst[di + 3] = src.data[si + 3];
    }
  }
}

/*
  Extracts one dev group (by tile position) and rearranges its sprites
  into an old-format 150x350 raw tile.
*/
async function bakeTile(sheetPath, tileCol, tileRow) {
  const sheet = await rawSheet(sheetPath);
  const tile = Buffer.alloc(OLD_TILE_W * OLD_TILE_H * 4);
  for (let oldPose = 0; oldPose < 21; oldPose++) {
    const devIdx = devPoses.indexOf(OLD_TO_DEV[oldPose]);
    if (devIdx === -1) {
      console.warn(`  missing dev pose ${OLD_TO_DEV[oldPose]}`);
      continue;
    }
    const sx = tileCol * DEV_TILE_W + (devIdx % 4) * S;
    const sy = tileRow * DEV_TILE_H + Math.floor(devIdx / 4) * S;
    const dx = (oldPose % 3) * S;
    const dy = Math.floor(oldPose / 3) * S;
    copySprite(sheet, sx, sy, tile, dx, dy, OLD_TILE_W);
  }
  return tile;
}

function tileToSharp(tile) {
  return sharp(tile, {
    raw: { width: OLD_TILE_W, height: OLD_TILE_H, channels: 4 },
  });
}

// masks tileA's alpha by tileB's alpha (for heterochromia second eyes)
function maskTile(tile, mask) {
  const out = Buffer.from(tile);
  for (let i = 0; i < out.length; i += 4) {
    out[i + 3] = Math.round((out[i + 3] * mask[i + 3]) / 255);
  }
  return out;
}

/*
  Assembles named 150x350 tiles into a packed sheet (7 tiles per row)
  and registers the groups in our sprites index.
*/
async function writeNewSheet(sheetName, tiles) {
  const cols = 7;
  const rows = Math.ceil(tiles.length / cols);
  const composites = [];
  for (let i = 0; i < tiles.length; i++) {
    const x = (i % cols) * OLD_TILE_W;
    const y = Math.floor(i / cols) * OLD_TILE_H;
    composites.push({
      input: await tileToSharp(tiles[i].tile).png().toBuffer(),
      left: x,
      top: y,
    });
    ourIndex[tiles[i].group] = {
      spritesheet: sheetName,
      xOffset: x,
      yOffset: y,
    };
  }
  await sharp({
    create: {
      width: cols * OLD_TILE_W,
      height: rows * OLD_TILE_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(`public/sprites/${sheetName}.png`);
  console.log(`wrote ${sheetName}.png (${tiles.length} groups)`);
}

// ---- 1. Freckled pelt ----

const peltData = devDict("pelt_sprite_data");
{
  const freckledTiles = [];
  for (let row = 0; row < peltData.sprite_list.length; row++) {
    const colours = Object.keys(peltData.sprite_list[row]);
    for (let col = 0; col < colours.length; col++) {
      const tile = await bakeTile(devSheet("colours_freckled"), col, row);
      freckledTiles.push({ group: `freckled${colours[col]}`, tile });
    }
  }
  await writeNewSheet("freckledcolours", freckledTiles);
}

// ---- 2. New eye colours (+ heterochromia versions) ----

{
  const eyeData = devDict("eye_sprite_data");
  const heteroMask = await bakeTile(devSheet("heterochromiamask"), 0, 0);

  const eyeTiles = [];
  const eye2Tiles = [];
  for (let row = 0; row < eyeData.sprite_list.length; row++) {
    const names = Object.keys(eyeData.sprite_list[row]);
    for (let col = 0; col < names.length; col++) {
      const name = names[col];
      if (`eyes${name}` in ourIndex) {
        continue; // already have an eye colour with this name
      }
      const tile = await bakeTile(devSheet("eyes"), col, row);
      eyeTiles.push({ group: `eyes${name}`, tile });
      eye2Tiles.push({ group: `eyes2${name}`, tile: maskTile(tile, heteroMask) });
    }
  }
  if (eyeTiles.length > 0) {
    await writeNewSheet("cgneweyes", eyeTiles);
    await writeNewSheet("cgneweyes2", eye2Tiles);
    console.log(
      "new eye colours:",
      eyeTiles.map((t) => t.group.slice(4)).join(", "),
    );
  }
}

// ---- 3. White patches / points / vitiligo ----

{
  const patchDicts = [
    "white_patches_little_sprite_data",
    "white_patches_mid_sprite_data",
    "white_patches_high_sprite_data",
    "white_patches_mostly_sprite_data",
    "white_patches_points_sprite_data",
    "white_patches_vitiligo_sprite_data",
  ];

  const updates = {}; // our sheet -> composites
  const additions = [];
  const updatedNames = [];

  for (const dictName of patchDicts) {
    const data = devDict(dictName);
    const sheetPath = devSheet(data.spritesheet);
    if (!existsSync(sheetPath)) {
      console.warn(`missing dev sheet ${data.spritesheet}, skipping`);
      continue;
    }
    for (let row = 0; row < data.sprite_list.length; row++) {
      const names = data.sprite_list[row];
      for (let col = 0; col < names.length; col++) {
        const group = `white${names[col]}`;
        const tile = await bakeTile(sheetPath, col, row);
        if (group in ourIndex) {
          const entry = ourIndex[group];
          (updates[entry.spritesheet] ??= []).push({
            input: await tileToSharp(tile).png().toBuffer(),
            left: Math.round(entry.xOffset),
            top: Math.round(entry.yOffset),
          });
          updatedNames.push(names[col]);
        } else {
          additions.push({ group, tile });
        }
      }
    }
  }

  for (const [sheet, composites] of Object.entries(updates)) {
    const path = `public/sprites/${sheet}.png`;
    // clear each replaced tile region first so old art doesn't bleed
    // through transparent pixels of the new art
    const meta = await sharp(path).metadata();
    const base = await rawSheet(path);
    const cleared = Buffer.from(base.data);
    for (const c of composites) {
      for (let y = 0; y < OLD_TILE_H; y++) {
        const start = ((c.top + y) * meta.width + c.left) * 4;
        cleared.fill(0, start, start + OLD_TILE_W * 4);
      }
    }
    const out = await sharp(cleared, {
      raw: { width: meta.width, height: meta.height, channels: 4 },
    })
      .composite(composites)
      .png()
      .toBuffer();
    writeFileSync(path, out);
    console.log(`updated ${composites.length} patch tiles in ${sheet}.png`);
  }

  if (additions.length > 0) {
    await writeNewSheet("cgnewpatches", additions);
    console.log(
      "new patches:",
      additions.map((t) => t.group.slice(5)).join(", "),
    );
  }
  console.log(`replaced art for ${updatedNames.length} existing patches`);
}

writeFileSync(ourIndexPath, JSON.stringify(ourIndex, null, 4));
console.log("index updated");
