import React, { useState } from "react";
import { toast } from "react-toastify";
import Draggable from "react-draggable";

const Permissions = ({
  permissionModal,
  setPermissionModal,
  templatePermissions,
  setTemplatePermissions,
}) => {
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleInputFocus = () => setIsInputFocused(true);
  const handleInputBlur = () => setIsInputFocused(false);

  return (
    <>
      {permissionModal && (
        <div
          className="position-fixed top-0 start-0 w-100 vh-100 d-flex justify-content-center align-items-center"
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
          }}
        >
          <Draggable handle=".drag-handle" cancel="input, textarea, button">
            <div
              className="bg-white rounded-4 shadow-lg w-100"
              style={{ maxWidth: "520px", animation: "fadeInScale 0.25s ease" }}
            >
              {/* Header */}
              <div className="drag-handle px-4 py-3 border-bottom">
                <h3 className="fw-bold m-0">Permissions Settings</h3>
                <p className="text-muted small mb-0">
                  Configure pattern rules and field access
                </p>
              </div>

              {/* Body */}
              <div className="p-4">
                {/* Pattern */}
                <div className="mb-4">
                  <label className="fw-semibold mb-2 d-block">
                    Pattern Definition
                  </label>
                  <input
                    type="text"
                    placeholder="only: / * ~"
                    className="custom-input text-center"
                    value={templatePermissions.patternDefinition}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (
                        inputValue.length === 0 ||
                        (inputValue.length === 1 && /[/*~>-]/.test(inputValue))
                      ) {
                        setTemplatePermissions((prev) => ({
                          ...prev,
                          patternDefinition: inputValue,
                        }));
                      }
                    }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                  {/* <small className="text-muted ml-8">Allowed: / * ~ &gt; -</small> */}
                </div>

                {/* Blank Definition */}
                <div className="mb-4">
                  <label className="fw-semibold mb-2 d-block">
                    Blank Definition
                  </label>
                  <input
                    type="text"
                    className="custom-input text-center"
                    value={templatePermissions?.blankDefination}
                    onChange={(e) =>
                      setTemplatePermissions((prev) => ({
                        ...prev,
                        blankDefination: e.target.value,
                      }))
                    }
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>

                {/* Permission Toggle */}
                <div className="d-flex align-items-center justify-content-between p-3 rounded-3 ">
                  {/* Left Content */}
                  <div className="me-3">
                    <div className="fw-semibold">Field Edit Permission</div>
                    <small className="text-muted d-block">
                      Allow users to modify fields
                    </small>
                  </div>

                  {/* Right Checkbox */}
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                      checked={templatePermissions.isPermittedToEdit}
                      onChange={() =>
                        setTemplatePermissions((prev) => ({
                          ...prev,
                          isPermittedToEdit:
                            !templatePermissions.isPermittedToEdit,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="d-flex justify-content-end gap-2 px-4 py-3 border-top">
                <button
                  className="btn btn-light rounded-pill px-4"
                  onClick={() => setPermissionModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-dark rounded-pill px-4"
                  onClick={() => {
                    if (!templatePermissions.patternDefinition) {
                      toast.warning("Please enter any pattern.");
                    } else {
                      setPermissionModal(false);
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </Draggable>
        </div>
      )}
    </>
  );
};

export default Permissions;

<style jsx>
  {`
    .custom-input {
      width: 100%;
      padding: 10px 14px;
      border-radius: 12px;
      border: none;
      outline: none;
      background-color: #f8fafc;
      transition: all 0.25s ease;
      font-weight: 500;
    }

    .custom-input:focus {
      background-color: #ffffff;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.15);
    }

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `}
</style>;
