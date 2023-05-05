/**
 * Local
 */
export const API_URL = 'http://localhost:5261/api/';
export const BASE_URL = 'http://localhost:5261';

/**
 * Autonsi
 */
// export const API_URL = 'http://baseapi.autonsi.com/api/';
// export const BASE_URL = 'http://baseapi.autonsi.com';

/**
 * Hanlim
 */
// export const API_URL = 'http://192.168.1.35:81/api/';
// export const BASE_URL = 'http://192.168.1.35:81';

export const LOGIN_URL = '/api/login/checklogin';
export const REFRESH_TOKEN_URL = '/api/refreshtoken';

const company = '_Hanlim';

const accessTokenKey = `access-token${company}`;
const refreshAccessTokenKey = `refresh-token${company}`;

export const CURRENT_USER = 'CURRENT_USER' + company;
export const TOKEN_ACCESS = accessTokenKey;
export const TOKEN_REFRESH = refreshAccessTokenKey;
export const LANG_CODE = 'LANG_CODE' + company;

//Action
export const VIEW_ACTION = 'View';
export const CREATE_ACTION = 'Create';
export const UPDATE_ACTION = 'Update';
export const DELETE_ACTION = 'Delete';
