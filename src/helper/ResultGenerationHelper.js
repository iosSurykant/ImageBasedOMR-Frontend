import { toast } from "react-toastify";
import axiosApi from "../Interceptor/axios";
import { post, get, del } from "./api_helper";
import * as url from "./url_helper";

export const fetchCsvHeader = async (file) => {
  const urls = await url.getUrls();

  const formData = new FormData();
  formData.append("CSV1", file); // ✅ FIXED KEY

  return post(urls.GETCSVHEADER, formData);
};

export const generateResult = async (formData) => {
  const urls = await url.getUrls();

  return post(urls.GENERATE_RESULT, formData, {
    responseType: "blob",
  });
};

/**
 * Result generation from a saved bubble-scan table.
 * The file comes back as a Blob. When the call fails the error body is a Blob
 * too, so it is read as text here to show the server's real message.
 */
export const generateResultExcel2 = async (formData) => {
  const urls = await url.getUrls();

  try {
    const response = await axiosApi.post(urls.GENERATE_RESULT_EXCEL2, formData, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    let message = "";
    const body = error?.response?.data;

    if (body instanceof Blob) {
      try {
        const text = await body.text();
        message = text.trim().startsWith("{")
          ? JSON.parse(text)?.message || ""
          : text;
      } catch {
        message = "";
      }
    } else {
      message = body?.message || "";
    }

    toast.error(message || "Could not generate the result");
    throw error;
  }
};

export const mergerCsv = async (formData) => {
  const urls = await url.getUrls();

  return post(urls.MERGECSV, formData, {
    responseType: "blob",
  })
}

export const getDBRecords = async (fileName = "") => {
  const urls = await url.getUrls();

  const finalUrl = fileName
    ? `${urls.GET_DB_DATA}?fileName=${encodeURIComponent(fileName)}`
    : urls.GET_DB_DATA;

  return get(finalUrl);
};

export const deleteDBRecords = async (deleteName) => {
  const urls = await url.getUrls();
  const endpoint = `${urls.DELETE_DB_DATA}?deleteName=${encodeURIComponent(deleteName)}`;

  return await del(endpoint);
};