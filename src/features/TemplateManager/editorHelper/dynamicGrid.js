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

  // 1. Force strict integer sizes for the cells
  const cellWidth = Math.floor(Number(width) / numCols);
  const cellHeight = Math.floor(Number(height) / numRows);

  const factor = Number(radiusFactor) > 1 ? Number(radiusFactor) / 10 : Number(radiusFactor);
  const calculatedRadius = Math.min(cellWidth, cellHeight) * factor;
  
  // 2. Force strict integer sizes for the bubbles
  const bubbleDiameter = Math.max(Math.floor(calculatedRadius * 2), 2); 

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      
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

      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'grid',
          // 3. Use strict pixel values instead of '1fr'
          gridTemplateColumns: `repeat(${numCols}, ${cellWidth}px)`,
          gridTemplateRows: `repeat(${numRows}, ${cellHeight}px)`,
          // 4. Distribute any leftover sub-pixel gaps evenly
          justifyContent: 'space-evenly', 
          alignContent: 'space-evenly',
          placeItems: 'center',
          backgroundColor: 'rgba(36, 96, 251, 0.22)',
          border: `1px solid #2460FB`,
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
              backgroundColor: bubbleColor,
              // 5. Use box-shadow instead of border to prevent pixel snapping
              boxShadow: `inset 0 0 0 0.5px ${borderColor}`,
              boxSizing: 'border-box',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DynamicGrid;