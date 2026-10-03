import React from "react";
import ModalShell from "./ModalShell";
import { C, S } from "../preDesignStyles";

const ConfirmDeleteModal = ({ item, deleting, onCancel, onConfirm }) => {
  if (!item) return null;

  return (
    <ModalShell
      label="Delete template"
      maxWidth={420}
      onClose={onCancel}
      closeOnEscape={!deleting}
      closeOnBackdrop={!deleting}
    >
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Delete {item.id}?</div>
        <p style={{ fontSize: 14, color: C.muted, margin: "8px 0 20px" }}>
          This removes the template for {item.name || "this institute"}. You can't undo it.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="pd-focusable" onClick={onCancel} disabled={deleting} style={S.btnGhost}>
            Cancel
          </button>
          <button
            type="button"
            className="pd-focusable"
            onClick={onConfirm}
            disabled={deleting}
            style={{ ...S.btnDanger, opacity: deleting ? 0.7 : 1, cursor: deleting ? "wait" : "pointer" }}
          >
            {deleting ? "Deleting..." : "Delete template"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default ConfirmDeleteModal;