import axiosApi from 'Interceptor/axios';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react';
import { useDispatch } from 'react-redux';
import { getLayoutData } from 'redux/reducers/templateSlice';

const GEO_KEYS = ['x', 'y', 'width', 'height'];
const scaleGeo = (obj, s) => {
  const out = { ...obj };
  GEO_KEYS.forEach((k) => {
    if (typeof obj[k] === 'number') out[k] = obj[k] * s;
  });
  return out;
};

const AccurateOMRSheet = forwardRef(({ row, tId, activeField, modalViewportRef, setModalZoom, setModalPan }, ref) => {
  const imageUrl = row?.FileName || row?.fileName || row?.imageUrl;
  const dispatch = useDispatch();
  const [jsonData, setJsonData] = useState();
  const [scale, setScale] = useState(null);
  const imgRef = useRef(null);
  const [boxes, setBoxes] = useState([]);

  const getJsonData = useCallback(async () => {
    if (!tId) return;
    try {
      const { payload } = await dispatch(getLayoutData(tId));
      const jsonXPath = payload?.data?.jsonPath;
      if (!jsonXPath) throw new Error('JSON path not found');

      const encodedPath = jsonXPath
        .split('/')
        .map(encodeURIComponent)
        .join('/');

      const { data } = await axiosApi.get(
        `${process.env.REACT_APP_BACKEND_URL}${encodedPath}`
      );
      setJsonData(data);
    } catch (error) {
      console.error('Error fetching template data:', error);
    }
  }, [tId, dispatch]);

  useEffect(() => {
    getJsonData();
  }, [getJsonData]);

  const handleImageLoad = (e) => {
    const img = e.currentTarget;
    const displayedWidth = img.width || img.offsetWidth;
    if (img.naturalWidth && img.naturalHeight && displayedWidth) {
      setScale(displayedWidth / img.naturalWidth);
    }
  };

  // Advanced matcher for both question ranges and metadata fields
  const isFieldSelected = (field, activeF) => {
    if (!activeF) return false;
    const fName = field.fieldName || "";

    // 1. Exact match check
    if (fName.toLowerCase() === activeF.toLowerCase()) return true;

    // 2. Question number/range check (e.g. "Q3" inside "Q1-Q5")
    const qNumMatch = activeF.match(/^Q(\d+)$/i);
    if (qNumMatch) {
      const qNum = parseInt(qNumMatch[1], 10);
      const rangeMatch = fName.match(/Q(\d+)\s*-\s*Q(\d+)/i);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        if (qNum >= start && qNum <= end) return true;
      }
    }

    // 3. Flexible metadata field match (ignoring spaces, casing, or underscores)
    const normalize = (str) => str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    if (normalize(fName) === normalize(activeF)) return true;

    return false;
  };

  // Expose zoom/pan method for any clicked field name
  useImperativeHandle(ref, () => ({
    zoomToField(fieldName) {
      if (!jsonData || !jsonData.fields || scale === null) return;

      const targetField = jsonData.fields.find((field) => isFieldSelected(field, fieldName));
      if (!targetField) return;

      const viewport = modalViewportRef?.current;
      if (!viewport) return;

      const viewportWidth = viewport.clientWidth;
      const viewportHeight = viewport.clientHeight;

      const targetZoom = 200; // 200% zoom focus level
      const scaleFactor = targetZoom / 100;

      const renderedX = targetField.x * scale;
      const renderedY = targetField.y * scale;
      const renderedW = targetField.width * scale;
      const renderedH = targetField.height * scale;

      const boxCenterX = renderedX + (renderedW / 2);
      const boxCenterY = renderedY + (renderedH / 2);

      const newPanX = (viewportWidth / 2) - boxCenterX;
      const newPanY = (viewportHeight / 2) - boxCenterY;

      setModalZoom(targetZoom);
      setModalPan({ x: newPanX, y: newPanY });
    }
  }));

  useEffect(() => {
    if (!jsonData || scale === null) {
      setBoxes([]);
      return;
    }
    const fields = jsonData.fields || [];
    const scaled = fields.map((f) => {
      const scaledObj = scaleGeo(f, scale);
      return {
        ...scaledObj,
        isSelected: isFieldSelected(f, activeField)
      };
    });
    setBoxes(scaled);
  }, [jsonData, scale, activeField]);

  return (
    <div
      className="omr-sheet-paper-accurate"
      style={{ width: '100%', height: '100%', position: 'relative' }} >
      {imageUrl ? (
        <>
          <img
            src={`${process.env.REACT_APP_BACKEND_URL + imageUrl}`}
            alt={row?.FileName ? row.FileName.split('/').pop() : 'Scanned OMR Sheet'}
            onLoad={handleImageLoad}
            style={{ width: '100%', height: 'auto', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'block', }}
            ref={imgRef}
          />
          {/* Render ONLY the selected field box when clicked */}
          {boxes
            .filter((box) => box.isSelected)
            .map((box, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: box.x,
                  top: box.y,
                  width: box.width,
                  height: box.height,
                  border: '1px solid rgba(0,123,255,0.6)',
                  backgroundColor: 'rgba(0,123,255,0.1)',
                  pointerEvents: 'none',
                  boxSizing: 'box-border',
                  transition: 'all 0.2s ease-in-out',
                  zIndex: 10
                }}
              />
            ))}
        </>
      ) : (
        <div className="text-center text-muted p-4">
          <i className="fas fa-image fa-2x mb-2 d-block text-secondary"></i>
          No image preview available
        </div>
      )}
    </div>
  );
});

export default AccurateOMRSheet;