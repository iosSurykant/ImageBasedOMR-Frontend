import { BsStop } from "react-icons/bs";
import { CiPause1, CiPlay1 } from "react-icons/ci";
import { IoPlayOutline } from "react-icons/io5";

function ProgressCard({ isLiveScanning, handleStart, handleStop, handlePause, handleResume, processedCount, totalCount, elapsedSeconds, startTime, isScanFinished, isWebSocketConnected }) {
  
  const percent = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

  // Format seconds into MM:SS (or HH:MM:SS if needed)
  const formatTime = (secs) => {
    if (isNaN(secs) || secs <= 0) return '00:00';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = Math.floor(secs % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Dynamic Remaining Time Calculation
  const getRemainingSeconds = () => {
    if (!processedCount || processedCount === 0 || !elapsedSeconds) return 0;
    const remainingSheets = totalCount - processedCount;
    if (remainingSheets <= 0) return 0;

    const timePerSheet = elapsedSeconds / processedCount;
    return Math.round(remainingSheets * timePerSheet);
  };

  const remainingSeconds = getRemainingSeconds();
  const sheetsPerMinute = elapsedSeconds > 0 ? Math.round((processedCount / elapsedSeconds) * 60) : 0;

  // Determine if scan is finished via API or processed count
  const finished = isScanFinished || (processedCount >= totalCount && totalCount > 0);
  // Show controls only when WebSocket is connected and scan is not finished/not started
  const showControls = isWebSocketConnected && startTime !== null && !finished;

  return (
    <div className="omr-card progress-card mb-4">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="scanning-title">SCANNING OMR SHEETS</div>
          <div className="processed-number">
            {processedCount.toLocaleString()}{' '}
            <span className="processed-total-text">
              / {totalCount.toLocaleString()} sheets processed
            </span>
          </div>
        </div>
        <div className="percentage-text">{percent}%</div>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }}></div>
      </div>

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pt-1">
        <div className="progress-footer-stats mb-3 mb-sm-0">
          <span>
            <span className="stat-label">Started:</span>
            <span className="stat-value">{startTime || '--:--'}</span>
            <span className="stat-divider">|</span>
          </span>
          <span>
            <span className="stat-label">Elapsed:</span>
            <span className="stat-value">{formatTime(elapsedSeconds)}</span>
            <span className="stat-divider">|</span>
          </span>
          <span>
            <span className="stat-label" style={{display:"inline-block"}}>Est. Remaining:</span>
            <span className="stat-value">
              {processedCount > 0 ? formatTime(remainingSeconds) : '--:--'}
            </span>
            <span className="stat-divider">|</span>
          </span>
          <span>
            <span className="stat-label">Sheets/min:</span>
            <span className="stat-value" style={{ color: "#09835B", fontWeight: "600", letterSpacing: "0.5px" }}>{sheetsPerMinute}</span>
          </span>
        </div>

        {showControls ? (
          <div className="d-flex align-items-center">
            <button
              type="button"
              className="btn-pause-custom mr-2"
              onClick={isLiveScanning ? handlePause : handleResume}>
              <span className={` ${isLiveScanning ? "scanning" : "not-scanning"}`} style={{ fontSize: "11px" }}              >
                {isLiveScanning ? <CiPause1 size={16} /> : <CiPlay1 size={16} />}
              </span> {isLiveScanning ? 'Pause Scan' : 'Resume Scan'}
            </button>

            <button type="button" className="btn-stop-custom" onClick={handleStop}>
              <BsStop size={22} />
              Stop Scan
            </button>
          </div>
        ) : (
          <button type="button" className="btn-start-custom" onClick={handleStart} style={{ letterSpacing:"0.5px" }}>
           <IoPlayOutline size={20}/>
            Start Scan
          </button>
        )}
      </div>
    </div>
  );
}
export default ProgressCard