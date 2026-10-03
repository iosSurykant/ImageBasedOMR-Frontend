/* eslint-disable array-callback-return */
import React, { useEffect, useState, useRef, useCallback, useMemo, } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GoArrowLeft } from 'react-icons/go';
import { FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { Rnd } from 'react-rnd';

// Redux Toolkit
import { useDispatch, useSelector } from 'react-redux';
import { getLayoutData, updateTemplateData, } from 'redux/reducers/templateSlice';
import { updateSkewPosition, updateSkewDimensions, } from 'redux/reducers/skewSlice';
import { updateBoxGeometry } from 'redux/reducers/boxSlice';

// Components
import Controls from './editorHelper/controls';
import Skews from './editorHelper/skews';
import MappingForm from './editorHelper/BoxForm';
import DynamicGrid from './editorHelper/dynamicGrid';
import { selectBox } from 'redux/reducers/boxSlice';
import { isFormPanelOpen } from 'redux/reducers/tempControlSlice';
import axiosApi from 'Interceptor/axios';
import { toast } from 'react-toastify';
import { setSelectedSkewCorners } from 'redux/reducers/skewSlice';
import { renderBoxes } from 'redux/reducers/boxSlice';
import MergeModal from './editorHelper/mergeModel';

const tourSteps = [
  {
    title: 'Toolbar',
    target: '#tour-body',
    content:
      'This is your main floating control panel. From here, you can manage all your workspace tools.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    title: 'Skew Calibration Switch',
    target: '#tour-skew-btn',
    content:
      'Toggle this switch to view and adjust the four red skew corners on your document.',
    placement: 'top',
  },
  {
    title: 'Hand Tool',
    target: '#tour-pan-btn',
    content:
      'Click the Hand tool to drag and pan around your canvas without moving any boxes.',
    placement: 'top',
  },
  {
    title: 'Add Mapping box',
    target: '#tour-add-btn',
    content:
      'Click the Plus icon to open the Form Panel and create a new OMR area.',
    placement: 'top',
  },
  {
    title: 'Duplicate / Copy Box',
    target: '#tour-duplicate-btn',
    content:
      'Select an existing box on the canvas, then click here to instantly duplicate it.',
    placement: 'top',
  },
  {
    title: 'Delete Mapping box',
    target: '#tour-delete-btn',
    content: 'Select a box and click the trash can to delete it.',
    placement: 'top',
  },
  {
    title: 'Merge / Group Boxes',
    target: '#tour-merge-btn',
    content:
      'Need to combine fields? Click here to open the Merge Panel and group boxes together.',
    placement: 'top',
  },
  {
    title: 'Save Template',
    target: '#tour-save-btn',
    content: 'Click here to save your template.',
    placement: 'top',
  },
  {
    title: 'Zoom In / Out',
    target: '#tour-zoom-btn',
    content: 'Use these buttons to zoom in and out of the canvas.',
    placement: 'top',
  },
  {
    title: 'Back to templates List',
    target: '#tour-back-btn',
    content: 'Click here to go back to the templates list.',
    placement: 'top',
  },
];

const GEO_KEYS = ['x', 'y', 'width', 'height'];

// image px -> screen px (no rounding, so nothing drifts on load/save)
const scaleGeo = (obj, s) => {
  const out = { ...obj };
  GEO_KEYS.forEach((k) => {
    if (typeof obj[k] === 'number') out[k] = obj[k] * s;
  });
  return out;
};


// const normalizeCorners = (json) => {
//   // New format: array with one object containing the four corners
//   if (Array.isArray(json?.referncefield) && json.referncefield.length === 1) {
//     const obj = json.referncefield[0];
//     if (obj.topLeft && obj.bottomLeft && obj.topRight && obj.bottomRight) {
//       return {
//         topLeft: { ...obj.topLeft, selected: true },
//         bottomLeft: { ...obj.bottomLeft, selected: true },
//         topRight: { ...obj.topRight, selected: true },
//         bottomRight: { ...obj.bottomRight, selected: true },
//       };
//     }
//   }

//   // Existing format: object keyed by corner names
//   if (json?.referncefield && Object.keys(json.referncefield).length) {
//     return Object.fromEntries(
//       Object.entries(json.referncefield).map(([key, value]) => [
//         key,
//         { ...value, selected: true },
//       ])
//     );
//   }

//   // Existing format: referenceCoordinate array
//   if (Array.isArray(json?.referenceCoordinate)) {
//     return json.referenceCoordinate.reduce((acc, c) => {
//       acc[c.position] = {
//         x: c.x,
//         y: c.y,
//         width: c.width,
//         height: c.height,
//         selected: true,
//       };
//       return acc;
//     }, {});
//   }

//   return null;
// };


const normalizeCorners = (json) => {
  // New format:
  // referncefield: [
  //   {
  //     topLeft: {...},
  //     topRight: {...}
  //   }
  // ]
  if (
    Array.isArray(json?.referncefield) &&
    json.referncefield.length > 0
  ) {
    const obj = json.referncefield[0];

    if (obj && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          key,
          {
            ...value,
            selected: true,
          },
        ])
      );
    }
  }

  // Old format:
  // referncefield: {
  //   topLeft: {...},
  //   topRight: {...}
  // }
  if (
    json?.referncefield &&
    !Array.isArray(json.referncefield) &&
    Object.keys(json.referncefield).length > 0
  ) {
    return Object.fromEntries(
      Object.entries(json.referncefield).map(([key, value]) => [
        key,
        {
          ...value,
          selected: true,
        },
      ])
    );
  }

  // Existing format:
  // referenceCoordinate: [
  //   {
  //     position: "topLeft",
  //     x: ...,
  //     y: ...,
  //     width: ...,
  //     height: ...
  //   }
  // ]
  if (Array.isArray(json?.referenceCoordinate)) {
    return json.referenceCoordinate.reduce((acc, c) => {
      if (!c?.position) return acc;

      acc[c.position] = {
        x: c.x,
        y: c.y,
        width: c.width,
        height: c.height,
        selected: true,
      };

      return acc;
    }, {});
  }

  return null;
};



// Works in whatever space the box is passed in (we pass image-space boxes)
const getBubbleCoordinates = (box) => {
  if (!box) return [];

  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    totalRow = 0,
    totalCol = 0,
  } = box;
  const rows = Number(totalRow);
  const cols = Number(totalCol);

  if (!rows || !cols || rows <= 0 || cols <= 0 || !width || !height) return [];

  const cellWidth = width / cols;
  const cellHeight = height / rows;

  const rawRadius = box?.radius ?? 0.35;
  const rScale = rawRadius > 1 ? rawRadius / 10 : rawRadius;
  const radius = Math.min(cellWidth, cellHeight) * rScale;

  const bubbles = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = x + col * cellWidth + cellWidth / 2;
      const cy = y + row * cellHeight + cellHeight / 2;
      bubbles.push({
        x: Math.round(cx - radius + 1.7),
        y: Math.round(cy - radius + 1.7),
        width: Math.round(radius * 2),
        height: Math.round(radius * 2),
        row,
        col,
      });
    }
  }
  return bubbles;
};

const getMergeBoxCoordinates = (selectedBoxes) => {
  if (!selectedBoxes || selectedBoxes.length === 0) return null;

  const first = selectedBoxes[0];
  let minX = first.x;
  let minY = first.y;
  let maxX = first.x + first.width;
  let maxY = first.y + first.height;

  for (let i = 1; i < selectedBoxes.length; i++) {
    const b = selectedBoxes[i];
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

const TemplateEditor = () => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [jsonData, setJsonData] = useState([]);
  const [boxGeometry, setBoxGeometry] = useState({});
  const [runTour, setRunTour] = useState(false);

  // displayed width / natural width of the template image (null until loaded)
  const [scale, setScale] = useState(null);

  // PAN / DRAG
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const { Id } = useParams();
  const [activeSkewCorner, setActiveSkewCorner] = useState(null);

  const containerRef = useRef(null);
  const imageRef = useRef(null); // wrapper div = coordinate space used by Rnd

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 300));
  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const nextZoom = Math.max(prev - 10, 50);
      if (nextZoom === 50) setPosition({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { layoutData } = useSelector((state) => state.templates);
  const tempData = layoutData;
  const skewData = useSelector((state) => state.skew.skewData);
  const isPanelOpen = useSelector((state) => state.skew.isPanelOpen);

  const isPanMode = useSelector((state) => state.tempControl.isPanModeActive);
  const isFormOpen = useSelector((state) => state.tempControl.isFormPanelOpen);
  const isMergePanel = useSelector(
    (state) => state.tempControl.isMergePanelOpen,
  );

  const boxes = useSelector((state) => state.BoxData.boxes);
  const mergeFields = useSelector((state) => state.BoxData.mergefields);
  const selectedBoxId = useSelector((state) => state.BoxData.selectedBoxId);

  // Measure scale once the image has loaded.
  // offsetWidth ignores CSS transform, so zoom does not affect it.
  const handleImageLoad = (e) => {
    const img = e.currentTarget;
    const displayedWidth = imageRef.current?.offsetWidth || img.offsetWidth;
    if (img.naturalWidth && displayedWidth) {
      setScale(displayedWidth / img.naturalWidth);
    }
  };

  // FETCH TEMPLATE JSON
  const getJsonData = useCallback(async () => {
    if (!Id) return;

    try {
      const { payload } = await dispatch(getLayoutData(Id));
      const jsonXPath = payload?.data?.jsonPath;
      if (!jsonXPath) throw new Error('JSON path not found');

      const encodedPath = jsonXPath.split('/').map(encodeURIComponent).join('/');

      const { data } = await axiosApi.get(
        `${process.env.REACT_APP_BACKEND_URL}${encodedPath}`,
      );
      setJsonData(data);
    } catch (error) {
      console.error('Error fetching template data:', error);
    }
  }, [Id, dispatch]);

  useEffect(() => {
    getJsonData();
  }, [getJsonData]);

  // LOAD: image px -> screen px, then push into Redux (runs once per file)
  // useEffect(() => {
  //   if (!scale || !jsonData) return;


  //   const corners = normalizeCorners(jsonData);
  //   if (!Array.isArray(jsonData.fields) && !corners) return;

  //   console.log(jsonData)
  //   console.log(corners)

  //   const fields = (jsonData.fields || []).map((f) => scaleGeo(f, scale));

  //   dispatch(
  //     renderBoxes({
  //       ...jsonData,
  //       mergedfields: jsonData.mergedfields ?? jsonData.mergedFields ?? [],
  //       fields,
  //     }),
  //   );

  //   if (corners) {
  //     const scaledCorners = Object.fromEntries(
  //       Object.entries(corners).map(([key, p]) => [key, scaleGeo(p, scale)]),
  //     );
  //     dispatch(setSelectedSkewCorners(scaledCorners));
  //   }

  //   setBoxGeometry({});
  // }, [scale, jsonData, dispatch]);


  useEffect(() => {
  if (!scale || !jsonData) return;

  const corners = normalizeCorners(jsonData);

  if (!Array.isArray(jsonData.fields) && !corners) return;

  console.log("JSON DATA:", jsonData);
  console.log("NORMALIZED CORNERS:", corners);

  const fields = (jsonData.fields || []).map((f) =>
    scaleGeo(f, scale)
  );

  dispatch(
    renderBoxes({
      ...jsonData,
      mergedfields:
        jsonData.mergedfields ??
        jsonData.mergedFields ??
        [],
      fields,
    })
  );

  if (corners && Object.keys(corners).length > 0) {
    const scaledCorners = Object.fromEntries(
      Object.entries(corners).map(([key, point]) => [
        key,
        scaleGeo(point, scale),
      ])
    );

    dispatch(setSelectedSkewCorners(scaledCorners));
  }

  setBoxGeometry({});
}, [scale, jsonData, dispatch]);


  const getBoxGeometry = (box) =>
    boxGeometry[box.id] || {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    };

  // MERGE BOUNDARIES (screen space, derived from live boxes)
  const mergeBoundaries = useMemo(() => {
    if (!mergeFields || mergeFields.length === 0 || !boxes) return [];

    return mergeFields
      .map((mergeGroup) => {
        const liveGroup = boxes.filter((b) =>
          mergeGroup.childrenIds.includes(b.id),
        );
        if (liveGroup.length === 0) return null;

        const coords = getMergeBoxCoordinates(liveGroup);
        if (!coords) return null;

        return {
          id: mergeGroup.mergeId,
          name: mergeGroup.fieldName,
          ...coords,
        };
      })
      .filter(Boolean);
  }, [boxes, mergeFields]);

  // Selected skew corners (screen space)
  const activeSkewCoordinates = useMemo(
    () =>
      Object.entries(skewData || {}).reduce((acc, [key, point]) => {
        if (point.selected) {
          acc[key] = {
            x: point.x,
            y: point.y,
            width: point.width,
            height: point.height,
            selected: point.selected,
          };
        }
        return acc;
      }, {}),
    [skewData],
  );

  // SAVE: screen px -> image px
  const handleSaveTemplate = useCallback(async () => {
    if (!tempData?.data?.fileName) return;
    // Measure at save time so we never depend on a stale/missing state value
    const wrap = imageRef.current;
    const imgEl = wrap?.querySelector('img');
    const liveScale =
      wrap && imgEl?.naturalWidth
        ? wrap.offsetWidth / imgEl.naturalWidth
        : null;

    // console.log('SAVE scale check:', {
    //   displayedWidth: wrap?.offsetWidth,
    //   naturalWidth: imgEl?.naturalWidth,
    //   liveScale,
    //   stateScale: scale,
    // });

    if (!liveScale || !isFinite(liveScale)) {
      toast.error('Image is still loading, please try again');
      return;
    }

    const { fileName } = tempData.data;
    const toImg = (v) => Math.round(v / liveScale);

    const fields = boxes.map((box) => {
      const imgBox = {
        ...box,
        x: toImg(box.x),
        y: toImg(box.y),
        width: toImg(box.width),
        height: toImg(box.height),
      };
      return { ...imgBox, bubbles: getBubbleCoordinates(imgBox) };
    });

   const selectedReferences = Object.entries(
  activeSkewCoordinates || {}
);

const referncefield =
  selectedReferences.length > 0
    ? [
        Object.fromEntries(
          selectedReferences.map(([position, point]) => [
            position,
            {
              x: toImg(point.x),
              y: toImg(point.y),
              width: toImg(point.width),
              height: toImg(point.height),
            },
          ])
        ),
      ]
    : [];

const referenceCoordinate =
  selectedReferences.length > 0
    ? selectedReferences.map(([position, point]) => ({
        position,
        width: toImg(point.width),
        height: toImg(point.height),
        x: toImg(point.x),
        y: toImg(point.y),
      }))
    : [];
    // const templateData = {
    //   name: fileName,
    //   fields,
    //   mergedfields: mergeFields,
    //   mergedFields: mergeFields, // old key (capital F) that the old JSON used
    //   referncefield,
    //   referenceCoordinate, // old key the backend/engine most likely reads
    // }; 


const templateData = {
  name: fileName,
  fields,
  // mergedfields: mergeFields,
  mergedFields: mergeFields,
  referncefield,
  referenceCoordinate,
};

    console.log('SAVING templateData:', templateData);

    const jsonFileName = fileName.endsWith('.json')
      ? fileName
      : `${fileName}.json`;

    const jsonFile = new File([JSON.stringify(templateData)], jsonFileName, {
      type: 'application/json',
    });

    try {
      await dispatch(
        updateTemplateData({ FileName: fileName, tempName: jsonFile }),
      );
      navigate('/app/template');
    } catch (error) {
      toast.error('Failed to save template');
    }
  }, [
    tempData?.data,
    boxes,
    mergeFields,
    activeSkewCoordinates,
    scale,
    dispatch,
    navigate,
  ]);

  // KEYBOARD: ARROW KEY PANNING & BOX MOVEMENT
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key))
        return;
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      )
        return;

      e.preventDefault();
      const MOVE_STEP = 1;

      // 1. Skew corner
      if (activeSkewCorner && skewData[activeSkewCorner] && !isPanMode) {
        const currentPoint = skewData[activeSkewCorner];
        let newX = currentPoint.x;
        let newY = currentPoint.y;

        if (e.key === 'ArrowLeft') newX -= MOVE_STEP;
        if (e.key === 'ArrowRight') newX += MOVE_STEP;
        if (e.key === 'ArrowUp') newY -= MOVE_STEP;
        if (e.key === 'ArrowDown') newY += MOVE_STEP;

        dispatch(
          updateSkewPosition({ corner: activeSkewCorner, x: newX, y: newY }),
        );
        return;
      }

      // 2. Selected box
      if (selectedBoxId && !isPanMode) {
        const selectedBox = boxes.find((b) => b.id === selectedBoxId);
        if (!selectedBox) return;

        const currentGeo = boxGeometry[selectedBoxId] || {
          x: selectedBox.x,
          y: selectedBox.y,
          width: selectedBox.width,
          height: selectedBox.height,
        };

        let newX = currentGeo.x;
        let newY = currentGeo.y;

        if (e.key === 'ArrowLeft') newX -= MOVE_STEP;
        if (e.key === 'ArrowRight') newX += MOVE_STEP;
        if (e.key === 'ArrowUp') newY -= MOVE_STEP;
        if (e.key === 'ArrowDown') newY += MOVE_STEP;

        setBoxGeometry((prev) => ({
          ...prev,
          [selectedBoxId]: { ...currentGeo, x: newX, y: newY },
        }));

        dispatch(
          updateBoxGeometry({
            id: selectedBoxId,
            x: newX,
            y: newY,
            width: currentGeo.width,
            height: currentGeo.height,
          }),
        );
        return;
      }

      // 3. Canvas panning
      const PAN_STEP = 20;
      setPosition((prevPos) => {
        let newX = prevPos.x;
        let newY = prevPos.y;

        if (e.key === 'ArrowLeft') newX += PAN_STEP;
        if (e.key === 'ArrowRight') newX -= PAN_STEP;
        if (e.key === 'ArrowUp') newY += PAN_STEP;
        if (e.key === 'ArrowDown') newY -= PAN_STEP;

        if (!containerRef.current || !imageRef.current)
          return { x: newX, y: newY };

        const containerRect = containerRef.current.getBoundingClientRect();
        const zoom = zoomLevel / 100;
        const scaledWidth = imageRef.current.offsetWidth * zoom;
        const scaledHeight = imageRef.current.offsetHeight * zoom;

        const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
        const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

        return {
          x: Math.min(Math.max(newX, -maxX), maxX),
          y: Math.min(Math.max(newY, -maxY), maxY),
        };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    zoomLevel,
    selectedBoxId,
    boxes,
    boxGeometry,
    dispatch,
    isPanMode,
    activeSkewCorner,
    skewData,
  ]);

  // MOUSE PAN
  const handleMouseDown = (e) => {
    if (!isPanMode) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // ALT + MOUSE WHEEL ZOOM
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (!e.altKey) return;
      e.preventDefault();
      const ZOOM_STEP = 10;

      if (e.deltaY < 0) {
        setZoomLevel((prev) => Math.min(prev + ZOOM_STEP, 300));
      } else if (e.deltaY > 0) {
        setZoomLevel((prev) => {
          const nextZoom = Math.max(prev - ZOOM_STEP, 50);
          if (nextZoom === 50) setPosition({ x: 0, y: 0 });
          return nextZoom;
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseMove = (e) => {
    if (!isDragging || !isPanMode) return;
    if (!containerRef.current || !imageRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const targetX = e.clientX - dragStartRef.current.x;
    const targetY = e.clientY - dragStartRef.current.y;

    const zoom = zoomLevel / 100;
    const scaledWidth = imageRef.current.offsetWidth * zoom;
    const scaledHeight = imageRef.current.offsetHeight * zoom;

    const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

    setPosition({
      x: Math.min(Math.max(targetX, -maxX), maxX),
      y: Math.min(Math.max(targetY, -maxY), maxY),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleBoxClick = (box) => {
    dispatch(isFormPanelOpen(box));
    dispatch(selectBox(box.id));
    setActiveSkewCorner(null);
  };

  const startTour = () => {
    setRunTour(false);
    setTimeout(() => setRunTour(true), 100);
  };

  const handleTourCallback = (data) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') setRunTour(false);
  };

  // Rnd helper: keep sub-pixel precision (no Math.round before Redux)
  const px = (v) => parseFloat(v);

  return (
    <div style={{ backgroundColor: 'white', height: '100%' }}>
      {/* ACTION TOOLBAR */}
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <div className='d-flex align-items-center justify-content-center'>
          <button
            id='tour-back-btn'
            onClick={() => navigate(-1)}
            className='border-0 shadow-none rounded mr-1 pb-1'
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#E8E8E8')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
            style={{ cursor: 'pointer', backgroundColor: 'white' }}
          >
            <GoArrowLeft size={22} />
          </button>

          <div
            className='d-flex align-items-center'
            style={{ fontFamily: 'outfit', fontWeight: 600 }}
          >
            <h5 className='d-none d-lg-block text-dark mb-0 mr-2 text-nowrap'>
              Template Name
            </h5>

            <span
              className='form-control bg-white border-1 px-3'
              style={{
                borderRadius: '8px',
                color: '#495057',
                fontWeight: 500,
                minWidth: '210px',
                overflowX: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {tempData?.data?.fileName}
            </span>
          </div>
        </div>

        <div className='d-flex align-items-center'>
          <button
            type='button'
            onClick={startTour}
            title='Start Editor Tour'
            className='btn btn-primary px-4 py-2 mr-3'
            style={{
              fontWeight: 500,
              fontFamily: 'outfit',
              backgroundColor: '#2563eb',
              borderColor: '#2563eb',
              borderRadius: '8px',
            }}
          >
            Tutorial Tour
          </button>

          <div
            id='tour-zoom-btn'
            className='bg-white border rounded-lg shadow-sm d-flex align-items-center px-2 mr-3'
            style={{ borderRadius: '8px' }}
          >
            <button
              type='button'
              className='btn btn-link border-0 shadow-none text-muted p-2 mr-0'
              onClick={handleZoomIn}
            >
              <FiZoomIn size={22} />
            </button>

            <span className='font-weight-bold text-primary px-2'>
              {zoomLevel}%
            </span>

            <button
              type='button'
              className='btn btn-link border-0 shadow-none text-muted p-2'
              onClick={handleZoomOut}
            >
              <FiZoomOut size={22} />
            </button>
          </div>

          <button
            id='tour-save-btn'
            onClick={handleSaveTemplate}
            type='button'
            className='btn btn-primary px-4 py-2'
            style={{
              fontWeight: 500,
              fontFamily: 'outfit',
              backgroundColor: '#2563eb',
              borderColor: '#2563eb',
              borderRadius: '8px',
            }}
          >
            Save <span>Template</span>
          </button>
        </div>
      </div>

      {/* CANVAS WORKSPACE AREA */}
      <div
        ref={containerRef}
        className='position-relative rounded-lg overflow-hidden shadow-sm d-flex justify-content-center align-items-center'
        style={{
          height: '90%',
          backgroundColor: '#EAF2FC',
          backgroundImage: 'radial-gradient(#cbd5e1 2.5px, transparent 1.5px)',
          backgroundSize: '35px 35px',
          cursor: isPanMode ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className='position-relative bg-white shadow-lg rounded p-2'
          style={{
            maxWidth: '450px',
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel / 100})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            userSelect: 'none',
            display: 'inline-block',
          }}
        >
          <div
            ref={imageRef}
            className='position-relative'
            style={{ width: '100%', height: '100%' }}
          >
            {/* NOTE: no "border" class on the image, so the image edge == Rnd coordinate origin */}
            <img
              src={process.env.REACT_APP_BACKEND_URL + tempData?.data?.imgPath}
              alt='OMR Document'
              className='img-fluid'
              onLoad={handleImageLoad}
              style={{ display: 'block', pointerEvents: 'none', width: '100%' }}
            />

            {/* Active Skew Boxes */}
            {skewData &&
              Object.entries(skewData).map(([corner, point]) => {
                if (!point?.selected) return null;

                return (
                  <Rnd
                    key={corner}
                    onMouseDown={() => setActiveSkewCorner(corner)}
                    position={{ x: point.x, y: point.y }}
                    size={{ width: point.width, height: point.height }}
                    scale={zoomLevel / 100}
                    bounds='parent'
                    disableDragging={isPanMode}
                    enableResizing={
                      isPanMode
                        ? false
                        : {
                          top: false,
                          right: false,
                          bottom: false,
                          left: false,
                          topRight: true,
                          bottomRight: true,
                          bottomLeft: true,
                          topLeft: true,
                        }
                    }
                    style={{
                      backgroundColor: 'rgba(255, 193, 7, 0.65)',
                      border: '1px solid #dc3545',
                      boxSizing: 'border-box',
                      zIndex: 900,
                      pointerEvents: isPanMode ? 'none' : 'auto',
                    }}
                    onDragStop={(e, d) => {
                      dispatch(updateSkewPosition({ corner, x: d.x, y: d.y }));
                    }}
                    onResizeStop={(e, direction, ref, delta, pos) => {
                      dispatch(
                        updateSkewDimensions({
                          corner,
                          width: px(ref.style.width),
                          height: px(ref.style.height),
                          x: pos.x,
                          y: pos.y,
                          selected: point.selected,
                        }),
                      );
                    }}
                  />
                );
              })}

            {/* Dynamic Grid Boxes */}
            {boxes.map((box) => {
              const geometry = getBoxGeometry(box);

              const patchGeo = (patch) =>
                setBoxGeometry((prev) => ({
                  ...prev,
                  [box.id]: {
                    ...(prev[box.id] || {
                      x: box.x,
                      y: box.y,
                      width: box.width,
                      height: box.height,
                    }),
                    ...patch,
                  },
                }));

              return (
                <Rnd
                  key={box.id}
                  position={{ x: geometry.x, y: geometry.y }}
                  size={{ width: geometry.width, height: geometry.height }}
                  scale={zoomLevel / 100}
                  bounds='parent'
                  disableDragging={isPanMode}
                  onMouseDown={() => {
                    if (!isPanMode) handleBoxClick(box);
                  }}
                  style={{
                    pointerEvents: isPanMode ? 'none' : 'auto',
                    zIndex: 800,
                  }}
                  onDrag={(e, d) => patchGeo({ x: d.x, y: d.y })}
                  onDragStop={(e, d) => {
                    patchGeo({ x: d.x, y: d.y });
                    dispatch(updateBoxGeometry({ id: box.id, x: d.x, y: d.y }));
                  }}
                  onResize={(e, direction, ref, delta, pos) => {
                    patchGeo({
                      x: pos.x,
                      y: pos.y,
                      width: px(ref.style.width),
                      height: px(ref.style.height),
                    });
                  }}
                  onResizeStop={(e, direction, ref, delta, pos) => {
                    const width = px(ref.style.width);
                    const height = px(ref.style.height);
                    patchGeo({ x: pos.x, y: pos.y, width, height });
                    dispatch(
                      updateBoxGeometry({
                        id: box.id,
                        x: pos.x,
                        y: pos.y,
                        width,
                        height,
                      }),
                    );
                  }}
                  enableResizing={
                    isPanMode
                      ? false
                      : {
                        top: true,
                        right: true,
                        bottom: true,
                        left: true,
                        topRight: true,
                        bottomRight: true,
                        bottomLeft: true,
                        topLeft: true,
                      }
                  }
                >
                  <DynamicGrid
                    rows={box.totalRow}
                    cols={box.totalCol}
                    radius={box.radius}
                    width={geometry.width}
                    height={geometry.height}
                    name={box.fieldName}
                    selectedBoxId={selectedBoxId}
                    box={box}
                  />
                </Rnd>
              );
            })}

            {/* MERGE / GROUPING OUTLINE */}
            {mergeBoundaries.map((boundary) => (
              <div
                key={boundary.id}
                style={{
                  position: 'absolute',
                  left: boundary.x,
                  top: boundary.y,
                  width: boundary.width,
                  height: boundary.height,
                  border: '1px dashed red',
                  pointerEvents: 'none',
                  zIndex: 900,
                  boxSizing: 'border-box',
                }}
              >
                {boundary.name && (
                  <div
                    className='px-1 d-flex justify-content-center align-items-center'
                    style={{
                      position: 'absolute',
                      top: '-9px',
                      right: '-1px',
                      backgroundColor: '#2460FB',
                      color: '#FFFFFF',
                      fontSize: '0.35rem',
                      fontWeight: 500,
                      borderRadius: '2px',
                      whiteSpace: 'nowrap',
                      fontFamily: 'outfit, sans-serif',
                    }}
                  >
                    {boundary.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Floating Controls */}
        <div
          className='bg-white rounded-pill shadow-lg d-flex align-items-center position-absolute'
          style={{
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            border: '1px solid #e2e8f0',
            gap: '16px',
            padding: '8px 24px',
          }}
        >
          <Controls
            tourSteps={tourSteps}
            runTour={runTour}
            handleTourCallback={handleTourCallback}
          />
        </div>

        {/* Skews Dropdown Panel */}
        <div
          style={{
            zIndex: '1000',
            position: 'absolute',
            left: '5%',
            top: '50px',
            pointerEvents: isPanelOpen ? 'auto' : 'none',
          }}
        >
          {isPanelOpen && <Skews />}
        </div>

        {/* FORM */}
        <div
          style={{
            height: '100%',
            width: '350px',
            zIndex: '1000',
            position: 'absolute',
            top: '0px',
            right: '0px',
            pointerEvents: isFormOpen ? 'auto' : 'none',
          }}
        >
          {isFormOpen && <MappingForm />}
        </div>

        {/* Merge Panel */}
        <div
          style={{
            zIndex: '1000',
            position: 'absolute',
            top: '50px',
            pointerEvents: isMergePanel ? 'auto' : 'none',
          }}
        >
          {isMergePanel && <MergeModal />}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
