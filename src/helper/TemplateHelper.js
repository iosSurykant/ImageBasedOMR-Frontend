import {
  post,
  del,
  get,
  postWithFormData,
  putWithFormData,
} from "./api_helper";
import * as url from "./url_helper";

// Create Class
export const fetchAllTemplate = async () => {
  const token = localStorage.getItem("token");
  const urls = await url.getUrls();
  const endpoint = urls.GET_ALL_TEMPLATE;
  return await get(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// export const createTemplate = async (templateName, image, role, uid) => {
//   const token = localStorage.getItem('token');
//   const urls = await url.getUrls();
//   const endpoint = `${urls.CREATE_TEMPLATE}?TempName=${templateName}`;

//   const formData = new FormData();
//   formData.append('ImgTemp', image);

//   const config = {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//       Authorization: `Bearer ${token}`,
//     },
//   };

//   return await post(endpoint, formData, config);
// };

// export const createTemplate = async (templateName, image, empid) => {
//   const token = localStorage.getItem("token");
//   const urls = await url.getUrls();
//   const endpoint = `${urls.CREATE_TEMPLATE}?TempName=${templateName}?{}`;

//   const formData = new FormData();

//   // File
//   formData.append("ImgTemp", image);

//   // Other fields
//   formData.append("TempName", templateName); // optional if backend needs it in form
//   formData.append("empId", empid); // user id

//   const config = {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       Authorization: `Bearer ${token}`,
//     },
//   };

//   return await post(endpoint, formData, config);
// };

export const createTemplate = async (templateName, image, empId) => {
  const token = localStorage.getItem("token");
  const urls = await url.getUrls();

  // ✅ Send TempName and empId in query params
  const endpoint = `${urls.CREATE_TEMPLATE}?TempName=${encodeURIComponent(
    templateName
  )}&empId=${encodeURIComponent(empId)}`;

  const formData = new FormData();

  // ✅ Only file in body
  formData.append("ImgTemp", image);

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      // ❌ DO NOT manually set Content-Type for FormData
      // Browser will set correct boundary automatically
    },
  };

  return await post(endpoint, formData, config);
};


export const updateTemplate = async (FileName, jsonFile) => {
  const urls = await url.getUrls();
  const token = localStorage.getItem("token");

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const empid = userData?.empid;

  if (!empid) {
    throw new Error("empid not found in localStorage");
  }

  // ✅ Remove existing ## if already present
  const baseFileName = FileName.includes("##")
    ? FileName.split("##")[0]
    : FileName;

  // ✅ Append empid only once
  const updatedFileName = `${baseFileName}##${empid}`;
  

  const endpoint = `${urls.UPDATE_TEMPLATE}?FileName=${encodeURIComponent(updatedFileName)}`;

  console.log("Final API URL:", endpoint);

  const formData = new FormData();
  formData.append("tempName", jsonFile);

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  return await putWithFormData(endpoint, formData, config);
};


export const deleteTemplate = async (id) => {
  const urls = await url.getUrls();
  const endpoint = `${urls.DELETE_TEMPLATE}?id=${id}`;
  const token = localStorage.getItem("token");

  return await del(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getLayoutDataById = async (id) => {
  const token = localStorage.getItem("token") ?? "";
  const urls = await url.getUrls();
  const endpoint = `${urls.GET_LAYOUT_DATA}?id=${id}`;
  return await get(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const sendFile = async (data) => {
  const urls = await url.getUrls();
  const endpoint = urls.SEND_FILE;
  return await postWithFormData(endpoint, data);
};

export const getSampleData = async () => {
  const urls = await url.getUrls();
  const endpoint = urls.GET_SCANNED_IMAGE;
  return await get(endpoint);
};

export const getTemplateImage = async (path) => {
  const urls = await url.getUrls();
  const endpoint = `${urls.GET_TEMPLATE_IMAGE}?filePath=${path}`;
  return await get(endpoint);
};

export const getTemplateCsv = async (path) => {
  const urls = await url.getUrls();
  const endpoint = `${urls.GET_TEMPLATE_CSV}?csvPath=${path}`;
  return await get(endpoint);
};

export const cancelScan = async () => {
  const urls = await url.getUrls();
  const endpoint = urls.CANCEL_SCAN;
  return await get(endpoint);
};

export const checkJobStatus = async (id) => {
  const urls = await url.getUrls();
  const endpoint = `${urls.CHECK_DELETE_TEMPLATE}?Id=${id}`;
  return await get(endpoint);
};

export const getBaseURL = async (id) => {
  const urls = await url.getUrls();
  const endpoint = `${urls.MAIN_URL}`;
  return await get(endpoint);
};
