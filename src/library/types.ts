// Optional post-processing colour adjustment for a sprite slot.
// h: hue shift in degrees (-180..180)
// s: saturation offset in percent (-100..100)
// l: lightness offset in percent (-100..100)
// hex: target colour to blend towards (e.g. "#ff8800"), or null
// mix: how strongly to blend towards hex, in percent (0..100)
type ColourAdjust = {
  h: number;
  s: number;
  l: number;
  hex: string | null;
  mix: number;
};

// Slots that can have an independent colour adjustment applied.
const ADJUST_SLOTS = [
  "pelt",
  "tortie",
  "whitePatches",
  "eyes",
  "eyes2",
  "skin",
  "scars",
  "lineart",
  "accessory",
] as const;

type AdjustSlot = (typeof ADJUST_SLOTS)[number];

type ColourAdjustMap = Partial<Record<AdjustSlot, ColourAdjust>>;

// Hand-drawn pixels layered over the finished sprite.
// Keys are "x,y" (0..49), values are hex colours like "#rrggbb".
type PaintLayer = Record<string, string>;

type Pelt = {
  name: string;
  colour: string;
  skin: string;
  pattern?: string | undefined;
  tortieBase?: string | undefined;
  tortiePattern?: string | undefined;
  tortieColour?: string | undefined;
  spritesName: string;
  whitePatches?: Array<string> | undefined;
  points?: string | undefined;
  vitiligo?: string | undefined;
  eyeColour: string;
  eyeColour2?: string | undefined;
  scars?: Array<string> | undefined;
  tint: string;
  whitePatchesTint: string;
  accessory?: Array<string> | undefined;
  reverse: boolean;
  adjust?: ColourAdjustMap | undefined;
  paint?: PaintLayer | undefined;
};

type JSONData = {
  pelt_name: string;
  pelt_color: string;
  eye_colour: string;
  eye_colour2: string | null;
  reverse: boolean;
  white_patches: string | string[] | null;
  vitiligo: string | null;
  points: string | null;
  white_patches_tint: string;
  pattern: string | null;
  tortie_base: string | null;
  tortie_pattern: string | null;
  tortie_color: string | null;
  skin: string;
  tint: string;
  scars: string | string[] | null;
  accessory: string | string[] | null;
  colour_adjustments?: ColourAdjustMap | null;
  paint?: PaintLayer | null;
};

export { ADJUST_SLOTS };
export type {
  Pelt,
  JSONData,
  ColourAdjust,
  ColourAdjustMap,
  AdjustSlot,
  PaintLayer,
};
