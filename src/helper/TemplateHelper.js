import { get, putWithFormData, } from "./api_helper";
import * as url from "./url_helper";
import axiosApi from "Interceptor/axios";

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


// TEST MODULE
export const createTest = async (formData) => {
  const urls = await url.getUrls();
  const { testName, template, testId, notes, } = formData
  const body = { testName, templateId: template, testId, notes, }
  return await axiosApi.post(urls.CREATE_TEST, body);
};

export const getTestList = async (search, page, range) => {
  const urls = await url.getUrls();

  const requestBody = {
    page, range, search: search || "",
  };

  const response = await axiosApi.post(urls.GET_TEST_LIST, requestBody);
  return response;
};


export const uploadImagesFiles = async ({ testName, formData }) => {
  const urls = await url.getUrls();

  const endpoint = urls.UPLOAD_IMAGES_FILE;

  return await axiosApi.post(endpoint, formData, {
    params: {
      TestName: testName,
    },
  });
};

export const deleteTest = async (testId) => {
  const urls = await url.getUrls();
  return axiosApi.delete(`${urls.DELETE_TEST}?testId=${testId}`)
}

export const updateTest = async (formData) => {
  const urls = await url.getUrls();

  console.log(formData)

  const body = {
    templateId: formData.template,
    testName: formData.testName,
    testId: formData.testId,
    notes: formData.notes,
    status: "string"
  }
  return axiosApi.put(`${urls.UPDATE_TEST}`, body)
}



//FOR DELETE OR REPLCE

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


export const updateTemplate = async (FileName, jsonFile) => {
  const urls = await url.getUrls();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const empid = userData?.empid;

  if (!empid) {
    throw new Error("empid not found in localStorage");
  }

  const baseFileName = FileName.includes("##")
    ? FileName.split("##")[0]
    : FileName;

  const updatedFileName = `${baseFileName}##${empid}`;

  const endpoint = `${urls.UPDATE_TEMPLATE}?FileName=${encodeURIComponent(updatedFileName)}`;

  const formData = new FormData();
  formData.append("tempName", jsonFile);
  return await putWithFormData(endpoint, formData);
};


