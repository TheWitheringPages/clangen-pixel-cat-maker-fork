/*
  Shared sprite-availability check.

  Not every part combination has art. Mod pelts (ster/silly/dance/mimi/etc.)
  only exist for certain colours, and poses 21-25 only have vanilla parts. The
  build step writes the full inventory of sprite groups to spriteGroups.json;
  a "<peltSpritesName><colour>" group being present means that pelt/colour pair
  can be drawn. The cat maker uses the same inventory to hide invalid options.
*/

import spriteGroups from "../assets/spriteGroups.json";
import { nameToSpritesname } from "./CatData";

const ALL_GROUPS = new Set<string>(spriteGroups.all);
const NEWPOSE_GROUPS = new Set<string>(spriteGroups.newPoses);

// map a pelt display name to the sprite group prefix used in the inventory
export function spritesNameOf(peltName: string): string {
  const mapped = (nameToSpritesname as Record<string, string>)[peltName];
  return mapped !== undefined ? mapped : peltName.toLowerCase();
}

// does art exist for this pelt name in this colour at the given pose?
export function peltColourExists(
  peltName: string,
  colour: string,
  pose: number = 0,
): boolean {
  const groups = pose >= 21 ? NEWPOSE_GROUPS : ALL_GROUPS;
  return groups.has(`${spritesNameOf(peltName)}${colour}`);
}
