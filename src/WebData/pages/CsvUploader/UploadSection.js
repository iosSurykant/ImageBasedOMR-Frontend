import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";

const UploadSection = ({
  onImageFolderHandler,
  setEditId,
  setEditModal,
  data,
  templateName,
  setTemplateName,
  imageNames,
  filteredTemplates,
  selectedId,
  setSelectedId,
  setRemoveModal,
  setRemoveId,
  handleImageNameChange,
  UploadFile,
  csvFile,
  onCsvFileHandler,
  imageFolder,
  setOpenPreFile,
  onGetCsvInfoHandler,
  onFileHeaderDetailsHandler,
}) => {
  const [enteredImageName, setEnteredImageName] = useState(null);
  useEffect(() => {
    if (data?.imageColName) {
      handleImageNameChange(0, data?.imageColName);
    }
  }, [data]);

  localStorage.setItem("templeteId", selectedId);


  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center g-4">
        {/* TEMPLATE SECTION */}
        <div className="col-lg-4">
          <div className="card shadow border-0 h-100">
            <div className="card-body text-center">
              <h5 className="text-primary mb-3">Template Name</h5>

              {/* Search */}
              <div className="position-relative mb-3">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Search..."
                  className="form-control ps-5"
                />
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "20px",
                    transform: "translateY(-50%)",
                  }}
                >
                <IoSearch style={{fontSize:25}}/>
                </span>
              </div>

              {/* Template List */}
              <div
                className="border rounded p-2"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {filteredTemplates?.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedId(template.id)}
                    className={`d-flex justify-content-between align-items-center p-2 rounded mb-2 cursor-pointer ${
                      selectedId === template.id ? "bg-light border" : ""
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <span
                      className={
                        selectedId === template.id
                          ? "text-primary fw-semibold"
                          : "text-dark"
                      }
                    >
                      {template.name}
                    </span>

                      <CiEdit
                        onClick={() => {
                          setEditModal(true);
                          setEditId(template.id);
                        }}
                        className="text-primary"
                        style={{ cursor: "pointer" }}
                      />
                      <MdDelete
                        onClick={() => {
                          setRemoveModal(true);
                          setRemoveId(template.id);
                        }}
                        className="text-danger"
                        style={{ cursor: "pointer" }}
                      />
                  </div>
                ))}
              </div>

              {/* Image Inputs */}
              <div className="mt-3">
                {data &&
                  Array.from({ length: data.pageCount }).map((_, index) => (
                    <input
                      key={index}
                      disabled={!!data?.imageColName}
                      type="text"
                      value={
                        imageNames[index] !== undefined
                          ? imageNames[index]
                          : data?.imageColName
                      }
                      onChange={(e) => {
                        if (!data?.imageColName) {
                          handleImageNameChange(index, e.target.value);
                        }
                      }}
                      placeholder={
                        data.pageCount === 1
                          ? "Image Name"
                          : `${index === 0 ? "First" : "Second"} Image Name`
                      }
                      className="form-control mb-2 text-center"
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>

        <style jsx>
          {`
            /* Upload Box Hover */
            .upload-box {
              transition: all 0.3s ease;
              border-radius: 12px;
            }

            .upload-box:hover {
              transform: translateY(-5px);
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }

            /* Drag & Drop Area */
            .upload-area {
              border: 2px dashed #0d6efd;
              border-radius: 10px;
              padding: 20px;
              cursor: pointer;
              position: relative;
              transition: 0.3s;
            }

            .upload-area:hover {
              background-color: #f8f9fa;
            }

            /* Hidden Input */
            .file-input {
              position: absolute;
              width: 100%;
              height: 100%;
              opacity: 0;
              top: 0;
              left: 0;
              cursor: pointer;
            }

            /* Buttons polish */
            .btn {
              border-radius: 8px !important;
              font-weight: 500;
              transition: 0.2s;
            }

            .btn:hover {
              transform: scale(1.03);
            }
          `}
        </style>

        {/* CSV UPLOAD */}
        <div className="col-lg-4">
          <div className="card shadow border-0 text-center h-100 upload-box">
            <div className="card-body d-flex flex-column justify-content-center">
              <img
                src={UploadFile}
                alt="upload"
                width="70"
                className="mx-auto mb-3"
              />

              <h6 className="mb-2">Upload CSV File</h6>

              <div className="upload-area mb-3">
                <p className="mb-2 text-muted">Drag & Drop or Click</p>

                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={onCsvFileHandler}
                  className="file-input"
                />
              </div>

              <small className="text-muted">
                {csvFile?.name || "No file selected"}
              </small>
            </div>
          </div>
        </div>

        {/* ZIP UPLOAD */}
        <div className="col-lg-4">
          <div className="card shadow border-0 text-center h-100 upload-box">
            <div className="card-body d-flex flex-column justify-content-center">
              <img
                src={UploadFile}
                alt="upload"
                width="70"
                className="mx-auto mb-3"
              />

              <h6 className="mb-2">Upload Image Folder</h6>

              <div className="upload-area mb-3">
                <p className="mb-2 text-muted">Drag & Drop or Click</p>

                <input
                  type="file"
                  accept=".zip,.folder,.rar"
                  onChange={onImageFolderHandler}
                  className="file-input"
                />
              </div>

              <small className="text-muted">
                {imageFolder?.name || "No file selected"}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="text-center mt-4">
        {selectedId && (
          <button
            onClick={() => {
              setOpenPreFile(true);
              onGetCsvInfoHandler();
            }}
            className="btn btn-info me-3 px-4"
          >
            Pre Files
          </button>
        )}

        <button
          onClick={onFileHeaderDetailsHandler}
          className="btn btn-success px-4"
        >
          Save Files
        </button>
      </div>
    </div>
  );
};

export default UploadSection;
