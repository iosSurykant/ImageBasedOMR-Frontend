import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  scanFiles,
  pauseScanning,
  resumeScanning,
  resetScanApi,
} from "helper/Booklet32Page_helper";
import { clearRecordsDB } from "AdminScanJob/utils/scanDB";

export function useScanControls({ onScanStart, dbState } = {}) {
  const [scanning, setScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [csvString, setCsvString] = useState("");

  const handleStart = useCallback(async () => {
    if (scanning) return;

    await clearRecordsDB();

    const folderName = localStorage.getItem("folderName");
    const templateId = localStorage.getItem("templateId");

    if (!folderName) {
      toast.error("Please select a folder");
      return;
    }
    if (!templateId) {
      toast.error("Please select a template");
      return;
    }

    try {
      // Notify parent so it can reset serial / accuracy counters
      onScanStart?.();
      setScanning(true);
      setIsPaused(false);

      const result = await scanFiles(folderName, templateId, dbState);
      const csvUrl = result?.csv
      console.log("Scan started, CSV URL:", csvUrl);
      setCsvString(csvUrl);

    } catch (err) {
      if (err?.name === "AbortError") return; // user cancelled file picker

      console.error("[useScanControls] start error:", err);
      setScanning(false);

      toast.error(
        err?.response?.data || err?.message || "Failed to start scan",
      );
    }
  }, [scanning, onScanStart, csvString, dbState]);
  

  // ── Pause ──────────────────────────────────────────────────────────────────
  const handlePause = useCallback(async () => {
    try {
      await pauseScanning();
      setIsPaused(true);
      toast.warning("Scanning paused");
    } catch (err) {
      console.error("[useScanControls] pause error:", err);
      toast.error("Failed to pause scanning");
    }
  }, []);

  // ── Resume ─────────────────────────────────────────────────────────────────
  const handleResume = useCallback(async () => {
    try {
      await resumeScanning();
      setIsPaused(false);
      toast.info("Scanning resumed");
    } catch (err) {
      console.error("[useScanControls] resume error:", err);
      toast.error("Failed to resume scanning");
    }
  }, []);

  const handleReset = useCallback(async () => {
    try {
      await resetScanApi();
      setIsPaused(false);
      setScanning(false);
      toast.info("Scan stopped and reset");
    } catch (err) {
      console.error("[useScanControls] reset error:", err);
      toast.error("Failed to reset scanning");
    }
  }, []);

  return {
    csvString,
    scanning,
    isPaused,
    handleStart,
    handlePause,
    handleResume,
    handleReset,
  };
}
