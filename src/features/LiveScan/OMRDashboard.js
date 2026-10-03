import React, { useState, useEffect, useRef } from 'react'
import TopMetaCard from './pages/TopMetaCard';
import ProgressCard from './pages/ProgressCard';
import LiveResultsTable from './pages/LiveResultsTable';
import FullViewModal from './pages/FullViewModal';
import "./OMRDashboard.css"
import { useScan } from 'context/ScanningContext';
import { useWebSocket } from './WebSocket/useWebSocket';
import { scanFiles } from 'helper/Booklet32Page_helper';
import { pauseScanning } from 'helper/Booklet32Page_helper';
import { resumeScanning } from 'helper/Booklet32Page_helper';
import { resetScanApi } from 'helper/Booklet32Page_helper';

export default function OMRScanningDashboard() {
  const [liveData, setLiveData] = useState([]);
  const { isLiveScanning, setIsLiveScanning } = useScan()

  const params = new URLSearchParams(window.location.search);
  const totalCount = parseInt(params.get("timgs"), 10);
  const tstName = params.get("tstName");
  const tId = params.get("tId");
  const userData = JSON.parse(localStorage.getItem("userData"))

  const [processedCount, setProcessedCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // const [activePage, setActivePage] = useState(1);

  const [selectedRow, setSelectedRow] = useState(null);
  const [showFullViewModal, setShowFullViewModal] = useState(false);
  const [modalZoom, setModalZoom] = useState(100);
  const [modalRotation, setModalRotation] = useState(0);

  const [isModalPanMode, setIsModalPanMode] = useState(false);

  const modalViewportRef = useRef(null);
  const modalSheetRef = useRef(null);

  const [modalPan, setModalPan] = useState({ x: 0, y: 0 });
  const [isModalDragging, setIsModalDragging] = useState(false);
  const isModalDraggingRef = useRef(false);
  const modalDragStartRef = useRef({ x: 0, y: 0 });
  const modalPanStartRef = useRef({ x: 0, y: 0 });

  const [startTime, setStartTime] = useState(null); // timestamp in milliseconds for calculation

  // Reset scanning state when entering the page to ensure no auto-start
  useEffect(() => {
    setIsLiveScanning(false);
    setProcessedCount(0);
    setElapsedSeconds(0);
    setStartTime(null);
  }, [setIsLiveScanning, setProcessedCount, setElapsedSeconds, setStartTime]);


  // WebSocket connection for live data
  useWebSocket({
    baseUrl: process.env.REACT_APP_BACKEND_URL,
    onMessage: (data) => {
      console.log("Received WebSocket data:", data);
      setLiveData(prev => [...prev, data]);
      setProcessedCount(prev => Math.min(prev + 1, totalCount));
    },
    onError: (error) => {
      console.error("WebSocket error:", error);
    },
    onOpen: () => {
      console.log("WebSocket connection opened");
    },
    onClose: () => {
      console.log("WebSocket connection closed");
    },
  });


  const handleStart = async () => {
    setIsLiveScanning(true);
    setProcessedCount(0);
    setElapsedSeconds(0);

    // Store start timestamp for elapsed calculation
    const startTimestamp = Date.now();
    setStartTime(startTimestamp);

    const userId = userData?.empid;
    const makePath = `${userId}\\${tstName}`;
    try {
      const res = await scanFiles({ makePath, tId });
      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStop = async () => {
    try {
      await resetScanApi()
      setIsLiveScanning(false);
      setProcessedCount(0);
      setElapsedSeconds(0);
      setStartTime(null);
    } catch (error) {
      console.error("Error stopping scan:", error);
    }
  };

  const handlePause = async () => {
    try {
      await pauseScanning();
      setIsLiveScanning(false);
    } catch (error) {
      console.error("Error pausing scan:", error);
    }
  };

  const handleResume = async () => {
    try {
      await resumeScanning();
      setIsLiveScanning(true);
    } catch (error) {
      console.error("Error resuming scan:", error);
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

  const handleModalWheel = (e) => {
    if (e.altKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 15 : -15;
      setModalZoom(prev => Math.min(Math.max(prev + delta, 50), 300));
    }
  };

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


  // Reset modal state whenever full-view modal opens
  useEffect(() => {
    if (showFullViewModal) {
      setModalZoom(100);
      setModalRotation(0);
      setModalPan({ x: 0, y: 0 });
      setIsModalPanMode(false);
    }
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
          handleModalWheel={handleModalWheel}
          modalViewportRef={modalViewportRef}
          modalSheetRef={modalSheetRef}
        />
      )}
    </div>
  );
}