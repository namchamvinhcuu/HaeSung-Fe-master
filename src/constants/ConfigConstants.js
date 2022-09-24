// export const API_URL = "http://192.168.5.193:99/api/";
// export const BASE_URL = "http://192.168.5.193:99/";

export const API_URL = "http://localhost:57232/api/";
// export const BASE_URL = "https://localhost:44333/";


const company = "_HAESUNG";

const accessTokenKey = "access-token" + company;
const refreshAccessTokenKey = `x-${accessTokenKey}`;

export const CURRENT_USER = "CURRENT_USER" + company;
export const TOKEN_ACCESS = accessTokenKey;
export const TOKEN_REFRESH = refreshAccessTokenKey;
export const LANG_CODE = "LANG_CODE" + company;

//Action
export const VIEW_ACTION = "View";
export const CREATE_ACTION = "Create";
export const UPDATE_ACTION = "Update";
export const DELETE_ACTION = "Delete";

