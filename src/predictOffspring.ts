import "./main.css";
import "./common.css";
import "./predictOffspring.css";
import { initThemeToggle } from "./library/theme";
import {
  generateChildPelt,
  analyzeAncestry,
  synthesizeParentPair,
} from "./library/inheritance";

initThemeToggle();
import CatData from "./library/CatData";
import drawCat from "./library/drawCat";
import { Pelt } from "./library/types";
import { loadSavedCats, addSavedCat } from "./library/savedCats";

const indexBase = new URL("index.html", location.href).toString();

// HTML Elements
const parent1Div = document.getElementById("parent1");
const parent2Div = document.getElementById("parent2");
const parent1Canvas = document.getElementById(
  "parent1-canvas",
) as unknown as OffscreenCanvas;
const parent2Canvas = document.getElementById(
  "parent2-canvas",
) as unknown as OffscreenCanvas;
const parent1URLInput = document.getElementById(
  "parent1-url",
) as HTMLInputElement;
const parent2URLInput = document.getElementById(
  "parent2-url",
) as HTMLInputElement;
const regenerateButton = document.getElementById(
  "regenerate-button",
) as HTMLButtonElement;
const amountInput = document.getElementById("amount-input") as HTMLInputElement;
const varianceInput = document.getElementById(
  "variance-input",
) as HTMLInputElement;

varianceInput.addEventListener("input", () => {
  document.getElementById("variance-value")!.textContent = varianceInput.value;
});

// Global constants
const fanSubmittedParents = [
  "https://crazydrawsprojects.github.io/clangen-megamerge-pixel-cat-maker/?shading=true&reverse=true&isTortie=false&backgroundColour=rgb(0+0+0+%2F+0)&tortieMask=ONE&tortieColour=BLACK&tortiePattern=Classic&peltName=Speckled&spriteNumber=6&colour=BLACK&tint=pink&skinColour=PEACH&eyeColour=YELLOW&eyeColour2=&whitePatches=&points=&whitePatchesTint=&vitiligo=&accessory=HOLLY&scar=&version=v1",
  "https://crazydrawsprojects.github.io/clangen-megamerge-pixel-cat-maker/?shading=true&reverse=true&isTortie=false&backgroundColour=rgb(0+0+0+%2F+0)&tortieMask=HEARTBEAT&tortieColour=DARKGREY&tortiePattern=Tabby&peltName=Agouti&spriteNumber=7&colour=WHITE&tint=red&skinColour=BROWN&eyeColour=PALEYELLOW&eyeColour2=&whitePatches=&points=&whitePatchesTint=&vitiligo=&accessory=&scar=&version=v1",
  "https://crazydrawsprojects.github.io/clangen-megamerge-pixel-cat-maker/?shading=true&reverse=false&isTortie=false&backgroundColour=rgb(0+0+0+%2F+0)&tortieMask=HEARTBEAT&tortieColour=DARKGREY&tortiePattern=Tabby&peltName=Sokoke&spriteNumber=15&colour=GOLDEN-BROWN&tint=pink&skinColour=GREY&eyeColour=BRONZE&eyeColour2=&whitePatches=SAMMY&points=&whitePatchesTint=cream&vitiligo=&accessory=&scar=&version=v1",
  "https://crazydrawsprojects.github.io/clangen-megamerge-pixel-cat-maker/?shading=true&reverse=false&isTortie=false&backgroundColour=rgb(0+0+0+%2F+0)&tortieMask=HEARTBEAT&tortieColour=DARKGREY&tortiePattern=Tabby&peltName=Mackerel&spriteNumber=8&colour=LILAC&tint=red&skinColour=LIGHTMARBLED&eyeColour=PALEYELLOW&eyeColour2=&whitePatches=FRONT&points=&whitePatchesTint=cream&vitiligo=&accessory=&scar=&version=v1",
  "https://crazydrawsprojects.github.io/clangen-megamerge-pixel-cat-maker/?shading=false&reverse=true&isTortie=false&backgroundColour=rgb(0+0+0+%2F+0)&tortieMask=HEARTBEAT&tortieColour=DARKGREY&tortiePattern=Tabby&peltName=Bengal&spriteNumber=9&colour=GHOST&tint=black&skinColour=DARKBLUE&eyeColour=DARKBLUE&eyeColour2=&whitePatches=&points=&whitePatchesTint=&vitiligo=&accessory=&scar=&version=v1",
  "https://crazydrawsprojects.github.io/clangen-megamerge-pixel-cat-maker/?shading=false&reverse=true&isTortie=false&backgroundColour=rgb(0+0+0+%2F+0)&tortieMask=HEARTBEAT&tortieColour=DARKGREY&tortiePattern=Tabby&peltName=Ticked&spriteNumber=7&colour=CREAM&tint=red&skinColour=PEACH&eyeColour=YELLOW&eyeColour2=&whitePatches=MASKMANTLE&points=&whitePatchesTint=cream&vitiligo=&accessory=&scar=&version=v1",
  "https://crazydrawsprojects.github.io/clangen-megamerge-pixel-cat-maker/?shading=false&reverse=true&isTortie=true&backgroundColour=rgb(0+0+0+%2F+0)&tortieMask=HEARTBEAT&tortieColour=DARKGREY&tortiePattern=Tabby&peltName=Classic&spriteNumber=6&colour=DARKGINGER&tint=orange&skinColour=BROWN&eyeColour=COBALT&eyeColour2=&whitePatches=HALFWHITE&points=&whitePatchesTint=pink&vitiligo=&accessory=&scar=&version=v1",
];

// Global vars
var parent1Pelt: Pelt;
var parent2Pelt: Pelt;

// Helper functions
function refreshParent1(parent1URL: string) {
  const parent1Data = CatData.fromURL(parent1URL);
  parent1Pelt = parent1Data.getPelt();
  drawCat(parent1Canvas, parent1Pelt, parent1Data.spriteNumber);
}

function refreshParent2(parent2URL: string) {
  const parent2Data = CatData.fromURL(parent2URL);
  parent2Pelt = parent2Data.getPelt();
  drawCat(parent2Canvas, parent2Pelt, parent2Data.spriteNumber);
}

// Event listener functions
parent1URLInput.addEventListener("input", (e: any) => {
  refreshParent1(e.target.value);
});
parent1Div?.addEventListener("dragover", (ev) => {
  ev.preventDefault();
  ev.dataTransfer!.dropEffect = "copy";
});
parent1Div?.addEventListener("drop", (ev) => {
  ev.preventDefault();
  const data = ev.dataTransfer?.getData("text/plain")!;
  parent1URLInput.value = data;
  refreshParent1(data);
});

parent2URLInput.addEventListener("input", (e: any) => {
  refreshParent2(e.target.value);
});
parent2Div?.addEventListener("dragover", (ev) => {
  ev.preventDefault();
  ev.dataTransfer!.dropEffect = "copy";
});
parent2Div?.addEventListener("drop", (ev) => {
  ev.preventDefault();
  const data = ev.dataTransfer?.getData("text/plain")!;
  parent2URLInput.value = data;
  refreshParent2(data);
});

// saved cats from the cat maker can be picked as parents directly
const parentSelects = Array.from(
  document.querySelectorAll<HTMLSelectElement>(".parent-saved-select"),
);

// rebuild the saved-cat pickers from localStorage (kept fresh so cats saved
// in the maker show up without a reload)
function populateParentSelects() {
  const savedCats = loadSavedCats();
  for (const select of parentSelects) {
    select.classList.toggle("hidden", savedCats.length === 0);
    const current = select.value;
    while (select.options.length > 1) {
      select.remove(1);
    }
    savedCats.forEach((cat, i) => {
      const option = document.createElement("option");
      option.value = i.toString();
      option.textContent = cat.name;
      select.appendChild(option);
    });
    select.value = current;
  }
}

for (const select of parentSelects) {
  select.addEventListener("change", () => {
    const entry = loadSavedCats()[Number(select.value)];
    if (select.value === "" || !entry) {
      return;
    }
    const url = indexBase + entry.params;
    if (select.dataset.parent === "1") {
      parent1URLInput.value = url;
      refreshParent1(url);
    } else {
      parent2URLInput.value = url;
      refreshParent2(url);
    }
  });
}

populateParentSelects();
window.addEventListener("focus", populateParentSelects);

// swap the two parents
const swapButton = document.getElementById(
  "swap-parents-button",
) as HTMLButtonElement;
swapButton.addEventListener("click", () => {
  const first = parent1URLInput.value;
  parent1URLInput.value = parent2URLInput.value;
  parent2URLInput.value = first;
  if (parent1URLInput.value) {
    refreshParent1(parent1URLInput.value);
  }
  if (parent2URLInput.value) {
    refreshParent2(parent2URLInput.value);
  }
});

// ---- pick parents from saved cats (thumbnails) ----

const parentThumbs = document.querySelector(".parent-thumbs") as HTMLElement;

function drawThumb(canvas: HTMLCanvasElement, params: string) {
  try {
    const data = CatData.fromURL(indexBase + params);
    const offscreen = new OffscreenCanvas(50, 50);
    drawCat(offscreen, data.getPelt(), data.spriteNumber)
      .then(() => {
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, 50, 50);
        ctx.drawImage(offscreen, 0, 0);
      })
      .catch((err) => console.error(err));
  } catch (err) {
    console.error(err);
  }
}

function renderParentThumbs() {
  const saved = loadSavedCats();
  parentThumbs.innerHTML = "";
  if (saved.length === 0) {
    const empty = document.createElement("span");
    empty.className = "thumbs-empty";
    empty.textContent =
      "No saved cats yet. Save cats in the maker to pick them here.";
    parentThumbs.appendChild(empty);
    return;
  }
  for (const cat of saved) {
    const card = document.createElement("div");
    card.className = "parent-thumb";

    const canvas = document.createElement("canvas");
    canvas.width = 50;
    canvas.height = 50;
    canvas.className = "parent-thumb-canvas";
    card.appendChild(canvas);
    drawThumb(canvas, cat.params);

    const name = document.createElement("div");
    name.className = "parent-thumb-name";
    name.textContent = cat.name;
    card.appendChild(name);

    const row = document.createElement("div");
    row.className = "parent-thumb-buttons";
    const toP1 = document.createElement("button");
    toP1.type = "button";
    toP1.textContent = "→ P1";
    toP1.addEventListener("click", () => {
      const url = indexBase + cat.params;
      parent1URLInput.value = url;
      refreshParent1(url);
    });
    const toP2 = document.createElement("button");
    toP2.type = "button";
    toP2.textContent = "→ P2";
    toP2.addEventListener("click", () => {
      const url = indexBase + cat.params;
      parent2URLInput.value = url;
      refreshParent2(url);
    });
    row.append(toP1, toP2);
    card.appendChild(row);

    parentThumbs.appendChild(card);
  }
}

renderParentThumbs();
window.addEventListener("focus", renderParentThumbs);

// ---- litter generation (with pinning) ----

const offspringDiv = document.getElementById("offspring")!;
// kit params the user has pinned to survive the next re-roll
var pinnedParams: string[] = [];
// the litter currently on screen, used by the "send to family tree" button
var currentLitter: string[] = [];

// ---- hand-off of a litter into the family tree ----

const TREE_LITTER_KEY = "pcm-tree-litter";

function searchOf(url: string): string | null {
  try {
    return new URL(url).search;
  } catch {
    return null;
  }
}

// use the saved-cat name if this cat is in the gallery, else a fallback
function nameForParent(search: string, fallback: string): string {
  const match = loadSavedCats().find((c) => c.params === search);
  return match ? match.name : fallback;
}

// stash the parents + given kits for the family tree page to pick up, then go
// there. params are stored verbatim so the tree draws them identically.
function sendLitterToTree(kitParamsList: string[]) {
  const parents: { name: string; params: string }[] = [];
  const p1 = searchOf(parent1URLInput.value);
  const p2 = searchOf(parent2URLInput.value);
  if (p1) {
    parents.push({ name: nameForParent(p1, "Parent 1"), params: p1 });
  }
  if (p2) {
    parents.push({ name: nameForParent(p2, "Parent 2"), params: p2 });
  }
  const payload = {
    parents,
    kits: kitParamsList.map((params) => ({ params })),
  };
  localStorage.setItem(TREE_LITTER_KEY, JSON.stringify(payload));
  location.href = "family-tree.html";
}

const sendLitterButton = document.getElementById(
  "send-litter-tree-button",
) as HTMLButtonElement;
sendLitterButton.addEventListener("click", () => {
  if (currentLitter.length > 0) {
    sendLitterToTree(currentLitter);
  }
});

function clampedAmount(): number {
  var amount = Number(amountInput.value);
  const min = Number(amountInput.min);
  const max = Number(amountInput.max);
  if (isNaN(amount)) {
    amount = min;
  }
  amount = Math.min(max, Math.max(min, amount));
  amountInput.value = amount.toString();
  return amount;
}

function buildKitElement(
  params: string,
  index: number,
): { el: HTMLElement; done: Promise<unknown> } {
  const kit = document.createElement("div");
  kit.className = "kit";

  const link = document.createElement("a");
  link.href = indexBase + params;
  link.target = "_blank";
  link.className = "cat-link";
  link.draggable = true;
  link.addEventListener("dragstart", (ev) => {
    ev.dataTransfer?.setData("text/plain", link.href);
  });

  const can = document.createElement("canvas");
  can.width = 100;
  can.height = 100;
  can.style.imageRendering = "pixelated";
  link.append(can);
  kit.appendChild(link);

  const offscreen = new OffscreenCanvas(50, 50);
  const done = drawCat(
    offscreen,
    CatData.fromURL(indexBase + params).getPelt(),
    CatData.fromURL(indexBase + params).spriteNumber,
  )
    .then(() => {
      const ctx = can.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.scale(2, 2);
      ctx.drawImage(offscreen, 0, 0);
    })
    .catch((err) => console.error(err));

  const actions = document.createElement("div");
  actions.className = "kit-actions";

  const pinButton = document.createElement("button");
  pinButton.type = "button";
  pinButton.className = "kit-pin-button";
  const syncPin = () => {
    const pinned = pinnedParams.includes(params);
    pinButton.textContent = pinned ? "📌 Pinned" : "📍 Pin";
    pinButton.classList.toggle("pinned", pinned);
  };
  syncPin();
  pinButton.addEventListener("click", () => {
    if (pinnedParams.includes(params)) {
      pinnedParams = pinnedParams.filter((p) => p !== params);
    } else {
      pinnedParams.push(params);
    }
    syncPin();
  });
  actions.appendChild(pinButton);

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "kit-save-button";
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", () => {
    const name = prompt("Name this kit:", `Kit ${index + 1}`);
    if (name === null) {
      return;
    }
    addSavedCat(name || `Kit ${index + 1}`, params);
    saveButton.textContent = "Saved ✓";
    saveButton.disabled = true;
    populateParentSelects();
    renderParentThumbs();
  });
  actions.appendChild(saveButton);

  const treeButton = document.createElement("button");
  treeButton.type = "button";
  treeButton.className = "kit-tree-button";
  treeButton.textContent = "→ Tree";
  treeButton.title = "Add this kit and its parents to the family tree";
  treeButton.addEventListener("click", () => {
    sendLitterToTree([params]);
  });
  actions.appendChild(treeButton);

  kit.appendChild(actions);
  return { el: kit, done };
}

regenerateButton.addEventListener("click", async () => {
  const amount = clampedAmount();
  const variance = Number(varianceInput.value);
  const v = Number.isFinite(variance) ? variance : 50;

  // keep pinned kits (up to the requested amount), re-roll the rest
  const keep = pinnedParams.slice(0, amount);
  const fresh: string[] = [];
  for (let i = keep.length; i < amount; i++) {
    const kitData = CatData.fromPelt(
      generateChildPelt([parent1Pelt, parent2Pelt], v),
    );
    kitData.spriteNumber = [0, 1, 2][Math.floor(Math.random() * 3)];
    fresh.push(kitData.getURL(indexBase).search);
  }
  pinnedParams = keep;
  const all = [...keep, ...fresh];
  currentLitter = all;
  sendLitterButton.disabled = all.length === 0;

  offspringDiv.replaceChildren();
  const label = regenerateButton.textContent;
  regenerateButton.disabled = true;
  regenerateButton.textContent = "Generating…";

  const draws: Promise<unknown>[] = [];
  all.forEach((params, idx) => {
    const { el, done } = buildKitElement(params, idx);
    offspringDiv.appendChild(el);
    draws.push(done);
  });
  await Promise.allSettled(draws);

  regenerateButton.disabled = false;
  regenerateButton.textContent = label;
});

// Startup code
// parents picked via "Use as offspring parent" on the cat maker take
// priority (?parent1= / ?parent2= URL params override localStorage);
// otherwise fall back to a random fan-submitted parent
const pageParams = new URLSearchParams(location.search);

const parent1URL =
  pageParams.get("parent1") ??
  localStorage.getItem("pcm-parent-1") ??
  fanSubmittedParents.splice(
    Math.floor(Math.random() * fanSubmittedParents.length),
    1,
  )[0];
parent1URLInput.value = parent1URL;
refreshParent1(parent1URL);

const parent2URL =
  pageParams.get("parent2") ??
  localStorage.getItem("pcm-parent-2") ??
  fanSubmittedParents[Math.floor(Math.random() * fanSubmittedParents.length)];
parent2URLInput.value = parent2URL;
refreshParent2(parent2URL);

// ---- reverse lookup (ancestry analysis) ----

const rlUrlInput = document.getElementById("rl-url") as HTMLInputElement;
const rlSavedSelect = document.getElementById(
  "rl-saved-select",
) as HTMLSelectElement;
const rlCanvas = document.getElementById(
  "rl-canvas",
) as unknown as OffscreenCanvas;
const rlAnalyzeButton = document.getElementById(
  "rl-analyze-button",
) as HTMLButtonElement;
const rlResults = document.getElementById("rl-results") as HTMLElement;
const rlInputDiv = document.getElementById("rl-input") as HTMLElement;

var rlData: CatData | null = null;

function refreshRL(url: string) {
  try {
    rlData = CatData.fromURL(url);
    drawCat(rlCanvas, rlData.getPelt(), rlData.spriteNumber);
  } catch (err) {
    console.error(err);
  }
}

rlUrlInput.addEventListener("input", (e: any) => refreshRL(e.target.value));
rlInputDiv.addEventListener("dragover", (ev) => {
  ev.preventDefault();
  ev.dataTransfer!.dropEffect = "copy";
});
rlInputDiv.addEventListener("drop", (ev) => {
  ev.preventDefault();
  const data = ev.dataTransfer?.getData("text/plain")!;
  rlUrlInput.value = data;
  refreshRL(data);
});

function populateRLSelect() {
  const saved = loadSavedCats();
  const current = rlSavedSelect.value;
  while (rlSavedSelect.options.length > 1) {
    rlSavedSelect.remove(1);
  }
  saved.forEach((cat, i) => {
    const option = document.createElement("option");
    option.value = i.toString();
    option.textContent = cat.name;
    rlSavedSelect.appendChild(option);
  });
  rlSavedSelect.value = current;
}
populateRLSelect();
window.addEventListener("focus", populateRLSelect);

rlSavedSelect.addEventListener("change", () => {
  const entry = loadSavedCats()[Number(rlSavedSelect.value)];
  if (rlSavedSelect.value === "" || !entry) {
    return;
  }
  const url = indexBase + entry.params;
  rlUrlInput.value = url;
  refreshRL(url);
});

// draw a Pelt into a real (on-page) canvas, scaled to fill it
function drawPeltInto(canvas: HTMLCanvasElement, pelt: Pelt, pose: number) {
  const offscreen = new OffscreenCanvas(50, 50);
  drawCat(offscreen, pelt, pose)
    .then(() => {
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offscreen, 0, 0, 50, 50, 0, 0, canvas.width, canvas.height);
    })
    .catch((err) => console.error(err));
}

function renderExampleParents(childPelt: Pelt) {
  const wrap = document.createElement("div");
  wrap.className = "rl-examples";

  const heading = document.createElement("h3");
  heading.textContent = "Example parent pairs";
  wrap.appendChild(heading);

  const note = document.createElement("p");
  note.className = "section-note";
  note.textContent =
    "Illustrative only - these are pairs whose genetics could plausibly lead " +
    "to a cat like this. Load a pair as parents and predict to see for yourself.";
  wrap.appendChild(note);

  for (let i = 0; i < 3; i++) {
    const [a, b] = synthesizeParentPair(childPelt);
    const pair = document.createElement("div");
    pair.className = "rl-pair";

    for (const [pelt, slot] of [
      [a, 1],
      [b, 2],
    ] as [Pelt, number][]) {
      const cell = document.createElement("div");
      cell.className = "rl-parent";

      const canvas = document.createElement("canvas");
      canvas.width = 60;
      canvas.height = 60;
      canvas.style.imageRendering = "pixelated";
      cell.appendChild(canvas);
      drawPeltInto(canvas, pelt, 6);

      const desc = document.createElement("div");
      desc.className = "rl-parent-desc";
      desc.textContent = `${pelt.colour} ${pelt.name}`;
      cell.appendChild(desc);

      const load = document.createElement("button");
      load.type = "button";
      load.textContent = `Load as P${slot}`;
      const url = CatData.fromPelt(pelt).getURL(indexBase).toString();
      load.addEventListener("click", () => {
        if (slot === 1) {
          parent1URLInput.value = url;
          refreshParent1(url);
        } else {
          parent2URLInput.value = url;
          refreshParent2(url);
        }
      });
      cell.appendChild(load);

      pair.appendChild(cell);
    }
    wrap.appendChild(pair);
  }
  rlResults.appendChild(wrap);
}

function renderAncestry(childPelt: Pelt) {
  rlResults.innerHTML = "";

  const { rows } = analyzeAncestry(childPelt);
  const list = document.createElement("div");
  list.className = "rl-rows";
  for (const row of rows) {
    const rowEl = document.createElement("div");
    rowEl.className = "rl-row";

    const trait = document.createElement("div");
    trait.className = "rl-trait";
    trait.textContent = row.trait;
    rowEl.appendChild(trait);

    const body = document.createElement("div");
    body.className = "rl-body";

    const value = document.createElement("div");
    value.className = "rl-value";
    value.textContent = row.value;
    body.appendChild(value);

    if (row.sources.length > 0) {
      const sources = document.createElement("div");
      sources.className = "rl-sources";
      const lead = document.createElement("span");
      lead.className = "rl-sources-lead";
      lead.textContent = "likely from: ";
      sources.appendChild(lead);
      row.sources.forEach((s, i) => {
        const badge = document.createElement("span");
        badge.className = "rl-badge";
        // first source carries the most weight
        if (i === 0) {
          badge.classList.add("rl-badge-top");
        }
        badge.textContent = s;
        sources.appendChild(badge);
      });
      body.appendChild(sources);
    }

    if (row.note) {
      const note = document.createElement("div");
      note.className = "rl-note";
      note.textContent = row.note;
      body.appendChild(note);
    }

    rowEl.appendChild(body);
    list.appendChild(rowEl);
  }
  rlResults.appendChild(list);

  renderExampleParents(childPelt);
}

rlAnalyzeButton.addEventListener("click", () => {
  if (!rlData) {
    return;
  }
  renderAncestry(rlData.getPelt());
});
