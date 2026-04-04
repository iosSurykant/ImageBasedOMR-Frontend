import React, { useEffect, useState } from "react";
import { fetchTemplateFormData } from "../../services/common";

const CSVFormDataSection = ({
  formCsvData,
  // correctionData,
  // csvData,
  // headerData,
  // templateHeaders,
  // imageColName,
  // currentFocusIndex,
  // inputRefs,
  // handleKeyDownJump,
  // changeCurrentCsvDataHandler,
  // imageFocusHandler,
  // templeteId,
  // filterResults,
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (formCsvData) {
      setFormData(formCsvData);
    }
  }, [formCsvData]);

  const AllFormData = Object.entries(formCsvData).map(([key, value], i) => {
    return (
      <div
        key={i}
        className="w-100 px-3 px-lg-0 py-1 d-flex flex-column align-items-center fw-bold"
      >
        <label className="w-100 rounded py-2 shadow-sm text-center">
          <span className="small text-light fw-bold d-flex justify-content-center">
            {key?.toUpperCase()}
          </span>
        </label>

        <input
          type="text"
          className={`form-control text-center mt-1 ${
            formCsvData[key] &&
            typeof formCsvData[key] === "string" &&
            formCsvData[key].includes(" ")
              ? "bg-danger text-white"
              : ""
          }`}
          style={{ maxWidth: "180px" }}
          value={formCsvData[key] || ""}
        />
      </div>
    );
  });

  return (
    <div className="border-end order-lg-1" style={{ width: "240px" }}>
      <div className="overflow-hidden">
        <article
          style={{
            scrollbarWidth: "thin",
            height: "80vh",
            width: "95%",
          }}
          className="py-4 mt-4 mt-lg-5 shadow mx-auto overflow-auto rounded d-flex flex-row flex-lg-column align-items-lg-center bg-primary"
        >
          {formData && AllFormData}
        </article>
      </div>
      {/* View image */}
    </div>
  );
};

export default CSVFormDataSection;
