import { Button } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResultTable = ({ tableHeaders = [], tableData = [], resultBlob }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  console.log("RAW HEADERS:", tableHeaders);
  console.log("RAW DATA:", tableData);

  // ✅ 1. Clean Headers
  const cleanHeaders = tableHeaders.map((h) =>
    h?.toString().replace(/"/g, "").replace(/\r/g, "").trim()
  );

  // ✅ 2. Clean Data
  const cleanData = tableData.map((row) => {
    const newRow = {};

    Object.entries(row).forEach(([key, value]) => {
      const cleanKey = key
        ?.toString()
        .replace(/"/g, "")
        .replace(/\r/g, "")
        .trim();

      let cleanValue = value;
      if (typeof cleanValue === "string") {
        cleanValue = cleanValue
          .replace(/"/g, "")
          .replace(/\r/g, "")
          .trim();
      }

      newRow[cleanKey] = cleanValue;
    });

    return newRow;
  });

  console.log("CLEAN HEADERS:", cleanHeaders);
  console.log("CLEAN DATA SAMPLE:", cleanData[0]);

  // ✅ 3. Handle Empty Case
  if (!cleanHeaders.length || !cleanData.length) {
    return (
      <div className="text-center mt-5 text-danger fw-semibold">
        No Data Props Passed
      </div>
    );
  }

  // ✅ 4. Filter Logic
  const filteredData = cleanData.filter((row) =>
    cleanHeaders.some((header) => {
      const val = row[header];
      return (
        val !== undefined &&
        val.toString().toLowerCase().includes(search.toLowerCase())
      );
    })
  );

  // ✅ 5. Download Clean CSV
  const handleDownload = () => {
    if (!cleanData.length) return;

    const csvHeaders = cleanHeaders.join(",");

    const csvRows = cleanData.map((row) =>
      cleanHeaders.map((h) => row[h] ?? "").join(",")
    );

    const csvContent = [csvHeaders, ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "result.csv");
    link.click();
  };

  const handleOkay = () => {
    navigate("/admin", { replace: true });
  };

  return (
    <div className="container-fluid mt-4">
      {/* 🔥 HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">📊 Result Table</h5>

        <input
          type="text"
          className="form-control w-25"
          placeholder="Search anything..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 🔥 TABLE CARD */}
      <div
        className="card shadow-sm border-0 rounded-4"
        style={{ overflow: "hidden" }}
      >
        <div
          className="table-responsive"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          <table className="table table-hover align-middle mb-0">
            {/* HEADER */}
            <thead
              className="table-dark"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
              }}
            >
              <tr>
                {cleanHeaders.map((header, index) => (
                  <th key={index} className="text-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {cleanHeaders.map((header, colIndex) => (
                    <td key={colIndex}>
                      {row[header] !== undefined && row[header] !== null
                        ? row[header]
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="p-2 text-end small text-muted">
          Showing {filteredData.length} of {cleanData.length} records
        </div>

        <div className="p-2 d-flex gap-2 justify-content-end">
          <Button variant="contained" onClick={handleDownload}>
            Download
          </Button>
          <Button variant="outlined" onClick={handleOkay}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultTable;