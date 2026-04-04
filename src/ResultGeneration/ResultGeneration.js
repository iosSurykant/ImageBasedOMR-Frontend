import React, { useState } from "react";

import { fetchCsvHeader, generateResult } from "helper/ResultGenerationHelper";
import ResultTable from "./ResultTable";
import { useNavigate } from "react-router-dom";

const ResultGenerateUI = () => {
  const [studentFile, setStudentFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [positive, setPositive] = useState(1);
  const [negative, setNegative] = useState(0);
  const [startQ, setStartQ] = useState("");
  const [endQ, setEndQ] = useState("");
  const [subject, setSubject] = useState("");
  const [percentage, setPercentage] = useState(false);
  const [grade, setGrade] = useState(false);
  const [questionList, setQuestionList] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [ansKeyHeaders, setAnsKeyHeaders] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [resultBlob, setResultBlob] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);

  const navigate = useNavigate();


  const handleProcess = async () => {
    try {
      const formData = new FormData();

      formData.append("AnswerKey", keyFile);
      formData.append("BubbleScan", studentFile);
      formData.append("positive", positive);
      formData.append("negative", negative);
      formData.append("selectedKey", selectedKey);
      formData.append("selectedHeaders", selectedHeaders.join(","));
      formData.append(
        "compairFields",
        questionList.map((q) => `${q.startQ}-${q.endQ}`).join(","),
      );
      formData.append(
        "questions",
        JSON.stringify(
          questionList.map((q) => ({
            subject: q.subject,
            startQ: q.startQ,
            endQ: q.endQ,
          })),
        ),
      );
      formData.append("percentage", percentage);
      formData.append("grade", grade);

      const data = await generateResult(formData);

      const blob = new Blob([data], { type: "text/csv" });
      setResultBlob(blob)

      // 🔥 Convert CSV to text
      const text = await blob.text();

      // 🔥 Convert CSV text → JSON
      const rows = text.split("\n").map((row) => row.split(","));

      const headers = rows[0];
      const tableData = rows.slice(1).map((row) => {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = row[index];
        });
        return obj;
      });

      // ✅ store in state
      setTableHeaders(headers);
      setTableData(tableData);

      navigate("/admin/result-table", {
        state: {
          tableHeaders: headers,
          tableData: tableData,
          resultBlob: blob,
        },
      });
    } catch (err) {
      console.error("Error generating result:", err);
    }
  };


  const handleFileUploadForHeaders = async (file) => {
    const res = await fetchCsvHeader(file);
    setCsvHeaders(res || []);
  };

  const handleFileUploadForAnsKey = async (file) => {
    const res = await fetchCsvHeader(file);
    setAnsKeyHeaders(res || []);
  };

  const questionHeaders = ansKeyHeaders.filter((h) =>
    h.toLowerCase().startsWith("q"),
  );

  const handleAddQuestion = () => {
    if (!startQ || !endQ || !selectedKey || !subject) {
      alert("Please fill all required fields");
      return;
    }

    const newEntry = {
      subject,
      startQ,
      endQ,
      // positive: Number(positive),
      // negative: Number(negative),
      key: selectedKey,
    };

    const updatedList = [...questionList, newEntry].map((item, index) => ({
      ...item,
      id: index + 1,
    }));

    setQuestionList(updatedList);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure?")) return;

    const updatedList = questionList
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, id: index + 1 }));

    setQuestionList(updatedList);
  };

  const toggleHeader = (header) => {
    setSelectedHeaders((prev) =>
      prev.includes(header)
        ? prev.filter((h) => h !== header)
        : [...prev, header],
    );
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "#f5f5f5" }}
    >
      <div
        className="border rounded-4 p-4 bg-white"
        style={{ width: "100%", maxWidth: "1200px" }}
      >
        {/* ================= TOP SECTION ================= */}
        <div className="container my-4 ">
          <div
            className="d-flex align-items-around py-4 shadow-sm rounded bg-white"
            style={{ minHeight: "320px" }}
          >
            {/* LEFT COLUMN */}
            <div
              className="d-flex flex-column justify-content-between gap-3 mx-3"
              style={{ width: "260px" }}
            >
              <div>
                <label className="fw-semibold mb-1">Student File</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setStudentFile(file);
                    handleFileUploadForHeaders(file);
                  }}
                />
              </div>

              <div>
                <label className="fw-semibold mb-1">Answer Key</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setKeyFile(file);
                    handleFileUploadForAnsKey(file);
                  }}
                />
              </div>

              <div>
                <label className="fw-semibold mb-1">Subject</label>
                <input
                  className="form-control"
                  placeholder="Enter subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            {/* CENTER COLUMN */}
            <div className="flex-grow-1 mx-3">
              <div className="d-flex flex-column gap-4 h-100 justify-content-around">
                {/* START / END */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Start Q</label>
                    <select
                      className="form-select"
                      value={startQ}
                      onChange={(e) => setStartQ(e.target.value)}
                    >
                      <option value="">Select</option>
                      {questionHeaders.map((q, i) => (
                        <option key={i} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">End Q</label>
                    <select
                      className="form-select"
                      value={endQ}
                      onChange={(e) => setEndQ(e.target.value)}
                    >
                      <option value="">Select</option>
                      {questionHeaders.map((q, i) => (
                        <option key={i} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* MARKS */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Correct Mark
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter marks"
                      value={positive}
                      onChange={(e) => setPositive(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Negative Mark
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter marks"
                      value={negative}
                      onChange={(e) => setNegative(e.target.value)}
                    />
                  </div>
                </div>

                {/* CHECKBOX + SELECT */}
                <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
                  <div className="d-flex gap-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        checked={percentage}
                        onChange={() => setPercentage(!percentage)}
                        className="form-check-input"
                        id="percentage"
                      />
                      <label className="form-check-label" htmlFor="percentage">
                        Percentage
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        checked={grade}
                        onChange={() => setGrade(!grade)}
                        className="form-check-input"
                        id="grade"
                      />
                      <label className="form-check-label" htmlFor="grade">
                        Grade
                      </label>
                    </div>
                  </div>

                  <div style={{ minWidth: "200px" }}>
                    <label className="form-label fw-semibold">Select Key</label>
                    <select
                      className="form-select"
                      value={selectedKey}
                      onChange={(e) => setSelectedKey(e.target.value)}
                    >
                      <option value="">-- Select Key --</option>
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div
              className="border rounded-4 p-3 d-flex flex-column mx-3"
              style={{ width: "260px" }}
            >
              <div className="fw-semibold mb-2 border-bottom pb-1">
                Select Headers
              </div>

              <div
                className="flex-grow-1"
                style={{ overflowY: "auto", maxHeight: "220px" }}
              >
                {csvHeaders.map((header, index) => (
                  <div key={index} className="form-check mb-1">
                    <input
                      type="checkbox"
                      checked={selectedHeaders.includes(header)}
                      onChange={() => toggleHeader(header)}
                      className="form-check-input"
                      id={`header-${index}`}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`header-${index}`}
                    >
                      {header}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= MIDDLE (PREVIEW) ================= */}
        <div
          className="border rounded-4 p-3 mb-4"
          style={{ minHeight: "220px" }}
        >
          <div className="text-center fw-semibold mb-2">Preview</div>

          {questionList.length === 0 ? (
            <p className="text-center text-muted">No data</p>
          ) : (
            <div style={{ maxHeight: "180px", overflowY: "auto" }}>
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Subject</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Positive</th>
                    <th>Negative</th>
                    <th>Key</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {questionList.map((q) => (
                    <tr key={q.id}>
                      <td>{q.id}</td>
                      <td>{q.subject}</td>
                      <td>{q.startQ}</td>
                      <td>{q.endQ}</td>
                      <td>{positive}</td>
                      <td>{negative}</td>
                      <td>{q.key}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(q.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================= BOTTOM BUTTONS ================= */}
        <div className="d-flex justify-content-between align-items-center">
          <button
            className="btn btn-outline-dark px-4"
            onClick={handleAddQuestion}
          >
            add question
          </button>

          <button className="btn btn-dark px-4" onClick={handleProcess}>
            Process Result
          </button>
        </div>
        {/* <ResultTable tableHeaders={tableHeaders} tableData={tableData}  /> */}
      </div>
    </div>
  );
};

export default ResultGenerateUI;
