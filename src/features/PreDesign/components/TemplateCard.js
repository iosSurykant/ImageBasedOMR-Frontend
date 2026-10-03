import React from "react";
import { LuFileText } from "react-icons/lu";
import OmrPreview from "./OmrPreview";
import TemplateActionMenu from "./TemplateActionMenu";
import { C, S } from "../preDesignStyles";

const TemplateCard = ({ item, sr, onView, onEdit, onDelete }) => (
  <div
    style={{
      flex: 1,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: 10,
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
    }}
  >
    <div
      onClick={onView}
      role="button"
      tabIndex={0}
      className="pd-focusable"
      aria-label={`View ${item.id}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView();
        }
      }}
      style={{
        backgroundColor: C.thumbBg,
        borderRadius: 8,
        height: 170,
        padding: 10,
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      <OmrPreview src={item.imgUrl} alt={`${item.id} preview`} />
    </div>

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, color: C.faint, fontWeight: 500, letterSpacing: "0.3px" }}>
          Sr. {String(sr).padStart(2, "0")} &nbsp;|&nbsp; Template ID
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginTop: 2 }}>{item.id}</div>
        <div
          title={item.name}
          style={{ fontSize: 12, color: C.muted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {item.name}
        </div>
      </div>
      <TemplateActionMenu onView={onView} onEdit={onEdit} onDelete={onDelete} />
    </div>

    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {(item.fields || []).map((f) => (
        <span key={f} style={S.chip}>
          {f}
        </span>
      ))}
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto", paddingTop: 10, fontSize: 12, color: C.muted }}>
      <LuFileText size={13} /> Questions: 1-{item.questions}
    </div>
  </div>
);

export default TemplateCard;