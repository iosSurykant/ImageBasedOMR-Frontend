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
  getRecognizedResponses
}) {
  return (
    <div className="fullview-overlay" onClick={() => setShowFullViewModal(false)}>
      <div className="fullview-card" onClick={(e) => e.stopPropagation()}>
        <div className="fullview-header">
          <div className="fullview-header-left">
            <div className="fullview-header-title-line">
              <span>#{selectedRow.id}</span>
              <span className="fullview-status-badge">{selectedRow.statusText}</span>
            </div>
            <div className="fullview-scanned-time">{selectedRow.fileName} • Scanned {selectedRow.liveTime}</div>
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
              <button
                type="button"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 4px', fontWeight: 'bold' }}
                onClick={() => setModalZoom(prev => Math.max(prev - 15, 50))}
                title="Zoom Out"
              >
                -
              </button>
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
              <button
                type="button"
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 4px', fontWeight: 'bold' }}
                onClick={() => setModalZoom(prev => Math.min(prev + 15, 300))}
                title="Zoom In"
              >
                +
              </button>
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
            style={{ cursor: isModalPanMode ? (isModalDragging ? 'grabbing' : 'grab') : 'default', position: 'relative', overflow: 'hidden' }}
          >
            <div
              ref={modalSheetRef}
              className={`draggable-sheet-wrapper ${isModalDragging ? 'is-dragging' : ''}`}
              style={{
                transform: `translate(${modalPan.x}px, ${modalPan.y}px) rotate(${modalRotation}deg) scale(${modalZoom / 100})`,
                transition: isModalDragging ? 'none' : 'transform 0.15s ease-out',
                margin: 'auto'
              }}
            >
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
              <div className="details-grid">
                <div className="details-label">File Name</div>
                <div className="details-value">SSC_Pre_SectionA_1210.jpg</div>

                <div className="details-label">Template</div>
                <div className="details-value">SSC OMR Template</div>

                <div className="details-label">Created By</div>
                <div className="details-value">Operator (ID: 25478)</div>

                <div className="details-label">Scan Time</div>
                <div className="details-value">11 Sep 2026, 04:17:55 PM</div>
              </div>
            </div>

            <div>
              <div className="details-card-title" style={{ marginBottom: '12px' }}>Recognized Responses</div>
              <div className="responses-grid">
                {getRecognizedResponses(selectedRow).map((item, idx) => (
                  <div
                    key={idx}
                    className={`response-chip ${item.isWarning ? 'needs-review-chip' : ''}`}
                  >
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