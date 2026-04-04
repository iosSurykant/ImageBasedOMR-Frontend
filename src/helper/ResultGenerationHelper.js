import { post } from "./api_helper";
import * as url from "./url_helper";

// export const fetchCsvHeader = async (file) => {
//   const urls = await url.getUrls();

//   const formData = new FormData();
//   formData.append("file", file);

//   return post(urls.GETCSVHEADER, formData);
// };

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

// export const generateResult = async (payload) => {
//   const urls = await url.getUrls();

//   const formData = new FormData();

//   formData.append("Data", JSON.stringify(payload)); // ✅ important fix

//   return post(urls.GENERATE_RESULT, formData, {
//     responseType: "blob",
//   });
// };