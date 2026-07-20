import "./main.css";
import "./common.css";
import "./familyTree.css";
import { initThemeToggle } from "./library/theme";
import CatData from "./library/CatData";
import drawCat from "./library/drawCat";
import { generateChildPelt } from "./library/inheritance";
import { loadSavedCats, addSavedCat } from "./library/savedCats";

initThemeToggle();

type TreeCat = {
  id: string;
  name: string;
  params: string;
  parents: string[]; // ids of cats in the tree, max 2
};

const TREE_KEY = "pixel-cat-maker-family-tree";
const indexBase = new URL("index.html", location.href).toString();

function loadTree(): TreeCat[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(TREE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTree() {
  localStorage.setItem(TREE_KEY, JSON.stringify(tree));
}

function makeId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

var tree: TreeCat[] = loadTree();
var openPanelId: string | null = null;

// ---- toolbar ----

const savedSelect = document.querySelector(
  ".tree-saved-select",
) as HTMLSelectElement;
const urlInput = document.querySelector(
  ".tree-url-input",
) as HTMLInputElement;

// rebuild the saved-cat picker from localStorage (kept fresh so cats saved
// in the maker or predictor appear without a reload)
function populateSavedSelect() {
  const saved = loadSavedCats();
  const current = savedSelect.value;
  while (savedSelect.options.length > 1) {
    savedSelect.remove(1);
  }
  saved.forEach((cat, i) => {
    const option = document.createElement("option");
    option.value = i.toString();
    option.textContent = cat.name;
    savedSelect.appendChild(option);
  });
  savedSelect.value = current;
}

populateSavedSelect();
window.addEventListener("focus", populateSavedSelect);

function addCat(name: string, params: string) {
  tree.push({ id: makeId(), name, params, parents: [] });
  saveTree();
  renderTree();
}

document
  .querySelector(".tree-add-saved-button")!
  .addEventListener("click", () => {
    const entry = loadSavedCats()[Number(savedSelect.value)];
    if (savedSelect.value === "" || !entry) {
      return;
    }
    addCat(entry.name, entry.params);
  });

document
  .querySelector(".tree-add-url-button")!
  .addEventListener("click", () => {
    const raw = urlInput.value.trim();
    if (raw === "") {
      return;
    }
    let params: string;
    try {
      params = new URL(raw).search;
    } catch {
      alert("That doesn't look like a cat URL.");
      return;
    }
    if (!params.includes("version=")) {
      alert("That URL doesn't contain cat data.");
      return;
    }
    const name = prompt("Name this cat:", "Unnamed");
    if (name === null) {
      return;
    }
    addCat(name || "Unnamed", params);
    urlInput.value = "";
  });

// ---- export / import / clear ----

document
  .querySelector(".tree-export-button")!
  .addEventListener("click", () => {
    if (tree.length === 0) {
      alert("The tree is empty.");
      return;
    }
    const blob = new Blob([JSON.stringify(tree, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pixel-cat-family-tree.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

const importInput = document.querySelector(
  ".tree-import-input",
) as HTMLInputElement;
document
  .querySelector(".tree-import-button")!
  .addEventListener("click", () => importInput.click());

importInput.addEventListener("change", () => {
  const file = importInput.files?.[0];
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
        alert("That file doesn't look like a tree export.");
        return;
      }
      const incoming: TreeCat[] = parsed.filter(
        (c) =>
          c &&
          typeof c.id === "string" &&
          typeof c.name === "string" &&
          typeof c.params === "string" &&
          Array.isArray(c.parents),
      );
      if (incoming.length === 0) {
        alert("No valid cats found in that file.");
        return;
      }
      const replace =
        tree.length === 0 ||
        confirm(
          "Replace your current tree with the imported one?\n" +
            "(Cancel merges the two trees instead.)",
        );
      if (replace) {
        tree = incoming;
      } else {
        const known = new Set(tree.map((c) => c.id));
        for (const cat of incoming) {
          if (!known.has(cat.id)) {
            tree.push(cat);
          }
        }
      }
      saveTree();
      renderTree();
    })
    .finally(() => {
      importInput.value = "";
    });
});

document
  .querySelector(".tree-clear-button")!
  .addEventListener("click", () => {
    if (tree.length === 0) {
      return;
    }
    if (confirm("Delete the whole tree? This cannot be undone.")) {
      tree = [];
      saveTree();
      renderTree();
    }
  });

// ---- layout & rendering ----

const rowsDiv = document.querySelector(".tree-rows") as HTMLElement;
const linesSvg = document.querySelector(".tree-lines") as SVGSVGElement;
const emptyNote = document.querySelector(".tree-empty-note") as HTMLElement;
const viewport = document.querySelector(".tree-viewport") as HTMLElement;
const wrap = document.querySelector(".tree-canvas-wrap") as HTMLElement;
const zoomSlider = document.querySelector(
  ".tree-zoom-slider",
) as HTMLInputElement;
const zoomLabel = document.querySelector(".tree-zoom-label") as HTMLElement;

function catById(id: string) {
  return tree.find((c) => c.id === id);
}

// ---- viewport zoom & pan ----

const TREE_MIN_ZOOM = 0.3;
const TREE_MAX_ZOOM = 2;
var treeZoom = 1;
var treePanX = 0;
var treePanY = 0;

function applyTreeTransform() {
  wrap.style.transform = `translate(${treePanX}px, ${treePanY}px) scale(${treeZoom})`;
  zoomLabel.textContent = `${Math.round(treeZoom * 100)}%`;
  zoomSlider.value = treeZoom.toString();
}

// The SVG and rows share the wrap, so they scale/translate together — lines
// stay glued to nodes during zoom/pan with no redraw needed.
function zoomTreeAround(px: number, py: number, newZoom: number) {
  newZoom = Math.min(TREE_MAX_ZOOM, Math.max(TREE_MIN_ZOOM, newZoom));
  const cx = (px - treePanX) / treeZoom;
  const cy = (py - treePanY) / treeZoom;
  treePanX = px - cx * newZoom;
  treePanY = py - cy * newZoom;
  treeZoom = newZoom;
  applyTreeTransform();
}

zoomSlider.addEventListener("input", () => {
  const rect = viewport.getBoundingClientRect();
  zoomTreeAround(rect.width / 2, rect.height / 2, Number(zoomSlider.value));
});

document
  .querySelector(".tree-reset-view-button")!
  .addEventListener("click", () => {
    treeZoom = 1;
    treePanX = 0;
    treePanY = 0;
    applyTreeTransform();
  });

viewport.addEventListener(
  "wheel",
  (ev) => {
    ev.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const factor = ev.deltaY < 0 ? 1.1 : 1 / 1.1;
    zoomTreeAround(ev.clientX - rect.left, ev.clientY - rect.top, treeZoom * factor);
  },
  { passive: false },
);

var panning = false;
var panStartX = 0;
var panStartY = 0;
viewport.addEventListener("pointerdown", (ev) => {
  // let clicks on nodes/buttons work; only pan from empty space
  if ((ev.target as HTMLElement).closest(".tree-node")) {
    return;
  }
  panning = true;
  panStartX = ev.clientX;
  panStartY = ev.clientY;
  viewport.classList.add("panning");
  viewport.setPointerCapture(ev.pointerId);
});
viewport.addEventListener("pointermove", (ev) => {
  if (!panning) {
    return;
  }
  treePanX += ev.clientX - panStartX;
  treePanY += ev.clientY - panStartY;
  panStartX = ev.clientX;
  panStartY = ev.clientY;
  applyTreeTransform();
});
function endPan() {
  panning = false;
  viewport.classList.remove("panning");
}
viewport.addEventListener("pointerup", endPan);
viewport.addEventListener("pointercancel", endPan);

// ---- lineage highlight ----

function ancestorsOf(id: string, acc: Set<string>) {
  const cat = catById(id);
  for (const p of cat?.parents ?? []) {
    if (catById(p) && !acc.has(p)) {
      acc.add(p);
      ancestorsOf(p, acc);
    }
  }
}

function descendantsOf(id: string, acc: Set<string>) {
  for (const c of tree) {
    if (c.parents.includes(id) && !acc.has(c.id)) {
      acc.add(c.id);
      descendantsOf(c.id, acc);
    }
  }
}

function highlightLineage(id: string) {
  const set = new Set<string>([id]);
  ancestorsOf(id, set);
  descendantsOf(id, set);

  rowsDiv.classList.add("lineage-active");
  linesSvg.classList.add("lineage-active");
  for (const node of Array.from(rowsDiv.querySelectorAll(".tree-node"))) {
    const nid = (node as HTMLElement).dataset.id ?? "";
    node.classList.toggle("in-lineage", set.has(nid));
  }
  for (const line of Array.from(linesSvg.querySelectorAll("line"))) {
    const child = (line as SVGLineElement).dataset.child ?? "";
    const parent = (line as SVGLineElement).dataset.parent ?? "";
    line.classList.toggle("in-lineage", set.has(child) && set.has(parent));
  }
}

function clearLineage() {
  rowsDiv.classList.remove("lineage-active");
  linesSvg.classList.remove("lineage-active");
}

// generation = 1 + deepest parent generation; cycle-safe
function generations(): Map<string, number> {
  const memo = new Map<string, number>();
  function gen(id: string, visiting: Set<string>): number {
    if (memo.has(id)) {
      return memo.get(id)!;
    }
    if (visiting.has(id)) {
      return 0;
    }
    visiting.add(id);
    const cat = catById(id);
    const parents = (cat?.parents ?? []).filter((p) => catById(p));
    const value =
      parents.length === 0
        ? 0
        : 1 + Math.max(...parents.map((p) => gen(p, visiting)));
    visiting.delete(id);
    memo.set(id, value);
    return value;
  }
  for (const cat of tree) {
    gen(cat.id, new Set());
  }
  return memo;
}

function catURLFor(cat: TreeCat) {
  return `${indexBase}${cat.params}`;
}

async function drawCatDataCanvas(canvas: HTMLCanvasElement, data: CatData) {
  try {
    const offscreen = new OffscreenCanvas(50, 50);
    await drawCat(offscreen, data.getPelt(), data.spriteNumber);
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreen, 0, 0, 50, 50, 0, 0, canvas.width, canvas.height);
  } catch (err) {
    console.error(err);
  }
}

function drawNodeCanvas(canvas: HTMLCanvasElement, cat: TreeCat) {
  try {
    drawCatDataCanvas(canvas, CatData.fromURL(catURLFor(cat)));
  } catch (err) {
    console.error(err);
  }
}

// breed two tree cats and render pickable kits; each can be added straight
// into the tree as their child or saved to the gallery
function renderKits(container: HTMLElement, catA: TreeCat, catB: TreeCat) {
  container.innerHTML = "";
  let aPelt, bPelt;
  try {
    aPelt = CatData.fromURL(catURLFor(catA)).getPelt();
    bPelt = CatData.fromURL(catURLFor(catB)).getPelt();
  } catch (err) {
    console.error(err);
    return;
  }

  for (let i = 0; i < 4; i++) {
    const kitData = CatData.fromPelt(generateChildPelt([aPelt, bPelt], 50));
    kitData.spriteNumber = [0, 1, 2][Math.floor(Math.random() * 3)];
    const kitParams = kitData.getURL(indexBase).search;

    const kitEl = document.createElement("div");
    kitEl.className = "tree-kit";

    const canvas = document.createElement("canvas");
    canvas.width = 50;
    canvas.height = 50;
    kitEl.appendChild(canvas);
    drawCatDataCanvas(canvas, kitData);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "Add to tree";
    addButton.addEventListener("click", () => {
      const name = prompt("Name this kit:", "Unnamed");
      if (name === null) {
        return;
      }
      tree.push({
        id: makeId(),
        name: name || "Unnamed",
        params: kitParams,
        parents: [catA.id, catB.id],
      });
      saveTree();
      renderTree();
    });
    kitEl.appendChild(addButton);

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "Save to gallery";
    saveButton.addEventListener("click", () => {
      const name = prompt("Name this kit:", "Unnamed");
      if (name === null) {
        return;
      }
      addSavedCat(name || "Unnamed", kitParams);
      saveButton.textContent = "Saved ✓";
      saveButton.disabled = true;
      populateSavedSelect();
    });
    kitEl.appendChild(saveButton);

    container.appendChild(kitEl);
  }
}

function otherCatsSelect(current: TreeCat, selected: string | undefined) {
  const select = document.createElement("select");
  const none = document.createElement("option");
  none.value = "";
  none.textContent = "(none)";
  select.appendChild(none);
  for (const cat of tree) {
    if (cat.id === current.id) {
      continue;
    }
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    if (cat.id === selected) {
      option.selected = true;
    }
    select.appendChild(option);
  }
  return select;
}

function buildNode(cat: TreeCat): HTMLElement {
  const node = document.createElement("div");
  node.className = "tree-node";
  node.dataset.id = cat.id;
  node.addEventListener("mouseenter", () => highlightLineage(cat.id));
  node.addEventListener("mouseleave", clearLineage);

  const canvas = document.createElement("canvas");
  canvas.width = 50;
  canvas.height = 50;
  node.appendChild(canvas);
  drawNodeCanvas(canvas, cat);

  const nameDiv = document.createElement("div");
  nameDiv.className = "tree-node-name";
  nameDiv.textContent = cat.name;
  node.appendChild(nameDiv);

  const parentsDiv = document.createElement("div");
  parentsDiv.className = "tree-node-parents";
  const parentNames = cat.parents
    .map((p) => catById(p)?.name)
    .filter((n) => n !== undefined);
  parentsDiv.textContent =
    parentNames.length > 0 ? `parents: ${parentNames.join(" + ")}` : "founder";
  node.appendChild(parentsDiv);

  const buttons = document.createElement("div");
  buttons.className = "tree-node-buttons";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    openPanelId = openPanelId === cat.id ? null : cat.id;
    renderTree();
  });
  buttons.appendChild(editButton);

  const openLink = document.createElement("a");
  openLink.textContent = "Open";
  openLink.href = catURLFor(cat);
  openLink.target = "_blank";
  buttons.appendChild(openLink);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "✕";
  removeButton.title = "Remove from tree";
  removeButton.addEventListener("click", () => {
    if (!confirm(`Remove "${cat.name}" from the tree?`)) {
      return;
    }
    tree = tree.filter((c) => c.id !== cat.id);
    for (const c of tree) {
      c.parents = c.parents.filter((p) => p !== cat.id);
    }
    saveTree();
    renderTree();
  });
  buttons.appendChild(removeButton);

  node.appendChild(buttons);

  if (openPanelId === cat.id) {
    const panel = document.createElement("div");
    panel.className = "tree-node-panel";

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Name";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = cat.name;
    const rename = document.createElement("button");
    rename.type = "button";
    rename.textContent = "Rename";
    rename.addEventListener("click", () => {
      const value = nameInput.value.trim();
      if (value === "") {
        return;
      }
      cat.name = value;
      saveTree();
      populateSavedSelect();
      renderTree();
    });

    const p1Label = document.createElement("label");
    p1Label.textContent = "Parent 1";
    const p1 = otherCatsSelect(cat, cat.parents[0]);
    const p2Label = document.createElement("label");
    p2Label.textContent = "Parent 2";
    const p2 = otherCatsSelect(cat, cat.parents[1]);

    const apply = document.createElement("button");
    apply.type = "button";
    apply.textContent = "Save parents";
    apply.addEventListener("click", () => {
      cat.parents = [p1.value, p2.value].filter((v) => v !== "");
      openPanelId = null;
      saveTree();
      renderTree();
    });

    const predictLabel = document.createElement("label");
    predictLabel.textContent = "Breed with";
    const partner = otherCatsSelect(cat, undefined);

    const kitsDiv = document.createElement("div");
    kitsDiv.className = "tree-kits";

    const generate = document.createElement("button");
    generate.type = "button";
    generate.textContent = "Generate kits";
    generate.addEventListener("click", () => {
      const other = catById(partner.value);
      if (!other) {
        return;
      }
      renderKits(kitsDiv, cat, other);
    });

    const predict = document.createElement("button");
    predict.type = "button";
    predict.textContent = "Open in predictor";
    predict.addEventListener("click", () => {
      const other = catById(partner.value);
      if (!other) {
        return;
      }
      const p1URL = encodeURIComponent(catURLFor(cat));
      const p2URL = encodeURIComponent(catURLFor(other));
      window.open(
        `predict-offspring.html?parent1=${p1URL}&parent2=${p2URL}`,
        "_blank",
      );
    });

    panel.append(
      nameLabel,
      nameInput,
      rename,
      p1Label,
      p1,
      p2Label,
      p2,
      apply,
      predictLabel,
      partner,
      generate,
      predict,
      kitsDiv,
    );
    node.appendChild(panel);
  }

  return node;
}

// Order each generation so children sit near their parents (and parents near
// their children), which keeps the connecting lines short and reduces
// crossings. Barycenter heuristic with a few up/down sweeps.
function orderedRows(
  gens: Map<string, number>,
  maxGen: number,
): string[][] {
  const rows: string[][] = [];
  for (let g = 0; g <= maxGen; g++) {
    rows[g] = tree.filter((c) => gens.get(c.id) === g).map((c) => c.id);
  }

  const childrenOf = new Map<string, string[]>();
  for (const cat of tree) {
    for (const p of cat.parents) {
      if (catById(p)) {
        (childrenOf.get(p) ?? childrenOf.set(p, []).get(p)!).push(cat.id);
      }
    }
  }

  const sortByBary = (
    row: string[],
    neighbourPos: Map<string, number>,
    neighboursOf: (id: string) => string[],
  ) => {
    const current = new Map(row.map((id, i) => [id, i]));
    row.sort((a, b) => {
      const bary = (id: string) => {
        const ns = neighboursOf(id)
          .map((n) => neighbourPos.get(n))
          .filter((v): v is number => v !== undefined);
        return ns.length === 0
          ? current.get(id)!
          : ns.reduce((s, v) => s + v, 0) / ns.length;
      };
      return bary(a) - bary(b);
    });
  };

  for (let iter = 0; iter < 4; iter++) {
    for (let g = 1; g <= maxGen; g++) {
      const above = new Map(rows[g - 1].map((id, i) => [id, i]));
      sortByBary(rows[g], above, (id) =>
        (catById(id)?.parents ?? []).filter((p) => catById(p)),
      );
    }
    for (let g = maxGen - 1; g >= 0; g--) {
      const below = new Map(rows[g + 1].map((id, i) => [id, i]));
      sortByBary(rows[g], below, (id) => childrenOf.get(id) ?? []);
    }
  }
  return rows;
}

function renderTree() {
  emptyNote.classList.toggle("hidden", tree.length > 0);
  rowsDiv.innerHTML = "";

  const gens = generations();
  const maxGen = Math.max(0, ...gens.values());
  const rows = orderedRows(gens, maxGen);

  for (let g = 0; g <= maxGen; g++) {
    if (rows[g].length === 0) {
      continue;
    }
    const row = document.createElement("div");
    row.className = "tree-row";
    for (const id of rows[g]) {
      const cat = catById(id);
      if (cat) {
        row.appendChild(buildNode(cat));
      }
    }
    rowsDiv.appendChild(row);
  }

  requestAnimationFrame(drawLines);
}

function drawLines() {
  const wrapRect = wrap.getBoundingClientRect();
  // coordinates in the wrap's own (un-scaled) layout space, so the SVG scales
  // together with the nodes under the shared transform
  const z = treeZoom;
  linesSvg.setAttribute("width", wrap.scrollWidth.toString());
  linesSvg.setAttribute("height", wrap.scrollHeight.toString());
  linesSvg.innerHTML = "";

  for (const cat of tree) {
    const childEl = rowsDiv.querySelector(`[data-id="${cat.id}"]`);
    if (!childEl) {
      continue;
    }
    const childRect = childEl.getBoundingClientRect();
    for (const parentId of cat.parents) {
      const parentEl = rowsDiv.querySelector(`[data-id="${parentId}"]`);
      if (!parentEl) {
        continue;
      }
      const parentRect = parentEl.getBoundingClientRect();
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.dataset.child = cat.id;
      line.dataset.parent = parentId;
      line.setAttribute(
        "x1",
        ((parentRect.left + parentRect.width / 2 - wrapRect.left) / z).toString(),
      );
      line.setAttribute("y1", ((parentRect.bottom - wrapRect.top) / z).toString());
      line.setAttribute(
        "x2",
        ((childRect.left + childRect.width / 2 - wrapRect.left) / z).toString(),
      );
      line.setAttribute("y2", ((childRect.top - wrapRect.top) / z).toString());
      linesSvg.appendChild(line);
    }
  }
}

addEventListener("resize", () => drawLines());

renderTree();
