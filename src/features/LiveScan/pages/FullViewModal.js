import React, {  useMemo } from "react";
import AccurateOMRSheet from "./AccurateOMRSheet";

// --- COMPONENT 6: Full Resolution View Modal Component ---
function FullViewModal({
  selectedRow,
  setShowFullViewModal,
  isModalPanMode,
  setIsModalPanMode,
  modalZoom,
  setModalZoom,
  modalRotation,
  setModalRotation,
  modalPan,
  setModalPan,
  isModalDragging,
  handleModalMouseDown,
  handleModalMouseMove,
  handleModalMouseUp,
  handleModalTouchStart,
  handleModalTouchMove,
  handleModalTouchEnd,
  handleModalWheel,
  modalViewportRef,
  modalSheetRef,
  
}) {

  function processRowData(dataObject) {
    if (!dataObject || typeof dataObject !== 'object') {
      return { cleanFileName: '', questions: [], metadata: {} };
    }

    const questions = [];
    const metadata = {};
    let cleanFileName = '';

    Object.entries(dataObject).forEach(([key, value]) => {
      // 1. Exclude 'Sr' key
      if (key === 'Sr') return;

      // 2. Extract Questions (matches Q1, Q2, Q10, etc.)
      if (/^Q\d+$/i.test(key)) {
        questions.push({
          q: key,
          ans: value,
          qNum: parseInt(key.replace(/\D/g, ''), 10) // Restored qNum so sorting works
        });
      }
      // 3. Extract and clean FileName
      else if (key === 'FileName') {
        cleanFileName = value ? value.split('/').pop() : '';
        metadata.FileName = cleanFileName;
        metadata.RawFilePath = value;
      }
      // 4. Extract all other dynamic metadata fields
      else {
        metadata[key] = value;
      }
    });

    // Sort questions naturally (Q1, Q2, Q3...)
    questions.sort((a, b) => a.qNum - b.qNum);

    return {
      cleanFileName,
      questions,
      metadata
    };
  }

  const { cleanFileName, questions, metadata } = useMemo(
    () => processRowData(selectedRow),
    [selectedRow]
  );

  const renderBadge = (Status) => {
    const normalizedStatus = Status;

    if (normalizedStatus === 'True' || normalizedStatus === 'success') {
      return <span className="badge-soft-success">Successful</span>;
    } else if (normalizedStatus === 'needs review' || normalizedStatus === 'review') {
      return <span className="badge-soft-warning">Review</span>;
    } else {
      return <span className="badge-soft-danger">Failed</span>;
    }
  };

  console.log(selectedRow)
  return (
    <div className="fullview-overlay" onClick={() => setShowFullViewModal(false)}>
      <div className="fullview-card" onClick={(e) => e.stopPropagation()}>
        <div className="fullview-header">
          <div className="fullview-header-left">
            <div className="fullview-header-title-line">
              <span>#{selectedRow.Sr}</span>
              <span style={{fontSize:"14px", fontWeight:"500", letterSpacing:"0.5px"}}><span style={{color:"gray"}}>FileName: </span>{cleanFileName}</span>
              <span style={{letterSpacing:"0.5px"}}>{renderBadge(selectedRow.Status)}</span>
            </div>
            <div className="fullview-scanned-time">Scanned At: {selectedRow.LiveTime}</div>
          </div>

          <div className="fullview-controls">
            <button
              type="button"
              className={`btn-modal-pill ${isModalPanMode ? 'btn-pan-active' : ''}`}
              onClick={() => setIsModalPanMode(!isModalPanMode)}
              title={isModalPanMode ? "Disable Pan/Drag Mode" : "Enable Pan/Drag Mode"}
            >
              <i className="fas fa-hand-paper"></i>
              <span>{isModalPanMode ? 'Pan Mode: ON' : 'Pan Mode'}</span>
            </button>

            <div className="btn-modal-pill">
              {/* <button
                type="button"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 4px', fontWeight: 'bold' }}
                onClick={() => setModalZoom(prev => Math.max(prev - 15, 50))}
                title="Zoom Out">
                -
              </button> */}
              <select
                value={modalZoom}
                onChange={(e) => setModalZoom(Number(e.target.value))}
              >
                <option value={50}>50%</option>
                <option value={75}>75%</option>
                <option value={100}>100%</option>
                <option value={125}>125%</option>
                <option value={150}>150%</option>
                <option value={175}>175%</option>
                <option value={200}>200%</option>
                <option value={250}>250%</option>
              </select>
              {/* <button
                type="button"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 4px', fontWeight: 'bold' }}
                onClick={() => setModalZoom(prev => Math.min(prev + 15, 300))}
                title="Zoom In"
              >
                +
              </button> */}
            </div>

            <button
              type="button"
              className="btn-icon-square"
              onClick={() => setModalRotation((r) => (r - 90 + 360) % 360)}
              title="Rotate Left (90° CCW)"
            >
              <i className="fas fa-undo"></i>
            </button>

            <button
              type="button"
              className="btn-icon-square"
              onClick={() => setModalRotation((r) => (r + 90) % 360)}
              title="Rotate Right (90° CW)"
            >
              <i className="fas fa-redo"></i>
            </button>

            {(modalPan.x !== 0 || modalPan.y !== 0 || modalZoom !== 100 || modalRotation !== 0) && (
              <button
                type="button"
                className="btn-modal-pill"
                onClick={() => {
                  setModalPan({ x: 0, y: 0 });
                  setModalZoom(100);
                  setModalRotation(0);
                }}
                title="Reset Zoom & Pan Position"
                style={{ fontSize: '12px', padding: '4px 8px', color: '#3b82f6', borderColor: '#93c5fd' }}
              >
                <i className="fas fa-sync-alt mr-1"></i> Reset View
              </button>
            )}

            <button
              type="button"
              className="btn-close-modal"
              onClick={() => setShowFullViewModal(false)}
              title="Close"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="fullview-body-split">
          <div
            ref={modalViewportRef}
            className="fullview-sheet-column"
            onMouseDown={handleModalMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleModalMouseUp}
            onMouseLeave={handleModalMouseUp}
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
            onWheel={handleModalWheel}
            style={{ cursor: isModalPanMode ? (isModalDragging ? 'grabbing' : 'grab') : 'default', position: 'relative', overflow: 'hidden' }}>
            <div
              ref={modalSheetRef}
              className={`draggable-sheet-wrapper ${isModalDragging ? 'is-dragging' : ''}`}
              style={{
                transform: `translate(${modalPan.x}px, ${modalPan.y}px) rotate(${modalRotation}deg) scale(${modalZoom / 100})`,
                transition: isModalDragging ? 'none' : 'transform 0.15s ease-out',
                margin: 'auto'
              }}>
              <AccurateOMRSheet row={selectedRow} />
            </div>

            <div className="pan-hint-badge">
              {isModalPanMode ? (
                <span><i className="fas fa-hand-paper text-warning"></i> Pan Mode Active • Boundaries Locked • <b>Alt + Roller</b> to zoom</span>
              ) : (
                <span><i className="fas fa-info-circle"></i> Click <b>Pan Mode</b> in top bar to enable drag • Hold <b>Alt + Roller</b> to zoom</span>
              )}
            </div>
          </div>

          <div className="fullview-details-column">

            <div className="details-card-box">
              <div className="details-card-title">Scan Details</div>
              <div className="details-grid" style={{height:"150px", overflowY:"scroll", scrollbarWidth:"none", zIndex:"9999"}}>
                {Object.entries(metadata).map(([key, value]) => {
                  if (key === 'RawFilePath') return null;
                  return (
                    <React.Fragment key={key}>
                      <div className="details-label">{key}</div>
                      <div className="details-value">{String(value ?? '—')}</div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="details-card-title" style={{ marginBottom: '12px' }}>Recognized Responses</div>
              <div className="responses-grid" style={{height:"300px", overflowY:"scroll", scrollbarWidth:"none", zIndex:"9999"}}>
                {questions.map((item) => (
                  <div key={item.q} className={`response-chip ${item.ans === "" ? 'needs-review-chip' : ''}`}>
                    <span className="response-q-num">{item.q}</span>
                    <span className="response-ans-val">{item.ans}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="warning-alert-box">
              Some responses could not be confidently recognized.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default FullViewModal