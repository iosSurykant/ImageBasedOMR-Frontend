import React from "react";

export const FONT = '"Outfit", Inter, -apple-system, "Segoe UI", sans-serif';

export const C = {
  primary: "#2563eb",
  gradient: "linear-gradient(to left, #3969FE, #1047D5)",
  border: "#e2e8f0",
  text: "#1e293b",
  muted: "#64748b",
  faint: "#94a3b8",
  chipBg: "#eef0ff",
  chipText: "#5b5fc7",
  chipNeutral: "#f1f5f9",
  danger: "#dc3545",
  required: "#f64e60",
  surface: "#f8fafc",
  headBg: "#f1f4fc",
  thumbBg: "#f3f4f6",
  hoverBg: "#f8f9fa",
  label: "#3f4254",
  readOnlyBg: "#f4f6f9",
  readOnlyText: "#8a94a6",
  listHead: "#464e5f",
  listText: "#4a5568",
  rowBorder: "#f0f2f5",
  panelBorder: "#eff2f5",
};

export const S = {
  panel: {
    backgroundColor: "#fff",
    border: `1px solid ${C.panelBorder}`,
    borderRadius: 12,
    padding: 20,
    fontFamily: FONT,
    boxShadow: "0 0 20px rgba(76, 87, 125, 0.03)",
  },
  btnPrimary: {
    background: C.gradient,
    border: "none",
    color: "#fff",
    fontWeight: 500,
    fontSize: 14,
    letterSpacing: "0.3px",
    borderRadius: 6,
    padding: "9px 18px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnDanger: {
    backgroundColor: C.danger,
    border: "none",
    color: "#fff",
    fontWeight: 500,
    fontSize: 14,
    borderRadius: 6,
    padding: "9px 18px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnGhost: {
    backgroundColor: "#fff",
    border: `1px solid ${C.border}`,
    color: C.text,
    fontWeight: 500,
    fontSize: 13,
    borderRadius: 6,
    padding: "8px 16px",
    cursor: "pointer",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.chipBg,
    color: C.chipText,
    fontSize: 11,
    fontWeight: 500,
    borderRadius: 4,
    padding: "2px 8px",
    whiteSpace: "nowrap",
  },
  label: { fontSize: 13, fontWeight: 600, color: C.label, marginBottom: 6, display: "block" },
  // The focus ring comes from .pd-input:focus in PreDesignGlobalStyles
  input: {
    width: "100%",
    borderRadius: 6,
    border: `1px solid ${C.border}`,
    fontSize: 14,
    color: C.label,
    padding: "10px 12px",
    backgroundColor: "#fff",
  },
  inputReadOnly: { backgroundColor: C.readOnlyBg, color: C.readOnlyText, cursor: "not-allowed" },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    overflowY: "auto",
    fontFamily: FONT,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "94vh",
    overflowY: "auto",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
  },
  modalHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "16px 20px",
    borderBottom: `1px solid ${C.border}`,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: C.chipBg,
    color: C.primary,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};

/** Visible keyboard focus for everything in this module (inline styles can't do :focus). */
export const PreDesignGlobalStyles = () => (
  <style>{`
    .pd-input:focus {
      outline: none;
      border-color: ${C.primary} !important;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    .pd-focusable:focus-visible {
      outline: 2px solid ${C.primary};
      outline-offset: 2px;
    }
  `}</style>
);