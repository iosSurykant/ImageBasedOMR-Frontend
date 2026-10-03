import React, { useEffect, useRef } from "react";
import { S } from "../preDesignStyles";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Shared overlay + dialog for every modal in this module.
 *  - locks page scroll while open
 *  - Escape closes (can be turned off, e.g. while saving)
 *  - Tab stays inside the dialog; focus returns to the opener on close
 *  - backdrop closes only if the press AND the release both happen on the
 *    backdrop, so drag-selecting text in an input never closes the modal
 */
const ModalShell = ({ label, onClose, closeOnBackdrop = true, closeOnEscape = true, maxWidth = 760, children }) => {
  const dialogRef = useRef(null);
  const pressedOnBackdrop = useRef(false);
  const onCloseRef = useRef(onClose);
  const escapeRef = useRef(closeOnEscape);
  onCloseRef.current = onClose;
  escapeRef.current = closeOnEscape;

  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        if (escapeRef.current) onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const nodes = dialog.querySelectorAll(FOCUSABLE);
      if (!nodes.length) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (opener && typeof opener.focus === "function") opener.focus();
    };
  }, []);

  return (
    <div
      style={S.overlay}
      onMouseDown={(e) => {
        pressedOnBackdrop.current = e.target === e.currentTarget;
      }}
      onMouseUp={(e) => {
        if (closeOnBackdrop && pressedOnBackdrop.current && e.target === e.currentTarget) onClose();
        pressedOnBackdrop.current = false;
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        style={{ ...S.modal, maxWidth, outline: "none" }}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalShell;