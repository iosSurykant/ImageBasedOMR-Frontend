import React, { useState, useEffect, useRef } from 'react'
import TopMetaCard from './pages/TopMetaCard';
import ProgressCard from './pages/ProgressCard';
import LiveResultsTable from './pages/LiveResultsTable';
import FullViewModal from './pages/FullViewModal';
import "./OMRDashboard.css"
import { useScan } from 'context/ScanningContext';
import { useWebSocket } from './WebSocket/useWebSocket';

export default function OMRScanningDashboard() {
  const [liveData, setLiveData] = useState([]);
  const { isLiveScanning, setIsLiveScanning } = useScan()

  const params = new URLSearchParams(window.location.search);
  const totalCount = parseInt(params.get("timgs"), 10);
  const tstName = params.get("tstName");
  const tId = params.get("tId");

  const [processedCount, setProcessedCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [selectedRow, setSelectedRow] = useState(null);
  const [showFullViewModal, setShowFullViewModal] = useState(false);
  const [modalZoom, setModalZoom] = useState(75);
  const [modalRotation, setModalRotation] = useState(0);

  const [isModalPanMode, setIsModalPanMode] = useState(false);

  const modalViewportRef = useRef(null);
  const modalSheetRef = useRef(null);

  const [modalPan, setModalPan] = useState({ x: 0, y: 0 });
  const [isModalDragging, setIsModalDragging] = useState(false);
  const isModalDraggingRef = useRef(false);
  const modalDragStartRef = useRef({ x: 0, y: 0 });
  const modalPanStartRef = useRef({ x: 0, y: 0 });

  const [startTime, setStartTime] = useState(null);
  const [isScanFinished, setIsScanFinished] = useState(false); // NEW
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  // Reset scanning state when entering the page to ensure no auto-start
  useEffect(() => {
    setIsLiveScanning(false);
    setProcessedCount(0);
    setElapsedSeconds(0);
    setStartTime(null);
    setIsScanFinished(false);
  }, [setIsLiveScanning, setProcessedCount, setElapsedSeconds, setStartTime]);



  const handleWebSocketMessage = (data) => {
    console.log("[LiveScan] Received:", data);
    // Handle received scan data here
    setLiveData(prev => [data, ...prev]);
    setProcessedCount(prev => Math.min(prev + 1, totalCount));
  };

  const handleWebSocketError = (error) => {
    console.error("[LiveScan] WebSocket error:", error);
    setIsWebSocketConnected(false);
    // Reset scanning state when WebSocket errors
    setIsLiveScanning(false);
    setIsScanFinished(false);
  };

  const handleWebSocketOpen = () => {
    console.log("[LiveScan] WebSocket connected");
    setIsWebSocketConnected(true);
  };

  const handleWebSocketClose = (event) => {
    console.log("[LiveScan] WebSocket closed:", event);
    setIsWebSocketConnected(false);
    // Reset scanning state when WebSocket closes
    setIsLiveScanning(false);
    setIsScanFinished(false);
  };

  const { goScan, pauseScan, resumeScan, stopScan, } = useWebSocket({
    baseUrl: process.env.REACT_APP_BACKEND_URL,
    onMessage: handleWebSocketMessage,
    onError: handleWebSocketError,
    onOpen: handleWebSocketOpen,
    onClose: handleWebSocketClose,
  });

  const handleStart = () => {
    setIsLiveScanning(true);
    setProcessedCount(0);
    setElapsedSeconds(0);
    setStartTime(Date.now());
    setIsScanFinished(false);

    try {
      const folderPath = tstName
      const idTemp = parseInt(tId, 10);

      if (Number.isNaN(idTemp)) {
        console.error("Invalid Template ID:", tId);
        setIsLiveScanning(false);
        setStartTime(null);
        return;
      }

      const sent = goScan({
        action: "process",
        folderPath: folderPath,
        idTemp: idTemp,
        token: localStorage.getItem("token")
      });

      console.log(
        "[LiveScan] Process request sent:",
        sent
      );

      if (!sent) {
        setIsLiveScanning(false);
        setStartTime(null);
      }

    } catch (error) {
      console.error(
        "[LiveScan] Error starting scan:",
        error
      );

      setIsLiveScanning(false);
      setProcessedCount(0);
      setElapsedSeconds(0);
      setStartTime(null);
      setIsScanFinished(false);
    }
  };

  const handleStop = () => {
    try {
      const sent = stopScan();

      console.log(
        "[LiveScan] Stop request sent:",
        sent
      );

      if (sent) {
        setIsLiveScanning(false);
        setProcessedCount(0);
        setElapsedSeconds(0);
        setStartTime(null);
        setIsScanFinished(false);
      }

    } catch (error) {
      console.error(
        "[LiveScan] Error stopping scan:",
        error
      );
    }
  };

  const handlePause = () => {
    try {
      const sent = pauseScan();

      console.log(
        "[LiveScan] Pause request sent:",
        sent
      );

      if (sent) {
        setIsLiveScanning(false);
      }

    } catch (error) {
      console.error(
        "[LiveScan] Error pausing scan:",
        error
      );
    }
  };

  const handleResume = () => {
    try {
      const sent = resumeScan();
      console.log("[LiveScan] Resume request sent:", sent);
      if (sent) { setIsLiveScanning(true) }

    } catch (error) {
      console.error(
        "[LiveScan] Error resuming scan:",
        error
      );
    }
  };

  const getClampedPan = (x, y, viewportElem, sheetElem, scale, isCenteredVertically = false) => {
    if (!viewportElem || !sheetElem) return { x, y };

    const vw = viewportElem.clientWidth || 400;
    const vh = viewportElem.clientHeight || 500;

    const unscaledW = sheetElem.offsetWidth || 460;
    const unscaledH = sheetElem.offsetHeight || 600;

    const sw = unscaledW * scale;
    const sh = unscaledH * scale;

    const initialLeft = (vw - sw) / 2;
    const maxX = vw - (sw * 0.5) - initialLeft;
    const minX = (sw * 0.5) - (initialLeft + sw);

    let minY, maxY;
    if (isCenteredVertically) {
      const initialTop = (vh - sh) / 2;
      maxY = vh - (sh * 0.5) - initialTop;
      minY = (sh * 0.5) - (initialTop + sh);
    } else {
      const initialTop = 20;
      maxY = vh - (sh * 0.5) - initialTop;
      minY = (sh * 0.5) - (initialTop + sh);
    }

    const clampedX = Math.min(Math.max(x, minX), maxX);
    const clampedY = Math.min(Math.max(y, minY), maxY);

    return { x: clampedX, y: clampedY };
  };

  const handleModalMouseDown = (e) => {
    if (!isModalPanMode) return;
    isModalDraggingRef.current = true;
    setIsModalDragging(true);
    modalDragStartRef.current = { x: e.clientX, y: e.clientY };
    modalPanStartRef.current = { ...modalPan };
  };

  const handleModalMouseMove = (e) => {
    if (!isModalDraggingRef.current) return;
    const dx = e.clientX - modalDragStartRef.current.x;
    const dy = e.clientY - modalDragStartRef.current.y;
    const rawX = modalPanStartRef.current.x + dx;
    const rawY = modalPanStartRef.current.y + dy;

    setModalPan(getClampedPan(rawX, rawY, modalViewportRef.current, modalSheetRef.current, modalZoom / 100, true));
  };

  const handleModalMouseUp = () => {
    isModalDraggingRef.current = false;
    setIsModalDragging(false);
  };

  // const handleModalWheel = (e) => {
  //   if (e.altKey) {
  //     e.preventDefault();
  //     const delta = e.deltaY < 0 ? 15 : -15;
  //     setModalZoom(prev => Math.min(Math.max(prev + delta, 50), 250));
  //   }
  // };

  // NEW ADDITION 1: Native wheel listener to stop page scrolling
  
  useEffect(() => {
    const viewport = modalViewportRef.current;
    if (!viewport) return;

    const handleNativeWheel = (e) => {
      if (e.altKey) {
        e.preventDefault(); // This now forces the page to stop scrolling
        const delta = e.deltaY < 0 ? 15 : -15;
        setModalZoom((prev) => Math.min(Math.max(prev + delta, 50), 250));
      }
    };

    viewport.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      viewport.removeEventListener('wheel', handleNativeWheel);
    };
  }, [setModalZoom, modalViewportRef]); 


  // NEW ADDITION 2: Re-center/clamp the image when zooming out
  useEffect(() => {
    if (modalViewportRef.current && modalSheetRef.current) {
      setModalPan((prevPan) => 
        getClampedPan(
          prevPan.x, 
          prevPan.y, 
          modalViewportRef.current, 
          modalSheetRef.current, 
          modalZoom / 100, 
          true
        )
      );
    }
  }, [modalZoom, setModalPan, modalViewportRef, modalSheetRef]);


  const handleModalTouchStart = (e) => {
    if (!isModalPanMode) return;
    if (e.touches.length === 1) {
      isModalDraggingRef.current = true;
      setIsModalDragging(true);
      modalDragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      modalPanStartRef.current = { ...modalPan };
    }
  };

  const handleModalTouchMove = (e) => {
    if (!isModalDraggingRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - modalDragStartRef.current.x;
    const dy = e.touches[0].clientY - modalDragStartRef.current.y;
    const rawX = modalPanStartRef.current.x + dx;
    const rawY = modalPanStartRef.current.y + dy;

    setModalPan(getClampedPan(rawX, rawY, modalViewportRef.current, modalSheetRef.current, modalZoom / 100, true));
  };

  const handleModalTouchEnd = () => {
    isModalDraggingRef.current = false;
    setIsModalDragging(false);
  };

  useEffect(() => {
    let timer;

    if (
      isLiveScanning &&
      startTime !== null &&
      totalCount > 0 &&
      processedCount < totalCount
    ) {
      const updateElapsedTime = () => {
        const elapsed = Math.floor(
          (Date.now() - new Date(startTime).getTime()) / 1000
        );

        setElapsedSeconds(Math.max(0, elapsed));
      };

      // Update immediately instead of waiting for first 1 second
      updateElapsedTime();

      timer = setInterval(updateElapsedTime, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [
    isLiveScanning,
    startTime,
    processedCount,
    totalCount,
  ]);

  // Auto-stop scanning when all sheets are processed
  useEffect(() => {
    if (
      totalCount > 0 &&
      processedCount >= totalCount
    ) {
      setProcessedCount(totalCount);
      setIsLiveScanning(false);

      // Freeze final elapsed time
      if (startTime !== null) {
        const finalElapsed = Math.floor(
          (Date.now() - new Date(startTime).getTime()) / 1000
        );

        setElapsedSeconds(Math.max(0, finalElapsed));
      }
    }
  }, [
    processedCount,
    totalCount,
    startTime,
    setIsLiveScanning,
  ]);

  // Reset modal state when full-view modal closes
  useEffect(() => {
    if (!showFullViewModal) {
      setModalZoom(100);
      setModalRotation(0);
      setModalPan({ x: 0, y: 0 });
      setIsModalPanMode(false);
    }
    // Note: We intentionally don't reset when opening to preserve user zoom settings
  }, [showFullViewModal]);

  const handleRowViewClick = (row) => {
    setSelectedRow(row);
    setShowFullViewModal(true)
  };

  return (
    <div className="dashboard-outer-wrapper">
      <div className="dashboard-container">
        <TopMetaCard tstName={tstName} tId={tId} totalCount={totalCount} />

        <ProgressCard
          isLiveScanning={isLiveScanning}
          setIsLiveScanning={setIsLiveScanning}
          processedCount={processedCount}
          totalCount={totalCount}
          elapsedSeconds={elapsedSeconds}
          setProcessedCount={setProcessedCount}
          handleStart={handleStart}
          handleStop={handleStop}
          handlePause={handlePause}
          handleResume={handleResume}
          startTime={startTime ? new Date(startTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) : null}
          isScanFinished={isScanFinished} // NEW
          isWebSocketConnected={isWebSocketConnected}
        />

        <div className="row">
          <div className={"col-12"}>
            <LiveResultsTable
              selectedRow={selectedRow}
              liveData={liveData}
              handleRowViewClick={handleRowViewClick}
            />
          </div>
        </div>
      </div>

      {showFullViewModal && selectedRow && (
        <FullViewModal
          tId={tId}
          selectedRow={selectedRow}
          setShowFullViewModal={setShowFullViewModal}
          isModalPanMode={isModalPanMode}
          setIsModalPanMode={setIsModalPanMode}
          modalZoom={modalZoom}
          setModalZoom={setModalZoom}
          modalRotation={modalRotation}
          setModalRotation={setModalRotation}
          modalPan={modalPan}
          setModalPan={setModalPan}
          isModalDragging={isModalDragging}
          handleModalMouseDown={handleModalMouseDown}
          handleModalMouseMove={handleModalMouseMove}
          handleModalMouseUp={handleModalMouseUp}
          handleModalTouchStart={handleModalTouchStart}
          handleModalTouchMove={handleModalTouchMove}
          handleModalTouchEnd={handleModalTouchEnd}
          // handleModalWheel={handleModalWheel}
          modalViewportRef={modalViewportRef}
          modalSheetRef={modalSheetRef}
        />
      )}
    </div>
  );
}