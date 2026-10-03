import React, { useEffect, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { BsChevronDown } from "react-icons/bs";
import { LuLayoutTemplate } from "react-icons/lu";
import { toast } from "react-toastify";
import ModalShell from "./ModalShell";
import OmrPreview from "./OmrPreview";
import { BASIC_FIELD_OPTIONS, QUESTION_LIMITS, getErrorMessage } from "helper/PreDesign_helper";
import { C, S } from "../preDesignStyles";

/**
 * One modal for both flows.
 * The image is not picked here: the preview shows the image of the template
 * chosen in "Select Template", and that image is what gets saved.
 * onSubmit({ templateId, name, fields, questions, imgUrl }) must return a promise;
 * the parent closes the modal on success.
 * The modal can't be dismissed by backdrop click (it would throw away typing)
 * and can't be closed at all while a save is in flight.
 */
const TemplateFormModal = ({ mode, item, templateOptions = [], onClose, onSubmit }) => {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    templateId: item?.templateId !== undefined && item?.templateId !== null ? String(item.templateId) : "",
    name: item?.name || "",
    fields: item?.fields || [],
    questions: item?.questions || "",
  });
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const remaining = BASIC_FIELD_OPTIONS.filter((f) => !form.fields.includes(f));

  // keep the saved value selectable even if it isn't in the option list
  const options =
    !form.templateId || templateOptions.some((o) => String(o.id) === form.templateId)
      ? templateOptions
      : [...templateOptions, { id: form.templateId, label: `Template ${form.templateId}` }];

  const selected = options.find((o) => String(o.id) === form.templateId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const questions = Number(form.questions);

    if (!form.templateId) {
      toast.warning("Select a template");
      return;
    }
    if (!form.name.trim()) {
      toast.warning("Enter a name");
      return;
    }
    if (!Number.isInteger(questions) || questions < QUESTION_LIMITS.min || questions > QUESTION_LIMITS.max) {
      toast.warning(`Question range must be a whole number from ${QUESTION_LIMITS.min} to ${QUESTION_LIMITS.max}`);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        templateId: form.templateId,
        name: form.name.trim(),
        fields: form.fields,
        questions,
        // send the image on create, or when the template choice changed on edit
        imgUrl:
          !isEdit || String(form.templateId) !== String(item?.templateId)
            ? selected?.imgUrl
            : undefined,
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  return (
    <ModalShell
      label={isEdit ? "Update template" : "Create template"}
      onClose={onClose}
      closeOnBackdrop={false}
      closeOnEscape={!saving}
    >
      <form noValidate onSubmit={handleSubmit} onClick={() => setAddOpen(false)}>
        <div style={S.modalHead}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={S.iconBadge}>
              <LuLayoutTemplate size={18} />
            </span>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
              {isEdit ? "Update Template" : "Create Template"}
            </div>
          </div>
          <button
            type="button"
            className="pd-focusable"
            aria-label="Close"
            disabled={saving}
            onClick={onClose}
            style={{ ...S.btnGhost, padding: 6, display: "inline-flex", border: "none" }}
          >
            <RxCross2 />
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, padding: 20 }}>
          {/* Preview of the selected template */}
          <div style={{ flex: "1 1 200px", maxWidth: 260, alignSelf: "flex-start", margin: "0 auto" }}>
            <div style={{ backgroundColor: C.thumbBg, borderRadius: 10, padding: 12 }}>
              <div style={{ aspectRatio: "200 / 280", boxShadow: "0 4px 16px rgba(15,23,42,0.1)" }}>
                <OmrPreview src={selected?.imgUrl || item?.imgUrl} alt="Template preview" />
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 8, textAlign: "center" }}>
              Preview follows the selected template
            </div>
          </div>

          {/* Fields */}
          <div style={{ flex: "2 1 280px", minWidth: 0 }}>
            <div className="mb-3" style={{ position: "relative" }}>
              <label htmlFor="pd-template" style={S.label}>
                Select Template <span style={{ color: C.required }}>*</span>
              </label>
              <select
                id="pd-template"
                className="pd-input"
                value={form.templateId}
                onChange={(e) => set("templateId", e.target.value)}
                style={{ ...S.input, appearance: "none", cursor: "pointer", color: form.templateId ? C.label : C.faint }}
              >
                <option value="" disabled hidden>
                  Select template
                </option>
                {options.map((o) => (
                  <option key={o.id} value={String(o.id)}>
                    {o.label}
                  </option>
                ))}
              </select>
              <BsChevronDown
                size={14}
                color={C.muted}
                style={{ position: "absolute", right: 14, bottom: 14, pointerEvents: "none" }}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="pd-id" style={S.label}>
                Template ID
              </label>
              <input
                id="pd-id"
                readOnly
                value={form.templateId}
                placeholder="Auto-filled when you select a template"
                style={{ ...S.input, ...S.inputReadOnly }}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="pd-name" style={S.label}>
                Name <span style={{ color: C.required }}>*</span>
              </label>
              <input
                id="pd-name"
                className="pd-input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Dr. C. V. Raman University"
                style={S.input}
              />
            </div>

            <div className="mb-3" style={{ position: "relative" }}>
              <span id="pd-fields-label" style={S.label}>
                Basic Field
              </span>
              <div
                role="group"
                aria-labelledby="pd-fields-label"
                style={{
                  ...S.input,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  minHeight: 42,
                }}
              >
                {form.fields.map((f) => (
                  <span key={f} style={{ ...S.chip, backgroundColor: C.chipNeutral, color: C.text, border: `1px solid ${C.border}` }}>
                    {f}
                    <button
                      type="button"
                      className="pd-focusable"
                      aria-label={`Remove ${f}`}
                      onClick={() => set("fields", form.fields.filter((x) => x !== f))}
                      style={{ background: "none", border: "none", padding: 0, display: "inline-flex", cursor: "pointer", color: C.muted }}
                    >
                      <RxCross2 size={11} />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  className="pd-focusable"
                  aria-haspopup="listbox"
                  aria-expanded={addOpen}
                  disabled={!remaining.length}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddOpen((o) => !o);
                  }}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    color: C.primary,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: remaining.length ? "pointer" : "not-allowed",
                    opacity: remaining.length ? 1 : 0.4,
                  }}
                >
                  Add
                </button>
              </div>

              {addOpen && (
                <div
                  role="listbox"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: 4,
                    width: 190,
                    maxHeight: 190,
                    overflowY: "auto",
                    zIndex: 5,
                    backgroundColor: "#fff",
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                  }}
                >
                  {remaining.map((f) => (
                    <button
                      key={f}
                      type="button"
                      role="option"
                      aria-selected="false"
                      className="pd-focusable"
                      onClick={() => {
                        set("fields", [...form.fields, f]);
                        setAddOpen(false);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.hoverBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "8px 12px", fontSize: 13, cursor: "pointer" }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="pd-questions" style={S.label}>
                Question Range
              </label>
              <input
                id="pd-questions"
                className="pd-input"
                type="number"
                inputMode="numeric"
                min={QUESTION_LIMITS.min}
                max={QUESTION_LIMITS.max}
                value={form.questions}
                onChange={(e) => set("questions", e.target.value)}
                placeholder={`${QUESTION_LIMITS.min} to ${QUESTION_LIMITS.max}`}
                style={S.input}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 }}>
              <button type="button" className="pd-focusable" onClick={onClose} disabled={saving} style={S.btnGhost}>
                Close
              </button>
              <button
                type="submit"
                className="pd-focusable"
                disabled={saving}
                style={{ ...S.btnPrimary, opacity: saving ? 0.7 : 1, cursor: saving ? "wait" : "pointer" }}
              >
                {saving ? "Saving..." : isEdit ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </ModalShell>
  );
};

export default TemplateFormModal;