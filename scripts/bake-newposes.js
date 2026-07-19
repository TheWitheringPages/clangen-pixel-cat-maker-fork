/*
  Bakes the 5 new-generation ClanGen poses (newborn1, newborn2 and the
  three longhair adolescents) for every vanilla layer, so they can be
  offered as sprite numbers 21-25.

  Usage: node scripts/bake-newposes.js <path-to-clangen-repo>

  Only art that exists in new-gen ClanGen can be baked, so these poses
  work for vanilla pelts/eyes/patches/etc. MegaMerge and sparkle
  content has no art for them and will show the error placeholder.

  Output: public/sprites/newposes.png holding a 150x100 tile per group
  (3x2 grid of 50px sprites: poses 21,22,23 / 24,25) plus
  src/assets/spritesIndexNewPoses.json describing each tile.
*/
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const clangenRoot = process.argv[2];
if (!clangenRoot) {
  console.error("Usage: node scripts/bake-newposes.js <path-to-clangen-repo>");
  process.exit(1);
}

const DEV_TILE_W = 200;
const DEV_TILE_H = 400;
const TILE_W = 150; // 3 sprites wide
const TILE_H = 100; // 2 sprites tall
const S = 50;

const NEW_POSES = [
  "newborn1",
  "newborn2",
  "adolescent_long0",
  "adolescent_long1",
  "adolescent_long2",
];

const readJSON = (p) => JSON.parse(readFileSync(p, "utf8"));
const devDict = (name) =>
  readJSON(`${clangenRoot}/sprites/dicts/${name}.json`);

const devPoses = devDict("pose_sprite_data").poses;
const ourIndex = readJSON("src/assets/spritesIndex.json");

const sheetCache = {};
async function rawSheet(name) {
  if (!sheetCache[name]) {
    const img = sharp(`${clangenRoot}/sprites/${name}.png`).ensureAlpha();
    const meta = await img.metadata();
    sheetCache[name] = {
      data: await img.raw().toBuffer(),
      width: meta.width,
      height: meta.height,
    };
  }
  return sheetCache[name];
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

// extracts the 5 new poses of one dev group into a 150x100 tile
async function bakeTile(devSheetName, tileCol, tileRow) {
  const sheet = await rawSheet(devSheetName);
  const tile = Buffer.alloc(TILE_W * TILE_H * 4);
  for (let i = 0; i < NEW_POSES.length; i++) {
    const devIdx = devPoses.indexOf(NEW_POSES[i]);
    const sx = tileCol * DEV_TILE_W + (devIdx % 4) * S;
    const sy = tileRow * DEV_TILE_H + Math.floor(devIdx / 4) * S;
    copySprite(sheet, sx, sy, tile, (i % 3) * S, Math.floor(i / 3) * S, TILE_W);
  }
  return tile;
}

function maskTile(tile, mask) {
  const out = Buffer.from(tile);
  for (let i = 0; i < out.length; i += 4) {
    out[i + 3] = Math.round((out[i + 3] * mask[i + 3]) / 255);
  }
  return out;
}

// names per row of a sprite_list, whether rows are arrays or objects
const rowNames = (row) => (Array.isArray(row) ? row : Object.keys(row));

const tiles = []; // {group, tile}
const skipped = [];

async function addFromDict(dictName, groupPrefix, filter = null) {
  const data = devDict(dictName);
  const sheetName = Array.isArray(data.spritesheet)
    ? null
    : data.spritesheet;
  for (let row = 0; row < data.sprite_list.length; row++) {
    const names = rowNames(data.sprite_list[row]);
    for (let col = 0; col < names.length; col++) {
      const group = `${groupPrefix}${names[col]}`;
      if (!(group in ourIndex)) {
        skipped.push(group);
        continue;
      }
      if (filter && !filter(group)) {
        skipped.push(group);
        continue;
      }
      tiles.push({ group, tile: await bakeTile(sheetName, col, row) });
    }
  }
}

// ---- lineart (always drawn) ----
tiles.push({ group: "lines", tile: await bakeTile("lineart", 0, 0) });
tiles.push({ group: "lineartdead", tile: await bakeTile("lineart_sc", 0, 0) });
tiles.push({ group: "lineartdf", tile: await bakeTile("lineart_df", 0, 0) });

// ---- shading: old shader semantics don't map to the new system, so
// bake transparent tiles so the shading toggle is a no-op on new poses
tiles.push({ group: "shaders", tile: Buffer.alloc(TILE_W * TILE_H * 4) });
tiles.push({ group: "lighting", tile: Buffer.alloc(TILE_W * TILE_H * 4) });

// ---- pelts: every vanilla pattern in every colour ----
{
  const peltData = devDict("pelt_sprite_data");
  const patterns = Object.entries(peltData.spritesheet); // sheet -> names
  for (const [sheetName] of patterns) {
    const prefix = sheetName.replace("colours_", "");
    for (let row = 0; row < peltData.sprite_list.length; row++) {
      const colours = Object.keys(peltData.sprite_list[row]);
      for (let col = 0; col < colours.length; col++) {
        const group = `${prefix}${colours[col]}`;
        if (!(group in ourIndex)) {
          skipped.push(group);
          continue;
        }
        tiles.push({ group, tile: await bakeTile(sheetName, col, row) });
      }
    }
  }
}

// ---- eyes: only groups whose 0-20 art is also vanilla/dev art ----
{
  const eyeData = devDict("eye_sprite_data");
  const heteroMask = await bakeTile("heterochromiamask", 0, 0);
  const vanillaEye = (group, sheet2) => {
    const e = ourIndex[group];
    return (
      e.spritesheet === `cgneweyes${sheet2 ? "2" : ""}` ||
      (e.spritesheet === `eyes${sheet2 ? "2" : ""}` && e.yOffset < 700)
    );
  };
  for (let row = 0; row < eyeData.sprite_list.length; row++) {
    const names = Object.keys(eyeData.sprite_list[row]);
    for (let col = 0; col < names.length; col++) {
      const tile = await bakeTile("eyes", col, row);
      const g1 = `eyes${names[col]}`;
      const g2 = `eyes2${names[col]}`;
      if (g1 in ourIndex && vanillaEye(g1, false)) {
        tiles.push({ group: g1, tile });
      } else {
        skipped.push(g1);
      }
      if (g2 in ourIndex && vanillaEye(g2, true)) {
        tiles.push({ group: g2, tile: maskTile(tile, heteroMask) });
      }
    }
  }
}

// ---- everything else with matching names ----
await addFromDict("skin_sprite_data", "skin");
await addFromDict("white_patches_little_sprite_data", "white");
await addFromDict("white_patches_mid_sprite_data", "white");
await addFromDict("white_patches_high_sprite_data", "white");
await addFromDict("white_patches_mostly_sprite_data", "white");
await addFromDict("white_patches_points_sprite_data", "white");
await addFromDict("white_patches_vitiligo_sprite_data", "white");
await addFromDict("tortie_patches_sprite_data", "tortiemask");
await addFromDict("scar_sprite_data", "scars");
await addFromDict("scar_missing_sprite_data", "scars");
await addFromDict("plant_sprite_data", "acc_herbs");
await addFromDict("wild_sprite_data", "acc_wild");

// ---- pack the sheet ----
{
  const cols = 7;
  const rows = Math.ceil(tiles.length / cols);
  const composites = [];
  const extraIndex = {};
  for (let i = 0; i < tiles.length; i++) {
    const x = (i % cols) * TILE_W;
    const y = Math.floor(i / cols) * TILE_H;
    composites.push({
      input: await sharp(tiles[i].tile, {
        raw: { width: TILE_W, height: TILE_H, channels: 4 },
      })
        .png()
        .toBuffer(),
      left: x,
      top: y,
    });
    extraIndex[tiles[i].group] = {
      spritesheet: "newposes",
      xOffset: x,
      yOffset: y,
    };
  }
  await sharp({
    create: {
      width: cols * TILE_W,
      height: rows * TILE_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile("public/sprites/newposes.png");
  writeFileSync(
    "src/assets/spritesIndexNewPoses.json",
    JSON.stringify(extraIndex, null, 4),
  );
  console.log(`baked new poses for ${tiles.length} groups`);
  console.log(`no dev art (left old-format only): ${skipped.length} groups`);
}
