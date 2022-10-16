import axios from 'axios';
import _ from 'lodash';
import dayjs from 'dayjs';
import jwt_decode from 'jwt-decode';
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage, SetLocalStorage, RemoveLocalStorage } from '@utils'
import config from './config'
import { FormattedMessage, useIntl } from 'react-intl'

import { firstLogin, login } from "@utils";
import { ErrorAlert, SuccessAlert } from '@utils'
import { historyApp } from '@utils';
import { loginService } from '@services'
import store from '@states/store'

// const API_URL = config.api.API_BASE_URL;
const API_URL = ConfigConstants.BASE_URL;

// const intl = useIntl();

const instance = axios.create({
    // baseURL: 'http://localhost:8080',
    baseURL: API_URL,
    // timeout: 10 * 1000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': '',
    },
    // withCredentials: true
});

const createError = (httpStatusCode, statusCode, errorMessage, problems, errorCode = '') => {
    const error = new Error();
    error.httpStatusCode = httpStatusCode;
    error.statusCode = statusCode;
    error.errorMessage = errorMessage;
    error.problems = problems;
    error.errorCode = errorCode + "";
    return error;
};

export const isSuccessStatusCode = (s) => {
    // May be string or number
    const statusType = typeof s;
    return (statusType === 'number' && s === 0) || (statusType === 'string' && s.toUpperCase() === 'OK');
};

let refreshtokenRequest = null;

instance.interceptors.request.use(async (request) => {

    if (
        request.url.indexOf(`/api/login/checklogin`) >= 0
        || request.url.indexOf(`/api/refreshtoken`) >= 0
        // || request.url.indexOf(`/api/logout`) >= 0
    ) {
        return request;
    }
    else {
        let token = GetLocalStorage(ConfigConstants.TOKEN_ACCESS);
        if (token) {
            const tokenDecode = jwt_decode(token);
            const isExpired = dayjs.unix(tokenDecode.exp).diff(dayjs()) < 1;
            if (!isExpired) {
                request.headers.Authorization = `Bearer ${token}`;
                return request;
            }
            else {
                refreshtokenRequest = refreshtokenRequest
                    ? refreshtokenRequest
                    : instance.getNewAccessToken()

                const response = await refreshtokenRequest;
                refreshtokenRequest = null;

                if (response.HttpResponseCode === 200 && response.ResponseMessage === 'general.success') {
                    SetLocalStorage(ConfigConstants.TOKEN_ACCESS, response.Data.accessToken);
                    SetLocalStorage(ConfigConstants.TOKEN_REFRESH, response.Data.refreshToken);
                    request.headers.Authorization = `Bearer ${response.Data.accessToken}`;
                    return request;
                }
                else {
                    await instance.Logout();
                    return request;
                }
            }
        }
        else {
            await instance.Logout();
            return request;
        }
    }

}, err => {
    return Promise.reject(err)
});

instance.interceptors.response.use(
    async (response) => {
        // Thrown error for request with OK status code
        const { data } = response
        if (data.HttpResponseCode === 401 && data.ResponseMessage === 'login.lost_authorization') {
            await instance.Logout();
        }
        return response.data;
    },
    // (error) => {
    //     const { response } = error;
    //     if (response == null) {
    //         return Promise.reject(error);
    //     }

    //     const { data } = response;

    //     if (data.hasOwnProperty('s') && data.hasOwnProperty('errmsg')) {
    //         return Promise.reject(createError(response.status, data['s'], data['errmsg']));
    //     }

    //     if (data.hasOwnProperty('code') && data.hasOwnProperty('message')) {
    //         return Promise.reject(createError(response.status, data['code'], data['message'], data['problems']));
    //     }

    //     return Promise.reject(createError(response.status));
    // }
);

// instance.interceptors.response.use(
//     (response) => {
//         // Thrown error for request with OK status code
//         console.log('res', response)
//         const { data } = response;
//         if (data.hasOwnProperty('s') && !isSuccessStatusCode(data['s']) && data.hasOwnProperty('errmsg')) {
//             return Promise.reject(createError(response.status, data['s'], data['errmsg'], null, data['errcode'] ? data['errcode'] : ""));
//         }

//         // Return direct data to callback
//         if (data.hasOwnProperty('s') && data.hasOwnProperty('d')) {
//             return data['d'];
//         }
//         // Handle special case
//         if (data.hasOwnProperty('s') && _.keys(data).length === 1) {
//             return null;
//         }
//         return response.data;
//     },
//     (error) => {
//         const { response } = error;
//         if (response == null) {
//             return Promise.reject(error);
//         }

//         const { data } = response;

//         if (data.hasOwnProperty('s') && data.hasOwnProperty('errmsg')) {
//             return Promise.reject(createError(response.status, data['s'], data['errmsg']));
//         }

//         if (data.hasOwnProperty('code') && data.hasOwnProperty('message')) {
//             return Promise.reject(createError(response.status, data['code'], data['message'], data['problems']));
//         }

//         return Promise.reject(createError(response.status));
//     }
// );

instance.getNewAccessToken = async () => {
    let accessToken = GetLocalStorage(ConfigConstants.TOKEN_ACCESS);
    let refreshToken = GetLocalStorage(ConfigConstants.TOKEN_REFRESH);
    let postObj = {
        expiredToken: accessToken,
        refreshToken: refreshToken
    }

    return await instance.post(API_URL + '/api/refreshtoken', postObj);
}

instance.Logout = async (e) => {

    try {
        await handleLogout()
    } catch (error) {
        console.log(`logout error: ${error}`)
    }
}

const handleLogout = async () => {
    const requestOptions = {
        withCredentials: false,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': ''
        },
    };

    let token = GetLocalStorage(ConfigConstants.TOKEN_ACCESS);
    if (token) {
        requestOptions.headers.Authorization = `Bearer ${token}`;
    }

    else {
        requestOptions.headers.Authorization = `Bearer logout_token`;
    }

    fetch(`${API_URL}/api/logout`, requestOptions)
        .then(result => result.json())
        .then(result => {
            if (result.ResponseMessage === 'general.success') {

                RemoveLocalStorage(ConfigConstants.TOKEN_ACCESS);
                RemoveLocalStorage(ConfigConstants.TOKEN_REFRESH);
                RemoveLocalStorage(ConfigConstants.CURRENT_USER);
                store.dispatch({
                    type: 'Dashboard/DELETE_ALL',
                });
                historyApp.push("/logout");

            }
            // else
            // console.log('res', result.data)
        });

}

export { instance };
