import { expect, test } from 'vitest';
import CatData from '../src/library/CatData';

const catURL = "https://cgen-tools.github.io/pixel-cat-maker/?shading=true&reverse=true&isTortie=false&backgroundColour=rgb(0+0+0+%2F+0)&tortieMask=ONE&tortieColour=BLACK&tortiePattern=Classic&peltName=Speckled&spriteNumber=6&colour=BLACK&tint=pink&skinColour=PEACH&eyeColour=YELLOW&eyeColour2=&whitePatches=&points=&whitePatchesTint=&vitiligo=&accessory=HOLLY&scar=&version=v1";

test('test cat URL', () => {
  expect(CatData.
    fromURL(catURL))
    .toMatchObject({
      accessory: ["HOLLY"],
      backgroundColour: "rgb(0 0 0 / 0)",
      colour: "BLACK",
      eyeColour: "YELLOW",
      eyeColour2: null,
      isTortie: false,
      peltName: "Speckled",
      points: null,
      reverse: true,
      scar: [],
      shading: true,
      skinColour: "PEACH",
      spriteNumber: 6,
      tint: "pink",
      tortieColour: "BLACK",
      tortieMask: "ONE",
      tortiePattern: "Classic",
      vitiligo: null,
      whitePatches: [],
      whitePatchesTint: "none",
    });
});

test('colour adjustments and paint survive a URL round-trip', () => {
  const catData = new CatData();
  catData.adjust.pelt = { h: 45, s: -20, l: 10, hex: "#ff8800", mix: 50 };
  catData.adjust.eyes = { h: -90, s: 0, l: 0, hex: null, mix: 100 };
  catData.paint = { "0,0": "#123456", "49,49": "#abcdef" };

  const url = catData.getURL("https://example.com/").toString();
  const restored = CatData.fromURL(url);

  expect(restored.adjust.pelt).toEqual(catData.adjust.pelt);
  expect(restored.adjust.eyes).toEqual(catData.adjust.eyes);
  expect(restored.paint).toEqual(catData.paint);
});

test('no-op adjustments are not serialized', () => {
  const catData = new CatData();
  catData.getAdjust("skin"); // creates a default (no-op) adjustment

  const url = catData.getURL("https://example.com/").toString();
  expect(url).not.toContain("adj_");
  expect(CatData.fromURL(url).adjust).toEqual({});
});
