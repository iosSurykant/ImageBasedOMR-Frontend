import React, { useEffect, useState } from "react";

/**
 * Shows the real OMR image when `src` is given (and loads), otherwise a drawn
 * placeholder sheet so the layout looks right before the API is connected or
 * when an image URL is broken.
 */
const OmrPreview = ({ src, alt = "OMR sheet", style }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "contain", ...style }}
      />
    );
  }

  const blocks = [0, 1, 2, 3];
  const rows = Array.from({ length: 10 }, (_, i) => i);
  const cols = [0, 1, 2, 3];

  return (
    <svg
      viewBox="0 0 200 280"
      role="img"
      aria-label={alt}
      style={{ width: "100%", height: "100%", display: "block", backgroundColor: "#fff", ...style }}
    >
      <rect x="4" y="4" width="6" height="6" fill="#111" />
      <rect x="190" y="4" width="6" height="6" fill="#111" />
      <rect x="4" y="270" width="6" height="6" fill="#111" />
      <rect x="190" y="270" width="6" height="6" fill="#111" />

      <rect x="40" y="12" width="90" height="7" rx="2" fill="#b91c1c" opacity="0.85" />
      <rect x="40" y="23" width="60" height="3" rx="1" fill="#94a3b8" />
      <rect x="138" y="12" width="48" height="16" fill="#1f2937" opacity="0.85" />

      {blocks.map((b) => (
        <g key={b} transform={`translate(${14 + (b % 2) * 90}, ${48 + Math.floor(b / 2) * 100})`}>
          <rect width="82" height="88" fill="none" stroke="#cbd5e1" strokeWidth="0.6" />
          {rows.map((r) =>
            cols.map((c) => (
              <circle
                key={`${r}-${c}`}
                cx={16 + c * 16}
                cy={10 + r * 8}
                r="2.6"
                fill={(r * 3 + c * 5 + b) % 7 === 0 ? "#334155" : "none"}
                stroke="#94a3b8"
                strokeWidth="0.5"
              />
            ))
          )}
        </g>
      ))}

      <rect x="14" y="252" width="172" height="12" fill="none" stroke="#e2e8f0" strokeWidth="0.6" />
    </svg>
  );
};

export default OmrPreview;