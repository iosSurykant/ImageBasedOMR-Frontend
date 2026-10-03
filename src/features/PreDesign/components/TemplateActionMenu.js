import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FiEdit2, FiEye } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { C } from "../preDesignStyles";

const MENU_W = 150;
const MENU_H = 128;

const itemStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "9px 14px",
  background: "transparent",
  border: "none",
  fontSize: 14,
  fontWeight: 500,
  textAlign: "left",
  cursor: "pointer",
};

const TemplateActionMenu = ({ onView, onEdit, onDelete }) => {
  const [coords, setCoords] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const close = useCallback(() => setCoords(null), []);

  // Close on any press outside this menu (including another row's ⋮ button),
  // so two menus can never be open together.
  useEffect(() => {
    if (!coords) return undefined;
    const onPointerDown = (e) => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [coords, close]);

  const toggle = (e) => {
    if (coords) {
      close();
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const opensAbove = window.innerHeight - r.bottom < MENU_H;
    setCoords({
      top: opensAbove ? r.top - MENU_H - 4 : r.bottom + 4,
      left: Math.max(8, r.right - MENU_W),
    });
  };

  const run = (fn) => () => {
    close();
    fn();
  };

  const hover = (on) => (e) => {
    e.currentTarget.style.backgroundColor = on ? C.hoverBg : "transparent";
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="pd-focusable"
        aria-label="Template actions"
        aria-haspopup="menu"
        aria-expanded={Boolean(coords)}
        onClick={toggle}
        style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: C.muted, display: "inline-flex" }}
      >
        <HiOutlineDotsVertical size={20} />
      </button>

      {coords &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: MENU_W,
              zIndex: 10000,
              backgroundColor: "#fff",
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: "4px 0",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
            }}
          >
            <button type="button" role="menuitem" className="pd-focusable" style={{ ...itemStyle, color: C.text }} onClick={run(onView)} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>
              <FiEye /> View
            </button>
            <button type="button" role="menuitem" className="pd-focusable" style={{ ...itemStyle, color: C.text }} onClick={run(onEdit)} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>
              <FiEdit2 /> Edit
            </button>
            <button type="button" role="menuitem" className="pd-focusable" style={{ ...itemStyle, color: C.danger }} onClick={run(onDelete)} onMouseEnter={hover(true)} onMouseLeave={hover(false)}>
              <RiDeleteBin6Line /> Delete
            </button>
          </div>,
          document.body
        )}
    </>
  );
};

export default TemplateActionMenu;