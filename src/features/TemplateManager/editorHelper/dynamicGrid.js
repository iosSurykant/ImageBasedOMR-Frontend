const DynamicGrid = ({
  width,
  height,
  rows,
  cols,
  name,
  radius: radiusFactor = 0.35,
  bubbleColor = "transparent",
  borderColor = "#555d6e",
  selectedBoxId,
  box
}) => {
  const numRows = Number(rows);
  const numCols = Number(cols);

  const gridWidth = Number(width);
  const gridHeight = Number(height);

  const totalBubbles = numRows * numCols;

  if (
    !numRows ||
    !numCols ||
    totalBubbles <= 0 ||
    !gridWidth ||
    !gridHeight
  ) {
    return null;
  }

  const cellWidth = gridWidth / numCols;
  const cellHeight = gridHeight / numRows;

  const factor =
    Number(radiusFactor) > 1
      ? Number(radiusFactor) / 10
      : Number(radiusFactor);

  const bubbleSize = Math.max(
    Math.min(cellWidth, cellHeight) * factor * 2,
    2
  );

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%", overflow: "visible", boxSizing: "border-box", backgroundColor: "rgba(36, 96, 251, 0.22)", border: box.id === selectedBoxId ? "1px solid #FF0000" : "1px solid #2460FB", userSelect: "none", }}>
      {/* Field Name */}
      {name && (
        <div style={{ position: "absolute", bottom: "100%", left: "0px", fontSize: "6px", lineHeight: "8px", fontWeight: 400, color: "#FFFFFF", backgroundColor: "#2460FB", padding: "1px 3px", whiteSpace: "nowrap", pointerEvents: "none", fontFamily: "outfit, sans-serif", zIndex: 9999, }}>
          {name}
        </div>
      )}

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${gridWidth} ${gridHeight}`}
        preserveAspectRatio="none"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
        }}>
        {Array.from({ length: totalBubbles }).map(
          (_, index) => {
            const row = Math.floor(index / numCols);
            const col = index % numCols;
            const centerX =
              col * cellWidth +
              cellWidth / 2;
            const centerY =
              row * cellHeight +
              cellHeight / 2;

            return (
              <rect
                key={index}
                x={centerX - bubbleSize / 2}
                y={centerY - bubbleSize / 2}
                width={bubbleSize}
                height={bubbleSize}
                fill={bubbleColor}
                stroke={borderColor}
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
              />
            );
          }
        )}
      </svg>
    </div>
  );
};

export default DynamicGrid;