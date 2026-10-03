import React from "react";
import { LuFileText } from "react-icons/lu";
import OmrPreview from "./OmrPreview";
import TemplateActionMenu from "./TemplateActionMenu";
import { C, S } from "../preDesignStyles";

const th = {
  backgroundColor: C.headBg,
  color: C.listHead,
  fontWeight: 600,
  fontSize: 13,
  padding: "12px 14px",
  border: "none",
  whiteSpace: "nowrap",
};
const td = { verticalAlign: "middle", padding: "12px 14px", borderTop: `1px solid ${C.rowBorder}`, fontSize: 14, color: C.listText };

const TemplateListTable = ({ records, startIndex, onView, onEdit, onDelete }) => (
  <div style={{ overflowX: "auto" }}>
    <table className="table mb-0" style={{ minWidth: 720, width: "100%" }}>
      <thead>
        <tr>
          <th style={{ ...th, width: 70, borderRadius: "8px 0 0 8px" }}>Sr. No.</th>
          <th style={{ ...th, width: 100 }}>Template</th>
          <th style={th}>Template Details</th>
          <th style={th}>Fields</th>
          <th style={th}>Range</th>
          <th style={{ ...th, width: 80, textAlign: "center", borderRadius: "0 8px 8px 0" }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {records.map((item, i) => (
          <tr key={item.id}>
            <td style={{ ...td, color: C.muted }}>{startIndex + i + 1}</td>
            <td style={td}>
              <div
                role="button"
                tabIndex={0}
                className="pd-focusable"
                aria-label={`View ${item.id}`}
                onClick={() => onView(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onView(item);
                  }
                }}
                style={{ width: 44, height: 56, backgroundColor: C.thumbBg, borderRadius: 6, padding: 3, cursor: "pointer" }}
              >
                <OmrPreview src={item.imgUrl} alt={`${item.id} preview`} />
              </div>
            </td>
            <td style={td}>
              <div style={{ fontWeight: 600, color: C.text }}>{item.name}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Template ID: {item.id}</div>
            </td>
            <td style={td}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(item.fields || []).map((f) => (
                  <span key={f} style={S.chip}>
                    {f}
                  </span>
                ))}
              </div>
            </td>
            <td style={{ ...td, whiteSpace: "nowrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
                <LuFileText size={13} /> Questions: 1-{item.questions}
              </span>
            </td>
            <td style={{ ...td, textAlign: "center" }}>
              <TemplateActionMenu onView={() => onView(item)} onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TemplateListTable;