/*
  Splits the spritesheets according to the JSON file.

  It has to generate several thousand files, so it's a little slow.
*/

import sharp from "sharp";
import fs from "node:fs";

const OUTPUT_DIR = "public/sprites/split";

// clear out folder
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true });
}
fs.mkdirSync(OUTPUT_DIR);

const spritesIndex = JSON.parse(fs.readFileSync("src/assets/spritesIndex.json"));
const spriteNumbers = JSON.parse(fs.readFileSync("src/assets/spritesOffsetMap.json"));

// compact group inventory used by the site to hide incompatible options:
// "all" = groups with art for poses 0-20, "newPoses" = groups that also
// have art for poses 21-25
{
  const extraPosesPath = "src/assets/spritesIndexNewPoses.json";
  const newPoseGroups = fs.existsSync(extraPosesPath)
    ? Object.keys(JSON.parse(fs.readFileSync(extraPosesPath)))
    : [];
  fs.writeFileSync(
    "src/assets/spriteGroups.json",
    JSON.stringify({
      all: Object.keys(spritesIndex),
      newPoses: newPoseGroups,
    }),
  );
}

// group by spritesheet so we aren't constantly opening spritesheets
const batch = {};
for (const [spriteGroupName, spriteGroupInfo] of Object.entries(spritesIndex)) {
  if (batch[spriteGroupInfo.spritesheet] === undefined) {
    batch[spriteGroupInfo.spritesheet] = {};
  }
  batch[spriteGroupInfo.spritesheet][spriteGroupName] = spriteGroupInfo;
}

// extra poses 21-25 live in their own sheet as 150x100 tiles
// (3x2 grid of 50px sprites), described by spritesIndexNewPoses.json
const EXTRA_POSES_PATH = "src/assets/spritesIndexNewPoses.json";
if (fs.existsSync(EXTRA_POSES_PATH)) {
  const extras = JSON.parse(fs.readFileSync(EXTRA_POSES_PATH));
  const extraSheet = fs.readFileSync("public/sprites/newposes.png");
  for (const [group, info] of Object.entries(extras)) {
    for (let i = 0; i < 5; i++) {
      sharp(extraSheet)
        .extract({
          left: info.xOffset + 50 * (i % 3),
          top: info.yOffset + 50 * Math.floor(i / 3),
          width: 50,
          height: 50,
        })
        .toFile(`${OUTPUT_DIR}/${group}_${21 + i}.png`);
    }
  }
}

// by spritesheet
for (const [spritesheet, info] of Object.entries(batch)) {
  const spritesheetImage = fs.readFileSync(`public/sprites/${spritesheet}.png`);
  for (const [spriteGroupName, spriteGroupInfo] of Object.entries(info)) {
    for (const [spriteNumber, spriteNumberInfo] of Object.entries(spriteNumbers)) {
      const spriteXPosition = spriteNumberInfo.x;
      const spriteYPosition = spriteNumberInfo.y;

      sharp(spritesheetImage)
      .extract({
        left: spriteGroupInfo.xOffset + 50 * spriteXPosition,
        top: spriteGroupInfo.yOffset + 50 * spriteYPosition,
        width: 50,
        height: 50,
      })
      .toFile(`${OUTPUT_DIR}/${spriteGroupName}_${spriteNumber}.png`);
    }
  }
}
