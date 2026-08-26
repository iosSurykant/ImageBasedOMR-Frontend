/* eslint-disable array-callback-return */
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoArrowLeft } from "react-icons/go";
import { FiZoomIn, FiZoomOut } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { Rnd } from "react-rnd";

// Redux Toolkit
import { useDispatch, useSelector } from "react-redux";
import { getLayoutData, updateTemplateData } from "redux/reducers/templateSlice";
import { updateSkewPosition, updateSkewDimensions, } from "redux/reducers/skewSlice";
import { updateBoxGeometry } from "redux/reducers/boxSlice";

// Components
import Controls from "./editorHelper/controls";
import Skews from "./editorHelper/skews";
import MappingForm from "./editorHelper/BoxForm";
import DynamicGrid from "./editorHelper/dynamicGrid";
import { selectBox } from "redux/reducers/boxSlice";
import { isFormPanelOpen } from "redux/reducers/tempControlSlice";
import axiosApi from "Interceptor/axios";
import { toast } from "react-toastify";
import { setSelectedSkewCorners } from "redux/reducers/skewSlice";
import { renderBoxes } from "redux/reducers/boxSlice";
import MergeModal from "./editorHelper/mergeModel";

const tourSteps = [
  {
    title: "Toolbar",
    target: "#tour-body",
    content: "This is your main floating control panel. From here, you can manage all your workspace tools.",
    placement: "top",
    disableBeacon: true,
  },
  {
    title: "Skew Calibration Switch",
    target: "#tour-skew-btn",
    content: "Toggle this switch to view and adjust the four red skew corners on your document.",
    placement: "top",
  },
  {
    title: "Hand Tool",
    target: "#tour-pan-btn",
    content: "Click the Hand tool to drag and pan around your canvas without moving any boxes.",
    placement: "top",
  },
  {
    title: "Add Mapping box",
    target: "#tour-add-btn",
    content: "Click the Plus icon to open the Form Panel and create a new OMR area.",
    placement: "top",
  },
  {
    title: "Duplicate / Copy Box",
    target: "#tour-duplicate-btn",
    content: "Select an existing box on the canvas, then click here to instantly duplicate it.",
    placement: "top",
  },
  {
    title: "Delete Mapping box",
    target: "#tour-delete-btn",
    content: "Select a box and click the trash can to delete it.",
    placement: "top",
  },
  {
    title: "Merge / Group Boxes",
    target: "#tour-merge-btn",
    content: "Need to combine fields? Click here to open the Merge Panel and group boxes together.",
    placement: "top",
  },
  {
    title: "Save Template",
    target: "#tour-save-btn",
    content: "Click here to save your template.",
    placement: "top",
  },
  {
    title: "Zoom In / Out",
    target: "#tour-zoom-btn",
    content: "Use these buttons to zoom in and out of the canvas.",
    placement: "top",
  },
  {
    title: "Back to templates List",
    target: "#tour-back-btn",
    content: "Click here to go back to the templates list.",
    placement: "top",
  }
];

const TemplateEditor = () => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [jsonData, setJsonData] = useState([]);

  const [runTour, setRunTour] = useState(false);

  // 1. PAN / DRAG STATES & REFS
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Getting Json File And Data
  const { Id } = useParams();
  const [activeSkewCorner, setActiveSkewCorner] = useState(null);

  // Refs for boundary enforcement
  const containerRef = useRef(null);
  const imageRef = useRef(null);

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
  const isMergePanel = useSelector((state) => state.tempControl.isMergePanelOpen);

  const boxes = useSelector((state) => state.BoxData.boxes);
  const mergeFields = useSelector((state) => state.BoxData.mergefields);
  const mergeBoxes = useSelector((state) => state.BoxData.mergeBoxes);

  const selectedBoxId = useSelector((state) => state.BoxData.selectedBoxId);



  console.log("boxes", boxes)
  console.log("mergerboxes------->>>>>>", mergeBoxes)
  console.log("mergefields------->>>>>>", mergeFields)
  console.log("jsonData", jsonData);



  const getJsonData = useCallback(async () => {
    if (!Id) return;

    try {
      const { payload } = await dispatch(getLayoutData(Id));

      const jsonXPath = payload?.data?.jsonPath;

      if (!jsonXPath) {
        throw new Error("JSON path not found");
      }

      const encodedPath = jsonXPath
        .split("/")
        .map(encodeURIComponent)
        .join("/");

      const { data } = await axiosApi.get(
        `${process.env.REACT_APP_BACKEND_URL}${encodedPath}`,
      );

      console.log("JSON Data:", data);
      setJsonData(data);
    } catch (error) {
      console.error("Error fetching template data:", error);
    }
  }, [Id, dispatch]);

  useEffect(() => {
    getJsonData();
  }, [getJsonData]);


  // Helper function remains exactly the same!
  const getMergeBoxCoordinates = (selectedBoxes) => {
    if (!selectedBoxes || selectedBoxes.length === 0) return null;

    const firstBox = selectedBoxes[0];
    let minX = firstBox.x;
    let minY = firstBox.y;
    let maxX = firstBox.x + firstBox.width;
    let maxY = firstBox.y + firstBox.height;

    for (let i = 1; i < selectedBoxes.length; i++) {
      const box = selectedBoxes[i];
      minX = Math.min(minX, box.x);
      minY = Math.min(minY, box.y);
      maxX = Math.max(maxX, box.x + box.width);
      maxY = Math.max(maxY, box.y + box.height);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  // UPDATED: MERGE BOUNDARY (Plural)
  const mergeBoundaries = useMemo(() => {
    if (!mergeFields || mergeFields.length === 0 || !boxes) return [];

    return mergeFields.map((mergeGroup) => {
      const liveGroup = boxes.filter((mainBox) =>
        mergeGroup.childrenIds.includes(mainBox.id)
      );

      if (liveGroup.length === 0) return null;

      const coords = getMergeBoxCoordinates(liveGroup);
      if (!coords) return null;

      return {
        id: mergeGroup.mergeId,
        name: mergeGroup.fieldName,
        x: coords.x,
        y: coords.y,
        width: coords.width,
        height: coords.height
      };
    }).filter(boundary => boundary !== null);

  }, [boxes, mergeFields]);

  // RENDERING BOXES AFTER RE OPEN THE TEMPLATE ACCORDING TO JSON 
  useEffect(() => {
    if (jsonData?.referncefield) {
      const selectedCorners = jsonData?.referncefield;

      dispatch(renderBoxes(jsonData))
      dispatch(setSelectedSkewCorners(selectedCorners));
    }
  }, [jsonData?.referncefield, dispatch, jsonData]);


  // Data for sending to backend
  const activeSkewCoordinates = Object.entries(skewData || {}).reduce(
    (acc, [key, point]) => {
      if (point.selected) {
        acc[key] = {
          x: point.x,
          y: point.y,
          width: point.width,
          height: point.height,
          selected: point.selected
        };
      }
      return acc;
    },
    {},
  );

  // Calculates The Grid BUBBLE Coordinate For Each Box
  const getBubbleCoordinates = (box) => {
    if (!box) return [];

    const { x = 0, y = 0, width = 0, height = 0, totalRow = 0, totalCol = 0 } = box;

    if (!totalRow || !totalCol || totalRow <= 0 || totalCol <= 0 || !width || !height) {
      return [];
    }

    const cellWidth = width / totalCol;
    const cellHeight = height / totalRow;

    const rawRadius = box?.radius ?? 0.35;
    const rScale = rawRadius > 1 ? rawRadius / 10 : rawRadius;

    const radius = Math.min(cellWidth, cellHeight) * rScale;

    const bubbles = [];

    for (let row = 0; row < totalRow; row++) {
      for (let col = 0; col < totalCol; col++) {
        // Find center of current cell
        const cx = x + col * cellWidth + cellWidth / 2;
        const cy = y + row * cellHeight + cellHeight / 2;

        // Calculate bounding box top-left position
        bubbles.push({
          x: Math.round(cx - radius),
          y: Math.round(cy - radius),
          width: Math.round(radius * 2),
          height: Math.round(radius * 2),
          row,
          col,
        });
      }
    }

    return bubbles;
  };

  // SAVE TEMPLATE
  const handleSaveTemplate = useCallback(async () => {
    if (!tempData?.data?.fileName) return;

    const { fileName } = tempData.data;

    const fields = boxes.map((box) => ({
      ...box,
      bubbles: getBubbleCoordinates(box),
    }));

    const templateData = {
      name: fileName,
      fields,
      mergedfields: mergeFields,
      referncefield: activeSkewCoordinates,
    };

    console.log("templateData", templateData)

    const jsonFileName = fileName.endsWith(".json")
      ? fileName
      : `${fileName}.json`;

    console.log(jsonFileName);

    const jsonFile = new File([JSON.stringify(templateData)], jsonFileName, {
      type: "application/json",
    });

    try {
      await dispatch(
        updateTemplateData({
          FileName: fileName,
          tempName: jsonFile,
        }),
      );

      navigate("/app/template");
    } catch (error) {
      toast.error("Failed to save template");
    }
  }, [tempData?.data, boxes, mergeFields, activeSkewCoordinates, dispatch, navigate]);

  // KEYBOARD ARROW KEY PANNING & BOX MOVEMENT
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        return;
      }
      e.preventDefault();
      const MOVE_STEP = 1;


      if (activeSkewCorner && skewData[activeSkewCorner] && !isPanMode) {
        const currentPoint = skewData[activeSkewCorner];

        let newX = currentPoint.x;
        let newY = currentPoint.y;

        if (e.key === "ArrowLeft") newX -= MOVE_STEP;
        if (e.key === "ArrowRight") newX += MOVE_STEP;
        if (e.key === "ArrowUp") newY -= MOVE_STEP;
        if (e.key === "ArrowDown") newY += MOVE_STEP;

        dispatch(
          updateSkewPosition({
            corner: activeSkewCorner,
            x: newX,
            y: newY,
          })
        );
        return; // Exit early
      }


      // If a box is selected and we are NOT in pan mode
      if (selectedBoxId && !isPanMode) {
        const selectedBox = boxes.find((b) => b.id === selectedBoxId);
        if (!selectedBox) return;


        let newX = selectedBox.x;
        let newY = selectedBox.y;

        if (e.key === "ArrowLeft") newX -= MOVE_STEP;
        if (e.key === "ArrowRight") newX += MOVE_STEP;
        if (e.key === "ArrowUp") newY -= MOVE_STEP;
        if (e.key === "ArrowDown") newY += MOVE_STEP;

        dispatch(
          updateBoxGeometry({
            id: selectedBoxId,
            x: newX,
            y: newY,
            width: selectedBox.width,
            height: selectedBox.height,
          })
        );
        return;
      }

      // If no box is selected, pan the background canvas
      const PAN_STEP = 20;

      setPosition((prevPos) => {
        let newX = prevPos.x;
        let newY = prevPos.y;

        if (e.key === "ArrowLeft") newX += PAN_STEP;
        if (e.key === "ArrowRight") newX -= PAN_STEP;
        if (e.key === "ArrowUp") newY += PAN_STEP;
        if (e.key === "ArrowDown") newY -= PAN_STEP;

        // Apply container boundary clamping
        if (!containerRef.current || !imageRef.current)
          return { x: newX, y: newY };

        const containerRect = containerRef.current.getBoundingClientRect();
        const scale = zoomLevel / 100;
        const scaledWidth = imageRef.current.offsetWidth * scale;
        const scaledHeight = imageRef.current.offsetHeight * scale;

        const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
        const minX = -maxX;
        const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);
        const minY = -maxY;

        return {
          x: Math.min(Math.max(newX, minX), maxX),
          y: Math.min(Math.max(newY, minY), maxY),
        };
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);

  }, [zoomLevel, selectedBoxId, boxes, dispatch, isPanMode, activeSkewCorner, skewData]);

  // mouse event handler with boundary clamping
  const handleMouseDown = (e) => {

    if (!isPanMode) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // ALT + MOUSE WHEEL ZOOMING
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {

      if (e.altKey) {
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
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Boxes drag and drop
  const handleMouseMove = (e) => {
    if (!isDragging || !isPanMode) return;
    if (!containerRef.current || !imageRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();

    const targetX = e.clientX - dragStartRef.current.x;
    const targetY = e.clientY - dragStartRef.current.y;

    const scale = zoomLevel / 100;
    const scaledWidth = imageRef.current.offsetWidth * scale;
    const scaledHeight = imageRef.current.offsetHeight * scale;

    const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const minX = -maxX;

    const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);
    const minY = -maxY;

    const clampedX = Math.min(Math.max(targetX, minX), maxX);
    const clampedY = Math.min(Math.max(targetY, minY), maxY);

    setPosition({
      x: clampedX,
      y: clampedY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // While click on the box
  const handleBoxClick = (box) => {
    dispatch(isFormPanelOpen(box));
    dispatch(selectBox(box.id));
    setActiveSkewCorner(null);
  };

  // Srart Tour
  const startTour = () => {
    setRunTour(false);

    setTimeout(() => {
      setRunTour(true);
    }, 100);
  };

  const handleTourCallback = (data) => {
    const { status } = data;

    if (status === "finished" || status === "skipped") {
      setRunTour(false);
    }
  };

  return (
    <div className="p-4" style={{ backgroundColor: "white", height: "100%" }}>
      {/* ACTION TOOLBAR */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center justify-content-center">
          <button
            id="tour-back-btn"
            onClick={() => navigate(-1)}
            className="border-0 shadow-none rounded mr-1 pb-1"
            onMouseEnter={(e) => e.target.style.backgroundColor = "#E8E8E8"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            style={{ cursor: "pointer", backgroundColor: "white" }}
          >
            <GoArrowLeft size={22} />
          </button>

          <div className="d-flex align-items-center" style={{ fontFamily: "outfit", fontWeight: 600 }}>
            <h5 className="d-none d-lg-block text-dark mb-0 mr-2 text-nowrap">
              Template Name
            </h5>

            <span
              className="form-control bg-white border-1 px-3"
              style={{
                borderRadius: "8px",
                color: "#495057",
                fontWeight: 500,
                minWidth: "210px",
                overflowX: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {tempData?.data?.fileName}
            </span>
          </div>
        </div>

        {/* Zoom & Hand Controls */}
        <div className="d-flex align-items-center">

          {/* 3. NEW "START TOUR" BUTTON */}
          <button
            type="button"
            onClick={startTour}
            title="Start Editor Tour"
            className="btn btn-primary  px-4 py-2"
            style={{
              fontWeight: 500,
              fontFamily: "outfit",
              backgroundColor: "#2563eb",
              borderColor: "#2563eb",
              borderRadius: "8px",
            }}
          >
            Tutorial Tour
          </button>

          <div
            id="tour-zoom-btn"
            className="bg-white border rounded-lg shadow-sm d-flex align-items-center px-2 mr-3"
            style={{ borderRadius: "8px" }} >
            <button
              type="button"
              className="btn btn-link border-0 shadow-none text-muted p-2 mr-0"
              onClick={handleZoomIn}
            >
              <FiZoomIn size={22} />
            </button>

            <span className="font-weight-bold text-primary px-2">
              {zoomLevel}%
            </span>

            <button
              type="button"
              className="btn btn-link border-0 shadow-none text-muted p-2"
              onClick={handleZoomOut}
            >
              <FiZoomOut size={22} />
            </button>
          </div>

          <button
            id="tour-save-btn"
            onClick={handleSaveTemplate}
            type="button"
            className="btn btn-primary  px-4 py-2"
            style={{
              fontWeight: 500,
              fontFamily: "outfit",
              backgroundColor: "#2563eb",
              borderColor: "#2563eb",
              borderRadius: "8px",
            }}
          >
            Save <span>Template</span>
          </button>
        </div>
      </div>

      {/* CANVAS WORKSPACE AREA */}
      <div
        ref={containerRef}
        className="position-relative rounded-lg overflow-hidden shadow-sm d-flex justify-content-center align-items-center"
        style={{ height: "90%",  backgroundColor: "#EAF2FC", backgroundImage: "radial-gradient(#cbd5e1 2.5px, transparent 1.5px)", backgroundSize: "35px 35px", cursor: isPanMode ? (isDragging ? "grabbing" : "grab") : "default", }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="position-relative bg-white shadow-lg rounded p-2" style={{ maxWidth: "450px", transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel / 100})`, transformOrigin: "center center", transition: isDragging ? "none" : "transform 0.1s ease-out", userSelect: "none", display: "inline-block", }}>
          <div ref={imageRef} className="position-relative" style={{ width: "100%", height: "100%" }}>
            <img src={process.env.REACT_APP_BACKEND_URL + tempData?.data?.imgPath} alt="OMR Document" className="img-fluid border" style={{ display: "block", pointerEvents: "none", width: "100%" }} />

            {/* Render Active Skew Boxes */}
            {skewData &&
              Object.entries(skewData).map(([corner, point]) => {
                if (!point?.selected) return null;

                return (
                  <Rnd
                    key={corner}
                    onMouseDown={() => {
                      setActiveSkewCorner(corner);
                    }}
                    position={{ x: point.x, y: point.y }}
                    size={{ width: point.width, height: point.height }}
                    scale={zoomLevel / 100}
                    bounds="parent"
                    disableDragging={isPanMode}
                    resizeHandleStyles={{
                    }}
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
                      backgroundColor: "rgba(255, 193, 7, 0.65)",
                      border: "1px solid #dc3545",
                      boxSizing: "border-box",
                      zIndex: 900,
                      pointerEvents: isPanMode ? "none" : "auto",
                    }}
                    onDragStop={(e, d) => {
                      dispatch(
                        updateSkewPosition({
                          corner,
                          x: Math.round(d.x),
                          y: Math.round(d.y),
                        }),
                      );
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      dispatch(
                        updateSkewDimensions({
                          corner,
                          width: ref.offsetWidth,
                          height: ref.offsetHeight,
                          x: Math.round(position.x),
                          y: Math.round(position.y),
                          selected: point.selected,
                        }),
                      );
                    }}
                  />
                );
              })}

            {/* Render Dynamic Grid Boxes */}
            {boxes.map((box) => {
              const minW = box.totalCol * (box.radius * 2);
              const minH = box.totalRow * (box.radius * 2);
              return (
                <Rnd
                  onClick={() => handleBoxClick(box)}
                  key={box.id}
                  position={{ x: box.x, y: box.y }}
                  size={{ width: box.width, height: box.height }}
                  minWidth={minW}
                  minHeight={minH}
                  scale={zoomLevel / 100}
                  bounds="parent"
                  disableDragging={isPanMode}
                  style={{
                    pointerEvents: isPanMode ? "none" : "auto",
                    zIndex: 800,
                  }}
                  onDragStop={(e, d) => {
                    dispatch(
                      updateBoxGeometry({
                        id: box.id,
                        x: d.x,
                        y: d.y,
                      }),
                    );
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    dispatch(
                      updateBoxGeometry({
                        id: box.id,
                        width: ref.offsetWidth,
                        height: ref.offsetHeight,
                        x: position.x,
                        y: position.y,
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
                        topRight: false,
                        bottomRight: true,
                        bottomLeft: true,
                        topLeft: false,
                      }
                  }
                >
                  <DynamicGrid
                    rows={box.totalRow}
                    cols={box.totalCol}
                    radius={box.radius}
                    width={box.width}
                    height={box.height}
                    name={box.fieldName}
                  />
                </Rnd>
              );
            })}

            {/* MERGE/GROUPING OUTLINE */}
            {mergeBoundaries.map((boundary) => (
              <div
                key={boundary.id}
                style={{
                  position: "absolute",
                  left: boundary.x,
                  top: boundary.y,
                  width: boundary.width,
                  height: boundary.height,
                  border: "1px dashed red",
                  pointerEvents: "none",
                  zIndex: 900,
                  boxSizing: "border-box",
                }}
              >
                {/* FLOATING LABEL FOR MERGE NAME */}
                {boundary.name && (
                  <div
                    className="px-1 d-flex justify-content-center align-items-center"
                    style={{
                      position: "absolute",
                      top: "-9px",
                      right: "-1px",
                      backgroundColor: "#2460FB",
                      color: "#FFFFFF",
                      fontSize: "0.35rem",
                      fontWeight: 500,
                      borderRadius: "2px",
                      whiteSpace: "nowrap",
                      fontFamily: "outfit, sans-serif",
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
        <div className="bg-white rounded-pill shadow-lg d-flex align-items-center position-absolute" style={{ bottom: "24px", left: "50%", transform: "translateX(-50%)", zIndex: 100, border: "1px solid #e2e8f0", gap: "16px", padding: "8px 24px" }}>
          <Controls tourSteps={tourSteps} runTour={runTour} handleTourCallback={handleTourCallback} />
        </div>

        {/* Skews Dropdown Panel */}
        <div style={{ zIndex: "1000", position: "absolute", left: "5%", top: "50px", pointerEvents: isPanelOpen }} >
          {isPanelOpen && <Skews />}
        </div>

        {/* FORM */}
        <div style={{ height: "100%", width: "350px", zIndex: "1000", position: "absolute", top: "0px", right: "0px", pointerEvents: isFormOpen ? "auto" : "none", }}>
          {isFormOpen && <MappingForm />}
        </div>

        {/* Merger Panel */}
        <div style={{ zIndex: "1000", position: "absolute", top: "50px", pointerEvents: isMergePanel ? "auto" : "none", }}>
          {isMergePanel && <MergeModal />}
        </div>

      </div>
    </div>
  );
};

export default TemplateEditor;
