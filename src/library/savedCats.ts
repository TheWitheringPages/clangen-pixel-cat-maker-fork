// Shared access to the saved-cat gallery in localStorage, used by the cat
// maker, the offspring predictor and the family tree so all three stay in
// sync and can add cats to the same roster.

export type SavedCat = { name: string; params: string; notes?: string };

export const SAVED_CATS_KEY = "pixel-cat-maker-saved-cats";

export function loadSavedCats(): SavedCat[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_CATS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSavedCats(cats: SavedCat[]) {
  localStorage.setItem(SAVED_CATS_KEY, JSON.stringify(cats));
}

/** Append a cat to the gallery and return its new index. */
export function addSavedCat(name: string, params: string, notes?: string): number {
  const cats = loadSavedCats();
  cats.push(notes ? { name, params, notes } : { name, params });
  saveSavedCats(cats);
  return cats.length - 1;
}

/** Rename the cat at `index`. Returns false if the index is out of range. */
export function renameSavedCat(index: number, name: string): boolean {
  const cats = loadSavedCats();
  if (!cats[index]) {
    return false;
  }
  cats[index].name = name;
  saveSavedCats(cats);
  return true;
}

/** Move the cat at `from` to position `to`, shifting the rest. */
export function moveSavedCat(from: number, to: number): boolean {
  const cats = loadSavedCats();
  if (!cats[from] || to < 0 || to >= cats.length) {
    return false;
  }
  const [moved] = cats.splice(from, 1);
  cats.splice(to, 0, moved);
  saveSavedCats(cats);
  return true;
}
