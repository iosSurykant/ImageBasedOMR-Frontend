import { openDB } from "idb";

const DB_NAME   = "ScanRecordsDB";
const STORE_NAME = "scan_records";
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  },
});

// ─────────────────────────────────────────────────────────────
// Save records — OPTIMISED
// ─────────────────────────────────────────────────────────────
export async function saveRecords(records = []) {
  if (!records.length) return;

  const db    = await dbPromise;
  const tx    = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  // FIX: no await per record — fire all adds, let IDB queue them
  for (const record of records) {
    store.add(record); // intentionally NOT awaited
  }

  await tx.done; // await only the commit
}

// ─────────────────────────────────────────────────────────────
// Load latest chunk — OPTIMISED
// ─────────────────────────────────────────────────────────────
// export async function loadOlderRecords(limit = 100) {
//   const db    = await dbPromise;
//   const tx    = db.transaction(STORE_NAME, "readwrite");
//   const store = tx.objectStore(STORE_NAME);

//   const allKeys = await store.getAllKeys();

//   if (!allKeys.length) {
//     await tx.done;
//     return [];
//   }

//   const keysToLoad = allKeys.slice(-limit);

//   // FIX: fire all gets in parallel, collect promises
//   const recordPromises = keysToLoad.map((key) => store.get(key));

//   // FIX: fire all deletes in parallel (no await per key)
//   for (const key of keysToLoad) {
//     store.delete(key); // intentionally NOT awaited
//   }

//   // Now await all gets together
//   const records = (await Promise.all(recordPromises)).filter(Boolean);

//   await tx.done;

//   return records;
// }
export async function loadOlderRecords(limit = 100) {
  const db = await dbPromise;

  const tx = db.transaction(STORE_NAME, "readwrite");

  const store = tx.objectStore(STORE_NAME);

  const records = [];
  const keysToDelete = [];

  let cursor = await store.openCursor(null, "prev");

  while (cursor && records.length < limit) {
    records.push(cursor.value);

    keysToDelete.push(cursor.primaryKey);

    cursor = await cursor.continue();
  }

  // delete loaded rows
  for (const key of keysToDelete) {
    store.delete(key);
  }

  await tx.done;

  // reverse because we loaded newest → oldest
  return records.reverse();
}

// ─────────────────────────────────────────────────────────────
// Clear DB — unchanged, already optimal
// ─────────────────────────────────────────────────────────────
export async function clearRecordsDB() {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.objectStore(STORE_NAME).clear();
  await tx.done;
}