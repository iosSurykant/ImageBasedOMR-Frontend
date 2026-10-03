import axiosApi from "Interceptor/axios";
import { getUrls } from "helper/url_helper";

/**
 * PRE-DESIGN API LAYER  (CustomImg_Temp)
 * --------------------------------------------------------------
 * Everything the backend contract decides lives in this file:
 * URLs, HTTP methods, field names, the `discription` string format and the
 * response parsing. If a name or shape differs, change it here only.
 *
 * URLs come from helper/InitializeURL.js (PD_CREATE, PD_UPDATE, PD_VIEW, PD_DELETE),
 * so the host is resolved at runtime like every other API in the project.
 */

const URL_KEYS = {
  create: "PD_CREATE",
  update: "PD_UPDATE",
  view: "PD_VIEW",
  remove: "PD_DELETE",
};
// Verbs taken from the Swagger screenshots. Change one here if the backend differs.
const METHODS = { create: "post", update: "put", view: "get", remove: "delete" };

export const QUESTION_LIMITS = { min: 1, max: 500 };

export const BASIC_FIELD_OPTIONS = [
  "Name",
  "Roll No.",
  "Gender",
  "Subject",
  "Class",
  "Section",
  "Date of Birth",
  "Booklet Series",
];

// Host that serves template images (same variable Template.js uses).
// Falls back to the API base URL from InitializeURL.
const getImageBase = async () =>
  process.env.REACT_APP_BACKEND_URL || (await getUrls()).MAIN_URL || "";

const joinUrl = (base, path) =>
  `${String(base).replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;

/** Best human-readable message from an axios error, an Error, or a plain string. */
export const getErrorMessage = (err, fallback = "Something went wrong") =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  (typeof err === "string" ? err : err?.message) ||
  fallback;

/* ---------- discription:  [{'Name','Roll No.'},{'100'}] ---------- */
// 1st object = basic fields, 2nd object = question count.

const quote = (s) => `'${String(s).replace(/['"{}]/g, "").trim()}'`;

export const buildDescription = (fields = [], questions = "") =>
  `[{${fields.map(quote).join(",")}},{${quote(questions)}}]`;

export const parseDescription = (raw) => {
  const empty = { fields: [], questions: 0 };
  if (!raw || typeof raw !== "string") return empty;

  // in case the backend ever returns real JSON: [["Name"],["100"]]
  try {
    const json = JSON.parse(raw);
    if (Array.isArray(json)) {
      const [f, q] = json;
      return {
        fields: Array.isArray(f) ? f.map(String).filter(Boolean) : [],
        questions: Number(Array.isArray(q) ? q[0] : q) || 0,
      };
    }
  } catch (e) {
    // not JSON, parse the {'a','b'} form below
  }

  const groups = [...raw.matchAll(/\{([^}]*)\}/g)].map((m) =>
    [...m[1].matchAll(/'([^']*)'|"([^"]*)"/g)]
      .map((x) => x[1] ?? x[2] ?? "")
      .filter(Boolean)
  );
  return { fields: groups[0] || [], questions: Number(groups[1]?.[0]) || 0 };
};

/* ---------- response parsing ---------- */

// raw axios response, or already-unwrapped body (depends on your interceptor)
const bodyOf = (res) => (res && res.config && res.headers ? res.data : res);

// APIs in this project answer { state, message } on failure (see logout)
const assertOk = (res) => {
  const body = bodyOf(res);
  if (body && (body.state === false || body.success === false)) {
    throw new Error(body.message || "Request failed");
  }
  return body;
};

// Your list APIs wrap rows in `body` (see fetchTemplates), so it is checked first.
const toRows = (body) => {
  if (Array.isArray(body)) return body;
  for (const key of ["body", "record", "records", "data", "result", "items", "list"]) {
    if (Array.isArray(body?.[key])) return body[key];
    if (Array.isArray(body?.[key]?.record)) return body[key].record;
  }
  return [];
};

// case-insensitive field lookup (Id / id, TemplateName / templateName ...)
const pick = (obj, ...keys) => {
  const names = Object.keys(obj || {});
  for (const k of keys) {
    const hit = names.find((n) => n.toLowerCase() === k.toLowerCase());
    if (hit && obj[hit] !== null && obj[hit] !== undefined) return obj[hit];
  }
  return undefined;
};

const looksBase64 = (v) =>
  typeof v === "string" && v.length > 200 && /^[A-Za-z0-9+/=\s]+$/.test(v);

// Guess the image type from the first bytes of the base64 string.
const mimeOf = (b64) => {
  const s = b64.trim();
  if (s.startsWith("/9j/")) return "image/jpeg";
  if (s.startsWith("iVBOR")) return "image/png";
  if (s.startsWith("R0lGOD")) return "image/gif";
  if (s.startsWith("UklGR")) return "image/webp";
  return "image/png";
};

const toImageSrc = (v, base = "") => {
  if (!v || typeof v !== "string") return null;
  if (/^(https?:|data:|blob:)/i.test(v)) return v;
  if (looksBase64(v)) {
    const clean = v.replace(/\s+/g, "");
    return `data:${mimeOf(clean)};base64,${clean}`;
  }
  // .NET paths often use backslashes and may contain spaces
  const path = encodeURI(v.trim().replace(/\\/g, "/"));
  return base ? joinUrl(base, path) : path;
};

// Finds the image field even if the backend names it differently (imgPath, templateImgPath, filePath ...)
const pickImage = (raw) => {
  // 1) the API sends the image as a base64 string (any field name)
  const b64Key = Object.keys(raw || {}).find(
    (k) => looksBase64(raw[k]) || /^data:image\//i.test(String(raw[k] ?? ""))
  );
  if (b64Key) return raw[b64Key];
  // 2) a named field
  const direct = pick(raw, "templateImgBase64", "templateImg", "imgPath", "imgUrl", "imagePath", "image");
  if (direct) return direct;
  // 3) any other text field that looks like an image path
  const key = Object.keys(raw || {}).find(
    (k) => /img|image|path/i.test(k) && typeof raw[k] === "string" && raw[k]
  );
  return key ? raw[key] : undefined;
};

/** One record in the shape the UI uses. */
export const normalizeTemplate = (raw = {}, imageBase = "") => {
  const { fields, questions } = parseDescription(pick(raw, "discription", "description"));
  return {
    id: pick(raw, "id", "tempId"),
    templateId: pick(raw, "templateId"),
    name: String(pick(raw, "templateName", "name") ?? ""),
    fields,
    questions,
    imgUrl: toImageSrc(pickImage(raw), imageBase),
  };
};

const call = async (name, { params, data } = {}) => {
  const urls = await getUrls();
  const url = urls[URL_KEYS[name]];
  if (!url) throw new Error(`${URL_KEYS[name]} is missing in helper/InitializeURL.js`);
  // No Content-Type header for FormData: the browser adds the multipart boundary itself.
  return axiosApi.request({ url, method: METHODS[name], params, data });
};

const requireId = (id) => {
  if (id === null || id === undefined || id === "") throw new Error("Template id is missing");
};

/* ---------- "Select Template" options ---------- */

/**
 * Options come from the Template Manager list (GET_ALL_TEMPLATE / List_ImeTemp).
 * Each option: { id, label, imgUrl }. The chosen option's image is the preview.
 */
export const getTemplateOptions = async () => {
  const [urls, base] = await Promise.all([getUrls(), getImageBase()]);
  const body = assertOk(await axiosApi.get(urls.GET_ALL_TEMPLATE));
  return toRows(body)
    .filter((r) => r.id !== undefined && r.id !== null)
    .map((r) => ({
      id: String(r.id),
      label: r.fileName || `Template ${r.id}`,
      imgUrl: toImageSrc(r.imgPath, base),
    }));
};

/* ---------- API calls ---------- */

/** View with no tempId is assumed to return every row, so the page filters and paginates in the browser. */
export const fetchAllPreDesignTemplates = async () => {
  const base = await getImageBase();
  const body = assertOk(await call("view"));
  const rows = toRows(body);
  // TEMP DEBUG: remove once images show. Compare the raw row with the built URL.
  if (rows[0]) console.log("[PreDesign] raw row:", rows[0], "-> imgUrl:", normalizeTemplate(rows[0], base).imgUrl);
  return rows
    .map((r) => normalizeTemplate(r, base))
    .filter((t) => t.id !== undefined)
    .sort((a, b) => Number(b.id) - Number(a.id)); // newest first
};

/** Filter + paginate a list in memory. Returns { record, count }. */
export const queryTemplates = (all, { search = "", type = "", page = 1, range = 6 } = {}) => {
  const q = search.trim().toLowerCase();
  const filtered = all.filter(
    (t) =>
      (!type || String(t.templateId) === String(type)) &&
      (!q || String(t.id).toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
  );
  const start = (page - 1) * range;
  return { record: filtered.slice(start, start + range), count: filtered.length };
};

// Best effort: download the chosen template's image so it can be sent as TemplateImg.
// Returns null if the host blocks the request (CORS) or the file is missing.
const fetchImageBlob = async (url) => {
  if (!url) return null;
  try {
    const res = await fetch(url);
    return res.ok ? await res.blob() : null;
  } catch (e) {
    return null;
  }
};

/** Create: TemplateId, TemplateName, discription, TemplateImg (the selected template's image). */
export const createPreDesignTemplate = async ({ templateId, name, fields, questions, imgUrl }) => {
  const fd = new FormData();
  fd.append("TemplateId", templateId);
  fd.append("TemplateName", name);
  fd.append("discription", buildDescription(fields, questions));
  const blob = await fetchImageBlob(imgUrl);
  if (blob) fd.append("TemplateImg", blob, "template.png");
  return assertOk(await call("create", { data: fd }));
};

/** Update: Id is required, everything else is optional. The image is sent only when the template choice changed. */
export const updatePreDesignTemplate = async (id, { templateId, name, fields, questions, imgUrl }) => {
  requireId(id);
  const fd = new FormData();
  fd.append("Id", id);
  if (templateId !== undefined && templateId !== "") fd.append("TemplateId", templateId);
  if (name !== undefined) fd.append("TemplateName", name);
  if (fields !== undefined && questions !== undefined) {
    fd.append("discription", buildDescription(fields, questions));
  }
  const blob = await fetchImageBlob(imgUrl);
  if (blob) fd.append("TemplateImg", blob, "template.png");
  return assertOk(await call("update", { data: fd }));
};

/** Delete one row. A missing id is refused here because the API treats null as "all rows". */
export const deletePreDesignTemplate = async (id) => {
  requireId(id);
  return assertOk(await call("remove", { params: { templateIdVal: id } }));
};