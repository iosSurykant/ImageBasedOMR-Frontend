import React, { useState } from "react";
import { Button } from "reactstrap";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

const ScanToolbar = React.memo(function ScanToolbar({
  csvString,
  scanning,
  isPaused,
  isRefreshing,
  accuracy,
  dbState,
  onStart,
  onPause,
  onResume,
  onRefresh,
  onReset,
  onDbStateChange,
}) {

  const DbStateDropdown = ({ dbState, onDbStateChange }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggle = () => setDropdownOpen((prev) => !prev);

    return (
      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle
          caret
          className="border-0 bg-white d-flex align-items-center justify-content-between px-3 py-2.9 "
          style={{ width: 200 }}
        >
          {dbState ? "Save To DB" : "Don't Save To DB"}
        </DropdownToggle>

        <DropdownMenu>
          <DropdownItem onClick={() => onDbStateChange(false)}>
            Don't Save To DB
          </DropdownItem>

          <DropdownItem onClick={() => onDbStateChange(true)}>
            Save To DB
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  };

  // First Decode base64 then JSON.parse then json to csv and download
  const downloadCsv = () => {
    const decodedString = atob(csvString);
    const jsonData = JSON.parse(decodedString);

    // console.log(jsonData);
    const rows = jsonData.map((item) => item.FieldResults);
    const headers = Object.keys(rows[0]);
    // console.log(headers);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((key) => `"${row[key] ?? ""}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "scan_results.csv";
    link.click();

    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-2 px-1">
      {/* ── DB toggle ──────────────────────────────────────────────────────── */}
      <div clssName="ml-5">
        <DbStateDropdown dbState={dbState} onDbStateChange={onDbStateChange} />

        <Button color="primary" hidden={!csvString} onClick={downloadCsv}>
          Download CSV
        </Button>
      </div>

      {/* ── Accuracy badge ─────────────────────────────────────────────────── */}
      <div
        className="shadow rounded bg-white px-3 py-2"
        style={{ minWidth: 180 }}
      >
        <span className="text-muted text-bold">
          Accuracy Rate{" "}
          <span className="fw-bold fs-5 text-dark">{accuracy}%</span>
        </span>
      </div>

      {/* ── Action buttons ─────────────────────────────────────────────────── */}
      <div className="d-flex gap-2 ms-auto">
        <Button
          color="info"
          disabled={isRefreshing || scanning}
          onClick={onRefresh}
        >
          Refresh Data
        </Button>

        <Button color="success" disabled={scanning} onClick={onStart}>
          {scanning ? "Scanning…" : "Start"}
        </Button>

        {scanning && !isPaused && (
          <Button color="warning" onClick={onPause}>
            Pause
          </Button>
        )}

        {scanning && isPaused && (
          <Button color="info" onClick={onResume}>
            Resume
          </Button>
        )}

        <Button color="danger" onClick={onReset}>
          Stop
        </Button>
      </div>
    </div>
  );
});
export default ScanToolbar;
