import React from "react";

const CustomSwitch = ({
  id,
  checked,
  onChange,
  label,
  showStatus = false,
}) => {
  return (
    <div className="d-flex align-items-center">
      {label && (
        <span
          className="mr-2 font-weight-bold"
          style={{
            color: checked ? "#2456E6" : "#6c757d",
            fontSize: "0.9rem",
          }}
        >
          {label}
        </span>
      )}

      {showStatus && (
        <span
          className="mr-2"
          style={{
            color: checked ? "#2456E6" : "#6c757d",
            fontSize: "0.85rem",
            fontWeight: 600,
            minWidth: "28px",
          }}
        >
          {checked ? "true" : "false"}
        </span>
      )}

      <label
        htmlFor={id}
        className="mb-0"
        style={{ cursor: "pointer" }}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="d-none"
        />

        <div
          style={{
            width: 44,
            height: 24,
            borderRadius: 9999,
            background: checked ? "#2456E6" : "#e5e7eb",
            position: "relative",
            transition: "0.2s",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: 2,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,.2)",
              transform: `translateX(${checked ? 20 : 0}px)`,
              transition: "0.2s",
            }}
          />
        </div>
      </label>
    </div>
  );
};

export default CustomSwitch;