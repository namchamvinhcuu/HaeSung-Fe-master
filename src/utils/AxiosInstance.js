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

// const API_URL = config.api.API_BASE_URL;
const API_URL = ConfigConstants.BASE_URL;

// const intl = useIntl();

const instance = axios.create({
    // baseURL: 'http://localhost:8080',
    baseURL: API_URL,
    // timeout: 10 * 1000,
    headers: {
        'Content-Type': 'application/json',
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

instance.interceptors.request.use((request) => {

    if (
        request.url.indexOf(`/api/login/checklogin`) >= 0
        || request.url.indexOf(`/api/refreshtoken`) >= 0
        || request.url.indexOf(`/api/logout`) >= 0
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

                const response = refreshtokenRequest;

                // const response = await axiosInstance.getNewAccessToken()

                refreshtokenRequest = null;

                if (response && response !== '') {
                    SetLocalStorage(ConfigConstants.TOKEN_ACCESS, response.Token);
                    SetLocalStorage(ConfigConstants.TOKEN_REFRESH, response.RefreshToken);
                    request.headers.Authorization = `Bearer ${response.Token}`;
                    return request;
                }
                else {
                    // ErrorAlert('You lost your authorization, please login again !');
                    // ErrorAlert(<FormattedMessage id="login.lost_authorization" />);
                    instance.Logout();
                    return request;
                }
            }

        }
        else {
            //     ErrorAlert(intl.formatMessage({ id: 'login.lost_authorization' }));
            // ErrorAlert(<FormattedMessage id="login.lost_authorization" />);
            instance.Logout();
            return request;
        }
    }

}, err => {
    return Promise.reject(err)
});

instance.interceptors.response.use(
    (response) => {
        // Thrown error for request with OK status code
        const { data } = response
        if (data.HttpResponseCode === 401 && data.ResponseMessage === 'login.lost_authorization') {

            // ErrorAlert(<FormattedMessage id="login.lost_authorization" />);
            instance.Logout();
        }

        // if (data.ResponseMessage === 'general.unauthorized') {
        //     instance.Logout(data.ResponseMessage);
        // }

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

    const res = await instance.post(API_URL + '/api/refreshtoken', postObj);

    if (res.HttpResponseCode === 200) {
        let newTokenObj = res.Data;
        SetLocalStorage(ConfigConstants.TOKEN_ACCESS, newTokenObj.accessToken);
        SetLocalStorage(ConfigConstants.TOKEN_REFRESH, newTokenObj.refreshToken);
        return true;
    }
    else
        return false;
}

instance.Logout = async (e) => {
    RemoveLocalStorage(ConfigConstants.TOKEN_ACCESS);
    RemoveLocalStorage(ConfigConstants.TOKEN_REFRESH);
    RemoveLocalStorage(ConfigConstants.CURRENT_USER);
    firstLogin.isfirst = false;
    ErrorAlert(e)
    historyApp.push("/logout");
}

export { instance };
