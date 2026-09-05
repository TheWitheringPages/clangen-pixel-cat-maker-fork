import fs from "node:fs";

const rows = JSON.parse(fs.readFileSync("scripts/_extracted-rows-full.json", "utf8"));
const orig = fs.readFileSync("index.html", "utf8");

function withLabel(rowHtml, labelText, title) {
  return rowHtml.replace(
    /<label([^>]*)>([^<]*)<\/label>/,
    `<label$1 title="${title}">${labelText}</label>`,
  );
}

function accordion(id, title, tip, inner) {
  return `
        <details class="control-accordion" data-accordion="${id}">
          <summary title="${tip}">${title}</summary>
          <div class="accordion-body">
            ${inner}
          </div>
        </details>`;
}

function tabPanel(id, label, tip, inner, hidden, { includeRandomize = true } = {}) {
  const actions = includeRandomize
    ? `<div class="category-actions">
          <button type="button" class="category-randomize-button" data-category="${id}">
            Randomize category
          </button>
          <button type="button" class="category-reset-button" data-category="${id}">
            Reset category
          </button>
        </div>`
    : `<div class="category-actions">
          <button type="button" class="category-reset-button" data-category="${id}">
            Reset category
          </button>
        </div>`;
  return `
      <section
        class="tab-panel card"
        id="panel-${id}"
        role="tabpanel"
        aria-labelledby="tab-${id}"
        data-tab="${id}"
        ${hidden ? "hidden" : ""}
      >
        <div class="tab-panel-head">
          <h2 title="${tip}">${label}</h2>
          <p class="tab-blurb">${tip}</p>
        </div>
        ${inner}
        ${actions}
      </section>`;
}

// enhance labels with tooltips
const sprite = withLabel(rows["sprite-no-select"], "Sprite", "Age and pose");
const pelt = withLabel(rows["pelt-name-select"], "Pelt", "Coat pattern");
const colour = withLabel(rows["colour-select"], "Color", "Main coat colour");
const tint = withLabel(rows["tint-select"], "Tint", "Soft wash over the whole coat");
const tortieOn = withLabel(
  rows["tortie-checkbox"],
  "Tortie?",
  "Second colour in patch shapes (tortoiseshell-style)",
);
const tortieMask = withLabel(
  rows["tortie-mask-select"],
  "Tortie Mask",
  "Where the second colour goes",
);
const tortiePelt = withLabel(
  rows["tortie-pattern-select"],
  "Tortie Pelt",
  "Pattern used inside the tortie patches",
);
const tortieColour = withLabel(
  rows["tortie-colour-select"],
  "Tortie Colour",
  "Colour used inside the tortie patches",
);
const skin = withLabel(
  rows["skin-colour-select"],
  "Skin",
  "Nose, inner ear, and paw skin",
);
const lineart = withLabel(
  rows["lineart-select"],
  "Lineart",
  "Living, dead, or dark forest outline",
);
const eye = withLabel(rows["eye-colour-select"], "Eye", "First eye colour");
const eye2 = withLabel(
  rows["eye-colour2-select"],
  "Eye 2",
  "Second eye colour if different",
);
const white = withLabel(
  rows["white-patches-select"],
  "White Patches",
  "White markings on the coat",
);
const points = withLabel(
  rows["points-select"],
  "Points",
  "Darker points on face, legs, and tail",
);
const whiteTint = withLabel(
  rows["white-patches-tint-select"],
  "White Tint",
  "Colour wash on white areas only",
);
const vitiligo = withLabel(
  rows["vitiligo-select"],
  "Vitiligo",
  "Pale blotches",
);
const accessory = withLabel(
  rows["accessory-select"],
  "Accessories",
  "Things the cat is wearing or holding",
);
const scar = withLabel(rows["scar-select"], "Scars", "Injury marks");

// convert studio details to accordions (start collapsed)
const adjust = rows.adjust
  .replace("<details class=\"adjust-details\">", '<details class="adjust-details control-accordion" data-accordion="color-adjust">')
  .replace(
    "<summary>Colour Adjustments (optional)</summary>",
    '<summary title="Shift a layer\'s colours after the sprite is built">Color Adjust</summary>',
  );
const paint = rows.paint
  .replace("<details class=\"paint-details\">", '<details class="paint-details control-accordion" data-accordion="pixel-paint">')
  .replace(
    "<summary>Pixel Paint (optional)</summary>",
    '<summary title="Draw extra pixels by hand">Pixel Paint</summary>',
  );
const saved = rows.saved
  .replace("<details class=\"saved-cats-details\">", '<details class="saved-cats-details control-accordion" data-accordion="saved-cats">')
  .replace(
    "<summary>Saved Cats (stored in this browser)</summary>",
    '<summary title="Cats stored in this browser">Saved Cats</summary>',
  )
  .replace("anything —\n          saved", "anything -\n          saved");

const sharecode = `
      <details class="sharecode-details control-accordion" data-accordion="appearance-data">
        <summary title="Text for sharing or import">Appearance Data</summary>
        <div class="accordion-body">
          <p class="section-note">
            Does not contain all data; use only as reference.
          </p>
          <textarea readonly rows="10" class="sharecode"></textarea>
          <div>
            <button class="import-json-button" type="button">
              Import JSON data
            </button>
          </div>
        </div>
      </details>`;

const bodyInner = [
  accordion("pose", "Sprite", "Age and pose", sprite),
  accordion("pattern", "Pelt", "Coat pattern", pelt),
  accordion("color", "Color", "Main coat colour", colour),
  accordion("tint", "Tint", "Soft wash over the whole coat", tint),
  accordion(
    "tortie",
    "Tortie",
    "Second colour in patch shapes (tortoiseshell-style)",
    [tortieOn, tortieMask, tortiePelt, tortieColour].join("\n"),
  ),
  accordion("skin", "Skin", "Nose, inner ear, and paw skin", skin),
  accordion("lineart", "Lineart", "Living, dead, or dark forest outline", lineart),
].join("\n");

const faceInner = [
  accordion("eye", "Eye", "First eye colour", eye),
  accordion("eye2", "Eye 2", "Second eye colour if different", eye2),
].join("\n");

const markingsInner = [
  accordion("white", "White Patches", "White markings on the coat", white),
  accordion("points", "Points", "Darker points on face, legs, and tail", points),
  accordion("white-tint", "White Tint", "Colour wash on white areas only", whiteTint),
  accordion("vitiligo", "Vitiligo", "Pale blotches", vitiligo),
].join("\n");

const additionalInner = [
  accordion("accessories", "Accessories", "Things the cat is wearing or holding", accessory),
  accordion("scars", "Scars", "Injury marks", scar),
].join("\n");

const studioInner = [adjust, paint, saved, sharecode].join("\n");

const tabs = [
  tabPanel("body", "Body", "Pose, coat, skin, and outline", bodyInner, false),
  tabPanel("face", "Face", "Eye colours", faceInner, true),
  tabPanel("markings", "Markings", "White and pale patches", markingsInner, true),
  tabPanel("additional", "Additional", "Items and scars on top of the cat", additionalInner, true),
  tabPanel("studio", "Studio", "Fine-tune, paint, save, and data", studioInner, true, {
    includeRandomize: false,
  }),
].join("\n");

const headMatch = orig.match(/^[\s\S]*?<main class="layout">/);
const footerMatch = orig.match(/<div class="info">[\s\S]*$/);
if (!headMatch || !footerMatch) {
  throw new Error("Could not find head/footer anchors");
}

// rebuild from doctype through header only
const headerEnd = orig.indexOf("<main class=\"layout\">");
const prefix = orig.slice(0, headerEnd);

const main = `<main class="layout">
      <aside class="preview-panel">
        <div class="card preview-card">
          <img
            draggable="true"
            class="cat-sprite-img"
            style="image-rendering: pixelated"
          />
          <div class="palette-row hidden"></div>
          <div class="compare-box hidden">
            <canvas
              class="compare-canvas"
              width="50"
              height="50"
              style="image-rendering: pixelated"
            ></canvas>
            <div class="compare-label">
              <span class="compare-name"></span>
              <button
                class="compare-clear-button"
                type="button"
                title="Stop comparing"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div class="card preview-chrome">
          <div class="chrome-tabs" role="tablist" aria-label="Preview tools">
            <button type="button" class="chrome-tab is-active" data-chrome="view" role="tab" aria-selected="true" title="Display and compare options">View</button>
            <button type="button" class="chrome-tab" data-chrome="downloads" role="tab" aria-selected="false" title="Save images">Downloads</button>
            <button type="button" class="chrome-tab" data-chrome="share" role="tab" aria-selected="false" title="Share this cat">Share</button>
            <button type="button" class="chrome-tab" data-chrome="randomize" role="tab" aria-selected="false" title="Randomize the whole cat">Randomize</button>
          </div>

          <div class="chrome-panel is-active" data-chrome-panel="view">
            <div class="form-row preview-chrome-native">
              <label title="How big the preview is">Scale</label>
              <select class="zoom-level">
                <option value="1">1x</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option selected value="4">4x</option>
              </select>
            </div>
            <div class="form-row preview-chrome-native">
              <label title="Background behind the sprite">BG Colour</label>
              <select class="bg-color-select">
                <option value="rgb(0 0 0 / 0)">Transparent</option>
                <option value="rgb(255 255 255)">White</option>
                <option value="rgb(0 0 0)">Black</option>
                <option value="rgb(0 255 0)">Lime Green</option>
                <option value="rgb(206 194 168)">ClanGen Light</option>
                <option value="rgb(57 50 36)">ClanGen Dark</option>
                <option value="rgb(39 45 79)">Starry Blue</option>
                <option value="rgb(158 151 170)">Unknown Grey</option>
                <option value="rgb(42 17 13)">Starless Red</option>
                <option value="custom">Custom…</option>
              </select>
              <input
                type="color"
                class="bg-custom-colour hidden"
                value="#7f7f7f"
              />
            </div>
            <div class="form-row">
              <label title="Soft shading on the sprite">Shading</label>
              <input class="shading-checkbox" type="checkbox" />
            </div>
            <div class="form-row">
              <label title="Flip the cat left to right">Reverse</label>
              <input class="reverse-checkbox" type="checkbox" />
            </div>
            <div class="form-row preview-chrome-native">
              <label title="Overlay another saved cat">Compare with</label>
              <select class="compare-select">
                <option value="">None</option>
              </select>
            </div>
            <div class="form-row">
              <label title="Download the PNG without the background colour">
                Transparent PNG
              </label>
              <input class="png-transparent-checkbox" type="checkbox" />
            </div>
            <div class="button-column">
              <button class="palette-button" type="button" title="Show the colours used in this sprite">
                Show Palette
              </button>
            </div>
          </div>

          <div class="chrome-panel" data-chrome-panel="downloads" hidden>
            <div class="button-column">
              <div class="undo-redo-row">
                <button class="undo-button" type="button" title="Undo the last change (Ctrl+Z)" disabled>
                  ↩ Undo
                </button>
                <button class="redo-button" type="button" title="Redo (Ctrl+Y)" disabled>
                  Redo ↪
                </button>
              </div>
              <button class="download-png-button" type="button">
                Download PNG
              </button>
              <button class="age-strip-button" type="button" title="One image of this cat at every life stage">
                Download Age Strip
              </button>
              <button class="character-card-button" type="button" title="A shareable card with name and palette">
                Download Character Card
              </button>
              <button class="copy-card-button" type="button" title="Copy the character card image to the clipboard">
                Copy Card Image
              </button>
            </div>
          </div>

          <div class="chrome-panel" data-chrome-panel="share" hidden>
            <div class="button-column">
              <button class="copy-url-button" type="button">Copy this cat's URL</button>
              <button class="add-parent-button" type="button">
                Use as offspring parent…
              </button>
            </div>
          </div>

          <div class="chrome-panel" data-chrome-panel="randomize" hidden>
            <div class="button-column">
              <button class="randomize-all-button" type="button">
                🎲 Randomize
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div class="controls-shell">
        <div class="mobile-mode-bar" hidden>
          <button type="button" class="mobile-mode-toggle" data-mode="guided">
            Guided
          </button>
          <button type="button" class="mobile-mode-toggle" data-mode="full">
            Full view
          </button>
        </div>

        <div class="guided-nav" hidden>
          <button type="button" class="guided-back" disabled>Back</button>
          <span class="guided-step-label">Body</span>
          <button type="button" class="guided-next">Next</button>
        </div>

        <div class="maker-tabs" role="tablist" aria-label="Cat options">
          <button type="button" class="maker-tab is-active" role="tab" id="tab-body" data-tab="body" aria-selected="true" aria-controls="panel-body" title="Pose, coat, skin, and outline">Body</button>
          <button type="button" class="maker-tab" role="tab" id="tab-face" data-tab="face" aria-selected="false" aria-controls="panel-face" title="Eye colours">Face</button>
          <button type="button" class="maker-tab" role="tab" id="tab-markings" data-tab="markings" aria-selected="false" aria-controls="panel-markings" title="White and pale patches">Markings</button>
          <button type="button" class="maker-tab" role="tab" id="tab-additional" data-tab="additional" aria-selected="false" aria-controls="panel-additional" title="Items and scars on top of the cat">Additional</button>
          <button type="button" class="maker-tab" role="tab" id="tab-studio" data-tab="studio" aria-selected="false" aria-controls="panel-studio" title="Fine-tune, paint, save, and data">Studio</button>
        </div>

        <form class="controls">
${tabs}
        </form>
      </div>
    </main>

`;

const out = prefix + main + footerMatch[0];
fs.writeFileSync("index.html", out);
console.log("Wrote index.html", out.length);
