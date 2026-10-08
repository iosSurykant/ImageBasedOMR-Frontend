import axiosApi from 'Interceptor/axios';
import { post, get } from './api_helper';
import * as url from './url_helper';

export const scanFiles = async ({ makePath, tId }) => {
  const urls = await url.getUrls();
  const body = {
    folderPath: makePath,
    idTemp: tId,
    isSaveDb: true,
    Token:localStorage.getItem("token")
  }
  return axiosApi.post(urls.SCAN_FILES, body);
};

export const getLastScannedFiles = async (tempId) => {
  const urls = await url.getUrls();
  return get(`${urls.LAST_RECORDS}?TempId=${tempId}&token=${localStorage.getItem('token')}`,
  );
};

export const pauseScanning = async () => {
  const urls = await url.getUrls();
  return post(`${urls.PAUSE_SCAN}`);
};

export const resumeScanning = async () => {
  const urls = await url.getUrls();
  return post(`${urls.RESUME_SCAN}`);
};

export const resetScanApi = async () => {
  const urls = await url.getUrls();
  return post(`${urls.SCAN_API_RESET}`);
};