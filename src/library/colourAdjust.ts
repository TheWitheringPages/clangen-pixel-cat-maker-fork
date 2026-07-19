import { ColourAdjust } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// r, g, b in 0..255; returns h in 0..360, s and l in 0..1
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, l];
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h;
  if (max === r) {
    h = (g - b) / d + (g < b ? 6 : 0);
  } else if (max === g) {
    h = (b - r) / d + 2;
  } else {
    h = (r - g) / d + 4;
  }

  return [h * 60, s, l];
}

// h in 0..360, s and l in 0..1; returns r, g, b in 0..255
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function parseHex(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (match === null) {
    return null;
  }
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function isNoopAdjust(adjust: ColourAdjust | undefined): boolean {
  if (adjust === undefined) {
    return true;
  }
  const hexActive =
    adjust.hex !== null && adjust.mix > 0 && parseHex(adjust.hex) !== null;
  return adjust.h === 0 && adjust.s === 0 && adjust.l === 0 && !hexActive;
}

/*
  Applies a colour adjustment to every non-transparent pixel of the canvas.
  The hue/saturation/lightness offsets are applied first, then the pixel is
  blended towards the target hex colour by mix percent.
*/
function applyAdjust(
  ctx: OffscreenCanvasRenderingContext2D,
  adjust: ColourAdjust | undefined,
) {
  if (adjust === undefined || isNoopAdjust(adjust)) {
    return;
  }

  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const target = adjust.hex === null ? null : parseHex(adjust.hex);
  const mix = clamp(adjust.mix, 0, 100) / 100;
  const doHsl = adjust.h !== 0 || adjust.s !== 0 || adjust.l !== 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) {
      continue;
    }

    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (doHsl) {
      let [h, s, l] = rgbToHsl(r, g, b);
      h += adjust.h;
      s = clamp(s + adjust.s / 100, 0, 1);
      l = clamp(l + adjust.l / 100, 0, 1);
      [r, g, b] = hslToRgb(h, s, l);
    }

    if (target !== null && mix > 0) {
      r = Math.round(r + (target[0] - r) * mix);
      g = Math.round(g + (target[1] - g) * mix);
      b = Math.round(b + (target[2] - b) * mix);
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);
}

export { applyAdjust, isNoopAdjust, parseHex };
