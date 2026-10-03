import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { BsGrid, BsListUl, BsChevronDown } from "react-icons/bs";
import { toast } from "react-toastify";
import Pagination from "common/Pagination";
import {
  getErrorMessage,
  getTemplateOptions,
  fetchAllPreDesignTemplates,
  queryTemplates,
  createPreDesignTemplate,
  updatePreDesignTemplate,
  deletePreDesignTemplate,
} from "helper/PreDesign_helper";
import TemplateCard from "./components/TemplateCard";
import TemplateListTable from "./components/TemplateListTable";
import ViewTemplateModal from "./components/ViewTemplateModal";
import TemplateFormModal from "./components/TemplateFormModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import { C, S, PreDesignGlobalStyles } from "./preDesignStyles";

const RANGE = 6;
// Set to false if AdminNavbar already shows the breadcrumb and page title.
const SHOW_PAGE_HEADER = true;

const toggleBtn = (active) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 12px",
  fontSize: 12,
  fontWeight: 500,
  borderRadius: 6,
  border: `1px solid ${active ? "#c7d2fe" : C.border}`,
  backgroundColor: active ? C.chipBg : "#fff",
  color: active ? C.primary : C.muted,
  cursor: "pointer",
});

const PreDesign = () => {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [all, setAll] = useState([]); // every row; the API returns them all at once
  const [templateOptions, setTemplateOptions] = useState([]); // loaded from List_ImeTemp
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ mode: null, item: null }); // view | create | edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // filter + search + pagination all happen in memory
  const data = useMemo(
    () => queryTemplates(all, { search, type: typeFilter, page, range: RANGE }),
    [all, search, typeFilter, page]
  );
  const totalPages = Math.max(1, Math.ceil(data.count / RANGE));
  const startIndex = (page - 1) * RANGE;

  // Only the newest request may update the screen, and nothing updates after unmount.
  const requestId = useRef(0);
  useEffect(
    () => () => {
      requestId.current += 1;
    },
    []
  );

  const load = useCallback(async () => {
    requestId.current += 1;
    const id = requestId.current;
    setLoading(true);
    try {
      const rows = await fetchAllPreDesignTemplates();
      if (id === requestId.current) setAll(rows);
    } catch (err) {
      if (id === requestId.current) toast.error(getErrorMessage(err, "Failed to load templates"));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // "Select Template" options come from the Template Manager list.
  useEffect(() => {
    let alive = true;
    getTemplateOptions()
      .then((opts) => alive && Array.isArray(opts) && setTemplateOptions(opts))
      .catch((e) => alive && toast.error(getErrorMessage(e, "Failed to load template list")));
    return () => {
      alive = false;
    };
  }, []);

  // If the current page no longer exists (last item on it deleted, filter narrowed), step back.
  useEffect(() => {
    if (!loading && page > totalPages) setPage(totalPages);
  }, [loading, page, totalPages]);

  const closeModal = useCallback(() => setModal({ mode: null, item: null }), []);
  const open = (mode) => (item) => setModal({ mode, item });

  const handleSave = async (payload) => {
    if (modal.mode === "edit") {
      await updatePreDesignTemplate(modal.item.id, payload);
      toast.success("Template updated");
    } else {
      await createPreDesignTemplate(payload);
      toast.success("Template created");
      setPage(1);
    }
    closeModal();
    load();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deletePreDesignTemplate(deleteTarget.id);
      toast.success("Template deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete template"));
    } finally {
      setDeleting(false);
    }
  };

  const labelFor = (templateId) =>
    templateOptions.find((o) => String(o.id) === String(templateId))?.label;

  const firstLoad = loading && all.length === 0;
  const isEmpty = !loading && data.record.length === 0;

  return (
    <div className="container-fluid pt-3 pb-4" style={{ fontFamily: S.panel.fontFamily }}>
      <PreDesignGlobalStyles />

      {SHOW_PAGE_HEADER && (
        <div className="mb-3">
          <div style={{ fontSize: 11, color: C.muted }}>
            Admin / <span style={{ color: C.primary }}>Pre-Design</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "2px 0 0" }}>Custom Template</h2>
        </div>
      )}

      <div style={S.panel}>
        {/* Toolbar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-3" style={{ gap: 12 }}>
          <div className="d-flex align-items-center flex-wrap" style={{ gap: 10 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Pre-Designed OMR Templates</h3>
            <div style={{ position: "relative" }}>
              <select
                aria-label="Filter by template"
                className="pd-input"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                style={{ ...S.input, width: "auto", padding: "5px 28px 5px 10px", fontSize: 12, appearance: "none", cursor: "pointer", backgroundColor: C.surface }}
              >
                <option value="">All Templates</option>
                {templateOptions.map((o) => (
                  <option key={o.id} value={String(o.id)}>
                    {o.label}
                  </option>
                ))}
              </select>
              <BsChevronDown size={10} color={C.muted} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>

          <div className="d-flex align-items-center flex-wrap" style={{ gap: 10 }}>
            <div style={{ position: "relative", width: 230, maxWidth: "100%" }}>
              <FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#a0aec0", fontSize: 13 }} />
              <input
                type="text"
                aria-label="Search templates"
                className="pd-input"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{ ...S.input, paddingLeft: 34, height: 38 }}
              />
            </div>
            <button type="button" className="pd-focusable" style={S.btnPrimary} onClick={() => open("create")(null)}>
              Create Template
            </button>
          </div>
        </div>

        {/* View toggle */}
        <div className="d-flex mb-3" style={{ gap: 8 }}>
          <button type="button" className="pd-focusable" style={toggleBtn(view === "grid")} onClick={() => setView("grid")} aria-pressed={view === "grid"}>
            <BsGrid /> Grid
          </button>
          <button type="button" className="pd-focusable" style={toggleBtn(view === "list")} onClick={() => setView("list")} aria-pressed={view === "list"}>
            <BsListUl /> List
          </button>
        </div>

        {/* Content: previous results stay on screen (dimmed) while a refresh loads */}
        {firstLoad ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="text-center py-5" style={{ color: C.faint, fontSize: 14 }}>
            No templates match your search. Clear the filters or create a template.
          </div>
        ) : (
          <div
            aria-busy={loading}
            style={{ opacity: loading ? 0.55 : 1, pointerEvents: loading ? "none" : "auto", transition: "opacity .15s ease" }}
          >
            {view === "grid" ? (
              <div className="row">
                {data.record.map((item, i) => (
                  <div key={item.id} className="col-xl-3 col-lg-4 col-md-6 col-12 mb-3 d-flex">
                    <TemplateCard
                      item={item}
                      sr={startIndex + i + 1}
                      onView={() => open("view")(item)}
                      onEdit={() => open("edit")(item)}
                      onDelete={() => setDeleteTarget(item)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <TemplateListTable
                records={data.record}
                startIndex={startIndex}
                onView={open("view")}
                onEdit={open("edit")}
                onDelete={setDeleteTarget}
              />
            )}
          </div>
        )}

        {totalPages > 1 && <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />}
      </div>

      {modal.mode === "view" && (
        <ViewTemplateModal item={modal.item} templateLabel={labelFor(modal.item?.templateId)} onClose={closeModal} />
      )}
      {(modal.mode === "create" || modal.mode === "edit") && (
        <TemplateFormModal
          mode={modal.mode}
          item={modal.item}
          templateOptions={templateOptions}
          onClose={closeModal}
          onSubmit={handleSave}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          item={deleteTarget}
          deleting={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default PreDesign;