import React, { useState, useEffect, useRef } from 'react'
import TopMetaCard from './pages/TopMetaCard';
import ProgressCard from './pages/ProgressCard';
import LiveResultsTable from './pages/LiveResultsTable';
import FullViewModal from './pages/FullViewModal';
import "./OMRDashboard.css"
import { useScan } from 'context/ScanningContext';
import { useWebSocket } from './WebSocket/useWebSocket';
import { scanFiles } from 'helper/Booklet32Page_helper';

export default function OMRScanningDashboard() {
  const [liveData, setLiveData] = useState([]);
  const { isLiveScanning, setIsLiveScanning } = useScan()

  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount] = useState(1250);
  const [elapsedSeconds, setElapsedSeconds] = useState(64);
  const [activePage, setActivePage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [postCodeFilter, setPostCodeFilter] = useState('All');

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


  const params = new URLSearchParams(window.location.search);
  // const tstId = params.get("tstId");
  const tstName = params.get("tstName");
  const tId = params.get("tId");
  const userData = JSON.parse(localStorage.getItem("userData"))

  // WebSocket connection for live data
  useWebSocket({
    baseUrl: process.env.REACT_APP_BACKEND_URL,
    onMessage: (data) => {
      // Handle incoming WebSocket message
      console.log("Received WebSocket data:", data);
      // Update liveData with the new message
      setLiveData(prev => [...prev, data]);
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

    const userId = userData.empid
    const makePath = `${userId}\\${tstName}`;
    try {
      const res = await scanFiles({makePath, tId})
      console.log(res)
    } catch (error) {
      console.log(error)
    }
  }

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
    if (modalViewportRef.current && modalSheetRef.current) {
      setModalPan(prev => getClampedPan(prev.x, prev.y, modalViewportRef.current, modalSheetRef.current, modalZoom / 100, true));
    }
  }, [modalZoom, modalRotation]);

  useEffect(() => {
    let timer;
    if (isLiveScanning && processedCount < totalCount) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        setProcessedCount((prev) => Math.min(prev + 1, totalCount));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLiveScanning, processedCount, totalCount]);

  useEffect(() => {
    if (showFullViewModal) {
      setModalZoom(100);
      setModalRotation(0);
      setModalPan({ x: 0, y: 0 });
      setIsModalPanMode(false);
    }
  }, [showFullViewModal]);

  const rawData = liveData;
  const currentDataset = rawData.filter(item => {
    return item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rollNo.includes(searchTerm);
  });

  const getRecognizedResponses = (row) => {
    if (!row) return [];
    return [
      { q: 'Q1', ans: 'A', isWarning: false },
      { q: 'Q2', ans: 'C', isWarning: false },
      { q: 'Q3', ans: 'B', isWarning: false },
      { q: 'Q4', ans: 'D', isWarning: false },
      { q: 'Q5', ans: 'A', isWarning: false },
      { q: 'Q6', ans: 'C', isWarning: false },
      { q: 'Q7', ans: 'B', isWarning: false },
      { q: 'Q8', ans: '?', isWarning: true },
      { q: 'Q9', ans: 'A', isWarning: false },
      { q: 'Q10', ans: 'D', isWarning: false },
      { q: 'Q11', ans: 'C', isWarning: false },
      { q: 'Q12', ans: 'B', isWarning: false },
      { q: 'Q13', ans: 'A', isWarning: false },
      { q: 'Q14', ans: 'D', isWarning: false },
      { q: 'Q15', ans: 'C', isWarning: false },
      { q: 'Q16', ans: 'B', isWarning: false },
      { q: 'Q17', ans: '?', isWarning: true },
      { q: 'Q18', ans: 'A', isWarning: false },
      { q: 'Q19', ans: 'C', isWarning: false },
      { q: 'Q20', ans: 'D', isWarning: false },
      { q: 'Q21', ans: 'B', isWarning: false },
      { q: 'Q22', ans: 'A', isWarning: false },
      { q: 'Q23', ans: 'C', isWarning: false },
      { q: 'Q24', ans: 'D', isWarning: false },
      { q: 'Q25', ans: 'B', isWarning: false },
    ];
  };

  const handleRowViewClick = (row) => {
    setSelectedRow(row);
    setShowFullViewModal(true)
  };


  return (
    <div className="dashboard-outer-wrapper">
      <div className="dashboard-container">
        <TopMetaCard tstName={tstName} tId={tId} />

        <ProgressCard
          isLiveScanning={isLiveScanning}
          setIsLiveScanning={setIsLiveScanning}
          processedCount={processedCount}
          totalCount={totalCount}
          elapsedSeconds={elapsedSeconds}
          setProcessedCount={setProcessedCount}
          handleStart={handleStart}
        />

        <div className="row">
          <div className={"col-12"}>
            <LiveResultsTable
              currentDataset={currentDataset}
              selectedRow={selectedRow}
              handleRowViewClick={handleRowViewClick}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              postCodeFilter={postCodeFilter}
              setPostCodeFilter={setPostCodeFilter}
              activePage={activePage}
              setActivePage={setActivePage}
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
          getRecognizedResponses={getRecognizedResponses}
        />
      )}
    </div>
  );
}