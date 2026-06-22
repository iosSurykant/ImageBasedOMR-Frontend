import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Container } from "reactstrap";
import axios from "axios";

import NormalHeader from "components/Headers/NormalHeader";
import RecognizationBtn from "../../components/ui/RecognizationBtn";
import RecognizationModal from "../../components/ui/RecognizationModal";

import { getLastScannedFiles } from "helper/Booklet32Page_helper";
import { getLayoutDataById } from "helper/TemplateHelper";
import getBaseUrl from "services/BackendApi";

import { useRecordBuffer } from "./hooks/useRecordBuffer";
import { useWebSocket } from "./hooks/useWebSocket";
import { useScanControls } from "./hooks/useScanControls";
import { useGridScroll } from "./hooks/useGridScroll";

import ScanGrid from "./ScanComponents/ScanGrid";
import ScanToolbar from "./ScanComponents/ScanToolbar";
import ImageViewerPanel from "./ScanComponents/ImageViewerPanel";
import LoadingBanner from "./ScanComponents/LoadingBanner";

import { useScan } from "context/ScanningContext";
import { debounce } from "./utils/scanUtils";

// ─── AdminScanJob ──────────────────────────────────────────────────────────────
const AdminScanJob = () => {
  const { setIsScanning, setIsPausedContext } = useScan();
  const location = useLocation();
  const navigate = useNavigate();

  // ── Infra state ────────────────────────────────────────────────────────────
  const [baseUrl, setBaseUrl] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [templateData, setTemplateData] = useState([]);
  const [headData, setHeadData] = useState(["Student Data"]);
  const [accuracy, setAccuracy] = useState(0);
  const [dbState, setDbState] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 576);
  const [gridHeight, setGridHeight] = useState("850px");

  // ── Image viewer state ─────────────────────────────────────────────────────
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [borderRowId, setBorderRowId] = useState(null);
  const [focusBox, setFocusBox] = useState({});

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showRecModal, setShowRecModal] = useState(false);

  const gridRef = useRef();
  const headDataSetRef = useRef(false); // FIX: track if columns are set
  const templateFetchedRef = useRef(false); // FIX: fetch template only once

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const {
    processedData,
    pushNewRecords,
    loadOlderRecords,
    clearRecords,
    isLoadingOlder,
  } = useRecordBuffer();

  const {
    csvString,
    scanning,
    isPaused,
    handleStart,
    handlePause,
    handleResume,
    handleReset,
    writableRef,
    headerWrittenRef,
    fileClosingRef,
  } = useScanControls({
    dbState,
    onScanStart: () => {
      setAccuracy(0);
      headDataSetRef.current = false; 
      resetRefs();
    },
  });

  
  const { resetRefs } = useWebSocket({
    baseUrl,
    writableRef,
    headerWrittenRef,
    fileClosingRef,

    onMessage: (rows) => {
      if (!headDataSetRef.current && rows?.length) {
        setHeadData(Object.keys(rows[0]));
        headDataSetRef.current = true;
      }

      pushNewRecords(rows);
      setTimeout(() => {
        if (gridRef.current) {
          gridRef.current.setProperties(
            {
              dataSource: [...processedData, ...rows],
            },
            true,
          );
        }
      }, 0);
    },

    onAccuracyChange: setAccuracy, // now called once per batch (not per message)
  });

  const { isWaitingToLoad } = useGridScroll({
    gridRef,
    onLoadOlder: async () => {
      const loaded = await loadOlderRecords();
      if (loaded) setTimeout(() => gridRef.current?.refresh(), 100);
      return loaded;
    },
  });

  // ── Debounced scan control handlers ───────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedStart = useCallback(debounce(handleStart, 500), [handleStart]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPause = useCallback(debounce(handlePause, 500), [handlePause]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedResume = useCallback(debounce(handleResume, 500), [
    handleResume,
    handleReset,
  ]);

  // ── Context sync ───────────────────────────────────────────────────────────
  useEffect(() => {
    setIsScanning(scanning);
  }, [scanning, setIsScanning]);
  useEffect(() => {
    setIsPausedContext(isPaused);
  }, [isPaused, setIsPausedContext]);

  // ── Base URL ───────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const base = await getBaseUrl();
        if (base) setBaseUrl(new URL(base).host);
      } catch (e) {
        console.error("[AdminScanJob] getBaseUrl:", e);
      }
    })();
  }, []);

  // ── Initial data fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const templateId = localStorage.getItem("templateId");
        const res = await getLastScannedFiles(templateId);
        if (!res?.state) return;
        const data = res.res;
        if (!Array.isArray(data) || !data.length) return;

        setHeadData(Object.keys(data[0]));
        headDataSetRef.current = true;

        let serial = Number(localStorage.getItem("lastSerialNo") || 1);
        const mapped = data.map((d) => ({
          ...d,
          "Serial No": d["Serial No"] ?? serial++,
        }));
        pushNewRecords(mapped);
      } catch (e) {
        console.error("[AdminScanJob] initial fetch:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!baseUrl) return;
    if (templateFetchedRef.current) return; // FIX: fetch only once
    templateFetchedRef.current = true;

    (async () => {
      try {
        const base = await getBaseUrl();
        const templateId = localStorage.getItem("templateId");
        const res = await getLayoutDataById(templateId);
        if (!res?.data?.jsonPath) return;

        // FIX: no Cache-Control / Pragma / Expires headers — let browser cache it
        const { data } = await axios.get(`${base}${res.data.jsonPath}`);
        if (data?.fields) setTemplateData(data.fields);
      } catch (e) {
        console.error("[AdminScanJob] template fetch:", e);
      }
    })();
  }, [baseUrl]);

  // ── Responsive sizing ──────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      setIsSmallScreen(window.innerWidth < 576);
      setGridHeight(`${window.innerHeight * 0.65}px`);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Template name ──────────────────────────────────────────────────────────
  useEffect(() => {
    setTemplateName(localStorage.getItem("templateName") || "");
  }, [location]);

  // ── Grid callbacks ─────────────────────────────────────────────────────────
  const handleActionComplete = useCallback((args) => {
    if (!args.data) return;
  }, []);

  const handleRowSelected = useCallback((args) => {
    const row = args?.data;
    if (!row?.FileName) return;
    setBorderRowId(row.FileName);
    setCurrentImage(row.FileName);
    setIsViewerOpen(true);
  }, []);

  const handleCellSelected = useCallback(
    (args) => {
      const row = args?.data;
      const colIdx = args?.currentCell?.cellIndex;
      if (!row) return;
      const key = Object.keys(row)[colIdx];
      const field = templateData.find((f) => f.fieldName === key);
      if (field) {
        const { x, y, width, height } = field;
        setFocusBox({ x, y, width, height });
      }
      setCurrentImage(row?.FileName);
      setIsViewerOpen(true);
    },
    [templateData],
  );

  const handleGridClick = useCallback((e) => {
    if (!e.target.closest(".e-row")) {
      setBorderRowId(null);
      setIsViewerOpen(false);
    }
  }, []);

  // ── Refresh (clear visible + localStorage) ─────────────────────────────────
  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    clearRecords();
    headDataSetRef.current = false;
    toast.info("Data cleared.");
    setIsRefreshing(false);
    gridRef.current?.refresh();
  }, [clearRecords]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <NormalHeader />

      {/* Main content */}
      <Container className={isSmallScreen ? "mt--6" : "mt--6"} fluid>
        <br />
      {/* Recognition */}
        <div
          style={{
            position: "absolute",
            top: "6%",
            right: "1%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            padding: 10,
            pointerEvents: scanning ? "none" : "auto",
            opacity: scanning ? 0.5 : 1,
          }}
        >
          <RecognizationBtn handleBtnClick={() => setShowRecModal(true)} />
        </div>

        <RecognizationModal
          show={showRecModal}
          onClose={() => setShowRecModal(false)}
        />

        <div className="control-section" style={{ position: "relative" }}>
          <LoadingBanner
            isWaiting={isWaitingToLoad}
            isLoading={isLoadingOlder}
          />

          <ScanGrid
            ref={gridRef}
            dataSource={processedData}
            headData={headData}
            gridHeight={gridHeight}
            borderRowId={borderRowId}
            templateData={templateData}
            onRowSelected={handleRowSelected}
            onCellSelected={handleCellSelected}
            onActionComplete={handleActionComplete}
            onDataBound={() => {}}
            onClick={handleGridClick}
          />

          <ImageViewerPanel
            isOpen={isViewerOpen}
            currentImage={currentImage}
            baseUrl={baseUrl}
            focusBox={focusBox}
            templateData={templateData}
            onClose={() => setIsViewerOpen(false)}
          />
        </div>

        <ScanToolbar
          // templateName={templateName}
          csvString={csvString}
          scanning={scanning}
          isPaused={isPaused}
          isRefreshing={isRefreshing}
          accuracy={accuracy}
          dbState={dbState}
          onStart={debouncedStart}
          onPause={debouncedPause}
          onResume={debouncedResume}
          onReset={handleReset}
          onRefresh={handleRefreshData}
          onDbStateChange={setDbState}
        />
      </Container>

    </>
  );
};

export default AdminScanJob;
