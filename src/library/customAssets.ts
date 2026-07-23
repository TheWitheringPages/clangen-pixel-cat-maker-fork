/*
  Custom art (backgrounds and stickers) a user uploads or draws in the scene
  composer. Kept in IndexedDB because localStorage is too small for images.
  These never leave the browser unless the user submits them separately.
*/

export type CustomAssetType = "background" | "sticker";

export type CustomAsset = {
  id: string;
  type: CustomAssetType;
  name: string;
  blob: Blob;
  created: number;
};

const DB_NAME = "pixel-cat-maker";
const STORE = "custom-assets";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise === null) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function makeId(): string {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

async function addCustomAsset(
  type: CustomAssetType,
  name: string,
  blob: Blob,
): Promise<CustomAsset> {
  const db = await openDb();
  const asset: CustomAsset = {
    id: makeId(),
    type,
    name,
    blob,
    created: Date.now(),
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).add(asset);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return asset;
}

async function listCustomAssets(): Promise<CustomAsset[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    req.onsuccess = () => {
      const all = (req.result as CustomAsset[]) ?? [];
      all.sort((a, b) => a.created - b.created);
      resolve(all);
    };
    req.onerror = () => reject(req.error);
  });
}

async function getCustomAsset(id: string): Promise<CustomAsset | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as CustomAsset | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function deleteCustomAsset(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export { addCustomAsset, listCustomAssets, getCustomAsset, deleteCustomAsset };
