function ProgressCard({ isLiveScanning, setIsLiveScanning, handleStart, processedCount, totalCount, elapsedSeconds, setProcessedCount }) {
  const percent = Math.round((processedCount / totalCount) * 100);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

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
        <div className="percentage-text">
          {percent}%
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }}></div>
      </div>

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pt-1">
        <div className="progress-footer-stats mb-3 mb-sm-0">
          <span>
            <span className="stat-label">Started:</span>
            <span className="stat-value">11:42 AM</span>
          </span>
          <span className="stat-divider">|</span>
          <span>
            <span className="stat-label">Elapsed:</span>
            <span className="stat-value">{formatTime(elapsedSeconds)}</span>
          </span>
          <span className="stat-divider">|</span>
          <span>
            <span className="stat-label">Est. Remaining:</span>
            <span className="stat-value">10:12</span>
          </span>
        </div>

        <div className="d-flex align-items-center">
          <button
            type="button"
            className="btn-pause-custom mr-2"
            onClick={() => setIsLiveScanning(!isLiveScanning)}
          >
            <i className={`fas ${isLiveScanning ? 'fa-pause' : 'fa-play'} mr-2`} style={{ fontSize: '11px' }}></i>
            {isLiveScanning ? 'Pause Scan' : 'Resume Scan'}
          </button>

          <button type="button" className="btn-start-custom" onClick={handleStart}>
            <i className="fas fa-stop mr-2" style={{ fontSize: '12px' }}></i>
            Start Scan
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProgressCard