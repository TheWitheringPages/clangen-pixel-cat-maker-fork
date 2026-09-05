import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");

/** Extract the form-row that contains a control with this class. */
function extractRow(className) {
  const needle = `class="${className}`;
  const alt = `class="${className} `;
  let idx = html.indexOf(`class="${className}"`);
  if (idx < 0) {
    idx = html.indexOf(`class="${className} `);
  }
  if (idx < 0) {
    // disabled / multiple may insert attributes before class in rare cases
    idx = html.search(new RegExp(`class="[^"]*\\b${className}\\b[^"]*"`));
  }
  if (idx < 0) {
    console.error("MISSING", className);
    return null;
  }
  const rowStart = html.lastIndexOf('<div class="form-row">', idx);
  if (rowStart < 0) {
    console.error("NO ROW", className);
    return null;
  }
  // find matching close for this form-row by scanning div depth
  let i = rowStart;
  let depth = 0;
  while (i < html.length) {
    if (html.startsWith("<div", i)) {
      depth++;
      i = html.indexOf(">", i) + 1;
      continue;
    }
    if (html.startsWith("</div>", i)) {
      depth--;
      i += 6;
      if (depth === 0) {
        const block = html.slice(rowStart, i);
        console.log("OK", className, block.length);
        return block.trim();
      }
      continue;
    }
    i++;
  }
  console.error("UNCLOSED", className);
  return null;
}

const keys = [
  "sprite-no-select",
  "pelt-name-select",
  "colour-select",
  "tortie-checkbox",
  "tortie-mask-select",
  "tortie-pattern-select",
  "tortie-colour-select",
  "tint-select",
  "eye-colour-select",
  "eye-colour2-select",
  "skin-colour-select",
  "white-patches-select",
  "points-select",
  "white-patches-tint-select",
  "vitiligo-select",
  "accessory-select",
  "scar-select",
  "lineart-select",
];

const rows = {};
for (const key of keys) {
  rows[key] = extractRow(key);
}

// also extract details blocks and sharecode
function extractByClass(openTagHint, className) {
  const idx = html.indexOf(className);
  if (idx < 0) return null;
  // walk back to <details or <section
  const startDetails = html.lastIndexOf("<details", idx);
  const startSection = html.lastIndexOf("<section", idx);
  const start = Math.max(startDetails, startSection);
  const isDetails = start === startDetails && startDetails > startSection;
  const close = isDetails ? "</details>" : "</section>";
  const end = html.indexOf(close, idx) + close.length;
  return html.slice(start, end).trim();
}

rows.adjust = extractByClass("<details", 'class="adjust-details"');
rows.paint = extractByClass("<details", 'class="paint-details"');
rows.saved = extractByClass("<details", 'class="saved-cats-details"');
rows.sharecode = extractByClass("<section", 'class="sharecode-div"');

fs.writeFileSync(
  "scripts/_extracted-rows.json",
  JSON.stringify(
    Object.fromEntries(
      Object.entries(rows).map(([k, v]) => [k, v ? v.length : null]),
    ),
    null,
    2,
  ),
);
fs.writeFileSync("scripts/_extracted-rows-full.json", JSON.stringify(rows));
console.log("wrote extraction");
