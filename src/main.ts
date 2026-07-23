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
import {
  SAVED_CATS_KEY,
  loadSavedCats,
  renameSavedCat,
  moveSavedCat,
} from "./library/savedCats";

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
const paintViewport = getElementByUniqueClassName(
  "paint-viewport",
) as HTMLElement;
const paintZoomSlider = getElementByUniqueClassName(
  "paint-zoom-slider",
) as HTMLInputElement;
const paintZoomLabel = getElementByUniqueClassName(
  "paint-zoom-label",
) as HTMLElement;

const savedCatsSelect = getElementByUniqueClassName(
  "saved-cats-select",
) as HTMLSelectElement;
const savedThumbs = getElementByUniqueClassName("saved-thumbs");

// last fully rendered 50x50 cat (post-reverse, incl. paint),
// used by the paint editor and the PNG download
var lastRenderedCat: OffscreenCanvas | null = null;

// form-wide undo/redo. each entry is a full cat state as a URL query string
// (the same canonical form used by saved cats and the address bar). the paint
// editor keeps its own separate undo stack for individual strokes.
var undoStack: string[] = [];
var redoStack: string[] = [];
var lastCommittedParams: string | null = null;
// set while undo/redo is applying a state, so applying it doesn't get recorded
// as a fresh change
var applyingHistory = false;
const UNDO_LIMIT = 100;

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
  // don't let a shift-click line anchor to the previous cat's last pixel
  lastPaintCell = null;
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

  // sync the undo baseline to whatever we just loaded, so the next change is
  // recorded relative to it
  lastCommittedParams = getDataURL().search;
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
        const params = getDataURL().search;
        // record the previous state for undo, unless we're mid undo/redo
        if (!applyingHistory && lastCommittedParams !== null && lastCommittedParams !== params) {
          undoStack.push(lastCommittedParams);
          if (undoStack.length > UNDO_LIMIT) {
            undoStack.shift();
          }
          redoStack = [];
        }
        lastCommittedParams = params;
        updateUndoRedoButtons();
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

// Pick a random option, but only from ones that are actually valid for the
// current pose/pelt (not hidden/disabled by the compatibility filter). An
// optional `allow` predicate narrows the pool further. Returns false if no
// option qualified.
function randomizeSelected(
  select: HTMLSelectElement,
  allow?: (value: string) => boolean,
): boolean {
  const candidates = Array.from(select.options).filter(
    (o) => !o.disabled && !o.hidden && (allow === undefined || allow(o.value)),
  );
  if (candidates.length === 0) {
    return false;
  }
  const choice = candidates[Math.floor(Math.random() * candidates.length)];
  select.value = choice.value;
  return true;
}

// does a pelt pattern have a sprite for this colour at the current pose?
function peltSupportsColour(peltName: string, colour: string): boolean {
  const pose = Number(spriteNumberSelect.value);
  const groups = pose >= 21 ? NEWPOSE_GROUPS : ALL_GROUPS;
  return groups.has(`${spritesNameOf(peltName)}${colour}`);
}

// choose 1-2 distinct valid white patches
function randomizeWhitePatches(select: HTMLSelectElement) {
  for (const o of Array.from(select.options)) {
    o.selected = false;
  }
  const valid = Array.from(select.options).filter(
    (o) => o.value !== "" && !o.disabled && !o.hidden,
  );
  if (valid.length === 0) {
    return;
  }
  const count = Math.min(valid.length, Math.floor(Math.random() * 2) + 1);
  const shuffled = valid.slice().sort(() => Math.random() - 0.5);
  for (let i = 0; i < count; i++) {
    shuffled[i].selected = true;
  }
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
    if (selectId === "white-patches-select") {
      randomizeWhitePatches(select);
    } else if (selectId === "pelt-name-select") {
      // randomizing the pattern shouldn't disturb the colour: pick a pattern
      // that still supports the current colour, falling back to any pattern
      const colour = colourSelect.value;
      if (
        !randomizeSelected(select, (pelt) => peltSupportsColour(pelt, colour))
      ) {
        randomizeSelected(select);
      }
    } else {
      randomizeSelected(select);
    }
    redrawCat();
  });
}

// ---- field locks (skipped by Randomize All) ----
//
// a locked field keeps its value when Randomize All runs. the field's own
// shuffle button still works, since that's an explicit request to change it.

const LOCKED_FIELDS_KEY = "pixel-cat-maker-locked-fields";

function loadLockedFields(): Set<string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCKED_FIELDS_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

const lockedFields = loadLockedFields();

function saveLockedFields() {
  localStorage.setItem(
    LOCKED_FIELDS_KEY,
    JSON.stringify(Array.from(lockedFields)),
  );
}

function isLocked(selectId: string): boolean {
  return lockedFields.has(selectId);
}

// add a lock toggle next to every shuffle button
for (const randomButton of Array.from(randomButtons)) {
  const selectId = randomButton.dataset.selectId;
  if (!selectId) {
    continue;
  }
  const lockButton = document.createElement("button");
  lockButton.type = "button";
  lockButton.className = "lock-button";
  lockButton.dataset.selectId = selectId;
  lockButton.title = "Lock this field so Randomize All leaves it alone";
  const syncLock = () => {
    const locked = lockedFields.has(selectId);
    lockButton.textContent = locked ? "🔒" : "🔓";
    lockButton.classList.toggle("locked", locked);
  };
  syncLock();
  lockButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (lockedFields.has(selectId)) {
      lockedFields.delete(selectId);
    } else {
      lockedFields.add(selectId);
    }
    saveLockedFields();
    syncLock();
  });
  // keep the shuffle and lock buttons together in the row's last cell so the
  // lock doesn't spill onto its own grid row
  const buttons = document.createElement("span");
  buttons.className = "field-buttons";
  randomButton.replaceWith(buttons);
  buttons.append(randomButton, lockButton);
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

    // locked fields keep their current value; everything else is rerolled
    if (!isLocked("sprite-no-select")) {
      randomizeSelected(spriteNumberSelect);
    }
    if (!isLocked("pelt-name-select")) {
      randomizeSelected(peltNameSelect);
    }
    if (!isLocked("colour-select")) {
      // pick a colour the freshly chosen pattern actually has
      if (
        !randomizeSelected(colourSelect, (c) =>
          peltSupportsColour(peltNameSelect.value, c),
        )
      ) {
        randomizeSelected(colourSelect);
      }
    }
    if (!isLocked("tortie-pattern-select")) {
      randomizeSelected(tortiePatternSelect);
    }
    if (!isLocked("tortie-colour-select")) {
      randomizeSelected(tortieColourSelect);
    }
    if (!isLocked("tortie-mask-select")) {
      randomizeSelected(tortieMaskSelect);
    }
    isTortieCheckbox.checked = Math.random() <= 0.5;
    if (!isLocked("tint-select")) {
      randomizeSelected(tintSelect);
    }
    if (!isLocked("eye-colour-select")) {
      randomizeSelected(eyeColourSelect);
    }
    if (!isLocked("eye-colour2-select")) {
      if (Math.random() <= 0.5) {
        randomizeSelected(eyeColour2Select);
      } else {
        eyeColour2Select.selectedIndex = 0;
      }
    }
    if (!isLocked("skin-colour-select")) {
      randomizeSelected(skinColourSelect);
    }

    if (Math.random() <= 0.5) {
      if (!isLocked("white-patches-select")) {
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
      }
      if (!isLocked("points-select")) {
        if (Math.random() <= 0.5) {
          randomizeSelected(pointsSelect);
        } else {
          pointsSelect.selectedIndex = 0;
        }
      }
      randomizeSelected(whitePatchesTintSelect);
      if (!isLocked("vitiligo-select")) {
        if (Math.random() <= 0.5) {
          randomizeSelected(vitiligoSelect);
        } else {
          vitiligoSelect.selectedIndex = 0;
        }
      }
    } else {
      whitePatchesTintSelect.selectedIndex = 0;
      if (!isLocked("white-patches-select")) {
        whitePatchesSelect.selectedIndex = 0;
      }
      if (!isLocked("points-select")) {
        pointsSelect.selectedIndex = 0;
      }
      if (!isLocked("vitiligo-select")) {
        vitiligoSelect.selectedIndex = 0;
      }
    }

    if (!isLocked("accessory-select")) {
      if (Math.random() <= 0.5) {
        randomizeSelected(accessorySelect);
      } else {
        accessorySelect.selectedIndex = 0;
      }
    }

    if (!isLocked("scar-select")) {
      if (Math.random() <= 0.5) {
        randomizeSelected(scarSelect);
      } else {
        scarSelect.selectedIndex = 0;
      }
    }

    reverseCheckbox.checked = Math.random() <= 0.5;

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

// ---- form-wide undo/redo ----

const undoButton = getElementByUniqueClassName(
  "undo-button",
) as HTMLButtonElement;
const redoButton = getElementByUniqueClassName(
  "redo-button",
) as HTMLButtonElement;

function updateUndoRedoButtons() {
  undoButton.disabled = undoStack.length === 0;
  redoButton.disabled = redoStack.length === 0;
}

// load a stored cat state without recording it as a new change
function applyState(params: string) {
  applyingHistory = true;
  const url = new URL(document.URL);
  catData = CatData.fromURL(`${url.origin}${url.pathname}${params}`);
  setFormFromObject(catData);
  redrawCat(false);
  lastCommittedParams = params;
  history.replaceState(null, "", getDataURL().toString());
  applyingHistory = false;
  updateUndoRedoButtons();
}

function undo() {
  const previous = undoStack.pop();
  if (previous === undefined) {
    return;
  }
  if (lastCommittedParams !== null) {
    redoStack.push(lastCommittedParams);
  }
  applyState(previous);
}

function redo() {
  const next = redoStack.pop();
  if (next === undefined) {
    return;
  }
  if (lastCommittedParams !== null) {
    undoStack.push(lastCommittedParams);
  }
  applyState(next);
}

undoButton.addEventListener("click", (e) => {
  e.preventDefault();
  undo();
});
redoButton.addEventListener("click", (e) => {
  e.preventDefault();
  redo();
});

document.addEventListener("keydown", (e) => {
  // the paint editor handles Ctrl+Z itself while its panel is open
  if (paintDetails.open) {
    return;
  }
  const target = e.target as HTMLElement;
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
    return;
  }
  if (!e.ctrlKey && !e.metaKey) {
    return;
  }
  const key = e.key.toLowerCase();
  if (key === "z" && !e.shiftKey) {
    e.preventDefault();
    undo();
  } else if (key === "y" || (key === "z" && e.shiftKey)) {
    e.preventDefault();
    redo();
  }
});

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

// map a displayed cell x to the stored (pre-reverse) key, so paint flips
// together with the cat
function paintKey(px: number, py: number): string {
  const sx = catData.reverse ? 49 - px : px;
  return `${sx},${py}`;
}

const symmetryCheckbox = getElementByUniqueClassName(
  "paint-symmetry-checkbox",
) as HTMLInputElement;

// last displayed cell drawn, used as the anchor for shift-click straight lines
var lastPaintCell: { x: number; y: number } | null = null;

/** Draw or erase a single displayed cell. Returns whether anything changed. */
function applyPaintCell(px: number, py: number, erase: boolean): boolean {
  if (px < 0 || px >= 50 || py < 0 || py >= 50) {
    return false;
  }
  const key = paintKey(px, py);
  if (erase) {
    if (!(key in catData.paint)) {
      return false;
    }
    delete catData.paint[key];
    return true;
  }
  if (catData.paint[key] === paintColourInput.value) {
    return false;
  }
  catData.paint[key] = paintColourInput.value;
  return true;
}

/** Apply draw/erase to a cell plus its mirror when symmetry is on. */
function applyToolAtCell(px: number, py: number, erase: boolean): boolean {
  let changed = applyPaintCell(px, py, erase);
  if (symmetryCheckbox.checked) {
    changed = applyPaintCell(49 - px, py, erase) || changed;
  }
  return changed;
}

/** Bresenham line of cells between two displayed cells. */
function paintLine(
  from: { x: number; y: number },
  to: { x: number; y: number },
  erase: boolean,
): boolean {
  let x0 = from.x;
  let y0 = from.y;
  const dx = Math.abs(to.x - x0);
  const dy = -Math.abs(to.y - y0);
  const sx = x0 < to.x ? 1 : -1;
  const sy = y0 < to.y ? 1 : -1;
  let err = dx + dy;
  let changed = false;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    changed = applyToolAtCell(x0, y0, erase) || changed;
    if (x0 === to.x && y0 === to.y) {
      break;
    }
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
  return changed;
}

// visible colour at a displayed cell: painted colour if any, else the
// rendered cat pixel, as [r,g,b,a] (a=0 means transparent/empty)
function visibleColourAt(px: number, py: number): [number, number, number, number] {
  const key = paintKey(px, py);
  const painted = catData.paint[key];
  if (painted !== undefined) {
    const r = parseInt(painted.slice(1, 3), 16);
    const g = parseInt(painted.slice(3, 5), 16);
    const b = parseInt(painted.slice(5, 7), 16);
    return [r, g, b, 255];
  }
  if (lastRenderedCat !== null) {
    const d = lastRenderedCat.getContext("2d")!.getImageData(px, py, 1, 1).data;
    return [d[0], d[1], d[2], d[3]];
  }
  return [0, 0, 0, 0];
}

const FILL_TOLERANCE = 40;
function colourMatches(
  a: [number, number, number, number],
  b: [number, number, number, number],
): boolean {
  // both transparent counts as a match; otherwise compare within tolerance
  if (a[3] === 0 || b[3] === 0) {
    return a[3] === b[3];
  }
  return (
    Math.abs(a[0] - b[0]) <= FILL_TOLERANCE &&
    Math.abs(a[1] - b[1]) <= FILL_TOLERANCE &&
    Math.abs(a[2] - b[2]) <= FILL_TOLERANCE
  );
}

/** Flood fill the contiguous region matching the clicked cell's colour. */
function floodFill(startX: number, startY: number): boolean {
  const target = visibleColourAt(startX, startY);
  const fill = paintColourInput.value;
  const seen = new Set<number>();
  const stack: [number, number][] = [[startX, startY]];
  let changed = false;
  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= 50 || y < 0 || y >= 50) {
      continue;
    }
    const id = y * 50 + x;
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    if (!colourMatches(visibleColourAt(x, y), target)) {
      continue;
    }
    const key = paintKey(x, y);
    if (catData.paint[key] !== fill) {
      catData.paint[key] = fill;
      changed = true;
    }
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return changed;
}

function displayedCellOf(ev: PointerEvent): { px: number; py: number } {
  const rect = paintCanvas.getBoundingClientRect();
  return {
    px: Math.floor(((ev.clientX - rect.left) / rect.width) * 50),
    py: Math.floor(((ev.clientY - rect.top) / rect.height) * 50),
  };
}

function paintAt(ev: PointerEvent, isStart = false) {
  const { px, py } = displayedCellOf(ev);
  if (px < 0 || px >= 50 || py < 0 || py >= 50) {
    return;
  }

  const tool = paintToolSelect.value;

  if (tool === "pick") {
    // eyedropper reads from the rendered cat (displayed coordinates)
    if (lastRenderedCat !== null) {
      const data = lastRenderedCat
        .getContext("2d")!
        .getImageData(px, py, 1, 1).data;
      if (data[3] > 0) {
        const hex = `#${componentToHex(data[0])}${componentToHex(
          data[1],
        )}${componentToHex(data[2])}`;
        paintColourInput.value = hex;
        rememberPaintColour(hex);
        paintToolSelect.value = "draw";
      }
    }
    return;
  }

  if (tool === "fill") {
    if (!isStart) {
      return; // fill only on the initial click, not while dragging
    }
    let changed = floodFill(px, py);
    if (symmetryCheckbox.checked) {
      changed = floodFill(49 - px, py) || changed;
    }
    lastPaintCell = { x: px, y: py };
    if (changed) {
      rememberPaintColour(paintColourInput.value);
      redrawCat(false);
    }
    return;
  }

  const erase = tool === "erase";

  // shift-click from the last pixel draws a straight line
  if (isStart && ev.shiftKey && lastPaintCell !== null) {
    const changed = paintLine(lastPaintCell, { x: px, y: py }, erase);
    lastPaintCell = { x: px, y: py };
    if (changed) {
      if (!erase) {
        rememberPaintColour(paintColourInput.value);
      }
      redrawCat(false);
    }
    return;
  }

  const changed = applyToolAtCell(px, py, erase);
  lastPaintCell = { x: px, y: py };
  if (changed) {
    if (!erase) {
      rememberPaintColour(paintColourInput.value);
    }
    redrawCat(false);
  }
}

// ---- recent paint colours ----

const RECENT_COLOURS_KEY = "pixel-cat-maker-recent-colours";
const MAX_RECENT_COLOURS = 8;
const recentColoursContainer = getElementByUniqueClassName(
  "paint-recent-colours",
);

function loadRecentColours(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_COLOURS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderRecentColours() {
  const colours = loadRecentColours();
  recentColoursContainer.innerHTML = "";
  if (colours.length === 0) {
    const hint = document.createElement("span");
    hint.className = "paint-recent-empty";
    hint.textContent = "—";
    recentColoursContainer.appendChild(hint);
    return;
  }
  for (const colour of colours) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "paint-swatch";
    swatch.style.backgroundColor = colour;
    swatch.title = colour;
    swatch.addEventListener("click", (e) => {
      e.preventDefault();
      paintColourInput.value = colour;
    });
    recentColoursContainer.appendChild(swatch);
  }
}

function rememberPaintColour(colour: string) {
  const normalised = colour.toLowerCase();
  const colours = loadRecentColours().filter(
    (c) => c.toLowerCase() !== normalised,
  );
  colours.unshift(normalised);
  localStorage.setItem(
    RECENT_COLOURS_KEY,
    JSON.stringify(colours.slice(0, MAX_RECENT_COLOURS)),
  );
  renderRecentColours();
}

renderRecentColours();

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

// ---- paint canvas zoom & pan ----
//
// The canvas fills its viewport at zoom 1; zoom/pan is a CSS transform on the
// canvas element. paintAt() maps clicks via getBoundingClientRect(), which
// already reflects the transform, so drawing coordinates stay correct at any
// zoom without extra maths.

const PAINT_MIN_ZOOM = 1;
const PAINT_MAX_ZOOM = 8;

var paintZoom = 1;
var paintPanX = 0;
var paintPanY = 0;

function applyPaintTransform() {
  paintCanvas.style.transform = `translate(${paintPanX}px, ${paintPanY}px) scale(${paintZoom})`;
}

function syncZoomUI() {
  paintZoomSlider.value = paintZoom.toString();
  paintZoomLabel.textContent = `${paintZoom.toFixed(1)}×`;
}

// keep the canvas covering the viewport — no dragging it off into empty space
function clampPan() {
  const size = paintViewport.clientWidth;
  const scaled = size * paintZoom;
  const min = size - scaled; // <= 0 once zoomed in
  paintPanX = Math.min(0, Math.max(min, paintPanX));
  paintPanY = Math.min(0, Math.max(min, paintPanY));
}

/** Zoom to `newZoom` keeping the viewport-relative point (px, py) fixed. */
function zoomAroundPoint(px: number, py: number, newZoom: number) {
  newZoom = Math.min(PAINT_MAX_ZOOM, Math.max(PAINT_MIN_ZOOM, newZoom));
  const canvasX = (px - paintPanX) / paintZoom;
  const canvasY = (py - paintPanY) / paintZoom;
  paintPanX = px - canvasX * newZoom;
  paintPanY = py - canvasY * newZoom;
  paintZoom = newZoom;
  clampPan();
  applyPaintTransform();
  syncZoomUI();
}

function resetPaintView() {
  paintZoom = 1;
  paintPanX = 0;
  paintPanY = 0;
  applyPaintTransform();
  syncZoomUI();
}

paintZoomSlider.addEventListener("input", () => {
  const rect = paintViewport.getBoundingClientRect();
  zoomAroundPoint(rect.width / 2, rect.height / 2, Number(paintZoomSlider.value));
});
getElementByUniqueClassName("paint-reset-view-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    resetPaintView();
  },
);

paintCanvas.addEventListener(
  "wheel",
  (ev) => {
    ev.preventDefault();
    const rect = paintViewport.getBoundingClientRect();
    const factor = ev.deltaY < 0 ? 1.15 : 1 / 1.15;
    zoomAroundPoint(ev.clientX - rect.left, ev.clientY - rect.top, paintZoom * factor);
  },
  { passive: false },
);
// no context menu on the canvas so right-drag can be used to pan
paintViewport.addEventListener("contextmenu", (e) => e.preventDefault());

// ---- paint pointer handling (draw / right-drag pan / pinch-zoom) ----

var painting = false;
var drawPointerId: number | null = null;
var panPointerId: number | null = null;
var lastPanClientX = 0;
var lastPanClientY = 0;

// active touch points, for pinch-zoom / two-finger pan
const activeTouches = new Map<number, { x: number; y: number }>();
var pinchActive = false;
var pinchLastDist = 0;
var pinchLastMidX = 0;
var pinchLastMidY = 0;

function pinchGeometry() {
  const pts = [...activeTouches.values()];
  const dx = pts[0].x - pts[1].x;
  const dy = pts[0].y - pts[1].y;
  return {
    dist: Math.hypot(dx, dy),
    midX: (pts[0].x + pts[1].x) / 2,
    midY: (pts[0].y + pts[1].y) / 2,
  };
}

function beginPinch() {
  pinchActive = true;
  const g = pinchGeometry();
  pinchLastDist = g.dist;
  pinchLastMidX = g.midX;
  pinchLastMidY = g.midY;
}

function updatePinch() {
  if (!pinchActive) {
    beginPinch();
    return;
  }
  const g = pinchGeometry();
  const rect = paintViewport.getBoundingClientRect();
  // two-finger drag pans, spreading fingers zooms toward the midpoint
  paintPanX += g.midX - pinchLastMidX;
  paintPanY += g.midY - pinchLastMidY;
  const ratio = pinchLastDist > 0 ? g.dist / pinchLastDist : 1;
  zoomAroundPoint(g.midX - rect.left, g.midY - rect.top, paintZoom * ratio);
  pinchLastDist = g.dist;
  pinchLastMidX = g.midX;
  pinchLastMidY = g.midY;
}

/** Discard an in-progress stroke and undo any pixels it placed. */
function abortPaintStroke() {
  if (!painting) {
    return;
  }
  painting = false;
  drawPointerId = null;
  const snapshot = paintUndoStack.pop();
  if (snapshot !== undefined) {
    catData.paint = snapshot;
    paintUndoButton.disabled = paintUndoStack.length === 0;
    redrawCat(false);
  }
}

function finishPaintStroke() {
  painting = false;
  drawPointerId = null;
  // drop the undo entry if the stroke didn't actually change anything
  const last = paintUndoStack[paintUndoStack.length - 1];
  if (
    last !== undefined &&
    JSON.stringify(last) === JSON.stringify(catData.paint)
  ) {
    paintUndoStack.pop();
    paintUndoButton.disabled = paintUndoStack.length === 0;
  }
  // update the URL/sharecode once the stroke is finished
  redrawCat(true);
}

paintCanvas.addEventListener("pointerdown", (ev) => {
  // right mouse button → pan
  if (ev.pointerType === "mouse" && ev.button === 2) {
    ev.preventDefault();
    panPointerId = ev.pointerId;
    lastPanClientX = ev.clientX;
    lastPanClientY = ev.clientY;
    paintCanvas.setPointerCapture(ev.pointerId);
    return;
  }
  // ignore other non-primary mouse buttons (e.g. middle)
  if (ev.pointerType === "mouse" && ev.button !== 0) {
    return;
  }

  if (ev.pointerType === "touch") {
    activeTouches.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (activeTouches.size >= 2) {
      // a second finger → this is a pinch/pan gesture, not drawing
      abortPaintStroke();
      beginPinch();
      return;
    }
  }

  // primary button / single finger → draw
  ev.preventDefault();
  painting = true;
  drawPointerId = ev.pointerId;
  if (paintToolSelect.value !== "pick") {
    pushPaintUndo();
  }
  paintCanvas.setPointerCapture(ev.pointerId);
  paintAt(ev, true);
});

paintCanvas.addEventListener("pointermove", (ev) => {
  if (panPointerId === ev.pointerId) {
    paintPanX += ev.clientX - lastPanClientX;
    paintPanY += ev.clientY - lastPanClientY;
    lastPanClientX = ev.clientX;
    lastPanClientY = ev.clientY;
    clampPan();
    applyPaintTransform();
    return;
  }
  if (ev.pointerType === "touch" && activeTouches.has(ev.pointerId)) {
    activeTouches.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (activeTouches.size >= 2) {
      updatePinch();
      return;
    }
  }
  if (painting && drawPointerId === ev.pointerId) {
    paintAt(ev);
  }
});

function endPaintPointer(ev: PointerEvent) {
  if (panPointerId === ev.pointerId) {
    panPointerId = null;
    return;
  }
  if (ev.pointerType === "touch") {
    activeTouches.delete(ev.pointerId);
    if (activeTouches.size < 2) {
      pinchActive = false;
    }
  }
  if (drawPointerId === ev.pointerId && painting) {
    finishPaintStroke();
  }
}

paintCanvas.addEventListener("pointerup", endPaintPointer);
paintCanvas.addEventListener("pointercancel", endPaintPointer);

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

// ---- saved cats (localStorage; shared helpers in library/savedCats) ----

const savedSearchInput = getElementByUniqueClassName(
  "saved-search-input",
) as HTMLInputElement;
var savedSearchTerm = "";

function highlightSelectedSavedThumb() {
  const selected = savedCatsSelect.value;
  savedThumbs.querySelectorAll(".cat-thumb").forEach((el) => {
    el.classList.toggle(
      "selected",
      (el as HTMLElement).dataset.index === selected,
    );
  });
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

  // thumbnail strip mirrors the select; clicking a thumb selects that cat
  savedThumbs.innerHTML = "";
  const term = savedSearchTerm.trim().toLowerCase();
  const shown = saved
    .map((cat, i) => ({ cat, i }))
    .filter(({ cat }) => term === "" || cat.name.toLowerCase().includes(term));
  if (saved.length === 0) {
    const empty = document.createElement("span");
    empty.className = "cat-thumb-empty";
    empty.textContent = "No saved cats yet.";
    savedThumbs.appendChild(empty);
  } else if (shown.length === 0) {
    const empty = document.createElement("span");
    empty.className = "cat-thumb-empty";
    empty.textContent = "No saved cats match your search.";
    savedThumbs.appendChild(empty);
  } else {
    shown.forEach(({ cat, i }) => {
      const btn = makeThumbButton(cat.params, cat.name, cat.name);
      btn.dataset.index = i.toString();
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        savedCatsSelect.value = i.toString();
        loadNotesForSelection();
        highlightSelectedSavedThumb();
      });
      savedThumbs.appendChild(btn);
    });
  }
  highlightSelectedSavedThumb();

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
    startNewRecentSession();
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

getElementByUniqueClassName("rename-cat-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    const index = Number(savedCatsSelect.value);
    const saved = loadSavedCats();
    if (!saved[index]) {
      return;
    }
    const name = prompt("Rename this cat:", saved[index].name);
    if (name === null || name.trim() === "") {
      return;
    }
    renameSavedCat(index, name.trim());
    refreshSavedCatsList(index);
  },
);

function moveSelectedSavedCat(delta: number) {
  const index = Number(savedCatsSelect.value);
  const saved = loadSavedCats();
  const target = index + delta;
  if (!saved[index] || target < 0 || target >= saved.length) {
    return;
  }
  moveSavedCat(index, target);
  refreshSavedCatsList(target);
}

getElementByUniqueClassName("move-cat-up-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    moveSelectedSavedCat(-1);
  },
);
getElementByUniqueClassName("move-cat-down-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    moveSelectedSavedCat(1);
  },
);

savedSearchInput.addEventListener("input", () => {
  savedSearchTerm = savedSearchInput.value;
  refreshSavedCatsList(
    savedCatsSelect.value === "" ? null : Number(savedCatsSelect.value),
  );
});

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

// draw the shareable character card and return it as a PNG blob
async function buildCharacterCard(name: string): Promise<Blob> {
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
  ctx.drawImage(lastRenderedCat!, 0, 0, 50, 50, 30, 30, 220, 220);

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

  return card.convertToBlob();
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

    const blob = await buildCharacterCard(name);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/[^\w-]+/g, "_") || "cat"}-card.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
);

// copy the character card straight to the clipboard, handy for pasting into
// Discord or a chat. hidden where the browser can't write images to clipboard.
const copyCardButton = getElementByUniqueClassName(
  "copy-card-button",
) as HTMLButtonElement;
if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
  copyCardButton.addEventListener("click", async (e) => {
    e.preventDefault();
    if (lastRenderedCat === null) {
      return;
    }
    const name = prompt("Name on the card:", "Unnamed");
    if (name === null) {
      return;
    }
    try {
      const blob = await buildCharacterCard(name);
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      copyCardButton.textContent = "Copied!";
      setTimeout(() => {
        copyCardButton.textContent = "Copy Card Image";
      }, 1250);
    } catch (err) {
      console.error(err);
      alert("Couldn't copy the card image to the clipboard.");
    }
  });
} else {
  copyCardButton.classList.add("hidden");
}

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

savedCatsSelect.addEventListener("change", () => {
  loadNotesForSelection();
  highlightSelectedSavedThumb();
});

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
const recentThumbs = getElementByUniqueClassName("recent-thumbs");

// ---- cat thumbnails (shared by Recent and Saved lists) ----

function catLabelOf(params: string): string {
  const p = new URLSearchParams(params);
  return `${p.get("colour") ?? "?"} ${
    p.get("isTortie") === "true" ? "Tortie" : p.get("peltName") ?? "?"
  }`;
}

/** Render a 50×50 cat preview from stored params into `canvas`. */
function renderCatThumb(params: string, canvas: HTMLCanvasElement) {
  const url = new URL(document.URL);
  let data;
  try {
    data = CatData.fromURL(`${url.origin}${url.pathname}${params}`);
  } catch {
    return;
  }
  const offscreen = new OffscreenCanvas(50, 50);
  drawCat(offscreen, data.getPelt(), data.spriteNumber)
    .then(() => {
      const ctx = canvas.getContext("2d");
      if (ctx === null) {
        return;
      }
      ctx.clearRect(0, 0, 50, 50);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offscreen, 0, 0);
    })
    .catch((err) => console.error(err));
}

/** A clickable thumbnail button (preview + caption). */
function makeThumbButton(
  params: string,
  labelText: string,
  title: string,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "cat-thumb";
  btn.title = title;

  const canvas = document.createElement("canvas");
  canvas.width = 50;
  canvas.height = 50;
  canvas.className = "cat-thumb-canvas";
  btn.appendChild(canvas);

  const label = document.createElement("span");
  label.className = "cat-thumb-label";
  label.textContent = labelText;
  btn.appendChild(label);

  renderCatThumb(params, canvas);
  return btn;
}

function loadRecents(): { params: string; time: number }[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadRecentDesign(params: string) {
  const url = new URL(document.URL);
  catData = CatData.fromURL(`${url.origin}${url.pathname}${params}`);
  setFormFromObject(catData);
  startNewRecentSession();
  redrawCat(true);
}

function refreshRecentsList() {
  const recents = loadRecents();
  recentThumbs.innerHTML = "";
  if (recents.length === 0) {
    const empty = document.createElement("span");
    empty.className = "cat-thumb-empty";
    empty.textContent = "No recent designs yet.";
    recentThumbs.appendChild(empty);
    return;
  }
  recents.forEach((entry) => {
    const label = catLabelOf(entry.params);
    const time = new Date(entry.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const btn = makeThumbButton(entry.params, time, `${label} — ${time}`);
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      loadRecentDesign(entry.params);
    });
    recentThumbs.appendChild(btn);
  });
}

// "Main choice" fields that make a cat a *different* cat rather than a tweak
// of the current one. Changing anything else (eyes, accessory, white patches,
// pose, scar, paint...) just updates the slot for the cat you're editing.
const RECENT_IDENTITY_FIELDS = [
  "peltName",
  "colour",
  "isTortie",
  "tortieColour",
  "tortiePattern",
];

// How long a changed main choice must be *left in place* before it counts as
// a new cat. Below this, flipping through pelts/colours to preview them just
// keeps the current slot and never forks history.
const RECENT_COMMIT_MS = 60000;

function recentIdentityOf(params: string): string {
  const p = new URLSearchParams(params);
  return RECENT_IDENTITY_FIELDS.map((f) => `${f}=${p.get(f) ?? ""}`).join("&");
}

// Identity of the cat occupying the live (top) history slot — the one we keep
// updating in place. null forces the next snapshot to start a fresh slot
// (set on load/import boundaries).
var committedIdentity: string | null = null;
// A different main-choice identity we're currently previewing, and when it
// was first seen. It only becomes a new slot once held for RECENT_COMMIT_MS.
var pendingIdentity: string | null = null;
var pendingSince = 0;
var recentCommitTimer: number | undefined;
var forceNewRecentSlot = false;

function saveRecents(recents: { params: string; time: number }[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, 10)));
  refreshRecentsList();
}

/** Force the next snapshot to create a new history slot (load/import). */
function startNewRecentSession() {
  forceNewRecentSlot = true;
  pendingIdentity = null;
  clearTimeout(recentCommitTimer);
}

function clearPendingIdentity() {
  pendingIdentity = null;
  clearTimeout(recentCommitTimer);
}

/** Fork the previewed main-choice change into its own slot, if still current. */
function commitPendingIdentity() {
  const params = getDataURL().search;
  const identity = recentIdentityOf(params);
  // user may have reverted or flipped away while the timer was pending
  if (identity !== pendingIdentity || identity === committedIdentity) {
    return;
  }
  const recents = loadRecents().filter((r) => r.params !== params);
  recents.unshift({ params, time: Date.now() });
  committedIdentity = identity;
  clearPendingIdentity();
  saveRecents(recents);
}

var recentTimer: number | undefined;
function scheduleRecentSnapshot() {
  clearTimeout(recentTimer);
  recentTimer = window.setTimeout(() => {
    const params = getDataURL().search;
    const identity = recentIdentityOf(params);
    const recents = loadRecents();

    if (forceNewRecentSlot || recents.length === 0) {
      // load/import boundary, or the very first cat → fresh slot
      forceNewRecentSlot = false;
      clearPendingIdentity();
      const deduped = recents.filter((r) => r.params !== params);
      deduped.unshift({ params, time: Date.now() });
      committedIdentity = identity;
      saveRecents(deduped);
      return;
    }

    if (identity === committedIdentity) {
      // same cat, just a tweak — keep its slot current, cancel any preview
      clearPendingIdentity();
      recents[0] = { params, time: Date.now() };
      saveRecents(recents);
      return;
    }

    // A main choice changed. Don't fork yet — this may just be previewing.
    // Leave the committed cat's slot untouched and (re)arm the commit timer,
    // resetting the clock only when the previewed identity itself changes.
    if (identity !== pendingIdentity) {
      pendingIdentity = identity;
      pendingSince = Date.now();
    }
    clearTimeout(recentCommitTimer);
    const remaining = Math.max(0, RECENT_COMMIT_MS - (Date.now() - pendingSince));
    recentCommitTimer = window.setTimeout(commitPendingIdentity, remaining);
  }, 4000);
}

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
