import { useState, useCallback, useRef } from "react";

import { MAX_VISIBLE, LOAD_SIZE } from "../utils/scanUtils";

import {
  saveRecords,
  loadOlderRecords as loadOlderRecordsFromDB,
  clearRecordsDB,
} from "../utils/scanDB";

export function useRecordBuffer() {
  const [processedData, setProcessedData] = useState([]);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  // ── Batch older rows before DB write ───────────────────────────────────────
  const dbBufferRef  = useRef([]);
  const flushTimerRef = useRef(null);

  const saveToIndexedDBBatched = (records) => {
    dbBufferRef.current.push(...records);
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(async () => {
      try {
        await saveRecords(dbBufferRef.current);
        dbBufferRef.current = [];
      } catch (err) {
        console.error("[IndexedDB save error]", err);
      }
    }, 2000);
  };


  const lsTimerRef = useRef(null);
  const writeLastSerial = useCallback((serialNo) => {
    clearTimeout(lsTimerRef.current);
    lsTimerRef.current = setTimeout(() => {
      localStorage.setItem("lastSerialNo", JSON.stringify(serialNo ?? 0));
    }, 1000);
  }, []);

  // ── Push new records ───────────────────────────────────────────────────────
  const pushNewRecords = useCallback((newRecords = []) => {
    if (!newRecords?.length) return;

    setProcessedData((prev) => {
      const updated = [...prev, ...newRecords];

      if (updated.length > MAX_VISIBLE) {
        const extraCount = updated.length - MAX_VISIBLE;
        const olderRows  = updated.slice(0, extraCount);
        const latestRows = updated.slice(extraCount);

        saveToIndexedDBBatched(olderRows);

        // FIX: debounced instead of synchronous setItem
        writeLastSerial(latestRows[latestRows.length - 1]?.["Serial No"]);

        return latestRows;
      }

      // FIX: debounced instead of synchronous setItem
      writeLastSerial(updated[updated.length - 1]?.["Serial No"]);

      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writeLastSerial]);

  // ── Load older records from IndexedDB ──────────────────────────────────────
  const loadOlderRecords = useCallback(async () => {
    if (isLoadingOlder) return false;
    setIsLoadingOlder(true);
    try {
      const chunk = await loadOlderRecordsFromDB(LOAD_SIZE);
      if (!chunk.length) return false;
      setProcessedData((prev) => [...chunk, ...prev]);
      return true;
    } catch (err) {
      console.error("[IndexedDB load error]", err);
      return false;
    } finally {
      setIsLoadingOlder(false);
    }
  }, [isLoadingOlder]);

  // ── Clear all records ──────────────────────────────────────────────────────
  const clearRecords = useCallback(() => {
    clearTimeout(lsTimerRef.current);
    setProcessedData([]);
    localStorage.removeItem("lastSerialNo");
    clearRecordsDB();
  }, []);

  return {
    processedData,
    pushNewRecords,
    loadOlderRecords,
    clearRecords,
    isLoadingOlder,
  };
}