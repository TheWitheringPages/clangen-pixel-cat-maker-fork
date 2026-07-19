import "./main.css";
import "./common.css";
import drawCat from "./library/drawCat";
import loadingImg from "./assets/loading.png";
import errorImg from "./assets/error_placeholder.png";

import CatData from "./library/CatData";
import { AdjustSlot } from "./library/types";

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
function redrawCat(applyURL: boolean = true) {
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

// ---- theme toggle ----

const themeToggle = getElementByUniqueClassName(
  "theme-toggle",
) as HTMLButtonElement;

function applyTheme(theme: string) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

themeToggle.addEventListener("click", () => {
  const next =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("pcm-theme", next);
  applyTheme(next);
});

// the pre-paint script in index.html already set the theme; sync the icon
applyTheme(document.documentElement.dataset.theme ?? "light");

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
}

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

var painting = false;
paintCanvas.addEventListener("pointerdown", (ev) => {
  ev.preventDefault();
  painting = true;
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
    // update the URL/sharecode once the stroke is finished
    redrawCat(true);
  }
});

getElementByUniqueClassName("paint-clear-button").addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    catData.paint = {};
    redrawCat();
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
    ctx.fillStyle = catData.backgroundColour;
    ctx.fillRect(0, 0, size, size);
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

// ---- saved cats (localStorage) ----

const SAVED_CATS_KEY = "pixel-cat-maker-saved-cats";

function loadSavedCats(): { name: string; params: string }[] {
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

refreshSavedCatsList();

addEventListener("popstate", () => {
  applyDataURL();
});

applyDataURL();
