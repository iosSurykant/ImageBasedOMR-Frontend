import { post, del, get, put } from "./api_helper";
import * as url from "./url_helper";

//OPERATOR AND MODERATOR
export const createUser = async (data) => {
  console.log(data)
  const { name, email, cont, role, pwd, referenceId } = data;
  const urls = await url.getUrls();
  return post(
    `${urls.CREATE_USER}?name=${name}&email=${email}&cont=${cont}&role=${role}&pwd=${pwd}&refranceId=${referenceId}`,
  );
};

export const fetchAllUsers = async (currentPage,statusFilter,roleFilter,debouncedSearchQuery) => {
  const urls = await url.getUrls();
  const pageNumber = currentPage
  const role = roleFilter
  const search = debouncedSearchQuery
  const isLogg = statusFilter
  const range = 5

  return post(urls.GET_USERS, { pageNumber, range, isLogg, role, search });
};


export const removeUser = async (id) => {
  const urls = await url.getUrls();
  return del(`${urls.DELETE_USER}?idEmp=${id}`);
};


export const updateUser = async (data) => {
  const urls = await url.getUrls();

  return put(urls.UPDATE_USER, null, {
    params: {
      EmpId: data.EmpId,
      // referenceId: data.referenceId,
      name: data.name,
      email: data.email,
      pwd: data.pwd,
      cont: data.cont,
      role: data.role,
    },
  });
};


export const logout = async () =>{
  const urls = await url.getUrls();
  return get(`${urls.LOG_OUT}`);
}

// Via a OTP
export const createUserWithOtp = async (data) => {
  const urls = await url.getUrls();
  return post(
    `${urls.CREATE_USER_WITH_OTP}?name=${data.fullName}&email=${data.email}&cont=${data.phone}`,
  );
};

export const verifyOtp = async (data) => {
  const { email: otpEmail, otp: otpCode } = data;
  const urls = await url.getUrls();
  return post(
    `${urls.OTP_VERIFY}?email=${otpEmail}&Otp=${otpCode}`,
  );
};

export const sendLoginOtp = async ({email}) => {
  const urls = await url.getUrls();
  return post(`${urls.LOGIN_VIA_OTP}?email=${email}`);
}

export const createQREndpoint = async (oldSessionId) => {
  const urls = await url.getUrls();

  const query = oldSessionId ? `?sessionId=${encodeURIComponent(oldSessionId)}`
    : "";

  return post(`${urls.CREATE_QR_ENDPOINT}${query}`);
};