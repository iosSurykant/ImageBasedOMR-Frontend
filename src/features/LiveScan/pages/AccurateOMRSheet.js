import React from 'react';

function AccurateOMRSheet({ row }) {
  // Extract the image URL from row.FileName (or fallback properties if available)
  const imageUrl = row?.FileName || row?.fileName || row?.imageUrl;


  return (
    <div 
      className="omr-sheet-paper-accurate" 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: '100%', 
        height: '100%',
        padding: '8px'
      }}
    >
      {imageUrl ? (
        <img
          src={process.env.REACT_APP_BACKEND_URL + imageUrl}
          alt={row?.FileName ? row.FileName.split('/').pop() : "Scanned OMR Sheet"}
          style={{
            maxWidth: '100%',
            height: 'auto',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        />
      ) : (
        <div className="text-center text-muted p-4">
          <i className="fas fa-image fa-2x mb-2 d-block text-secondary"></i>
          No image preview available
        </div>
      )}
    </div>
  );
}

export default AccurateOMRSheet;