import { post, get, del } from "./api_helper";
import * as url from "./url_helper";

export const addPackage = async (packageData) => {
  const urls = await url.getUrls();
  
  return post(urls.ADD_PACKAGE, packageData);
};

export const getPackages = async () => {
  const urls = await url.getUrls();

  return get(urls.GET_PACKAGES);
};

export const deletePackage = async (packageId) => {
  const urls = await url.getUrls();

  return del(`${urls.DELETE_PACKAGE}?PackId=${packageId}`);
};