import "./main.css";
import "./common.css";
import "./familyTree.css";
import { initThemeToggle } from "./library/theme";
import CatData from "./library/CatData";
import drawCat from "./library/drawCat";

initThemeToggle();

type TreeCat = {
  id: string;
  name: string;
  params: string;
  parents: string[]; // ids of cats in the tree, max 2
};

const TREE_KEY = "pixel-cat-maker-family-tree";
const SAVED_CATS_KEY = "pixel-cat-maker-saved-cats";

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

function loadSavedCats(): { name: string; params: string }[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_CATS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

{
  const saved = loadSavedCats();
  saved.forEach((cat, i) => {
    const option = document.createElement("option");
    option.value = i.toString();
    option.textContent = cat.name;
    savedSelect.appendChild(option);
  });
}

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

function catById(id: string) {
  return tree.find((c) => c.id === id);
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
  return `${new URL("index.html", location.href).toString()}${cat.params}`;
}

async function drawNodeCanvas(canvas: HTMLCanvasElement, cat: TreeCat) {
  try {
    const data = CatData.fromURL(catURLFor(cat));
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
    predictLabel.textContent = "Predict offspring with";
    const partner = otherCatsSelect(cat, undefined);
    const predict = document.createElement("button");
    predict.type = "button";
    predict.textContent = "Open predictor";
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
      p1Label,
      p1,
      p2Label,
      p2,
      apply,
      predictLabel,
      partner,
      predict,
    );
    node.appendChild(panel);
  }

  return node;
}

function renderTree() {
  emptyNote.classList.toggle("hidden", tree.length > 0);
  rowsDiv.innerHTML = "";

  const gens = generations();
  const maxGen = Math.max(0, ...gens.values());

  for (let g = 0; g <= maxGen; g++) {
    const row = document.createElement("div");
    row.className = "tree-row";
    for (const cat of tree) {
      if (gens.get(cat.id) === g) {
        row.appendChild(buildNode(cat));
      }
    }
    if (row.children.length > 0) {
      rowsDiv.appendChild(row);
    }
  }

  requestAnimationFrame(drawLines);
}

function drawLines() {
  const wrap = document.querySelector(".tree-canvas-wrap") as HTMLElement;
  const wrapRect = wrap.getBoundingClientRect();
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
      line.setAttribute(
        "x1",
        (parentRect.left + parentRect.width / 2 - wrapRect.left).toString(),
      );
      line.setAttribute("y1", (parentRect.bottom - wrapRect.top).toString());
      line.setAttribute(
        "x2",
        (childRect.left + childRect.width / 2 - wrapRect.left).toString(),
      );
      line.setAttribute("y2", (childRect.top - wrapRect.top).toString());
      linesSvg.appendChild(line);
    }
  }
}

addEventListener("resize", () => drawLines());

renderTree();
