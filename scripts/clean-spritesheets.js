// Removes the unsplit spritesheets from dist after building.
// Only the split sprites in dist/sprites/split are used by the site.
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const spritesDir = join("dist", "sprites");

for (const file of readdirSync(spritesDir)) {
  if (file.endsWith(".png")) {
    rmSync(join(spritesDir, file));
  }
}
