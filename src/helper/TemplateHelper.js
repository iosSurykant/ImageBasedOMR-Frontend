import {
  get,
  postWithFormData,
  putWithFormData,
} from "./api_helper";
import * as url from "./url_helper";
import axiosApi from "Interceptor/axios";


// REPLACING Old Template.js Helper

export const getAllTemplate = async () => {
  const urls = await url.getUrls();
  return await axiosApi.get(urls.GET_ALL_TEMPLATE)
};

export const createTemplate = async (templateName, image, empId, description) => {
  const urls = await url.getUrls();
  const formData = new FormData();
  formData.append("ImgTemp", image);
  return await axiosApi.post(`${urls.CREATE_TEMPLATE}?TempName=${encodeURIComponent(templateName)}&empId=${encodeURIComponent(empId)}&description=${encodeURIComponent(description)}`, formData);
};

export const deleteTemplateById = async (id) => {
  const urls = await url.getUrls();
  return await axiosApi.delete(`${urls.DELETE_TEMPLATE}?id=${id}`);
};

export const getLayoutDataById = async (id) => {
  const urls = await url.getUrls();
  return axiosApi.get(`${urls.GET_LAYOUT_DATA}?id=${id}`)
}; 






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


// export const createTemplate = async (templateName, image, empId) => {
//   const token = localStorage.getItem("token");
//   const urls = await url.getUrls();

//   // Send TempName and empId in query params
//   const endpoint = `${urls.CREATE_TEMPLATE}?TempName=${encodeURIComponent(
//     templateName
//   )}&empId=${encodeURIComponent(empId)}`;

//   const formData = new FormData();

//   // Only file in body
//   formData.append("ImgTemp", image);

//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,

//     },
//   };

//   return await post(endpoint, formData, config);
// };


export const updateTemplate = async (FileName, jsonFile) => {
  const urls = await url.getUrls();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const empid = userData?.empid;

  if (!empid) {
    throw new Error("empid not found in localStorage");
  }

  // Remove existing ## if already present
  const baseFileName = FileName.includes("##")
    ? FileName.split("##")[0]
    : FileName;

  // Append empid only once
  const updatedFileName = `${baseFileName}##${empid}`;

  const endpoint = `${urls.UPDATE_TEMPLATE}?FileName=${encodeURIComponent(updatedFileName)}`;

  const formData = new FormData();
  formData.append("tempName", jsonFile);



  return await putWithFormData(endpoint, formData);
};


// export const deleteTemplate = async (id) => {
//   const urls = await url.getUrls();
//   const endpoint = `${urls.DELETE_TEMPLATE}?id=${id}`;
//   // const token = localStorage.getItem("token");

//   return await del(endpoint);
// };

// export const getLayoutDataById = async (id) => {
//   const token = localStorage.getItem("token") ?? "";
//   const urls = await url.getUrls();
//   const endpoint = `${urls.GET_LAYOUT_DATA}?id=${id}`;
//   return await get(endpoint, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };

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
