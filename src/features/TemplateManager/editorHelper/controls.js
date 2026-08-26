import React from "react";
import { FiCopy } from "react-icons/fi";
import { LuHand } from "react-icons/lu";
import { FaRegSquarePlus } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { setSkewPanel } from "redux/reducers/skewSlice";
import { togglePanMode, isFormPanelOpen } from "redux/reducers/tempControlSlice";
import { selectBox, deleteBox, copyBox } from "redux/reducers/boxSlice";
import { AiOutlineDelete } from "react-icons/ai";
import { LiaObjectGroupSolid } from "react-icons/lia";
import { isMergePanelOpen } from "redux/reducers/tempControlSlice";
import { toast } from "react-toastify";
import { Joyride } from "react-joyride";


const CustomTooltip = ({ index, size, step, backProps, primaryProps, skipProps, tooltipProps }) => (
  <div {...tooltipProps} style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px", width: "320px", border: "1px solid #e2e8f0", fontFamily: "outfit", textAlign: "left" }}>
    <div style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px", fontWeight: 500 }}>
      {index + 1}/{size}
    </div>
    {step.title && (
      <h3 style={{ margin: "0 0 12px 0", color: "#1e293b", fontSize: "18px", fontWeight: 600 }}>
        {step.title}
      </h3>
    )}
    <div style={{ color: "#475569", fontSize: "15px", lineHeight: "1.5", marginBottom: "32px" }}>
      {step.content}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <button {...skipProps} style={{ background: "none", border: "none", color: "#8b94a8", fontSize: "15px", fontWeight: 500, cursor: "pointer", padding: 0 }}>
        Skip
      </button>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        {index > 0 && (
          <button {...backProps} style={{ background: "none", border: "none", color: "#475569", fontSize: "15px", fontWeight: 500, cursor: "pointer", padding: 0 }}>
            Back
          </button>
        )}
        <button {...primaryProps} style={{ backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "15px", fontWeight: 500, cursor: "pointer" }}>
          Next
        </button>
      </div>
    </div>
  </div>
);

const Controls = ({ tourSteps, runTour, handleTourCallback }) => {
  const dispatch = useDispatch();

  // Redux Selectors
  const skewPanel = useSelector((state) => state.skew.isPanelOpen);
  const isPanActive = useSelector((state) => state.tempControl?.isPanModeActive);
  const selectedBoxId = useSelector((state) => state.BoxData?.selectedBoxId);
  const isAddAreaActive = useSelector((state) => state.tempControl?.isFormPanelOpen);

  const handleAddNewBox = () => {
    dispatch(selectBox(null));
    dispatch(isFormPanelOpen(!isAddAreaActive));
  };

  const handleToggleSkewPanel = () => {
    dispatch(setSkewPanel());
  };

  const handleDuplicate = () => {
    if (!selectedBoxId) return;
    dispatch(copyBox(selectedBoxId));
  };

  const handleDeleteBox = () => {
    if (!selectedBoxId) {
      toast.warning("Select a box to delete");
      return;
    }
    dispatch(deleteBox(selectedBoxId));
    dispatch(selectBox(null));
  };

  return (
    <>

      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleTourCallback}
        scrollToFirstStep
        tooltipComponent={CustomTooltip} // This replaces the styles object
      />

      <style>{`
        .custom-tooltip {
          position: relative;
        }

        .custom-tooltip::after {
          content: attr(data-tooltip);
          position: absolute;
          top: -45px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #2460FB;
          color: #fff;
          padding: 6px 10px;
          border-radius: 8px;
          font-family: Outfit;
          letter-spacing: 0.5px;
          font-size: 13px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s ease;
        }

        .custom-tooltip:hover::after {
          opacity: 1;
          visibility: visible;
        }
      `}</style>

      <div className="d-flex" id="tour-body">
        {/* Skew Switch */}
        <div className="d-flex align-items-center custom-tooltip" data-tooltip="Skew Switch" id="tour-skew-btn" style={{ paddingRight: "24px", borderRight: "1px solid #dee2e6" }}>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", marginRight: "12px", color: "#212529" }}>
            Skew
          </span>

          <label htmlFor="skewSwitch" className="d-inline-flex align-items-center mb-0" style={{ cursor: "pointer", userSelect: "none" }}>
            <div style={{ position: "relative", width: "44px", height: "24px", backgroundColor: skewPanel ? "#2456E6" : "#e5e7eb", borderRadius: "9999px", transition: "background-color 0.2s ease-in-out" }}>
              <input
                id="skewSwitch"
                type="checkbox"
                className="sr-only"
                checked={Boolean(skewPanel)}
                onChange={handleToggleSkewPanel}
                style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
              />
              <span style={{ position: "absolute", top: "2px", left: "2px", width: "20px", height: "20px", backgroundColor: "#fff", borderRadius: "50%", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transform: skewPanel ? "translateX(20px)" : "translateX(0px)", transition: "transform 0.2s ease-in-out" }} />
            </div>
          </label>
        </div>

        <div className="d-flex align-items-center pl-4" style={{ gap: "16px" }}>
          <style jsx>
            {`
            .control-btn {
              background: transparent; color: #64748b; border: none; padding: 6px 10px; border-radius: 6px; transition: all 0.2s ease; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
            }
            .control-btn:hover { background-color: #eff6ff !important; color: #2563eb !important; }
            .control-btn svg { pointer-events: none; }
            .control-btn.active { background-color: #2563eb !important; color: #ffffff !important; }
          `}
          </style>

          <button onClick={() => dispatch(togglePanMode())} type="button" id="tour-pan-btn" className={`control-btn custom-tooltip ${isPanActive ? "active" : ""}`} data-tooltip="Pan Tool">
            <LuHand size={22} />
          </button>

          <button onClick={handleAddNewBox} type="button" id="tour-add-btn" className={`control-btn custom-tooltip ${isAddAreaActive ? "active" : ""}`} data-tooltip="Add Area">
            <FaRegSquarePlus size={22} />
          </button>

          <button onClick={handleDuplicate} type="button" id="tour-duplicate-btn" disabled={!selectedBoxId} className="control-btn custom-tooltip" data-tooltip="Duplicate Selected Box" style={{ opacity: selectedBoxId ? 1 : 0.4, cursor: selectedBoxId ? "pointer" : "not-allowed" }} title={selectedBoxId ? "Duplicate Selected Box" : "Select a box to duplicate"}>
            <FiCopy size={22} />
          </button>

          <button onClick={handleDeleteBox} type="button" id="tour-delete-btn" disabled={!selectedBoxId} className="control-btn custom-tooltip" data-tooltip="Delete Box">
            <AiOutlineDelete size={22} />
          </button>

          <button onClick={() => dispatch(isMergePanelOpen())} type="button" id="tour-merge-btn" className="control-btn custom-tooltip" data-tooltip="Group Boxes">
            <LiaObjectGroupSolid size={24} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Controls;