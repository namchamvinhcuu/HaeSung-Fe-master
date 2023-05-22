export const API_URL = process.env.API_URL;
export const BASE_URL = process.env.BASE_URL;

export const LOGIN_URL = process.env.LOGIN_URL;
export const REFRESH_TOKEN_URL = process.env.REFRESH_TOKEN_URL;

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
