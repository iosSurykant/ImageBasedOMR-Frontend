import React from "react";
import { RxCross2 } from "react-icons/rx";
import { LuLayoutTemplate } from "react-icons/lu";
import ModalShell from "./ModalShell";
import OmrPreview from "./OmrPreview";
import { C, S } from "../preDesignStyles";

const Row = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", fontSize: 12 }}>
    <span style={{ color: C.muted }}>{label}</span>
    <span style={{ color: C.text, fontWeight: 600, textAlign: "right" }}>{value}</span>
  </div>
);

const ViewTemplateModal = ({ item, templateLabel, onClose }) => {
  if (!item) return null;
  const fields = item.fields || [];

  return (
    <ModalShell label={`${item.name} template`} onClose={onClose}>
      <div style={S.modalHead}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span style={S.iconBadge}>
            <LuLayoutTemplate size={18} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{item.name}</div>
            <div style={{ fontSize: 11, color: C.muted }}>Template Id: {item.id}</div>
          </div>
        </div>
        <button type="button" className="pd-focusable" onClick={onClose} style={{ ...S.btnGhost, padding: "5px 14px", fontSize: 12 }}>
          <RxCross2 className="mr-1" /> Close
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: 20 }}>
        <div
          style={{
            flex: "1 1 280px",
            backgroundColor: C.thumbBg,
            borderRadius: 10,
            padding: 16,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "100%", maxWidth: 300, aspectRatio: "200 / 280", boxShadow: "0 4px 16px rgba(15,23,42,0.12)" }}>
            <OmrPreview src={item.imgUrl} alt={`${item.id} full preview`} />
          </div>
        </div>

        <div style={{ flex: "1 1 220px", alignSelf: "flex-start", border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>Template Details</div>
          <Row label="Template ID" value={item.id} />
          <Row label="Institute" value={item.name} />
          <Row label="Template" value={templateLabel || item.templateId || "-"} />
          <Row label="Fields" value={fields.length ? fields.join(", ") : "-"} />
          <Row label="Questions" value={`1-${item.questions}`} />
        </div>
      </div>
    </ModalShell>
  );
};

export default ViewTemplateModal;