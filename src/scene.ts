import "./main.css";
import "./common.css";
import "./scene.css";

import { initThemeToggle } from "./library/theme";
import CatData from "./library/CatData";
import drawCat from "./library/drawCat";
import { loadSavedCats } from "./library/savedCats";
import {
  addCustomAsset,
  listCustomAssets,
  getCustomAsset,
  deleteCustomAsset,
  CustomAsset,
} from "./library/customAssets";
import communityAssetsRaw from "./assets/communityAssets.json";

initThemeToggle();

// ---- types ----

type CommunityAsset = {
  file: string;
  type: "background" | "sticker";
  name: string;
  author?: string;
  credit?: string;
  license?: string;
};

const COMMUNITY = communityAssetsRaw as CommunityAsset[];

type Preset = { w: number; h: number };
const PRESETS: Record<string, Preset> = {
  landscape: { w: 640, h: 360 },
  square: { w: 512, h: 512 },
  portrait: { w: 360, h: 640 },
};

// an asset is either a built-in community file (by URL) or a user upload/drawing
// stored in IndexedDB (by id)
type AssetRef =
  | { source: "community"; url: string }
  | { source: "custom"; id: string };

type BaseLayer = {
  id: string;
  x: number; // centre, in canvas coords
  y: number;
  scale: number;
  flip: boolean;
  rotation: number; // degrees, clockwise
};
type CatLayer = BaseLayer & { kind: "cat"; params: string };
type StickerLayer = BaseLayer & { kind: "sticker"; ref: AssetRef };
type Layer = CatLayer | StickerLayer;

// fit sets the baseline size (cover/contain); scale and offset let the user
// zoom and pan to frame the background, cropped to the canvas
type Background = {
  ref: AssetRef | null;
  fit: "cover" | "contain";
  scale: number;
  offsetX: number;
  offsetY: number;
};

// layers are drawn in array order, so the last entry sits on top

// ---- state ----

let presetKey = "landscape";
let canvasW = PRESETS[presetKey].w;
let canvasH = PRESETS[presetKey].h;
let background: Background = {
  ref: null,
  fit: "cover",
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};
let layers: Layer[] = [];
let selectedId: string | null = null;

const SCENES_KEY = "pixel-cat-maker-scenes";
// cat params are stored as a bare "?..." search; CatData.fromURL needs a full URL
const indexBase = new URL("index.html", location.href).toString();

// ---- element refs ----

function el<T extends Element>(cls: string): T {
  return document.getElementsByClassName(cls)[0] as unknown as T;
}

const canvas = el<HTMLCanvasElement>("scene-canvas");
const overlay = el<HTMLCanvasElement>("scene-overlay");
const stage = el<HTMLElement>("scene-stage");
const ctx = canvas.getContext("2d")!;
const octx = overlay.getContext("2d")!;

const presetSelect = el<HTMLSelectElement>("scene-preset-select");
const exportScaleSelect = el<HTMLSelectElement>("scene-export-scale");
const bgFitSelect = el<HTMLSelectElement>("scene-bg-fit-select");
const bgZoomSlider = el<HTMLInputElement>("scene-bg-zoom");
const catSelect = el<HTMLSelectElement>("scene-cat-select");
const catUrlInput = el<HTMLInputElement>("scene-cat-url");
const loadSelect = el<HTMLSelectElement>("scene-load-select");

const objToolbar = el<HTMLElement>("scene-obj-toolbar");

// ---- image / cat caches ----

// rendered cats, keyed by their param string
const catCache = new Map<string, OffscreenCanvas>();
const catPending = new Set<string>();

// loaded sticker/background images, keyed by ref
const imgCache = new Map<string, HTMLImageElement>();
const imgPending = new Set<string>();
// object URLs we made for custom assets, revoked on unload
const objectUrls: string[] = [];

function refKey(ref: AssetRef): string {
  return ref.source === "community" ? `c:${ref.url}` : `u:${ref.id}`;
}

function catCanvasFor(params: string): OffscreenCanvas | null {
  const cached = catCache.get(params);
  if (cached) {
    return cached;
  }
  if (!catPending.has(params)) {
    catPending.add(params);
    try {
      const data = CatData.fromURL(indexBase + params);
      const off = new OffscreenCanvas(50, 50);
      drawCat(off, data.getPelt(), data.spriteNumber)
        .then(() => {
          catCache.set(params, off);
          catPending.delete(params);
          renderScene();
        })
        .catch((err) => {
          console.error(err);
          catPending.delete(params);
        });
    } catch (err) {
      console.error(err);
      catPending.delete(params);
    }
  }
  return null;
}

function imageFor(ref: AssetRef): HTMLImageElement | null {
  const key = refKey(ref);
  const cached = imgCache.get(key);
  if (cached) {
    return cached;
  }
  if (!imgPending.has(key)) {
    imgPending.add(key);
    loadImage(ref)
      .then((img) => {
        imgCache.set(key, img);
        imgPending.delete(key);
        renderScene();
      })
      .catch((err) => {
        console.error(err);
        imgPending.delete(key);
      });
  }
  return null;
}

async function loadImage(ref: AssetRef): Promise<HTMLImageElement> {
  let src: string;
  if (ref.source === "community") {
    src = ref.url;
  } else {
    const asset = await getCustomAsset(ref.id);
    if (!asset) {
      throw new Error(`custom asset ${ref.id} not found`);
    }
    src = URL.createObjectURL(asset.blob);
    objectUrls.push(src);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

window.addEventListener("beforeunload", () => {
  for (const url of objectUrls) {
    URL.revokeObjectURL(url);
  }
});

// ---- geometry helpers ----

function naturalSize(layer: Layer): { w: number; h: number } {
  if (layer.kind === "cat") {
    return { w: 50, h: 50 };
  }
  const img = imageFor(layer.ref);
  if (img) {
    return { w: img.naturalWidth || img.width, h: img.naturalHeight || img.height };
  }
  return { w: 50, h: 50 };
}

// rotate+translate a point that is already scaled, into canvas coords
function place(layer: Layer, px: number, py: number): { x: number; y: number } {
  const r = (layer.rotation * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return {
    x: layer.x + px * cos - py * sin,
    y: layer.y + px * sin + py * cos,
  };
}

function halfExtents(layer: Layer): { hw: number; hh: number } {
  const n = naturalSize(layer);
  return { hw: (n.w * layer.scale) / 2, hh: (n.h * layer.scale) / 2 };
}

// is a canvas-space point inside the layer's (possibly rotated) box?
function hitLayer(layer: Layer, px: number, py: number): boolean {
  const dx = px - layer.x;
  const dy = py - layer.y;
  const r = (-layer.rotation * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  const lx = dx * cos - dy * sin;
  const ly = dx * sin + dy * cos;
  const n = naturalSize(layer);
  return (
    Math.abs(lx) <= (n.w * layer.scale) / 2 &&
    Math.abs(ly) <= (n.h * layer.scale) / 2
  );
}

function makeId(): string {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function getSelected(): Layer | undefined {
  return layers.find((l) => l.id === selectedId);
}

// ---- rendering ----

function drawLayer(context: CanvasRenderingContext2D, layer: Layer) {
  const n = naturalSize(layer);
  let content: CanvasImageSource | null = null;
  if (layer.kind === "cat") {
    content = catCanvasFor(layer.params);
  } else {
    content = imageFor(layer.ref);
  }
  if (!content) {
    return;
  }
  context.save();
  context.translate(layer.x, layer.y);
  context.rotate((layer.rotation * Math.PI) / 180);
  context.scale((layer.flip ? -1 : 1) * layer.scale, layer.scale);
  context.imageSmoothingEnabled = false;
  context.drawImage(content, -n.w / 2, -n.h / 2, n.w, n.h);
  context.restore();
}

// baseline scale that makes the image cover or fit the canvas
function bgFitScale(iw: number, ih: number): number {
  return background.fit === "cover"
    ? Math.max(canvasW / iw, canvasH / ih)
    : Math.min(canvasW / iw, canvasH / ih);
}

function drawBackground(context: CanvasRenderingContext2D) {
  if (!background.ref) {
    return;
  }
  const img = imageFor(background.ref);
  if (!img) {
    return;
  }
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = bgFitScale(iw, ih) * background.scale;
  const w = iw * scale;
  const h = ih * scale;
  context.imageSmoothingEnabled = false;
  context.drawImage(
    img,
    (canvasW - w) / 2 + background.offsetX,
    (canvasH - h) / 2 + background.offsetY,
    w,
    h,
  );
}

function renderScene() {
  ctx.clearRect(0, 0, canvasW, canvasH);
  drawBackground(ctx);
  for (const layer of layers) {
    drawLayer(ctx, layer);
  }
  drawHandles();
}

// display-to-canvas scale factor (canvas is drawn at logical size, shown scaled)
function displayRatio(): number {
  const rect = overlay.getBoundingClientRect();
  return rect.width > 0 ? canvasW / rect.width : 1;
}

function corners(layer: Layer) {
  const { hw, hh } = halfExtents(layer);
  return {
    tl: place(layer, -hw, -hh),
    tr: place(layer, hw, -hh),
    br: place(layer, hw, hh),
    bl: place(layer, -hw, hh),
    topMid: place(layer, 0, -hh),
  };
}

function rotateHandlePos(layer: Layer) {
  const { hh } = halfExtents(layer);
  return place(layer, 0, -hh - 22 * displayRatio());
}

function drawHandles() {
  octx.clearRect(0, 0, overlay.width, overlay.height);
  const layer = getSelected();
  if (!layer) {
    return;
  }
  const c = corners(layer);
  const rot = rotateHandlePos(layer);
  const ratio = displayRatio();
  const accent =
    getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
    "#c8963c";

  octx.strokeStyle = accent;
  octx.lineWidth = 1.5 * ratio;

  // bounding box
  octx.beginPath();
  octx.moveTo(c.tl.x, c.tl.y);
  octx.lineTo(c.tr.x, c.tr.y);
  octx.lineTo(c.br.x, c.br.y);
  octx.lineTo(c.bl.x, c.bl.y);
  octx.closePath();
  octx.stroke();

  // rotate stem + knob
  octx.beginPath();
  octx.moveTo(c.topMid.x, c.topMid.y);
  octx.lineTo(rot.x, rot.y);
  octx.stroke();

  const knob = 6 * ratio;
  octx.fillStyle = accent;
  octx.beginPath();
  octx.arc(rot.x, rot.y, knob, 0, Math.PI * 2);
  octx.fill();

  // resize handle (bottom-right)
  const hs = 6 * ratio;
  octx.fillRect(c.br.x - hs, c.br.y - hs, hs * 2, hs * 2);
}

// ---- pointer interaction ----

type DragMode = "move" | "resize" | "rotate" | "bg" | null;
let dragMode: DragMode = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragStartScale = 1;
let dragStartDist = 1;

function pointerCanvas(ev: PointerEvent): { x: number; y: number } {
  const rect = overlay.getBoundingClientRect();
  const ratio = canvasW / rect.width;
  return {
    x: (ev.clientX - rect.left) * ratio,
    y: (ev.clientY - rect.top) * ratio,
  };
}

function near(ax: number, ay: number, bx: number, by: number, r: number) {
  return Math.hypot(ax - bx, ay - by) <= r;
}

overlay.addEventListener("pointerdown", (ev) => {
  const { x, y } = pointerCanvas(ev);
  const ratio = displayRatio();
  const grab = 12 * ratio;
  const selected = getSelected();

  // handles of the current selection take priority
  if (selected) {
    const rot = rotateHandlePos(selected);
    if (near(x, y, rot.x, rot.y, grab)) {
      dragMode = "rotate";
      overlay.setPointerCapture(ev.pointerId);
      return;
    }
    const c = corners(selected);
    if (near(x, y, c.br.x, c.br.y, grab)) {
      dragMode = "resize";
      dragStartScale = selected.scale;
      dragStartDist = Math.max(1, Math.hypot(x - selected.x, y - selected.y));
      overlay.setPointerCapture(ev.pointerId);
      return;
    }
  }

  // otherwise select the topmost layer under the pointer
  for (let i = layers.length - 1; i >= 0; i--) {
    if (hitLayer(layers[i], x, y)) {
      selectedId = layers[i].id;
      dragMode = "move";
      dragOffsetX = x - layers[i].x;
      dragOffsetY = y - layers[i].y;
      overlay.setPointerCapture(ev.pointerId);
      syncObjToolbar();
      renderScene();
      return;
    }
  }

  // empty space clears the selection; if a background is set, drag pans it
  selectedId = null;
  syncObjToolbar();
  if (background.ref) {
    dragMode = "bg";
    dragOffsetX = x - background.offsetX;
    dragOffsetY = y - background.offsetY;
    overlay.setPointerCapture(ev.pointerId);
  } else {
    dragMode = null;
  }
  renderScene();
});

overlay.addEventListener("pointermove", (ev) => {
  if (!dragMode) {
    return;
  }
  const { x, y } = pointerCanvas(ev);
  if (dragMode === "bg") {
    background.offsetX = x - dragOffsetX;
    background.offsetY = y - dragOffsetY;
    renderScene();
    return;
  }
  const layer = getSelected();
  if (!layer) {
    return;
  }
  if (dragMode === "move") {
    layer.x = x - dragOffsetX;
    layer.y = y - dragOffsetY;
  } else if (dragMode === "resize") {
    const dist = Math.hypot(x - layer.x, y - layer.y);
    layer.scale = Math.min(20, Math.max(0.1, dragStartScale * (dist / dragStartDist)));
  } else if (dragMode === "rotate") {
    let deg = (Math.atan2(y - layer.y, x - layer.x) * 180) / Math.PI + 90;
    if (ev.shiftKey) {
      deg = Math.round(deg / 15) * 15;
    }
    layer.rotation = deg;
  }
  renderScene();
});

function endDrag(ev: PointerEvent) {
  if (dragMode) {
    dragMode = null;
    if (overlay.hasPointerCapture(ev.pointerId)) {
      overlay.releasePointerCapture(ev.pointerId);
    }
  }
}
overlay.addEventListener("pointerup", endDrag);
overlay.addEventListener("pointercancel", endDrag);

document.addEventListener("keydown", (ev) => {
  const target = ev.target as HTMLElement;
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
    return;
  }
  const layer = getSelected();
  if (!layer) {
    return;
  }
  if (ev.key === "Delete" || ev.key === "Backspace") {
    ev.preventDefault();
    deleteSelected();
  } else if (ev.key.startsWith("Arrow")) {
    ev.preventDefault();
    const step = ev.shiftKey ? 10 : 1;
    if (ev.key === "ArrowLeft") layer.x -= step;
    if (ev.key === "ArrowRight") layer.x += step;
    if (ev.key === "ArrowUp") layer.y -= step;
    if (ev.key === "ArrowDown") layer.y += step;
    renderScene();
  }
});

// ---- object toolbar actions ----

function syncObjToolbar() {
  objToolbar.classList.toggle("hidden", getSelected() === undefined);
}

function deleteSelected() {
  if (!selectedId) {
    return;
  }
  layers = layers.filter((l) => l.id !== selectedId);
  selectedId = null;
  syncObjToolbar();
  renderScene();
}

function moveInArray(delta: number) {
  const i = layers.findIndex((l) => l.id === selectedId);
  if (i === -1) {
    return;
  }
  const j = i + delta;
  if (j < 0 || j >= layers.length) {
    return;
  }
  [layers[i], layers[j]] = [layers[j], layers[i]];
  renderScene();
}

el<HTMLButtonElement>("scene-obj-flip").addEventListener("click", () => {
  const layer = getSelected();
  if (layer) {
    layer.flip = !layer.flip;
    renderScene();
  }
});
el<HTMLButtonElement>("scene-obj-rotate-left").addEventListener("click", () => {
  const layer = getSelected();
  if (layer) {
    layer.rotation -= 15;
    renderScene();
  }
});
el<HTMLButtonElement>("scene-obj-rotate-right").addEventListener("click", () => {
  const layer = getSelected();
  if (layer) {
    layer.rotation += 15;
    renderScene();
  }
});
el<HTMLButtonElement>("scene-obj-forward").addEventListener("click", () =>
  moveInArray(1),
);
el<HTMLButtonElement>("scene-obj-back").addEventListener("click", () =>
  moveInArray(-1),
);
el<HTMLButtonElement>("scene-obj-duplicate").addEventListener("click", () => {
  const layer = getSelected();
  if (!layer) {
    return;
  }
  const copy: Layer = { ...layer, id: makeId(), x: layer.x + 16, y: layer.y + 16 };
  layers.push(copy);
  selectedId = copy.id;
  renderScene();
});
el<HTMLButtonElement>("scene-obj-delete").addEventListener("click", deleteSelected);

// ---- canvas size / presets ----

// cap how wide each preset's stage can display, so the pixel art scales up
// nicely without over-upscaling or getting too tall
const STAGE_MAX_WIDTH: Record<string, string> = {
  landscape: "1100px",
  square: "620px",
  portrait: "440px",
};

function applyPreset(key: string) {
  presetKey = key in PRESETS ? key : "landscape";
  canvasW = PRESETS[presetKey].w;
  canvasH = PRESETS[presetKey].h;
  canvas.width = canvasW;
  canvas.height = canvasH;
  overlay.width = canvasW;
  overlay.height = canvasH;
  stage.style.maxWidth = STAGE_MAX_WIDTH[presetKey];
  renderScene();
}

presetSelect.addEventListener("change", () => applyPreset(presetSelect.value));
bgFitSelect.addEventListener("change", () => {
  background.fit = bgFitSelect.value as "cover" | "contain";
  renderScene();
});

// ---- adding cats ----

function addCat(params: string) {
  layers.push({
    kind: "cat",
    id: makeId(),
    params,
    x: canvasW / 2 + (Math.random() * 40 - 20),
    y: canvasH / 2 + (Math.random() * 40 - 20),
    scale: 2,
    flip: false,
    rotation: 0,
  });
  selectedId = layers[layers.length - 1].id;
  syncObjToolbar();
  renderScene();
}

el<HTMLButtonElement>("scene-add-cat-button").addEventListener("click", () => {
  const entry = loadSavedCats()[Number(catSelect.value)];
  if (catSelect.value === "" || !entry) {
    return;
  }
  // saved cats already store a "?..." search string
  addCat(entry.params);
});

el<HTMLButtonElement>("scene-add-cat-url-button").addEventListener("click", () => {
  const raw = catUrlInput.value.trim();
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
  addCat(params);
  catUrlInput.value = "";
});

function populateCatSelect() {
  const saved = loadSavedCats();
  const current = catSelect.value;
  while (catSelect.options.length > 1) {
    catSelect.remove(1);
  }
  saved.forEach((cat, i) => {
    const option = document.createElement("option");
    option.value = i.toString();
    option.textContent = cat.name;
    catSelect.appendChild(option);
  });
  catSelect.value = current;
}
populateCatSelect();
window.addEventListener("focus", populateCatSelect);

// ---- adding stickers / setting background ----

async function addStickerLayer(ref: AssetRef) {
  const img = await loadImage(ref).catch((err) => {
    console.error(err);
    return null;
  });
  if (!img) {
    return;
  }
  imgCache.set(refKey(ref), img);
  const natW = img.naturalWidth || img.width;
  const natH = img.naturalHeight || img.height;
  const maxNat = Math.max(natW, natH);
  const target = Math.min(maxNat, Math.round(canvasW * 0.35));
  layers.push({
    kind: "sticker",
    id: makeId(),
    ref,
    x: canvasW / 2 + (Math.random() * 40 - 20),
    y: canvasH / 2 + (Math.random() * 40 - 20),
    scale: target / maxNat,
    flip: false,
    rotation: 0,
  });
  selectedId = layers[layers.length - 1].id;
  syncObjToolbar();
  renderScene();
}

function resetBgFraming() {
  background.scale = 1;
  background.offsetX = 0;
  background.offsetY = 0;
  bgZoomSlider.value = "1";
}

function setBackground(ref: AssetRef | null) {
  background.ref = ref;
  // start each new background fitted and centred
  resetBgFraming();
  renderScene();
}

el<HTMLButtonElement>("scene-bg-none-button").addEventListener("click", () =>
  setBackground(null),
);

bgZoomSlider.addEventListener("input", () => {
  background.scale = Number(bgZoomSlider.value) || 1;
  renderScene();
});

el<HTMLButtonElement>("scene-bg-reset-button").addEventListener("click", () => {
  resetBgFraming();
  renderScene();
});

// scroll to zoom the background (around the cursor) when nothing is selected
overlay.addEventListener(
  "wheel",
  (ev) => {
    if (selectedId || !background.ref) {
      return;
    }
    const img = imageFor(background.ref);
    if (!img) {
      return;
    }
    ev.preventDefault();
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const rect = overlay.getBoundingClientRect();
    const ratio = canvasW / rect.width;
    const px = (ev.clientX - rect.left) * ratio;
    const py = (ev.clientY - rect.top) * ratio;

    const fit = bgFitScale(iw, ih);
    const sOld = fit * background.scale;
    const factor = ev.deltaY < 0 ? 1.1 : 1 / 1.1;
    const newScale = Math.min(6, Math.max(0.25, background.scale * factor));
    const sNew = fit * newScale;

    const cx = canvasW / 2;
    const cy = canvasH / 2;
    // image pixel currently under the cursor, kept fixed as we rescale
    const imgX = (px - cx + (iw * sOld) / 2 - background.offsetX) / sOld;
    const imgY = (py - cy + (ih * sOld) / 2 - background.offsetY) / sOld;
    background.offsetX = px - cx + (iw * sNew) / 2 - imgX * sNew;
    background.offsetY = py - cy + (ih * sNew) / 2 - imgY * sNew;
    background.scale = newScale;
    bgZoomSlider.value = String(newScale);
    renderScene();
  },
  { passive: false },
);

// ---- asset trays ----

function communityUrl(a: CommunityAsset): string {
  return `${import.meta.env.BASE_URL}community/${a.type}s/${a.file}`;
}

function makeAssetTile(
  name: string,
  thumbSrc: string,
  onClick: () => void,
  onDelete?: () => void,
): HTMLElement {
  const tile = document.createElement("button");
  tile.type = "button";
  tile.className = "scene-asset";
  tile.title = name;

  const img = document.createElement("img");
  img.src = thumbSrc;
  img.alt = name;
  tile.appendChild(img);

  const label = document.createElement("span");
  label.className = "scene-asset-name";
  label.textContent = name;
  tile.appendChild(label);

  tile.addEventListener("click", onClick);

  if (onDelete) {
    const del = document.createElement("button");
    del.type = "button";
    del.className = "scene-asset-delete";
    del.textContent = "✕";
    del.title = "Delete this upload";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      onDelete();
    });
    tile.appendChild(del);
  }
  return tile;
}

function emptyTray(container: HTMLElement, text: string) {
  const span = document.createElement("span");
  span.className = "scene-tray-empty";
  span.textContent = text;
  container.appendChild(span);
}

function renderCommunityTrays() {
  const bgTray = el<HTMLElement>("scene-community-backgrounds");
  const stickerTray = el<HTMLElement>("scene-community-stickers");
  bgTray.innerHTML = "";
  stickerTray.innerHTML = "";

  const bgs = COMMUNITY.filter((a) => a.type === "background");
  const stickers = COMMUNITY.filter((a) => a.type === "sticker");

  if (bgs.length === 0) {
    emptyTray(bgTray, "None yet - submit one!");
  } else {
    for (const a of bgs) {
      const url = communityUrl(a);
      bgTray.appendChild(
        makeAssetTile(a.name, url, () =>
          setBackground({ source: "community", url }),
        ),
      );
    }
  }

  if (stickers.length === 0) {
    emptyTray(stickerTray, "None yet - submit one!");
  } else {
    for (const a of stickers) {
      const url = communityUrl(a);
      stickerTray.appendChild(
        makeAssetTile(a.name, url, () =>
          addStickerLayer({ source: "community", url }),
        ),
      );
    }
  }
}

async function renderCustomTrays() {
  const bgTray = el<HTMLElement>("scene-custom-backgrounds");
  const stickerTray = el<HTMLElement>("scene-custom-stickers");
  bgTray.innerHTML = "";
  stickerTray.innerHTML = "";

  const assets = await listCustomAssets();
  const bgs = assets.filter((a) => a.type === "background");
  const stickers = assets.filter((a) => a.type === "sticker");

  if (bgs.length === 0) {
    emptyTray(bgTray, "No uploads yet.");
  }
  if (stickers.length === 0) {
    emptyTray(stickerTray, "Draw or upload one.");
  }

  const tile = (asset: CustomAsset, tray: HTMLElement, use: () => void) => {
    const url = URL.createObjectURL(asset.blob);
    objectUrls.push(url);
    tray.appendChild(
      makeAssetTile(asset.name, url, use, async () => {
        if (!confirm(`Delete "${asset.name}"?`)) {
          return;
        }
        await deleteCustomAsset(asset.id);
        renderCustomTrays();
      }),
    );
  };

  for (const a of bgs) {
    tile(a, bgTray, () => setBackground({ source: "custom", id: a.id }));
  }
  for (const a of stickers) {
    tile(a, stickerTray, () => addStickerLayer({ source: "custom", id: a.id }));
  }
}

renderCommunityTrays();
renderCustomTrays();

// ---- uploads ----

function wireUpload(inputClass: string, type: "background" | "sticker") {
  const input = el<HTMLInputElement>(inputClass);
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    input.value = "";
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    const name = prompt("Name this " + type + ":", file.name.replace(/\.[^.]+$/, ""));
    if (name === null) {
      return;
    }
    await addCustomAsset(type, name || file.name, file);
    renderCustomTrays();
  });
}
wireUpload("scene-bg-upload", "background");
wireUpload("scene-sticker-upload", "sticker");

// ---- export ----

function drawSceneTo(context: CanvasRenderingContext2D, scale: number) {
  context.save();
  context.scale(scale, scale);
  drawBackground(context);
  for (const layer of layers) {
    drawLayer(context, layer);
  }
  context.restore();
}

el<HTMLButtonElement>("scene-export-button").addEventListener("click", async () => {
  const scale = Number(exportScaleSelect.value) || 1;
  const out = new OffscreenCanvas(canvasW * scale, canvasH * scale);
  const octx2 = out.getContext("2d")!;
  octx2.imageSmoothingEnabled = false;
  drawSceneTo(octx2 as unknown as CanvasRenderingContext2D, scale);
  const blob = await out.convertToBlob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pixel-cat-scene.png";
  a.click();
  URL.revokeObjectURL(a.href);
});

// ---- save / load scenes (localStorage) ----

type SavedScene = {
  name: string;
  preset: string;
  background: Background;
  layers: Layer[];
};

function loadScenes(): SavedScene[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SCENES_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveScenes(scenes: SavedScene[]) {
  localStorage.setItem(SCENES_KEY, JSON.stringify(scenes));
  populateSceneSelect();
}

function populateSceneSelect() {
  const scenes = loadScenes();
  while (loadSelect.options.length > 1) {
    loadSelect.remove(1);
  }
  scenes.forEach((s, i) => {
    const option = document.createElement("option");
    option.value = i.toString();
    option.textContent = s.name;
    loadSelect.appendChild(option);
  });
}

el<HTMLButtonElement>("scene-save-button").addEventListener("click", () => {
  const name = prompt("Name this scene:");
  if (!name) {
    return;
  }
  const scenes = loadScenes();
  scenes.push({ name, preset: presetKey, background, layers });
  saveScenes(scenes);
});

el<HTMLButtonElement>("scene-load-button").addEventListener("click", () => {
  const scenes = loadScenes();
  const scene = scenes[Number(loadSelect.value)];
  if (loadSelect.value === "" || !scene) {
    return;
  }
  presetKey = scene.preset;
  presetSelect.value = presetKey;
  applyPreset(presetKey);
  const bg = scene.background ?? { ref: null, fit: "cover" };
  background = {
    ref: bg.ref ?? null,
    fit: bg.fit ?? "cover",
    scale: bg.scale ?? 1,
    offsetX: bg.offsetX ?? 0,
    offsetY: bg.offsetY ?? 0,
  };
  bgFitSelect.value = background.fit;
  bgZoomSlider.value = String(background.scale);
  layers = Array.isArray(scene.layers) ? scene.layers : [];
  selectedId = null;
  syncObjToolbar();
  renderScene();
});

el<HTMLButtonElement>("scene-delete-scene-button").addEventListener("click", () => {
  const scenes = loadScenes();
  const i = Number(loadSelect.value);
  if (loadSelect.value === "" || !scenes[i]) {
    return;
  }
  if (!confirm(`Delete scene "${scenes[i].name}"?`)) {
    return;
  }
  scenes.splice(i, 1);
  saveScenes(scenes);
});

el<HTMLButtonElement>("scene-clear-button").addEventListener("click", () => {
  if (layers.length === 0 && !background.ref) {
    return;
  }
  if (!confirm("Clear the canvas?")) {
    return;
  }
  layers = [];
  background.ref = null;
  resetBgFraming();
  selectedId = null;
  syncObjToolbar();
  renderScene();
});

populateSceneSelect();

// ---- sticker drawing editor ----

const STICKER_N = 50;
const STICKER_CELL = 8;
const RECENT_COLOURS_KEY = "pixel-cat-maker-recent-colours";
const MAX_RECENT_COLOURS = 8;

const stickerModal = el<HTMLElement>("sticker-editor-modal");
const stickerCanvas = el<HTMLCanvasElement>("sticker-canvas");
const stickerCtx = stickerCanvas.getContext("2d")!;
const stickerToolSelect = el<HTMLSelectElement>("sticker-tool-select");
const stickerColour = el<HTMLInputElement>("sticker-colour");
const stickerGrid = el<HTMLInputElement>("sticker-grid-checkbox");
const stickerUndoButton = el<HTMLButtonElement>("sticker-undo-button");
const stickerRecent = el<HTMLElement>("sticker-recent-colours");

stickerCanvas.width = STICKER_N * STICKER_CELL;
stickerCanvas.height = STICKER_N * STICKER_CELL;

// painted cells, "x,y" -> hex
let stickerPaint: Record<string, string> = {};
let stickerUndo: Record<string, string>[] = [];
let stickerPainting = false;

function loadRecentColours(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_COLOURS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rememberColour(colour: string) {
  const normalised = colour.toLowerCase();
  const colours = loadRecentColours().filter((c) => c.toLowerCase() !== normalised);
  colours.unshift(normalised);
  localStorage.setItem(
    RECENT_COLOURS_KEY,
    JSON.stringify(colours.slice(0, MAX_RECENT_COLOURS)),
  );
  renderRecentColours();
}

function renderRecentColours() {
  stickerRecent.innerHTML = "";
  for (const colour of loadRecentColours()) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "sticker-swatch";
    swatch.style.backgroundColor = colour;
    swatch.title = colour;
    swatch.addEventListener("click", () => {
      stickerColour.value = colour;
    });
    stickerRecent.appendChild(swatch);
  }
}

function renderStickerCanvas() {
  stickerCtx.clearRect(0, 0, stickerCanvas.width, stickerCanvas.height);
  for (const [key, hex] of Object.entries(stickerPaint)) {
    const [x, y] = key.split(",").map(Number);
    stickerCtx.fillStyle = hex;
    stickerCtx.fillRect(x * STICKER_CELL, y * STICKER_CELL, STICKER_CELL, STICKER_CELL);
  }
  if (stickerGrid.checked) {
    stickerCtx.strokeStyle = "rgb(128 128 128 / 0.4)";
    stickerCtx.lineWidth = 1;
    for (let i = 1; i < STICKER_N; i++) {
      stickerCtx.beginPath();
      stickerCtx.moveTo(i * STICKER_CELL + 0.5, 0);
      stickerCtx.lineTo(i * STICKER_CELL + 0.5, stickerCanvas.height);
      stickerCtx.stroke();
      stickerCtx.beginPath();
      stickerCtx.moveTo(0, i * STICKER_CELL + 0.5);
      stickerCtx.lineTo(stickerCanvas.width, i * STICKER_CELL + 0.5);
      stickerCtx.stroke();
    }
  }
}

function stickerCell(ev: PointerEvent): { x: number; y: number } {
  const rect = stickerCanvas.getBoundingClientRect();
  return {
    x: Math.floor(((ev.clientX - rect.left) / rect.width) * STICKER_N),
    y: Math.floor(((ev.clientY - rect.top) / rect.height) * STICKER_N),
  };
}

function stickerFloodFill(sx: number, sy: number, target: string | undefined) {
  const fill = stickerColour.value;
  const stack: [number, number][] = [[sx, sy]];
  const seen = new Set<string>();
  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (x < 0 || y < 0 || x >= STICKER_N || y >= STICKER_N) {
      continue;
    }
    const key = `${x},${y}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    if ((stickerPaint[key] ?? undefined) !== target) {
      continue;
    }
    stickerPaint[key] = fill;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
}

function stickerApply(ev: PointerEvent, isStart: boolean) {
  const { x, y } = stickerCell(ev);
  if (x < 0 || y < 0 || x >= STICKER_N || y >= STICKER_N) {
    return;
  }
  const key = `${x},${y}`;
  const tool = stickerToolSelect.value;
  if (tool === "pick") {
    if (stickerPaint[key]) {
      stickerColour.value = stickerPaint[key];
      stickerToolSelect.value = "draw";
    }
    return;
  }
  if (tool === "fill") {
    if (isStart) {
      stickerFloodFill(x, y, stickerPaint[key] ?? undefined);
      rememberColour(stickerColour.value);
      renderStickerCanvas();
    }
    return;
  }
  if (tool === "erase") {
    delete stickerPaint[key];
  } else {
    stickerPaint[key] = stickerColour.value;
    rememberColour(stickerColour.value);
  }
  renderStickerCanvas();
}

stickerCanvas.addEventListener("pointerdown", (ev) => {
  ev.preventDefault();
  stickerUndo.push({ ...stickerPaint });
  stickerUndoButton.disabled = false;
  stickerPainting = true;
  stickerCanvas.setPointerCapture(ev.pointerId);
  stickerApply(ev, true);
});
stickerCanvas.addEventListener("pointermove", (ev) => {
  if (stickerPainting) {
    stickerApply(ev, false);
  }
});
function stickerEndStroke() {
  stickerPainting = false;
}
stickerCanvas.addEventListener("pointerup", stickerEndStroke);
stickerCanvas.addEventListener("pointercancel", stickerEndStroke);

stickerGrid.addEventListener("change", renderStickerCanvas);

stickerUndoButton.addEventListener("click", () => {
  const prev = stickerUndo.pop();
  if (prev) {
    stickerPaint = prev;
    renderStickerCanvas();
  }
  stickerUndoButton.disabled = stickerUndo.length === 0;
});

el<HTMLButtonElement>("sticker-clear-button").addEventListener("click", () => {
  if (Object.keys(stickerPaint).length === 0) {
    return;
  }
  stickerUndo.push({ ...stickerPaint });
  stickerUndoButton.disabled = false;
  stickerPaint = {};
  renderStickerCanvas();
});

function openStickerEditor() {
  stickerPaint = {};
  stickerUndo = [];
  stickerUndoButton.disabled = true;
  renderRecentColours();
  renderStickerCanvas();
  stickerModal.classList.remove("hidden");
}

function closeStickerEditor() {
  stickerModal.classList.add("hidden");
}

el<HTMLButtonElement>("scene-draw-sticker-button").addEventListener(
  "click",
  openStickerEditor,
);
el<HTMLButtonElement>("sticker-cancel-button").addEventListener(
  "click",
  closeStickerEditor,
);

el<HTMLButtonElement>("sticker-save-button").addEventListener("click", async () => {
  if (Object.keys(stickerPaint).length === 0) {
    alert("Draw something first.");
    return;
  }
  const name = prompt("Name this sticker:");
  if (name === null) {
    return;
  }
  const out = new OffscreenCanvas(STICKER_N, STICKER_N);
  const c = out.getContext("2d")!;
  for (const [key, hex] of Object.entries(stickerPaint)) {
    const [x, y] = key.split(",").map(Number);
    c.fillStyle = hex;
    c.fillRect(x, y, 1, 1);
  }
  const blob = await out.convertToBlob();
  await addCustomAsset("sticker", name || "sticker", blob);
  renderCustomTrays();
  closeStickerEditor();
});

// ---- start ----

applyPreset(presetKey);
syncObjToolbar();
