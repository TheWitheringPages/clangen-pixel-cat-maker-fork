/* 
  Based on generate_sprite() from ClanGen:
  https://github.com/ClanGenOfficial/clangen/blob/09a7c07772c3e33c6941b7a56b8cc5bfa83e316d/scripts/utility.py

  ClanGen source code is licensed under MPL-2.0.
*/

import { Pelt, ColourAdjust } from "./types";
import { applyAdjust, isNoopAdjust } from "./colourAdjust";
import tints from "../assets/tints/tint.json";
import whitePatchesTints from "../assets/tints/white_patches_tint.json";
import peltInfo from "../assets/peltInfo.json";

function getSpritePosition(spriteName: string, spriteNumber: number) {
  return {
    url: `sprites/split/${spriteName}_${spriteNumber}.png`,
    x: 0,
    y: 0,
  };
}

async function loadImage(url: string) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;

    img.addEventListener("load", () => {
      resolve(img);
    });
    img.addEventListener("error", () => {
      reject(`${url} doesn't seem to exist!`);
    });
  });
}

async function drawSprite(spriteName: string, spriteNumber: number, ctx: any) {
  const spritePosition = getSpritePosition(spriteName, spriteNumber);

  const img = await loadImage(spritePosition.url);
  ctx.drawImage(img, spritePosition.x, spritePosition.y, 50, 50, 0, 0, 50, 50);
}

async function drawTint(
  tint: number[] | null,
  blendingMode: "multiply" | "lighter",
  ctx: any,
) {
  if (tint === null) {
    return;
  }
  const cssTintColour = `rgb(${tint[0]} ${tint[1]} ${tint[2]})`;

  // we only want to tint non-transparent pixels
  // so get version of the tint that's only over those pixels
  const tintOverlay = new OffscreenCanvas(50, 50);
  const tintOverlayContext = tintOverlay.getContext("2d")!;
  tintOverlayContext.drawImage(ctx.canvas, 0, 0);
  tintOverlayContext.globalCompositeOperation = "source-in";
  tintOverlayContext.fillStyle = cssTintColour;
  tintOverlayContext.fillRect(0, 0, 50, 50);

  // tinted version of the image required for the next step
  const tintedLayer = new OffscreenCanvas(50, 50);
  const tintedLayerContext = tintedLayer.getContext("2d")!;
  tintedLayerContext.drawImage(ctx.canvas, 0, 0);
  tintedLayerContext.globalCompositeOperation = blendingMode;
  tintedLayerContext.drawImage(tintOverlay, 0, 0);

  // preserve the existing alpha channel
  // this is necessary because otherwise semi-transparent pixels
  // will get drawn twice
  const compositeOperation = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "source-in";
  ctx.drawImage(tintedLayer, 0, 0);
  ctx.globalCompositeOperation = compositeOperation;
}

/*
  Draws through an intermediate layer so an optional colour adjustment can
  be applied to just this slot before compositing it onto the cat.
  When there's no adjustment, draws directly to avoid the extra canvas.
*/
async function drawAdjusted(
  ctx: any,
  adjust: ColourAdjust | undefined,
  draw: (target: any) => Promise<void>,
) {
  if (isNoopAdjust(adjust)) {
    await draw(ctx);
    return;
  }

  const layer = new OffscreenCanvas(50, 50);
  const layerContext = layer.getContext("2d")!;
  await draw(layerContext);
  applyAdjust(layerContext, adjust);
  ctx.drawImage(layer, 0, 0);
}

async function drawMaskedSprite(
  spriteName: string,
  maskSpriteName: string,
  spriteNumber: number,
  ctx: any,
) {
  const offscreen = new OffscreenCanvas(50, 50);
  const offscreenContext = offscreen.getContext("2d");

  if (offscreenContext !== null) {
    await drawSprite(maskSpriteName, spriteNumber, offscreenContext);
    offscreenContext.globalCompositeOperation = "source-in";
    await drawSprite(spriteName, spriteNumber, offscreenContext);

    ctx.drawImage(offscreen, 0, 0);
  }
}

async function drawShading(spriteNumber: number, ctx: any) {
  const offscreen = new OffscreenCanvas(50, 50);
  const offscreenContext = offscreen.getContext("2d");

  if (offscreenContext === null) {
    return;
  }

  offscreenContext.drawImage(ctx.canvas, 0, 0);
  offscreenContext.globalCompositeOperation = "source-in";
  await drawSprite("shaders", spriteNumber, offscreenContext);

  const oldCompositeOperation = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(offscreen, 0, 0);
  ctx.globalCompositeOperation = oldCompositeOperation;

  await drawSprite("lighting", spriteNumber, ctx);
}

async function drawMissingScar(
  spriteName: string,
  spriteNumber: number,
  ctx: any,
) {
  const originalCompositeOperation = ctx.globalCompositeOperation;

  // clip canvas to missing scar mask
  // the missing mask goes "under" to not white-out the sprite,
  // so it's destination-in
  ctx.globalCompositeOperation = "destination-in";
  await drawSprite(spriteName, spriteNumber, ctx);

  // "layer" for the lines that go on top
  // have to clip to the canvas to preserve transparency
  const offscreenCanvas = new OffscreenCanvas(50, 50);
  const offscreenContext = offscreenCanvas.getContext("2d")!;
  offscreenContext.drawImage(ctx.canvas, 0, 0);
  offscreenContext.globalCompositeOperation = "source-in";
  await drawSprite(spriteName, spriteNumber, offscreenContext);

  // multiply so the white disappears
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(offscreenCanvas, 0, 0);

  ctx.globalCompositeOperation = originalCompositeOperation;
}

async function drawCat(
  outCanvas: OffscreenCanvas,
  pelt: Pelt,
  catSprite: number,
  dead = false,
  darkForest = false,
  shading = false,
  aprilFools = false,
) {
  const canvas = new OffscreenCanvas(50, 50);
  const ctx = canvas.getContext("2d");
  const outCtx = outCanvas.getContext("2d");

  if (ctx === null || outCtx == null) {
    return;
  }

  const adjust = pelt.adjust === undefined ? {} : pelt.adjust;

  if (pelt.name !== "Tortie" && pelt.name !== "Calico") {
    await drawAdjusted(ctx, adjust.pelt, (target) =>
      drawSprite(`${pelt.spritesName}${pelt.colour}`, catSprite, target),
    );
  } else {
    await drawAdjusted(ctx, adjust.pelt, (target) =>
      drawSprite(`${pelt.tortieBase}${pelt.colour}`, catSprite, target),
    );

    var tortiePattern: string | undefined;
    if (pelt.tortiePattern == "Single") {
      tortiePattern = "SingleColour";
    } else {
      tortiePattern = pelt.tortiePattern;
    }

    await drawAdjusted(ctx, adjust.tortie, (target) =>
      drawMaskedSprite(
        `${tortiePattern}${pelt.tortieColour}`,
        `tortiemask${pelt.pattern}`,
        catSprite,
        target,
      ),
    );
  }

  if (
    pelt.tint !== "none" &&
    Object.keys(tints.tint_colours).includes(pelt.tint)
  ) {
    const tint = pelt.tint as keyof typeof tints.tint_colours;
    await drawTint(tints.tint_colours[tint], "multiply", ctx);
  }
  if (
    pelt.tint !== "none" &&
    Object.keys(tints.dilute_tint_colours).includes(pelt.tint)
  ) {
    const tint = pelt.tint as keyof typeof tints.dilute_tint_colours;
    await drawTint(tints.dilute_tint_colours[tint], "lighter", ctx);
  }

  if (pelt.whitePatches !== undefined && pelt.whitePatches.length > 0) {
    const offscreen = new OffscreenCanvas(50, 50);
    const offscreenContext = offscreen.getContext("2d");

    if (offscreenContext) {
      const patches = pelt.whitePatches;

      for (const patch of patches) {
        await drawSprite(`white${patch}`, catSprite, offscreenContext);
      }

      if (
        pelt.whitePatchesTint !== "none" &&
        Object.keys(whitePatchesTints.tint_colours).includes(
          pelt.whitePatchesTint,
        )
      ) {
        const tintKey =
          pelt.whitePatchesTint as keyof typeof whitePatchesTints.tint_colours;
        await drawTint(
          whitePatchesTints.tint_colours[tintKey],
          "multiply",
          offscreenContext,
        );
      }

      applyAdjust(offscreenContext, adjust.whitePatches);
      ctx.drawImage(offscreen, 0, 0);
    }
  }
  if (pelt.points !== undefined) {
    const offscreen = new OffscreenCanvas(50, 50);
    const offscreenContext = offscreen.getContext("2d");
    await drawSprite(`white${pelt.points}`, catSprite, offscreenContext);
    if (
      pelt.whitePatchesTint !== "none" &&
      Object.keys(whitePatchesTints.tint_colours).includes(
        pelt.whitePatchesTint,
      )
    ) {
      const tint =
        pelt.whitePatchesTint as keyof typeof whitePatchesTints.tint_colours;
      await drawTint(
        whitePatchesTints.tint_colours[tint],
        "multiply",
        offscreenContext,
      );
    }
    if (offscreenContext !== null) {
      applyAdjust(offscreenContext, adjust.whitePatches);
    }
    ctx.drawImage(offscreen, 0, 0);
  }
  if (pelt.vitiligo !== undefined) {
    await drawAdjusted(ctx, adjust.whitePatches, (target) =>
      drawSprite(`white${pelt.vitiligo}`, catSprite, target),
    );
  }

  await drawAdjusted(ctx, adjust.eyes, (target) =>
    drawSprite(`eyes${pelt.eyeColour}`, catSprite, target),
  );
  if (pelt.eyeColour2 !== undefined) {
    await drawAdjusted(ctx, adjust.eyes2, (target) =>
      drawSprite(`eyes2${pelt.eyeColour2}`, catSprite, target),
    );
  }

  if (pelt.scars && pelt.scars.length > 0) {
    await drawAdjusted(ctx, adjust.scars, async (target) => {
      for (const s of pelt.scars!) {
        if (peltInfo.scars1.includes(s) || peltInfo.scars3.includes(s)) {
          await drawSprite(`scars${s}`, catSprite, target);
        }
      }
    });
  }

  if (shading) {
    await drawShading(catSprite, ctx);
  }

  await drawAdjusted(ctx, adjust.lineart, async (target) => {
    if (!aprilFools) {
      if (dead) {
        if (darkForest) {
          await drawSprite("lineartdf", catSprite, target);
        } else {
          await drawSprite("lineartdead", catSprite, target);
        }
      } else {
        await drawSprite("lines", catSprite, target);
      }
    } else {
      if (dead) {
        if (darkForest) {
          await drawSprite("aprilfoolslineartdf", catSprite, target);
        } else {
          await drawSprite("aprilfoolslineartdead", catSprite, target);
        }
      } else {
        await drawSprite("aprilfoolslineart", catSprite, target);
      }
    }
  });

  await drawAdjusted(ctx, adjust.skin, (target) =>
    drawSprite(`skin${pelt.skin}`, catSprite, target),
  );

  if (pelt.scars && pelt.scars.length > 0) {
    for (const s of pelt.scars) {
      if (peltInfo.scars2.includes(s)) {
        await drawMissingScar(`scars${s}`, catSprite, ctx);
      }
    }
  }

  if (pelt.accessory && pelt.accessory.length > 0) {
    await drawAdjusted(ctx, adjust.accessory, async (accCtx) => {
    for (const acc of pelt.accessory!) {
      if (peltInfo.plant_accessories.includes(acc)) {
        await drawSprite(`acc_herbs${acc}`, catSprite, accCtx);
      } else if (peltInfo.wild_accessories.includes(acc)) {
        await drawSprite(`acc_wild${acc}`, catSprite, accCtx);
      } else if (peltInfo.collars.includes(acc)) {
        await drawSprite(`collars${acc}`, catSprite, accCtx);
      } else if (peltInfo.bone_accessories.includes(acc)) {
        await drawSprite(`acc_bones${acc}`, catSprite, accCtx);
      } else if (peltInfo.butterflies_accessories.includes(acc)) {
        await drawSprite(`acc_butterflymoth${acc}`, catSprite, accCtx);
      } else if (peltInfo.stuff_accessories.includes(acc)) {
        await drawSprite(`acc_twolegstuff${acc}`, catSprite, accCtx);
      } else if (peltInfo.beetle_accessories.includes(acc)) {
        await drawSprite(`acc_beetle${acc}`, catSprite, accCtx);
      } else if (peltInfo.beetle_feathers_accessories.includes(acc)) {
        await drawSprite(`acc_beetlefeathers${acc}`, catSprite, accCtx);
      } else if (peltInfo.ster_accessories.includes(acc)) {
        await drawSprite(`acc_ster${acc}`, catSprite, accCtx);
      } else if (peltInfo.plant2_accessories.includes(acc)) {
        await drawSprite(`acc_plant2${acc}`, catSprite, accCtx);
      } else if (peltInfo.snake_accessories.includes(acc)) {
        await drawSprite(`acc_snake${acc}`, catSprite, accCtx);
      } else if (peltInfo.smallanimal_accessories.includes(acc)) {
        await drawSprite(`acc_smallAnimal${acc}`, catSprite, accCtx);
      } else if (peltInfo.deadinsect_accessories.includes(acc)) {
        await drawSprite(`acc_deadInsect${acc}`, catSprite, accCtx);
      } else if (peltInfo.aliveinsect_accessories.includes(acc)) {
        await drawSprite(`acc_aliveInsect${acc}`, catSprite, accCtx);
      } else if (peltInfo.random_accessories.includes(acc)) {
        await drawSprite(`acc_random${acc}`, catSprite, accCtx);
      } else if (peltInfo.fruit_accessories.includes(acc)) {
        await drawSprite(`acc_fruit${acc}`, catSprite, accCtx);
      } else if (peltInfo.sailormoon_accessories.includes(acc)) {
        await drawSprite(`acc_sailor${acc}`, catSprite, accCtx);
      } else if (peltInfo.crafted_accessories.includes(acc)) {
        await drawSprite(`acc_crafted${acc}`, catSprite, accCtx);
      }
    }
    });
  }

  // hand-drawn pixels go over everything else
  // drawn onto the internal canvas so they mirror along with the cat
  if (pelt.paint !== undefined) {
    for (const [key, colour] of Object.entries(pelt.paint)) {
      const [x, y] = key.split(",").map(Number);
      if (
        Number.isInteger(x) &&
        Number.isInteger(y) &&
        x >= 0 &&
        x < 50 &&
        y >= 0 &&
        y < 50
      ) {
        ctx.fillStyle = colour;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  outCtx.clearRect(0, 0, outCanvas.width, outCanvas.height);
  if (pelt.reverse) {
    outCtx.scale(-1, 1);
    outCtx.drawImage(canvas, -outCanvas.width, 0);
    outCtx.resetTransform();
  } else {
    outCtx.drawImage(canvas, 0, 0);
  }
}

export default drawCat;