import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { IoIosArrowDown } from 'react-icons/io';

import CustomSwitch from 'common/customSwitch';
import { isFormPanelOpen } from "redux/reducers/tempControlSlice";
import { useDispatch, useSelector } from 'react-redux';
import { saveBox, defaultBoxData } from 'redux/reducers/boxSlice';
import { toast } from 'react-toastify';

const MappingForm = () => {
  const dispatch = useDispatch();
  const [openSection, setOpenSection] = useState(1);
  const [formData, setFormData] = useState(defaultBoxData);

  // Get currently selected box
  const selectedBox = useSelector((state) => {
    const selectedId = state.BoxData.selectedBoxId;
    return selectedId ? state.BoxData.boxes.find(b => b.id === selectedId) : null;
  });

  useEffect(() => {
    if (selectedBox) {
      setFormData(selectedBox);
    } else {
      setFormData({ ...defaultBoxData });
    }
  }, [selectedBox]);

  const closePanel = () => {
    dispatch(isFormPanelOpen(false));
  };

  const handleToggle = (key) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (id) => {
    setOpenSection(prev => (prev === id ? null : id));
  };

  const handleSave = () => {
    if (
      formData.fieldName === "" || 
      formData.totalCol === null || 
      formData.totalRow === null || 
      !formData.fieldType || 
      formData.multi_Value === ""
    ) {
      toast.error("Please fill all the required fields");
      return;
    }

    dispatch(saveBox(formData));
    dispatch(isFormPanelOpen(false));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    const QUESTION_NAME_REGEX = /^[qQ]\d+-[qQ]\d+$/;

    if (name === "fieldType" && value === "QuestionField") {
      if (!QUESTION_NAME_REGEX.test(formData.fieldName.trim())) {
        toast.warning("Use format q1-q10 or Q1-Q10");
        return;
      }
    }

    if (name === "fieldName" && formData.fieldType === "QuestionField") {
      toast.warning("Please select field type");
      return;
    }

    const parsedValue = type === 'number' || type === 'range'
      ? (value === '' ? '' : Number(value))
      : value;

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));

    // Save specific fields to Redux immediately for live updates (bubble intensity and size)
    // Only save if we have a selected box and the field is one we want to update live
    if (selectedBox && (name === 'bubbleIntensity' || name === 'radius')) {
      // Create a minimal update object with just the changed field
      const updateData = {};
      updateData[name] = parsedValue;
      // Also need the id to identify which box to update
      updateData.id = selectedBox.id;
      dispatch(saveBox(updateData));
    }
  };

  const accordionItems = [
    {
      id: 1,
      title: "1. GRID METRICS",
      content: (
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label small text-muted font-weight-bold">
              Rows <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control shadow-none"
              name="totalRow"
              value={formData.totalRow ?? ''}
              onChange={handleChange}
            />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label small text-muted font-weight-bold">
              Columns <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control shadow-none"
              name="totalCol"
              value={formData.totalCol ?? ''}
              onChange={handleChange}
            />
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: '2. IDENTIFICATION MAPPING',
      content: (
        <div>
          <div className="mb-3">
            <label className="form-label small text-muted font-weight-bold">
              Field Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control shadow-none"
              placeholder="Enter Field Name"
              name="fieldName"
              value={formData.fieldName || ''}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small text-muted font-weight-bold">
              Field Type <span className="text-danger">*</span>
            </label>
            <div className="position-relative">
              <select
                style={{ appearance: "none" }}
                className="form-control shadow-none pr-4"
                name="fieldType"
                required
                value={formData.fieldType || ''}
                onChange={handleChange}
              >
                <option value="">Choose Field Type</option>
                <option value="FormField">Form Field</option>
                <option value="QuestionField">Question Field</option>
                <option value="Barcode">Barcode</option>
                <option value="Lithocode">Lithocode</option>
              </select>
              <IoIosArrowDown
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#6c757d",
                  fontSize: "18px"
                }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label small text-muted font-weight-bold">Reading Direction</label>
              <div className="position-relative">
                <select
                  style={{ appearance: "none" }}
                  className="form-control shadow-none pr-4"
                  name="ReadingDirection"
                  value={formData.ReadingDirection || 'Column'}
                  onChange={handleChange}
                >
                  <option value="Row">Row</option>
                  <option value="Column">Column</option>
                </select>
                <IoIosArrowDown
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#6c757d",
                    fontSize: "18px"
                  }}
                />
              </div>
            </div>

            <div className="col-6 mb-3">
              <div className="d-flex align-items-center mt-4 justify-content-between">
                <span className="form-label small text-muted font-weight-bold mb-0">Allow Multiple</span>
                <CustomSwitch
                  id="allow-multiple"
                  checked={Boolean(formData.allowMultiple)}
                  onChange={() => handleToggle('allowMultiple')}
                />
              </div>
            </div>
          </div>

          {!formData.allowMultiple ? (
            <div className="mb-3">
              <label className="form-label small text-muted font-weight-bold">
                Multiple Value <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control shadow-none"
                placeholder="e.g. *"
                name="multi_Value"
                value={formData.multi_Value || ''}
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className="row">
              <div className="col-6 mb-3">
                <label className="form-label small text-muted font-weight-bold">
                  Multiple Value <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control shadow-none"
                  placeholder="e.g. *"
                  name="multi_Value"
                  value={formData.multi_Value || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="col-6 mb-3">
                <label className="form-label small text-muted font-weight-bold">Blank Value</label>
                <input
                  type="text"
                  className="form-control shadow-none"
                  placeholder="e.g. #"
                  name="Blank_value"
                  value={formData.Blank_value || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 3,
      title: '3. FIELD RULES',
      content: (
        <div>
          <div className="mb-3">
            <label className="form-label small text-muted font-weight-bold">
              Field Value <span className="text-danger">*</span>
            </label>
            <div className="position-relative">
              <select
                style={{ appearance: "none" }}
                className="form-control shadow-none pr-4"
                name="fieldValue"
                required
                value={formData.fieldValue || 'integer'}
                onChange={handleChange}
              >
                <option value="integer">Integer</option>
                <option value="alphabet">Alphabet</option>
                <option value="custom">Custom</option>
              </select>
              <IoIosArrowDown
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#6c757d",
                  fontSize: "18px"
                }}
              />
            </div>
          </div>

          {formData.fieldValue === "custom" && (
            <div className="mb-3">
              <label className="form-label small text-muted font-weight-bold">Custom Value</label>
              <input
                type="text"
                className="form-control shadow-none"
                placeholder="With comma"
                name="Custom"
                value={formData.Custom || ''}
                onChange={handleChange}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 4,
      title: '4. THRESHOLDS & SIZING',
      content: (
        <div className="mb-3">
          <div>
            <label className="form-label d-flex justify-content-between align-items-center text-muted">
              <span className="font-weight-bold">Intensity</span>
              <span className="px-3 py-1 rounded bg-light text-primary font-weight-bold">
                {formData.bubbleIntensity ?? 14.5}
              </span>
            </label>
            <input
              type="range"
              step={0.1}
              className="custom-range"
              name="bubbleIntensity"
              value={formData.bubbleIntensity ?? 14.5}
              onChange={handleChange}
              min="0"
              max="30"
            />
          </div>
          <div className="mt-3">
            <label className="form-label d-flex justify-content-between align-items-center text-muted">
              <span className="font-weight-bold">Bubble Size</span>
              <span className="px-3 py-1 rounded bg-light text-primary font-weight-bold">
                {formData.radius ?? 3.5}
              </span>
            </label>
            <input
              type="range"
              step={0.1}
              className="custom-range"
              name="radius"
              value={formData.radius ?? 3.5}
              onChange={handleChange}
              min="0"
              max="7"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      className="card border-0 rounded-lg overflow-hidden d-flex flex-column"
      style={{backgroundColor: '#f8fafd', height: "100%", boxShadow: "rgba(0, 0, 0, 0.11) -3px 0px 6px 0px"}}>
      {/* Main Content Area */}
      <div className="card-body p-0 overflow-auto bg-white flex-grow-1">

        <h5 className="pl-4 pt-4 pb-2 text-uppercase" style={{ letterSpacing: "1px" }}>Mapping box form</h5>

        <div className="accordion" id="fieldPropertiesAccordion">
          {accordionItems.map((item) => (
            <div key={item.id} className="border-bottom border-light">
              <button
                type="button"
                className="btn btn-block text-left py-3 px-4 d-flex justify-content-between align-items-center w-100"
                style={{color: '#4c5c75', fontSize: '0.85rem', boxShadow: 'none', fontWeight: "600", letterSpacing: "1px", backgroundColor: openSection === item.id ? '#ffffff' : 'transparent',}}
                onClick={() => toggleSection(item.id)}>
                <span>{item.title}</span>
                <span
                  style={{transform: openSection === item.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  <IoIosArrowDown size={18} color="#6c757d" />
                </span>
              </button>

              {openSection === item.id && (
                <div className="px-4 py-2 bg-white border-top border-light">
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shared Footer Area */}
      <div className="card-footer bg-white border-top p-3">
        <div className="p-3 rounded d-flex justify-content-between align-items-center mb-3" style={{ background: "#F1F4FC" }}>
          <div>
            <h6 className="mb-1 font-weight-bold" style={{ color: "#3d4d65", fontSize: "0.9rem" }}>
              Detect Best Bubble
            </h6>
            <small className="text-muted">Resolves Multi-Scanned Noise</small>
          </div>
          <CustomSwitch
            id="bestBubble"
            checked={Boolean(formData.detectBestBubble)}
            onChange={() => handleToggle('detectBestBubble')}
          />
        </div>

        {/* Global Action Buttons */}
        <div className="d-flex gap-2">
          <button
            type="button"
            onClick={closePanel}
            className="btn btn-light flex-fill font-weight-bold py-2"
            style={{ color: '#686F94', backgroundColor: '#EFEFEF' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            type="button"
            className="btn flex-fill font-weight-bold py-2 text-white"
            style={{ background: 'linear-gradient(270deg, #3969FE, #1047D5)' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default MappingForm;