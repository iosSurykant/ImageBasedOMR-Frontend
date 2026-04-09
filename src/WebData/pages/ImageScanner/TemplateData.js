import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { toast } from "react-toastify";
import EditMappedDataModel from "./EditMappedDataModel";

const TemplateData = ({
  selectedCoordinates,
  setRemoveModal,
  setRemoveId,
  templateData,
  setTemplateData,
  setOptionModel,
  onEditCoordinateDataHanlder,
  setConfirmationModal,
  setPermissionModal,
  templatePermissions,
  setselectedtemplate,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const editFlag = localStorage.getItem("editModel");

  console.log("Temp Name",templateData.name)
  const onCheckHandler = () => {
    if (!templatePermissions.patternDefinition) {
      setPermissionModal(true);
      toast.warning("Please select the pattern.");
      return;
    }

    const isQuestionsField = selectedCoordinates.find(
      (coordinate) => coordinate.fieldType === "questionsField",
    );

    if (selectedCoordinates.length === 0) {
      toast.warning("Please create the coordinates.");
    } else if (templateData.name === "") {
      toast.warning("Please enter the template name.");
    } else if (!isQuestionsField) {
      setConfirmationModal(true);
    } else {
      setOptionModel(true);
    }
  };

  const handleselect = (fId) => {
    setselectedtemplate(fId);
  };

  return (
    <>
      <div className="container py-3">
        {/* TABLE SECTION */}
        <div className="card shadow border-0 mb-4">
          <div className="card-body">
            {/* HEADER */}
            <div className="row fw-bold border-bottom pb-2 px-5 mb-3">
              <div className="col-6">Name</div>
              <div className="col-3 text-center">Edit</div>
              <div className="col-3 text-center">Remove</div>
            </div>

            {/* LIST */}
            <div className="overflow-auto template-scroll">
              {selectedCoordinates?.map((data, index) => (
                <div
                  key={data.fId}
                  className={`row py-2 px-5 border-bottom align-items-center template-row ${
                    index % 2 === 0 ? "bg-light" : "bg-white"
                  }`}
                  onClick={() => handleselect(data.fId)}
                >
                  {/* NAME */}
                  <div className="col-6 text-truncate fw-semibold">
                    {data.attribute}
                  </div>

                  {/* EDIT */}
                  <div className="col-3 text-center">
                    <CiEdit
                      className="icon-btn text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCoordinateDataHanlder(data.fId);
                      }}
                    />
                  </div>

                  {/* DELETE */}
                  <div className="col-3 text-center">
                    <MdDelete
                      className="icon-btn text-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRemoveModal(true);
                        setRemoveId(data);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="card shadow border-0 p-4">
          <h5 className="fw-bold text-primary mb-4">Template Settings</h5>

          <input
            required
            type="text"
            className="form-control mb-4"
            value={templateData.name}
            onChange={(e) =>
              setTemplateData({
                ...templateData,
                name: e.target.value,
              })
            }
            placeholder="Enter template name..."
          />

          <div className="d-grid gap-2">
            <button
              onClick={() => setPermissionModal(true)}
              className="btn btn-outline-primary"
            >
              Select Pattern
            </button>

            <button onClick={onCheckHandler} className="btn btn-success">
              Save Template
            </button>

            {editFlag === "true" && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn btn-warning"
              >
                Edit Mapped Data
              </button>
            )}
          </div>
        </div>
      </div>

      <EditMappedDataModel
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        selectedCoordinates={selectedCoordinates}
      />
    </>
  );
};

export default TemplateData;

<style jsx>
  {`
    /* scroll height */
    .template-scroll {
      max-height: 300px;
      overflow-y: auto;
    }

    /* row hover (tailwind hover replacement) */
    .template-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .template-row:hover {
      background-color: #e9f2ff !important;
    }

    /* icon styling (tailwind scale replacement) */
    .icon-btn {
      font-size: 22px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .icon-btn:hover {
      transform: scale(1.2);
    }
  `}
</style>;
