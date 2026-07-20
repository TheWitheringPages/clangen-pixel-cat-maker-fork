import "./main.css";
import "./common.css";
import drawCat from "./library/drawCat";
import loadingImg from "./assets/loading.png";
import errorImg from "./assets/error_placeholder.png";

import CatData, { nameToSpritesname } from "./library/CatData";
import { AdjustSlot } from "./library/types";
import { initThemeToggle } from "./library/theme";
import peltInfo from "./assets/peltInfo.json";
import spriteGroups from "./assets/spriteGroups.json";

function getElementByUniqueClassName(className: string): Element {
  return document.getElementsByClassName(className)[0];
}

var catData: CatData;


const catSprite = getElementByUniqueClassName(
  "cat-sprite-img",
) as HTMLImageElement;
catSprite.src = loadingImg;

const spriteNumberSelect = getElementByUniqueClassName(
  "sprite-no-select",
) as HTMLSelectElement;
const peltNameSelect = getElementByUniqueClassName(
  "pelt-name-select",
) as HTMLSelectElement;
const colourSelect = getElementByUniqueClassName(
  "colour-select",
) as HTMLSelectElement;
const tintSelect = getElementByUniqueClassName(
  "tint-select",
) as HTMLSelectElement;
const skinColourSelect = getElementByUniqueClassName(
  "skin-colour-select",
) as HTMLSelectElement;
const eyeColourSelect = getElementByUniqueClassName(
  "eye-colour-select",
) as HTMLSelectElement;
const eyeColour2Select = getElementByUniqueClassName(
  "eye-colour2-select",
) as HTMLSelectElement;
const accessorySelect = getElementByUniqueClassName(
  "accessory-select",
) as HTMLSelectElement;
const scarSelect = getElementByUniqueClassName(
  "scar-select",
) as HTMLSelectElement;

const whitePatchesSelect = getElementByUniqueClassName(
  "white-patches-select",
) as HTMLSelectElement;
const pointsSelect = getElementByUniqueClassName(
  "points-select",
) as HTMLSelectElement;
const whitePatchesTintSelect = getElementByUniqueClassName(
  "white-patches-tint-select",
) as HTMLSelectElement;
const vitiligoSelect = getElementByUniqueClassName(
  "vitiligo-select",
) as HTMLSelectElement;

const tortieMaskSelect = getElementByUniqueClassName(
  "tortie-mask-select",
) as HTMLSelectElement;
const tortieColourSelect = getElementByUniqueClassName(
  "tortie-colour-select",
) as HTMLSelectElement;
const tortiePatternSelect = getElementByUniqueClassName(
  "tortie-pattern-select",
) as HTMLSelectElement;

const lineartSelect = getElementByUniqueClassName(
  "lineart-select",
) as HTMLSelectElement;

const isTortieCheckbox = getElementByUniqueClassName(
  "tortie-checkbox",
) as HTMLInputElement;
const shadingCheckbox = getElementByUniqueClassName(
  "shading-checkbox",
) as HTMLInputElement;
const reverseCheckbox = getElementByUniqueClassName(
  "reverse-checkbox",
) as HTMLInputElement;

const backgroundColourSelect = getElementByUniqueClassName(
  "bg-color-select",
) as HTMLSelectElement;

const scaleSelect = getElementByUniqueClassName(
  "zoom-level",
) as HTMLSelectElement;

const sharecodeTextArea = getElementByUniqueClassName(
  "sharecode",
) as HTMLTextAreaElement;

const bgCustomColourInput = getElementByUniqueClassName(
  "bg-custom-colour",
) as HTMLInputElement;

const adjustSlotSelect = getElementByUniqueClassName(
  "adjust-slot-select",
) as HTMLSelectElement;
const adjustHueInput = getElementByUniqueClassName(
  "adjust-hue",
) as HTMLInputElement;
const adjustSatInput = getElementByUniqueClassName(
  "adjust-sat",
) as HTMLInputElement;
const adjustLightInput = getElementByUniqueClassName(
  "adjust-light",
) as HTMLInputElement;
const adjustHexEnabledInput = getElementByUniqueClassName(
  "adjust-hex-enabled",
) as HTMLInputElement;
const adjustHexInput = getElementByUniqueClassName(
  "adjust-hex",
) as HTMLInputElement;
const adjustMixInput = getElementByUniqueClassName(
  "adjust-mix",
) as HTMLInputElement;

const paintToolSelect = getElementByUniqueClassName(
  "paint-tool-select",
) as HTMLSelectElement;
const paintColourInput = getElementByUniqueClassName(
  "paint-colour",
) as HTMLInputElement;
const paintCanvas = getElementByUniqueClassName(
  "paint-canvas",
) as HTMLCanvasElement;

const savedCatsSelect = getElementByUniqueClassName(
  "saved-cats-select",
) as HTMLSelectElement;

// last fully rendered 50x50 cat (post-reverse, incl. paint),
// used by the paint editor and the PNG download
var lastRenderedCat: OffscreenCanvas | null = null;

function selectByValue(select: HTMLSelectElement, value: string | string[] | null, ignoreNull: boolean) {
  if (value === null && !ignoreNull) {
    value = [];
  }

  const targetValues = Array.isArray(value) ? value : [value as string];
  
  const options = select.options;
  for (let i = 0; i < options.length; i++) {
    const option = options.item(i)!;
    if (select.multiple) {
      option.selected = targetValues.includes(option.value);
    } else {
      if (option.value === targetValues[0]) {
        select.selectedIndex = i;
      }
    }
  }
}

function setFormFromObject(data: CatData) {

  isTortieCheckbox.checked = data.isTortie;
  shadingCheckbox.checked = data.shading;
  reverseCheckbox.checked = data.reverse;

  if (data.backgroundColour && data.backgroundColour.startsWith("#")) {
    bgCustomColourInput.value = data.backgroundColour;
    selectByValue(backgroundColourSelect, "custom", true);
  } else {
    selectByValue(backgroundColourSelect, data.backgroundColour, true);
  }
  bgCustomColourInput.classList.toggle(
    "hidden",
    backgroundColourSelect.value !== "custom",
  );
  selectByValue(tortieMaskSelect, data.tortieMask, false);
  selectByValue(tortieColourSelect, data.tortieColour, false);
  selectByValue(tortiePatternSelect, data.tortiePattern, false);
  selectByValue(peltNameSelect, data.peltName, true);
  selectByValue(spriteNumberSelect, data.spriteNumber.toString(), true);
  selectByValue(colourSelect, data.colour, true);
  selectByValue(tintSelect, data.tint, true);
  selectByValue(skinColourSelect, data.skinColour, true);
  selectByValue(eyeColourSelect, data.eyeColour, true);
  selectByValue(eyeColour2Select, data.eyeColour2, false);
  selectByValue(whitePatchesSelect, data.whitePatches, false);
  selectByValue(pointsSelect, data.points, false);
  selectByValue(whitePatchesTintSelect, data.whitePatchesTint, true);
  selectByValue(vitiligoSelect, data.vitiligo, false);
  selectByValue(accessorySelect, data.accessory, false);
  selectByValue(scarSelect, data.scar, false);

  syncAdjustUI();

  // a different cat was loaded; its paint history no longer applies
  paintUndoStack = [];
  paintUndoButton.disabled = true;
}

function getDataURL() {
  const url = new URL(document.URL);
  return catData.getURL(`${url.origin}${url.pathname}`);
}

function applyDataURL() {
  catData = CatData.fromURL(document.location.toString());
  setFormFromObject(catData);

  // don't want to reapply url or it adds to history twice
  redrawCat(false);
}

/**
 * Redraws the cat sprite and applies the new sprite to the cat image
 * element on the page.
 *
 * @param applyURL {boolean} Whether or not to add the data URL representing
 * the current sprite to the history.
 * Should be true on form modification but false on page load to avoid
 * getting added to history twice.
 */
/*
  ---- compatibility filtering ----

  Not every mod's parts exist for every other mod's parts (e.g. sparkle
  colours only exist for vanilla and sparkle pelts, and poses 21-25 only
  have art for vanilla parts). The sprite group inventory generated at
  build time tells us exactly which combinations exist, so incompatible
  options are hidden and invalid selections are corrected instead of
  showing the error sprite.
*/
const ALL_GROUPS = new Set<string>(spriteGroups.all);
const NEWPOSE_GROUPS = new Set<string>(spriteGroups.newPoses);

var allColourValues: string[] | null = null;

function spritesNameOf(peltName: string): string {
  const mapped = (nameToSpritesname as Record<string, string>)[peltName];
  return mapped !== undefined ? mapped : peltName.toLowerCase();
}

function accessoryGroupName(acc: string): string | null {
  const prefixes: [string[], string][] = [
    [peltInfo.plant_accessories, "acc_herbs"],
    [peltInfo.wild_accessories, "acc_wild"],
    [peltInfo.collars, "collars"],
    [peltInfo.bone_accessories, "acc_bones"],
    [peltInfo.butterflies_accessories, "acc_butterflymoth"],
    [peltInfo.stuff_accessories, "acc_twolegstuff"],
    [peltInfo.beetle_accessories, "acc_beetle"],
    [peltInfo.beetle_feathers_accessories, "acc_beetlefeathers"],
    [peltInfo.ster_accessories, "acc_ster"],
    [peltInfo.plant2_accessories, "acc_plant2"],
    [peltInfo.snake_accessories, "acc_snake"],
    [peltInfo.smallanimal_accessories, "acc_smallAnimal"],
    [peltInfo.deadinsect_accessories, "acc_deadInsect"],
    [peltInfo.aliveinsect_accessories, "acc_aliveInsect"],
    [peltInfo.random_accessories, "acc_random"],
    [peltInfo.fruit_accessories, "acc_fruit"],
    [peltInfo.sailormoon_accessories, "acc_sailor"],
    [peltInfo.crafted_accessories, "acc_crafted"],
  ];
  for (const [list, prefix] of prefixes) {
    if (list.includes(acc)) {
      return `${prefix}${acc}`;
    }
  }
  return null;
}

function filterSelect(
  select: HTMLSelectElement,
  valid: (value: string) => boolean,
) {
  for (const option of Array.from(select.options)) {
    const ok = option.value === "" || valid(option.value);
    option.hidden = !ok;
    option.disabled = !ok;
    if (!ok && option.selected) {
      option.selected = false;
    }
  }
  if (
    !select.multiple &&
    (select.selectedIndex === -1 ||
      select.options[select.selectedIndex]?.disabled)
  ) {
    const firstOk = Array.from(select.options).find((o) => !o.disabled);
    if (firstOk) {
      select.value = firstOk.value;
    }
  }
  for (const group of Array.from(select.querySelectorAll("optgroup"))) {
    const allHidden = Array.from(group.children).every(
      (o) => (o as HTMLOptionElement).hidden,
    );
    (group as HTMLOptGroupElement).hidden = allHidden;
  }
}

function applyCompatibility() {
  if (allColourValues === null) {
    allColourValues = Array.from(colourSelect.options).map((o) => o.value);
  }
  const colours = allColourValues;

  const pose = Number(spriteNumberSelect.value);
  const has = (group: string) =>
    pose >= 21 ? NEWPOSE_GROUPS.has(group) : ALL_GROUPS.has(group);

  const peltHasAnyColour = (name: string) => {
    const sn = spritesNameOf(name);
    return colours.some((c) => has(`${sn}${c}`));
  };

  filterSelect(peltNameSelect, peltHasAnyColour);
  const peltSprites = spritesNameOf(peltNameSelect.value);
  filterSelect(colourSelect, (c) => has(`${peltSprites}${c}`));

  filterSelect(tortiePatternSelect, peltHasAnyColour);
  const tortieSprites = spritesNameOf(
    tortiePatternSelect.value === "Single"
      ? "SingleColour"
      : tortiePatternSelect.value,
  );
  filterSelect(tortieColourSelect, (c) => has(`${tortieSprites}${c}`));
  filterSelect(tortieMaskSelect, (m) => has(`tortiemask${m}`));

  filterSelect(eyeColourSelect, (n) => has(`eyes${n}`));
  filterSelect(eyeColour2Select, (n) => has(`eyes2${n}`));
  filterSelect(skinColourSelect, (n) => has(`skin${n}`));
  filterSelect(whitePatchesSelect, (n) => has(`white${n}`));
  filterSelect(pointsSelect, (n) => has(`white${n}`));
  filterSelect(vitiligoSelect, (n) => has(`white${n}`));
  filterSelect(scarSelect, (n) => has(`scars${n}`));
  filterSelect(accessorySelect, (n) => {
    const group = accessoryGroupName(n);
    return group !== null && has(group);
  });
  filterSelect(lineartSelect, (v) => {
    const groupFor: Record<string, string> = {
      regular: "lines",
      dead: "lineartdead",
      "dark forest": "lineartdf",
      "aprilfools-regular": "aprilfoolslineart",
      "aprilfools-dead": "aprilfoolslineartdead",
      "aprilfools-dark forest": "aprilfoolslineartdf",
    };
    const group = groupFor[v];
    return group === undefined || has(group);
  });
}

function redrawCat(applyURL: boolean = true) {
  applyCompatibility();
  const c = new OffscreenCanvas(50, 50);
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, c.width, c.height);
  }

  const bgIsCustom = backgroundColourSelect.value === "custom";
  bgCustomColourInput.classList.toggle("hidden", !bgIsCustom);
  catData.backgroundColour = bgIsCustom
    ? bgCustomColourInput.value
    : backgroundColourSelect.value;

  catData.isTortie = isTortieCheckbox.checked;
  // pattern - represents mask
  catData.tortieMask = tortieMaskSelect.value;
  // tortieColour - represents masked pelt colour
  catData.tortieColour = tortieColourSelect.value;
  // tortiePattern - represents masked pelt name
  catData.tortiePattern = tortiePatternSelect.value;

  catData.peltName = peltNameSelect.value;
  catData.spriteNumber = Number(spriteNumberSelect.value);
  catData.colour = colourSelect.value;
  catData.tint = tintSelect.value;
  catData.skinColour = skinColourSelect.value;
  catData.eyeColour = eyeColourSelect.value;
  catData.whitePatchesTint = whitePatchesTintSelect.value;
  catData.eyeColour2 =
    eyeColour2Select.value === "" ? null : eyeColour2Select.value;
  catData.whitePatches = Array.from(whitePatchesSelect.selectedOptions)
    .map(opt => opt.value)
    .filter(val => val !== "");
  catData.points = pointsSelect.value === "" ? null : pointsSelect.value;
  catData.vitiligo = vitiligoSelect.value === "" ? null : vitiligoSelect.value;
  catData.accessory =
    Array.from(accessorySelect.selectedOptions)
    .map(opt => opt.value)
    .filter(val => val !== "");
  catData.scar =
    Array.from(scarSelect.selectedOptions)
    .map(opt => opt.value)
    .filter(val => val !== "");
  catData.shading = shadingCheckbox.checked;
  catData.reverse = reverseCheckbox.checked;

  if (isTortieCheckbox.checked) {
    tortieColourSelect.disabled = false;
    tortieMaskSelect.disabled = false;
    tortiePatternSelect.disabled = false;
  } else {
    tortieColourSelect.disabled = true;
    tortieMaskSelect.disabled = true;
    tortiePatternSelect.disabled = true;
  }

  var isDead: boolean = false;
  var isDf: boolean = false;
  var aprilFools: boolean = false;
  if (lineartSelect.value === "regular") {
    isDead = false;
    isDf = false;
  } else if (lineartSelect.value === "dead") {
    isDead = true;
    isDf = false;
  } else if (lineartSelect.value === "dark forest") {
    isDead = true;
    isDf = true;
  } else if (lineartSelect.value === "aprilfools-regular") {
    isDead = false;
    isDf = false;
    aprilFools = true;
  } else if (lineartSelect.value === "aprilfools-dead") {
    isDead = true;
    isDf = false;
    aprilFools = true;
  } else if (lineartSelect.value === "aprilfools-dark forest") {
    isDead = true;
    isDf = true;
    aprilFools = true;
  }

  // update share code
  sharecodeTextArea.textContent = catData.getJSONData();

  const scale = Number(scaleSelect.value);
  const canvasSize = scale * 50;

  // set scale here so things aren't resizing
  catSprite.width = canvasSize;
  catSprite.height = canvasSize;

  // if it's taking a while, show loading
  var loaded = false;
  setTimeout(() => {
    if (!loaded) {
      catSprite.src = loadingImg;
    }
  }, 200);
  drawCat(
    c,
    catData.getPelt(),
    catData.spriteNumber,
    isDead,
    isDf,
    catData.shading,
    aprilFools,
  )
    .then(() => {
      lastRenderedCat = c;
      updatePaintCanvas();

      const finalCanvas = new OffscreenCanvas(canvasSize, canvasSize);
      const finalCtx = finalCanvas.getContext("2d")!;
      finalCtx.imageSmoothingEnabled = false;

      finalCtx.fillStyle = catData.backgroundColour;
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      finalCtx.scale(scale, scale);
      finalCtx.drawImage(c, 0, 0);

      return finalCanvas.convertToBlob();
    })
    .then((blob) => {
      loaded = true;
      catSprite.src = URL.createObjectURL(blob);

      if (applyURL) {
        const dataURL = getDataURL().toString();
        history.pushState(null, "", dataURL);
        scheduleRecentSnapshot();
      }
      if (!paletteRow.classList.contains("hidden")) {
        renderPalette();
      }
    })
    .catch((err) => {
      loaded = true;
      catSprite.src = errorImg;
      console.error(err);
    });
}

function randomizeSelected(select: HTMLSelectElement) {
  const options: HTMLOptionsCollection = select.options;
  options.selectedIndex = Math.floor(options.length * Math.random());
}

const randomButtons = document.getElementsByClassName(
  "random-button",
) as HTMLCollectionOf<HTMLButtonElement>;
for (const randomButton of randomButtons) {
  randomButton.addEventListener("click", (e) => {
    e.preventDefault();
    const selectId = randomButton.dataset.selectId;
    if (!selectId) {
      return;
    }
    const select = getElementByUniqueClassName(selectId) as HTMLSelectElement;
    if (selectId == "white-patches-select") {
      for (let i = 0; i < select.options.length; i++) select.options[i].selected = false;
      const validOptions = Array.from(select.options).filter(opt => opt.value !== "");
      const countToSelect = Math.floor(Math.random() * 2) +1;
      for (let i = 0; i < countToSelect; i++) {
        const randomIndex = Math.floor(Math.random() * validOptions.length);
        validOptions[randomIndex].selected = true;
      }
    } else {
      randomizeSelected(select);
    }
    randomizeSelected(select);
    redrawCat();
  });
}

// allow dropping into offspring predict
catSprite.addEventListener("dragstart", (ev) => {
  ev.dataTransfer?.setData("text/plain", document.location.search);
});

isTortieCheckbox.addEventListener("change", () => {
  redrawCat();
});
tortieColourSelect.addEventListener("change", () => redrawCat());
tortieMaskSelect.addEventListener("change", () => redrawCat());
tortiePatternSelect.addEventListener("change", () => redrawCat());

spriteNumberSelect.addEventListener("change", () => redrawCat());
peltNameSelect.addEventListener("change", () => redrawCat());
colourSelect.addEventListener("change", () => redrawCat());
tintSelect.addEventListener("change", () => redrawCat());
skinColourSelect.addEventListener("change", () => redrawCat());
eyeColourSelect.addEventListener("change", () => redrawCat());
eyeColour2Select.addEventListener("change", () => redrawCat());
whitePatchesSelect.addEventListener("change", () => redrawCat());
pointsSelect.addEventListener("change", () => redrawCat());
whitePatchesTintSelect.addEventListener("change", () => redrawCat());
vitiligoSelect.addEventListener("change", () => redrawCat());
accessorySelect.addEventListener("change", () => redrawCat());
scarSelect.addEventListener("change", () => redrawCat());
lineartSelect.addEventListener("change", () => redrawCat());
shadingCheckbox.addEventListener("change", () => redrawCat());
reverseCheckbox.addEventListener("change", () => redrawCat());

backgroundColourSelect.addEventListener("change", () => redrawCat());
scaleSelect.addEventListener("change", () => redrawCat());

getElementByUniqueClassName("randomize-all-button")?.addEventListener(
  "click",
  (e) => {
    e.preventDefault();

    randomizeSelected(spriteNumberSelect);
    randomizeSelected(peltNameSelect);
    randomizeSelected(colourSelect);
    randomizeSelected(tortiePatternSelect);
    randomizeSelected(tortieColourSelect);
    randomizeSelected(tortieMaskSelect);
    if (Math.random() <= 0.5) {
      isTortieCheckbox.checked = true;
    } else {
      isTortieCheckbox.checked = false;
    }
    randomizeSelected(tintSelect);
    randomizeSelected(eyeColourSelect);
    if (Math.random() <= 0.5) {
      randomizeSelected(eyeColour2Select);
    } else {
      eyeColour2Select.selectedIndex = 0;
    }
    randomizeSelected(skinColourSelect);

    if (Math.random() <= 0.5) {
      if (Math.random() <= 0.5) {
        for (let i = 0; i < whitePatchesSelect.options.length; i++)
          whitePatchesSelect.options[i].selected = false;
        const validWp = Array.from(whitePatchesSelect.options).filter(opt => opt.value !== "");
        const countWp = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < countWp; i++) {
          validWp[Math.floor(Math.random() * validWp.length)].selected = true;
        }
      } else {
        for (let i = 0; i < whitePatchesSelect.options.length; i++) {
          whitePatchesSelect.options[i].selected = false;
        }
      }
      if (Math.random() <= 0.5) {
        randomizeSelected(pointsSelect);
      } else {
        pointsSelect.selectedIndex = 0;
      }
      randomizeSelected(whitePatchesTintSelect);
      if (Math.random() <= 0.5) {
        randomizeSelected(vitiligoSelect);
      } else {
        vitiligoSelect.selectedIndex = 0;
      }
    } else {
      whitePatchesTintSelect.selectedIndex = 0;
      whitePatchesSelect.selectedIndex = 0;
      pointsSelect.selectedIndex = 0;
      vitiligoSelect.selectedIndex = 0;
    }

    if (Math.random() <= 0.5) {
      randomizeSelected(accessorySelect);
    } else {
      accessorySelect.selectedIndex = 0;
    }

    if (Math.random() <= 0.5) {
      randomizeSelected(scarSelect);
    } else {
      scarSelect.selectedIndex = 0;
    }

    if (Math.random() <= 0.5) {
      reverseCheckbox.checked = true;
    } else {
      reverseCheckbox.checked = false;
    }

    redrawCat();
  },
);

const copyUrlButton = getElementByUniqueClassName("copy-url-button");
if ("clipboard" in navigator) {
  copyUrlButton?.addEventListener("click", (e) => {
    e.preventDefault();

    navigator.clipboard.writeText(getDataURL().toString()).then(() => {
      // temporarily change button text to say "Copied!"
      copyUrlButton.textContent = "Copied!";
      setTimeout(() => {
        copyUrlButton.textContent = "Copy this cat's URL";
      }, 1250);
    });
  });
} else {
  copyUrlButton?.classList.add("hidden");
}

const importJSONButton = getElementByUniqueClassName("import-json-button");
importJSONButton.addEventListener("click", (e) => {
  e.preventDefault();

  const input = prompt("Enter JSON data:");
  let data;
  if (input !== null) {
    try {
      data = JSON.parse(input);
    } catch (e: any) {
      alert("JSON parse error - check your syntax\n" + e.toString());
      return;
    }

    catData = CatData.fromJSONData(data);
    setFormFromObject(catData);
    redrawCat(true);
  }
})

initThemeToggle();

// ---- colour adjustments ----

function currentAdjustSlot(): AdjustSlot {
  return adjustSlotSelect.value as AdjustSlot;
}

function syncAdjustUI() {
  const a = catData.adjust[currentAdjustSlot()];

  adjustHueInput.value = (a?.h ?? 0).toString();
  adjustSatInput.value = (a?.s ?? 0).toString();
  adjustLightInput.value = (a?.l ?? 0).toString();
  adjustHexEnabledInput.checked = (a?.hex ?? null) !== null;
  if (a?.hex) {
    adjustHexInput.value = a.hex;
  }
  adjustMixInput.value = (a?.mix ?? 100).toString();

  updateAdjustLabels();
}

function updateAdjustLabels() {
  getElementByUniqueClassName("adjust-hue-value").textContent =
    adjustHueInput.value;
  getElementByUniqueClassName("adjust-sat-value").textContent =
    adjustSatInput.value;
  getElementByUniqueClassName("adjust-light-value").textContent =
    adjustLightInput.value;
  getElementByUniqueClassName("adjust-mix-value").textContent =
    adjustMixInput.value;
}

function writeAdjustFromUI(applyURL: boolean) {
  const a = catData.getAdjust(currentAdjustSlot());
  a.h = Number(adjustHueInput.value);
  a.s = Number(adjustSatInput.value);
  a.l = Number(adjustLightInput.value);
  a.hex = adjustHexEnabledInput.checked ? adjustHexInput.value : null;
  a.mix = Number(adjustMixInput.value);

  updateAdjustLabels();
  redrawCat(applyURL);
}

adjustSlotSelect.addEventListener("change", () => syncAdjustUI());
for (const input of [
  adjustHueInput,
  adjustSatInput,
  adjustLightInput,
  adjustHexInput,
  adjustMixInput,
]) {
  input.addEventListener("input", () => writeAdjustFromUI(false));
  input.addEventListener("change", () => writeAdjustFromUI(true));
}
adjustHexEnabledInput.addEventListener("change", () => writeAdjustFromUI(true));

getElementByUniqueClassName("adjust-reset-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    catData.resetAdjust(currentAdjustSlot());
    syncAdjustUI();
    redrawCat();
  },
);
getElementByUniqueClassName("adjust-reset-all-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    catData.adjust = {};
    syncAdjustUI();
    redrawCat();
  },
);

// ---- pixel paint ----

const PAINT_SCALE = 8; // paint canvas is 400x400 for the 50x50 sprite

function updatePaintCanvas() {
  const ctx = paintCanvas.getContext("2d");
  if (ctx === null || lastRenderedCat === null) {
    return;
  }

  ctx.imageSmoothingEnabled = false;
  // checkerboard so transparency is visible
  for (let y = 0; y < 50; y++) {
    for (let x = 0; x < 50; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#ffffff" : "#dddddd";
      ctx.fillRect(x * PAINT_SCALE, y * PAINT_SCALE, PAINT_SCALE, PAINT_SCALE);
    }
  }
  ctx.drawImage(lastRenderedCat, 0, 0, paintCanvas.width, paintCanvas.height);

  const gridCheckbox = getElementByUniqueClassName(
    "paint-grid-checkbox",
  ) as HTMLInputElement;
  if (gridCheckbox.checked) {
    ctx.strokeStyle = "rgb(128 128 128 / 0.4)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 50; i++) {
      ctx.beginPath();
      ctx.moveTo(i * PAINT_SCALE + 0.5, 0);
      ctx.lineTo(i * PAINT_SCALE + 0.5, paintCanvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * PAINT_SCALE + 0.5);
      ctx.lineTo(paintCanvas.width, i * PAINT_SCALE + 0.5);
      ctx.stroke();
    }
  }
}

getElementByUniqueClassName("paint-grid-checkbox").addEventListener(
  "change",
  () => updatePaintCanvas(),
);

function componentToHex(value: number) {
  return value.toString(16).padStart(2, "0");
}

function paintAt(ev: PointerEvent) {
  const rect = paintCanvas.getBoundingClientRect();
  const px = Math.floor(((ev.clientX - rect.left) / rect.width) * 50);
  const py = Math.floor(((ev.clientY - rect.top) / rect.height) * 50);
  if (px < 0 || px >= 50 || py < 0 || py >= 50) {
    return;
  }

  // the paint layer is stored pre-reverse so it flips with the cat;
  // the editor shows the final view, so unmap the x coordinate
  const sx = catData.reverse ? 49 - px : px;
  const key = `${sx},${py}`;

  const tool = paintToolSelect.value;
  if (tool === "draw") {
    if (catData.paint[key] === paintColourInput.value) {
      return;
    }
    catData.paint[key] = paintColourInput.value;
  } else if (tool === "erase") {
    if (!(key in catData.paint)) {
      return;
    }
    delete catData.paint[key];
  } else {
    // eyedropper reads from the rendered cat (displayed coordinates)
    if (lastRenderedCat !== null) {
      const data = lastRenderedCat
        .getContext("2d")!
        .getImageData(px, py, 1, 1).data;
      if (data[3] > 0) {
        paintColourInput.value = `#${componentToHex(data[0])}${componentToHex(
          data[1],
        )}${componentToHex(data[2])}`;
        paintToolSelect.value = "draw";
      }
    }
    return;
  }

  redrawCat(false);
}

// ---- paint undo (one entry per stroke / clear) ----

const paintDetails = getElementByUniqueClassName(
  "paint-details",
) as HTMLDetailsElement;
const paintUndoButton = getElementByUniqueClassName(
  "paint-undo-button",
) as HTMLButtonElement;

var paintUndoStack: Record<string, string>[] = [];

function pushPaintUndo() {
  paintUndoStack.push({ ...catData.paint });
  if (paintUndoStack.length > 50) {
    paintUndoStack.shift();
  }
  paintUndoButton.disabled = false;
}

function undoPaint() {
  const previous = paintUndoStack.pop();
  if (previous !== undefined) {
    catData.paint = previous;
    redrawCat();
  }
  paintUndoButton.disabled = paintUndoStack.length === 0;
}

paintUndoButton.addEventListener("click", (e) => {
  e.preventDefault();
  undoPaint();
});

document.addEventListener("keydown", (e) => {
  const target = e.target as HTMLElement;
  if (
    e.ctrlKey &&
    e.key.toLowerCase() === "z" &&
    paintDetails.open &&
    target.tagName !== "INPUT" &&
    target.tagName !== "TEXTAREA"
  ) {
    e.preventDefault();
    undoPaint();
  }
});

var painting = false;
paintCanvas.addEventListener("pointerdown", (ev) => {
  ev.preventDefault();
  painting = true;
  if (paintToolSelect.value !== "pick") {
    pushPaintUndo();
  }
  paintCanvas.setPointerCapture(ev.pointerId);
  paintAt(ev);
});
paintCanvas.addEventListener("pointermove", (ev) => {
  if (painting) {
    paintAt(ev);
  }
});
paintCanvas.addEventListener("pointerup", () => {
  if (painting) {
    painting = false;
    // drop the undo entry if the stroke didn't actually change anything
    const last = paintUndoStack[paintUndoStack.length - 1];
    if (last !== undefined && JSON.stringify(last) === JSON.stringify(catData.paint)) {
      paintUndoStack.pop();
      paintUndoButton.disabled = paintUndoStack.length === 0;
    }
    // update the URL/sharecode once the stroke is finished
    redrawCat(true);
  }
});

getElementByUniqueClassName("paint-clear-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    if (Object.keys(catData.paint).length > 0) {
      pushPaintUndo();
      catData.paint = {};
      redrawCat();
    }
  },
);

// ---- use as offspring parent ----

getElementByUniqueClassName("add-parent-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    const slot = prompt("Add this cat as which parent? Enter 1 or 2:", "1");
    if (slot === null) {
      return;
    }
    if (slot.trim() !== "1" && slot.trim() !== "2") {
      alert("Please enter 1 or 2.");
      return;
    }
    localStorage.setItem(
      `pcm-parent-${slot.trim()}`,
      getDataURL().toString(),
    );
    if (confirm(`Saved as parent ${slot.trim()}. Open the offspring predictor now?`)) {
      location.href = "predict-offspring.html";
    }
  },
);

// ---- custom background colour ----

bgCustomColourInput.addEventListener("input", () => redrawCat(false));
bgCustomColourInput.addEventListener("change", () => redrawCat());

// ---- PNG download ----

getElementByUniqueClassName("download-png-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    if (lastRenderedCat === null) {
      return;
    }

    const scale = Number(scaleSelect.value);
    const size = scale * 50;
    const exportCanvas = new OffscreenCanvas(size, size);
    const ctx = exportCanvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    const transparentPng = (
      getElementByUniqueClassName(
        "png-transparent-checkbox",
      ) as HTMLInputElement
    ).checked;
    if (!transparentPng) {
      ctx.fillStyle = catData.backgroundColour;
      ctx.fillRect(0, 0, size, size);
    }
    ctx.scale(scale, scale);
    ctx.drawImage(lastRenderedCat, 0, 0);

    exportCanvas.convertToBlob().then((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "pixel-cat.png";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  },
);

// ---- compare with a saved cat ----

const compareSelect = getElementByUniqueClassName(
  "compare-select",
) as HTMLSelectElement;
const compareBox = getElementByUniqueClassName("compare-box") as HTMLElement;
const compareCanvas = getElementByUniqueClassName(
  "compare-canvas",
) as HTMLCanvasElement;
const compareNameSpan = getElementByUniqueClassName(
  "compare-name",
) as HTMLElement;

function hideCompare() {
  compareBox.classList.add("hidden");
}

function showCompare(name: string, params: string) {
  const url = new URL(document.URL);
  const compareData = CatData.fromURL(
    `${url.origin}${url.pathname}${params}`,
  );

  const offscreen = new OffscreenCanvas(50, 50);
  drawCat(offscreen, compareData.getPelt(), compareData.spriteNumber)
    .then(() => {
      const ctx = compareCanvas.getContext("2d")!;
      ctx.clearRect(0, 0, 50, 50);
      ctx.drawImage(offscreen, 0, 0);
      compareNameSpan.textContent = name;
      compareBox.classList.remove("hidden");
    })
    .catch((err) => console.error(err));
}

compareSelect.addEventListener("change", () => {
  const saved = loadSavedCats();
  const entry = saved[Number(compareSelect.value)];
  if (compareSelect.value === "" || !entry) {
    hideCompare();
    return;
  }
  showCompare(entry.name, entry.params);
});

getElementByUniqueClassName("compare-clear-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    compareSelect.value = "";
    hideCompare();
  },
);

// ---- saved cats (localStorage) ----

const SAVED_CATS_KEY = "pixel-cat-maker-saved-cats";

function loadSavedCats(): { name: string; params: string; notes?: string }[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_CATS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function refreshSavedCatsList(selectIndex: number | null = null) {
  const saved = loadSavedCats();
  savedCatsSelect.innerHTML = "";
  saved.forEach((cat, i) => {
    const option = document.createElement("option");
    option.value = i.toString();
    option.textContent = cat.name;
    savedCatsSelect.appendChild(option);
  });
  if (selectIndex !== null) {
    savedCatsSelect.value = selectIndex.toString();
  }

  // keep the compare picker in sync, preserving the current choice
  const compareValue = compareSelect.value;
  compareSelect.innerHTML = "";
  const noneOption = document.createElement("option");
  noneOption.value = "";
  noneOption.textContent = "None";
  compareSelect.appendChild(noneOption);
  saved.forEach((cat, i) => {
    const option = document.createElement("option");
    option.value = i.toString();
    option.textContent = cat.name;
    compareSelect.appendChild(option);
  });
  compareSelect.value = compareValue;
  if (compareSelect.value !== compareValue) {
    // the compared cat was deleted or renumbered
    compareSelect.value = "";
    hideCompare();
  }

  loadNotesForSelection();
}

getElementByUniqueClassName("save-cat-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    const name = prompt("Name this cat:");
    if (!name) {
      return;
    }
    const saved = loadSavedCats();
    saved.push({ name, params: getDataURL().search });
    localStorage.setItem(SAVED_CATS_KEY, JSON.stringify(saved));
    refreshSavedCatsList(saved.length - 1);
  },
);
getElementByUniqueClassName("load-cat-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    const saved = loadSavedCats();
    const entry = saved[Number(savedCatsSelect.value)];
    if (!entry) {
      return;
    }
    const url = new URL(document.URL);
    catData = CatData.fromURL(`${url.origin}${url.pathname}${entry.params}`);
    setFormFromObject(catData);
    redrawCat(true);
  },
);
getElementByUniqueClassName("delete-cat-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    const saved = loadSavedCats();
    const index = Number(savedCatsSelect.value);
    if (!saved[index]) {
      return;
    }
    if (!confirm(`Delete "${saved[index].name}"?`)) {
      return;
    }
    saved.splice(index, 1);
    localStorage.setItem(SAVED_CATS_KEY, JSON.stringify(saved));
    refreshSavedCatsList();
  },
);

// ---- gallery export / import ----

getElementByUniqueClassName("export-gallery-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    const saved = loadSavedCats();
    if (saved.length === 0) {
      alert("You have no saved cats to export yet.");
      return;
    }
    const blob = new Blob([JSON.stringify(saved, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pixel-cat-gallery.json";
    a.click();
    URL.revokeObjectURL(a.href);
  },
);

const importGalleryInput = getElementByUniqueClassName(
  "import-gallery-input",
) as HTMLInputElement;

getElementByUniqueClassName("import-gallery-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    importGalleryInput.click();
  },
);

importGalleryInput.addEventListener("change", () => {
  const file = importGalleryInput.files?.[0];
  if (!file) {
    return;
  }
  file
    .text()
    .then((text) => {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        alert("That file isn't valid JSON.");
        return;
      }
      if (!Array.isArray(parsed)) {
        alert("That file doesn't look like a gallery export.");
        return;
      }

      const incoming = parsed.filter(
        (entry): entry is { name: string; params: string; notes?: string } =>
          entry !== null &&
          typeof entry === "object" &&
          typeof entry.name === "string" &&
          typeof entry.params === "string" &&
          entry.params.startsWith("?"),
      );
      if (incoming.length === 0) {
        alert("No valid cats found in that file.");
        return;
      }

      const added = mergeGalleryEntries(incoming);
      alert(
        `Imported ${added} cat${added === 1 ? "" : "s"}` +
          (added < incoming.length
            ? ` (${incoming.length - added} already in your gallery)`
            : "") +
          ".",
      );
    })
    .finally(() => {
      // allow re-importing the same file later
      importGalleryInput.value = "";
    });
});

// ---- sprite palette viewer ----

const paletteRow = getElementByUniqueClassName("palette-row") as HTMLElement;
const paletteButton = getElementByUniqueClassName(
  "palette-button",
) as HTMLButtonElement;

function spritePalette(maxColours: number): { hex: string; count: number }[] {
  if (lastRenderedCat === null) {
    return [];
  }
  const data = lastRenderedCat
    .getContext("2d")!
    .getImageData(0, 0, 50, 50).data;
  const counts: Record<string, number> = {};
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) {
      continue;
    }
    const hex = `#${componentToHex(data[i])}${componentToHex(
      data[i + 1],
    )}${componentToHex(data[i + 2])}`;
    counts[hex] = (counts[hex] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([hex, count]) => ({ hex, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColours);
}

function renderPalette() {
  paletteRow.innerHTML = "";
  for (const { hex } of spritePalette(8)) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "palette-swatch";
    swatch.style.background = hex;
    swatch.title = `${hex} — click to copy`;
    swatch.addEventListener("click", () => {
      navigator.clipboard?.writeText(hex);
      swatch.classList.add("copied");
      setTimeout(() => swatch.classList.remove("copied"), 600);
    });
    paletteRow.appendChild(swatch);
  }
}

paletteButton.addEventListener("click", (e) => {
  e.preventDefault();
  const showing = !paletteRow.classList.contains("hidden");
  paletteRow.classList.toggle("hidden", showing);
  paletteButton.textContent = showing ? "Show Palette" : "Hide Palette";
  if (!showing) {
    renderPalette();
  }
});

// ---- age strip export ----

const AGE_STAGES: { pose: number; label: string }[] = [
  { pose: 20, label: "newborn" },
  { pose: 0, label: "kitten" },
  { pose: 3, label: "adolescent" },
  { pose: 6, label: "adult" },
  { pose: 12, label: "senior" },
];

getElementByUniqueClassName("age-strip-button").addEventListener(
  "click",
  async (e) => {
    e.preventDefault();
    const scale = Number(scaleSelect.value);
    const cell = 50 * scale;
    const strip = new OffscreenCanvas(cell * AGE_STAGES.length, cell);
    const ctx = strip.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = catData.backgroundColour;
    ctx.fillRect(0, 0, strip.width, strip.height);

    try {
      for (let i = 0; i < AGE_STAGES.length; i++) {
        const stage = new OffscreenCanvas(50, 50);
        await drawCat(stage, catData.getPelt(), AGE_STAGES[i].pose);
        ctx.drawImage(stage, 0, 0, 50, 50, i * cell, 0, cell, cell);
      }
    } catch (err) {
      console.error(err);
      alert(
        "Couldn't render every life stage — some selected parts may not " +
          "have art for all poses.",
      );
      return;
    }

    const blob = await strip.convertToBlob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cat-age-strip.png";
    a.click();
    URL.revokeObjectURL(a.href);
  },
);

// ---- character card export ----

function themeColour(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value === "" ? fallback : value;
}

getElementByUniqueClassName("character-card-button").addEventListener(
  "click",
  async (e) => {
    e.preventDefault();
    if (lastRenderedCat === null) {
      return;
    }
    const name = prompt("Name on the card:", "Unnamed");
    if (name === null) {
      return;
    }

    const W = 560;
    const H = 280;
    const card = new OffscreenCanvas(W, H);
    const ctx = card.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;

    const surface = themeColour("--surface", "#ffffff");
    const surface2 = themeColour("--surface-2", "#f0ece3");
    const text = themeColour("--text", "#333333");
    const muted = themeColour("--muted", "#777777");
    const border = themeColour("--border", "#cccccc");

    ctx.fillStyle = surface;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // cat on a soft inset panel
    ctx.fillStyle = surface2;
    ctx.fillRect(20, 20, 240, 240);
    ctx.drawImage(lastRenderedCat, 0, 0, 50, 50, 30, 30, 220, 220);

    // name
    ctx.fillStyle = text;
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.fillText(name, 285, 65, W - 305);

    // details
    ctx.fillStyle = muted;
    ctx.font = "15px system-ui, sans-serif";
    const pelt = catData.isTortie ? `Tortie (${catData.peltName})` : catData.peltName;
    ctx.fillText(`${catData.colour} ${pelt}`, 285, 95, W - 305);
    ctx.fillText(`Eyes: ${catData.eyeColour}`, 285, 118, W - 305);

    // palette strip
    const palette = spritePalette(6);
    for (let i = 0; i < palette.length; i++) {
      ctx.fillStyle = palette[i].hex;
      ctx.fillRect(285 + i * 40, 150, 34, 34);
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.strokeRect(285.5 + i * 40, 150.5, 33, 33);
    }

    // footer
    ctx.fillStyle = muted;
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("made with Pixel Cat Maker", 285, 245);

    const blob = await card.convertToBlob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/[^\w-]+/g, "_") || "cat"}-card.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
);

// ---- notes on saved cats ----

const catNotesArea = getElementByUniqueClassName(
  "cat-notes",
) as HTMLTextAreaElement;

function loadNotesForSelection() {
  const saved = loadSavedCats();
  const entry = saved[Number(savedCatsSelect.value)];
  catNotesArea.value = entry?.notes ?? "";
  catNotesArea.disabled = !entry;
}

savedCatsSelect.addEventListener("change", loadNotesForSelection);

getElementByUniqueClassName("save-notes-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    const saved = loadSavedCats();
    const index = Number(savedCatsSelect.value);
    if (!saved[index]) {
      alert("Select a saved cat first.");
      return;
    }
    saved[index].notes = catNotesArea.value;
    localStorage.setItem(SAVED_CATS_KEY, JSON.stringify(saved));
  },
);

// ---- recent designs ----

const RECENT_KEY = "pixel-cat-maker-recent";
const recentSelect = getElementByUniqueClassName(
  "recent-cats-select",
) as HTMLSelectElement;

function loadRecents(): { params: string; time: number }[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function refreshRecentsList() {
  const recents = loadRecents();
  recentSelect.innerHTML = "";
  recents.forEach((entry, i) => {
    const p = new URLSearchParams(entry.params);
    const option = document.createElement("option");
    option.value = i.toString();
    const when = new Date(entry.time);
    option.textContent = `${p.get("colour") ?? "?"} ${
      p.get("isTortie") === "true" ? "Tortie" : p.get("peltName") ?? "?"
    } — ${when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    recentSelect.appendChild(option);
  });
}

var recentTimer: number | undefined;
function scheduleRecentSnapshot() {
  clearTimeout(recentTimer);
  recentTimer = window.setTimeout(() => {
    const params = getDataURL().search;
    const recents = loadRecents().filter((r) => r.params !== params);
    recents.unshift({ params, time: Date.now() });
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, 10)));
    refreshRecentsList();
  }, 4000);
}

getElementByUniqueClassName("load-recent-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    const entry = loadRecents()[Number(recentSelect.value)];
    if (!entry) {
      return;
    }
    const url = new URL(document.URL);
    catData = CatData.fromURL(`${url.origin}${url.pathname}${entry.params}`);
    setFormFromObject(catData);
    redrawCat(true);
  },
);

// ---- shareable gallery links ----

function base64UrlEncode(str: string) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(padded)));
}

const copyGalleryLinkButton = getElementByUniqueClassName(
  "copy-gallery-link-button",
) as HTMLButtonElement;
copyGalleryLinkButton.addEventListener("click", (e) => {
  e.preventDefault();
  const saved = loadSavedCats();
  if (saved.length === 0) {
    alert("You have no saved cats to share yet.");
    return;
  }
  const url = new URL(document.URL);
  const link = `${url.origin}${url.pathname}?gallery=${base64UrlEncode(
    JSON.stringify(saved),
  )}`;
  if (link.length > 30000) {
    alert(
      "Your gallery is too large for a link — use 'Export gallery file' " +
        "instead.",
    );
    return;
  }
  navigator.clipboard?.writeText(link).then(() => {
    copyGalleryLinkButton.textContent = "Copied!";
    setTimeout(() => {
      copyGalleryLinkButton.textContent = "Copy gallery link";
    }, 1250);
  });
});

function mergeGalleryEntries(
  incoming: { name: string; params: string; notes?: string }[],
): number {
  const saved = loadSavedCats();
  let added = 0;
  for (const entry of incoming) {
    const duplicate = saved.some(
      (cat) => cat.name === entry.name && cat.params === entry.params,
    );
    if (!duplicate) {
      saved.push({
        name: entry.name,
        params: entry.params,
        ...(typeof entry.notes === "string" ? { notes: entry.notes } : {}),
      });
      added++;
    }
  }
  localStorage.setItem(SAVED_CATS_KEY, JSON.stringify(saved));
  refreshSavedCatsList();
  return added;
}

// offer to import a gallery arriving by link
{
  const galleryParam = new URL(document.URL).searchParams.get("gallery");
  if (galleryParam) {
    try {
      const incoming = JSON.parse(base64UrlDecode(galleryParam));
      if (Array.isArray(incoming)) {
        const valid = incoming.filter(
          (c) =>
            c &&
            typeof c.name === "string" &&
            typeof c.params === "string" &&
            c.params.startsWith("?"),
        );
        if (
          valid.length > 0 &&
          confirm(
            `This link contains a gallery of ${valid.length} cat${
              valid.length === 1 ? "" : "s"
            }. Import into your saved cats?`,
          )
        ) {
          const added = mergeGalleryEntries(valid);
          alert(`Imported ${added} new cat${added === 1 ? "" : "s"}.`);
        }
      }
    } catch {
      // malformed link; ignore
    }
    // remove the huge parameter from the address bar
    const url = new URL(document.URL);
    url.searchParams.delete("gallery");
    history.replaceState(null, "", url.toString());
  }
}

refreshRecentsList();
loadNotesForSelection();

refreshSavedCatsList();

addEventListener("popstate", () => {
  applyDataURL();
});

applyDataURL();
