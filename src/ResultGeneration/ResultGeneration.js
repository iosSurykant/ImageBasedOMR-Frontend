import React, { useState } from "react";
import { fetchCsvHeader, generateResult } from "helper/ResultGenerationHelper";
import { useNavigate } from "react-router-dom";
import NormalHeader from "components/Headers/NormalHeader";

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

  // ── ALL LOGIC UNCHANGED ───────────────────────────────────────────────────

  // const handleProcess = async () => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("AnswerKey", keyFile);
  //     formData.append("BubbleScan", studentFile);
  //     formData.append("positive", positive);
  //     formData.append("negative", negative);
  //     formData.append("selectedKey", selectedKey);
  //     formData.append("selectedHeaders", selectedHeaders.join(","));
  //     formData.append(
  //       "compairFields",
  //       questionList.map((q) => `${q.startQ}-${q.endQ}`).join(","),
  //     );
  //     formData.append(
  //       "questions",
  //       JSON.stringify(
  //         questionList.map((q) => ({
  //           subject: q.subject,
  //           startQ: q.startQ,
  //           endQ: q.endQ,
  //         })),
  //       ),
  //     );
  //     formData.append("percentage", percentage);
  //     formData.append("grade", grade);

  //     const data = await generateResult(formData);
  //     const blob = new Blob([data], { type: "text/csv" });
  //     setResultBlob(blob);

  //     const text = await blob.text();
  //     const rows = text.split("\n").map((row) => row.split(","));
  //     const headers = rows[0];
  //     const tableData = rows.slice(1).map((row) => {
  //       let obj = {};
  //       headers.forEach((header, index) => {
  //         obj[header.trim()] = row[index];
  //       });
  //       return obj;
  //     });

  //     setTableHeaders(headers);
  //     setTableData(tableData);

  //     navigate("/admin/result-table", {
  //       state: { tableHeaders: headers, tableData, resultBlob: blob },
  //     });
  //   } catch (err) {
  //     console.error("Error generating result:", err);
  //   }
  // };

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
      setResultBlob(blob);

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
    const newEntry = { subject, startQ, endQ, key: selectedKey };
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

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: "#f4f6f9", position: "relative" }}>
      <NormalHeader />

      <div style={{ padding: "24px", position: "relative", top: "-100px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #e2e6ea",
            padding: "24px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* ── PAGE TITLE ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#3b82f6"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          
            <h4
              style={{
                margin: 0,
                fontSize: "17px",
                fontWeight: 600,
                color: "#1a1a2e",
              }}
            >
              Result Generation
            </h4>
          </div>

          {/* ── TOP THREE-PANEL GRID ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr 220px",
              gap: "16px",
              marginBottom: "18px",
            }}
          >
            {/* ── STEP 1 : Upload & Matching ── */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e6ea",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#1E1E1E",
                  lineHeight: "100%",
                  marginBottom: "12px",
                }}
              >
                Step 1: Upload &amp; Matching
              </p>

              {/* Student file drop zone */}
              <label
                style={{
                  display: "block",
                  border: "2px dashed #d1d5db",
                  borderRadius: "8px",
                  padding: "15px 10px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#fafafa",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    background: "#3b82f6",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#fff"
                    strokeWidth="2.5"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: "1px",
                  }}
                >
                  Upload Student File
                </p>
                <span style={{ fontSize: "10px", color: "#9ca3af" }}>
                  Accepted file: csv, pdf, xls
                </span>
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setStudentFile(file);
                    handleFileUploadForHeaders(file);
                  }}
                />
              </label>

              {/* Answer key drop zone */}
              <label
                style={{
                  display: "block",
                  border: "2px dashed #f59e0b",
                  borderRadius: "8px",
                  padding: "15px 10px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#F3EDD7",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    background: "#f59e0b",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#fff"
                    strokeWidth="2.5"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: "1px",
                  }}
                >
                  Upload Answer Key
                </p>
                <span style={{ fontSize: "10px", color: "#9ca3af" }}>
                  Accepted file: csv, xls
                </span>
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setKeyFile(file);
                    handleFileUploadForAnsKey(file);
                  }}
                />
              </label>

              {/* Uploaded file chips */}
              {studentFile && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#f3f4f6",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    fontSize: "12px",
                    color: "#374151",
                    marginBottom: "6px",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#22c55e"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 9h6M9 12h6M9 15h4" />
                  </svg>
                  {studentFile.name.length > 14
                    ? studentFile.name.slice(0, 11) + "..."
                    : studentFile.name}
                  <span
                    style={{
                      marginLeft: "auto",
                      cursor: "pointer",
                      color: "#9ca3af",
                    }}
                    onClick={() => setStudentFile(null)}
                  >
                    ×
                  </span>
                </div>
              )}
              {keyFile && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#f3f4f6",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    fontSize: "12px",
                    color: "#374151",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#22c55e"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 9h6M9 12h6M9 15h4" />
                  </svg>
                  {keyFile.name.length > 14
                    ? keyFile.name.slice(0, 11) + "..."
                    : keyFile.name}
                  <span
                    style={{
                      marginLeft: "auto",
                      cursor: "pointer",
                      color: "#9ca3af",
                    }}
                    onClick={() => setKeyFile(null)}
                  >
                    ×
                  </span>
                </div>
              )}
            </div>

            {/* ── STEP 2 : Define Rule ── */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e6ea",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1E1E1E",
                    lineHeight: "100%",
                    // letterSpacing: ".6px",
                    margin: 0,
                  }}
                >
                  Step 2: Define Rule
                </p>
                <button
                  style={{
                    // background: "#F3EDD7",
                    border: "none",
                    borderRadius: "6px",
                    padding: "5px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#374151",
                    // cursor: "pointer",
                  }}
                >
                  Apply rule to table
                </button>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#374151",
                    lineHeight:"100%",
                    marginBottom: "4px",
                  }}
                >
                  Subject
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={selectStyle}
                ></input>
              </div>

              {/* Start / End question */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label style={labelStyle}>Start Question</label>
                  <select
                    value={startQ}
                    onChange={(e) => setStartQ(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Select</option>
                    {questionHeaders.map((q, i) => (
                      <option key={i} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>End Question</label>
                  <select
                    value={endQ}
                    onChange={(e) => setEndQ(e.target.value)}
                    style={selectStyle}
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

              {/* Marks */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label style={{ ...labelStyle, color: "#16a34a" }}>
                    Scoring (Correct Marks)
                  </label>
                  <input
                    type="number"
                    value={positive}
                    onChange={(e) => setPositive(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, color: "#dc2626" }}>
                    Scoring (Negative Marks)
                  </label>
                  <input
                    type="number"
                    value={negative}
                    onChange={(e) => setNegative(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Toggles + Answer Key selector */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  gap: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="pct"
                      checked={percentage}
                      onChange={() => setPercentage(!percentage)}
                      style={{
                        accentColor: "black",
                        width: "16px",
                        height: "16px",
                      }}
                    />
                    <label
                      htmlFor="pct"
                      style={{ fontSize: "13px", color: "#374151" }}
                    >
                      Percentage
                    </label>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="grd"
                      checked={grade}
                      onChange={() => setGrade(!grade)}
                      style={{
                        accentColor: "black",
                        width: "16px",
                        height: "16px",
                      }}
                    />
                    <label
                      htmlFor="grd"
                      style={{ fontSize: "13px", color: "#374151" }}
                    >
                      Grade
                    </label>
                  </div>
                </div>
                <div style={{ minWidth: "190px" }}>
                  <label style={labelStyle}>Select Answer Key</label>
                  <select
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                    style={selectStyle}
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

            {/* ── STEP 3 : Header Selection ── */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e6ea",
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1E1E1E",
                  lineHeight: "100%",
                  marginBottom: "5px",
                  marginRight: "20px",
                }}
              >
                Step 3: Header Selection
              </p>
              <div
                style={{
                  maxHeight: "240px",
                  minWidth: "190px",
                  minHeight: "305px",
                  borderRadius: "3px",
                  overflowY: "auto",
                  border: "1px solid lightgray",
                  padding: "13px 0 13px 7px",
                  scrollbarWidth: "none",
                }}
              >
                {csvHeaders.map((header, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "2px 0",
                      fontSize: "13px",
                      color: "#374151",
                    }}
                  >
                    <input
                      type="checkbox"
                      id={`hdr-${index}`}
                      checked={selectedHeaders.includes(header)}
                      onChange={() => toggleHeader(header)}
                      style={{
                        accentColor: "black",
                        width: "16px",
                        height: "16px",
                      }}
                    />
                    <label htmlFor={`hdr-${index}`}>{header}</label>
                  </div>
                ))}
                {csvHeaders.length === 0 && (
                  <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                    Upload student file to see headers
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── ACTION BUTTONS ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <button
              onClick={handleAddQuestion}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#fff",
                border: "1.5px solid #374151",
                borderRadius: "8px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
                cursor: "pointer",
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Question
            </button>

            <button
              onClick={handleProcess}
              style={{
                background: "#3b82f6",
                border: "none",
                borderRadius: "8px",
                padding: "9px 28px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Press Result
            </button>
          </div>

          {/* ── PREVIEW TABLE ── */}
          <div style={{maxHeight:"150px", overflowY:"auto"}}>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#1a1a2e",
                marginBottom: "10px",
                // position:"fixed"
              }}
            >
              Preview
            </p>

            {questionList.length === 0 ? (
              <p
                style={{
                  fontSize: "13px",
                  color: "#9ca3af",
                  textAlign: "center",
                  padding: "24px 0",
                }}
              >
                No data
              </p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr>
                    {[
                      "#",
                      "Subject",
                      "Start Q",
                      "End Q",
                      "Positive",
                      "Negative",
                      "Section Code",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          background: "#f9fafb",
                          padding: "9px 12px",
                          textAlign: "left",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: ".5px",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questionList.map((q) => (
                    <tr key={q.id}>
                      <td style={tdStyle}>{q.id}</td>
                      <td style={tdStyle}>{q.subject}</td>
                      <td style={tdStyle}>{q.startQ}</td>
                      <td style={tdStyle}>{q.endQ}</td>
                      <td style={tdStyle}>{positive}</td>
                      <td style={tdStyle}>{negative}</td>
                      <td style={tdStyle}>{q.key}</td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => handleDelete(q.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#ef4444",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Shared micro-styles ────────────────────────────────────────────────────

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "4px",
};

const selectStyle = {
  width: "100%",
  padding: "7px 10px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  fontSize: "13px",
  color: "#1f2937",
  background: "#fff",
  outline: "none",
};

const inputStyle = {
  width: "100%",
  padding: "7px 10px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  fontSize: "13px",
  color: "#1f2937",
  background: "#fff",
  outline: "none",
};

const tdStyle = {
  padding: "10px 12px",
  borderBottom: "1px solid #f3f4f6",
  color: "#374151",
};

export default ResultGenerateUI;
