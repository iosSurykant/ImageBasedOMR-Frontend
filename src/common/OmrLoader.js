import React from "react";

const OmrLoader = () => {
  const options = ["A", "B", "C", "D"];

  const customStyles = (
    <style>{`
      .omr-loader-wrapper {
        background-color: #0b0f19;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }

      .omr-loader-v2 {
        gap: 18px;
        user-select: none;
      }

      /* OMR Sheet Badge with Alignment Corner Markers */
      .sheet-badge {
        width: 180px;
        height: 70px;
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.1);
        padding: 0 16px;
      }

      /* Authentic OMR Corner Timing Marks */
      .corner-mark {
        width: 7px;
        height: 7px;
        background-color: #10b981;
        box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
      }

      .corner-mark.tl { top: 6px; left: 6px; }
      .corner-mark.tr { top: 6px; right: 6px; }
      .corner-mark.bl { bottom: 6px; left: 6px; }
      .corner-mark.br { bottom: 6px; right: 6px; }

      /* Answer Bubbles Strip */
      .bubble-strip {
        gap: 12px;
        z-index: 2;
      }

      .bubble-option {
        width: 26px;
        height: 26px;
        border: 1.5px solid #475569;
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
        background: #0f172a;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Sequenced Bubble Wave Fill Animation */
      .bubble-option:nth-child(1) { animation: waveFill 1.8s infinite 0.0s; }
      .bubble-option:nth-child(2) { animation: waveFill 1.8s infinite 0.3s; }
      .bubble-option:nth-child(3) { animation: waveFill 1.8s infinite 0.6s; }
      .bubble-option:nth-child(4) { animation: waveFill 1.8s infinite 0.9s; }

      @keyframes waveFill {
        0%, 100% {
          background: #0f172a;
          border-color: #475569;
          color: #64748b;
          transform: translateY(0) scale(1);
          box-shadow: none;
        }
        30% {
          background: #10b981;
          border-color: #10b981;
          color: #0f172a;
          transform: translateY(-4px) scale(1.12);
          box-shadow: 0 6px 14px rgba(16, 185, 129, 0.4);
        }
        60% {
          background: #1e293b;
          border-color: #10b981;
          color: #10b981;
          transform: translateY(0) scale(1);
        }
      }

      /* Ambient Sweep Shimmer */
      .shimmer-line {
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.04),
          transparent
        );
        animation: sweep 2.2s infinite ease-in-out;
      }

      @keyframes sweep {
        0% { left: -100%; }
        100% { left: 200%; }
      }

      /* Loader Label & Pulse Track */
      .loader-meta {
        gap: 6px;
      }

      .loader-title {
        font-size: 13px;
        font-weight: 600;
        color: #f8fafc;
        letter-spacing: 0.4px;
      }

      .loader-bar-track {
        width: 110px;
        height: 3px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 2px;
      }

      .loader-bar-fill {
        top: 0;
        left: -50%;
        width: 50%;
        height: 100%;
        background: linear-gradient(90deg, transparent, #10b981, transparent);
        animation: barSlide 1.5s infinite ease-in-out;
      }

      @keyframes barSlide {
        0% { left: -50%; }
        100% { left: 100%; }
      }
    `}</style>
  );

  return (
    <div className="omr-loader-wrapper d-flex justify-content-center align-items-center min-vh-100">
      {customStyles}

      <div className="omr-loader-v2 d-flex flex-column align-items-center">
        {/* Sheet Badge with Alignment Corners */}
        <div className="sheet-badge position-relative d-flex align-items-center justify-content-center overflow-hidden">
          <div className="shimmer-line position-absolute"></div>

          {/* OMR Timing Marks */}
          <div className="corner-mark position-absolute tl"></div>
          <div className="corner-mark position-absolute tr"></div>
          <div className="corner-mark position-absolute bl"></div>
          <div className="corner-mark position-absolute br"></div>

          {/* Bubble Answer Strip */}
          <div className="bubble-strip d-flex align-items-center">
            {options.map((option) => (
              <div
                key={option}
                className="bubble-option rounded-circle d-flex align-items-center justify-content-center position-relative"
              >
                {option}
              </div>
            ))}
          </div>
        </div>

        {/* Status Metadata */}
        <div className="loader-meta d-flex flex-column align-items-center">
          <div className="loader-title">Initializing OMR System</div>
          <div className="loader-bar-track position-relative overflow-hidden">
            <div className="loader-bar-fill position-absolute"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmrLoader;