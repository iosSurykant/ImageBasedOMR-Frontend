const DynamicGrid = ({
  width,
  height,
  rows,
  cols,
  name,
  radius: radiusFactor = 0.35,
  bubbleColor = 'transparent',
  borderColor = '#555d6e',
}) => {
  const numRows = Number(rows);
  const numCols = Number(cols);
  const totalBubbles = numRows * numCols;
  
  if (!numRows || !numCols || totalBubbles <= 0 || !width || !height) {
    return null;
  }


  const cellWidth = Number(width) / numCols;
  const cellHeight = Number(height) / numRows;

  const factor = Number(radiusFactor) > 1 ? Number(radiusFactor) / 10 : Number(radiusFactor);

  const calculatedRadius = Math.min(cellWidth, cellHeight) * factor;
  const bubbleDiameter = Math.max(calculatedRadius * 2, 2); 

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      
      {/* 2. FLOATING NAME LABEL */}
      {name && (
        <div
        className="px-1 rounded-sm"
          style={{
            position: 'absolute',
            top: '-8px', 
            left: '0px',
            fontSize: '6px',
            fontWeight: 400,
            color: '#FFFFFF',
            backgroundColor: '#2460FB', 
            whiteSpace: 'nowrap',
            pointerEvents: 'none', 
            fontFamily: 'outfit, sans-serif',
          }}
        >
          {name}
        </div>
      )}

      {/* 3. ORIGINAL GRID */}
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'grid',
          gridTemplateColumns: `repeat(${numCols}, 1fr)`,
          gridTemplateRows: `repeat(${numRows}, 1fr)`,
          placeItems: 'center',
          backgroundColor: 'rgba(36, 96, 251, 0.22)',
          border: `1px solid #2460FB`,
          borderRadius: '2px',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {Array.from({ length: totalBubbles }).map((_, index) => (
          <div
            key={index}
            style={{
              width: `${bubbleDiameter}px`,
              height: `${bubbleDiameter}px`,
              borderRadius: '50%',
              backgroundColor: bubbleColor,
              border: `1px solid ${borderColor}`,
              boxSizing: 'border-box',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DynamicGrid;