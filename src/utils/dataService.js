import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { AuthHeader, GetMenus_LoginUser } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';
import * as TextConstants from '@constants/TextConstants';
import { toast } from 'react-toastify';

import jwt from 'jsonwebtoken';
import { historyApp } from '@utils';
import store from '@states/store';

//xử lý login 
function login(username, password, langcode, rememberMe) {
    const requestOptions = {
        withCredentials: true,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ Account: username, Password: password })
        body: JSON.stringify({ userName: username, userPassword: password })
    };

    localStorage.setItem(ConfigConstants.LANG_CODE, langcode);

    return new Promise((resolve, reject) => {

        fetch(ConfigConstants.API_URL + 'login', requestOptions)
            // fetch(ConfigConstants.API_URL + 'auth/login', requestOptions)
            .then(handleResponse, handleError)
            .then(result => {
                if (result === 'general.success') {

                    // let data = jwt.decode(result.data);

                    getLoggedInUser().then(res => {
                        if (res) {

                            // data.user_info = res.data;

                            localStorage.setItem(ConfigConstants.CURRENT_USER, JSON.stringify(res));
                            //    
                            store.dispatch({
                                type: 'Dashboard/USER_LOGIN',
                                //  data: {list:data.user_info.notifies,total: data.user_info.total_Notification}

                            });

                            resolve(res);

                        } else {
                            reject();
                        }
                    });


                } else
                    reject(result);
            });
    });

}

function logout() {

    // remove user from local storage to log user out
    localStorage.removeItem(ConfigConstants.CURRENT_USER);
    localStorage.removeItem(ConfigConstants.LANG_CODE);
    clearAccessTokens();
}

//hàm nội tại, khi login thành công lấy thêm thông tin user
function getLoggedInUser() {
    const requestOptions = {
        method: 'GET',
        headers: AuthHeader()

    };
    return fetch(ConfigConstants.API_URL + 'login/getUserInfo', requestOptions).then(handleResponse, handleError);
}

//lấy dữ liệu từ backend thông qua httpGet
function api_get(endpoint, data) {
    var strParams = ""
    if (data) {
        for (var key in data) {
            if (strParams != "") {
                strParams += "&";
            }
            strParams += key + "=" + (data[key] !== undefined && data[key] != null ? encodeURIComponent(data[key]) : '');
        }

    }
    const requestOptions = {
        method: 'GET',
        headers: AuthHeader(),
    };

    return new Promise((resolve, reject) => {
        fetch(ConfigConstants.API_URL + endpoint + "?" + strParams, requestOptions)
            .then(handleResponse, handleError)
            .then(res => {

                if (res.succeeded) {
                    resolve(res.data)
                }
                else if (res.redirected) {
                    reject();
                }
                else {
                    //.log(res)
                    toast.error(<ErrorDisplay errors={res.errors} />, {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        enableHtml: true
                    });
                    reject(res.errors)
                }
            })

    });

}

function ErrorDisplay({ errors }) {
    let listErrors = [];
    if (typeof errors === 'string') {
        listErrors.push(<li key="1">{errors}</li>)
    } else if (typeof errors === 'object') {
        let key_id = 0;
        for (let key in errors) {
            key_id++;
            listErrors.push(<li key={key_id}>{errors[key]}</li>)

        }
    }

    return (
        <ul>{listErrors}</ul>

    )
}

//lấy dữ liệu từ backend thông qua httpost
function api_post(endpoint, data) {

    const requestOptions = {

        method: 'POST',
        headers: { ...AuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    };

    return new Promise((resolve, reject) => {
        fetch(ConfigConstants.API_URL + endpoint, requestOptions).then(handleResponse, handleError)
            .then(res => {

                if (res.succeeded) {
                    resolve(res.data)
                }
                else if (res.redirected) {
                    reject();
                }
                else {
                    toast.error(<ErrorDisplay errors={res.errors} />, {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,

                    });
                    reject(res.errors)
                }

            })
    });

}

//download file
function api_download(endpoint, filename) {
    const requestOptions = {

        method: 'GET',
        headers: { ...AuthHeader() }

    };

    return new Promise((resolve, reject) => {
        fetch(ConfigConstants.API_URL + endpoint, requestOptions)
            .then(handleResponse, handleError)

            .then(response => {

                if (response.status != 200) {
                    toast.error(<ErrorDisplay errors={response.errors} />, {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,

                    });
                    reject(response.errors)
                } else {
                    return response.blob()
                }

            })
            .then(blob => {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                resolve();
            });

    });

}

function api_push_notify(user_id_list, message) {


    message.Type = 1;//
    message.Status = 1; //public
    if (user_id_list === -1) {
        //send all user
        message.IsSendAll = true;
    } else
        message.NoticeUserIdList = user_id_list;

    const requestOptions = {
        method: 'POST',
        headers: { ...AuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
    };


    return new Promise((resolve, reject) => {
        fetch(ConfigConstants.BASE_URL + "sysNotice/add", requestOptions).then(handleResponse, handleError)
            .then(res => {

                if (res.succeeded) {
                    resolve(res.data)
                }
                else if (res.redirected) {
                    reject();
                }
                else {
                    toast.error(<ErrorDisplay errors={res.errors} />, {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,

                    });
                    reject(res.errors)
                }

            })
    });
}

function createFormData(formData, key, data) {
    if (data === Object(data) || Array.isArray(data)) {
        for (var i in data) {
            createFormData(formData, key + '[' + i + ']', data[i] ?? '');
        }
    } else {
        formData.append(key, data ?? '');
    }
}

function api_post_formdata(endpoint, data, files) {
    const formData = new FormData();

    for (const name in data) {
        //var obj=data[name];

        createFormData(formData, name, data[name])
        // if (Array.isArray(obj)) {

        //     for(var i = 0; i < obj.length; i++) {
        //         formData.append(name + '['+ i+']' + '.model_id', obj[i].model_id);
        //     }


        // } else {
        //     formData.append(name, obj??'');
        // }


    }

    if (files && files.length) {
        files.forEach((f) => {

            formData.append(f.name, f.file);
        });

    }

    const requestOptions = {

        method: 'POST',

        headers: { ...AuthHeader() },
        body: formData
    };

    return new Promise((resolve, reject) => {

        fetch(ConfigConstants.API_URL + endpoint, requestOptions).then(handleResponse, handleError)
            .then(res => {

                if (res.succeeded) {
                    resolve(res.data)
                }
                else if (res.redirected) {
                    reject();
                }
                else {
                    toast.error(<ErrorDisplay errors={res.errors} />, {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,

                    });
                    reject(res.errors)
                }


            })
    });

}

function clearAccessTokens() {
    localStorage.removeItem(ConfigConstants.TOKEN_ACCESS);
    localStorage.removeItem(ConfigConstants.TOKEN_REFRESH);
};

function handleResponse(response) {

    // console.log(response)
    var status = response.status;
    var serve = response.data;

    // console.log(response)
    // Handling 401
    if (status === 401) {

        clearAccessTokens();
        localStorage.removeItem(ConfigConstants.CURRENT_USER);
    }
    // Handling unnormalized
    if (status >= 400) {
        throw new Error(response.statusText || "Request Error.");
    }
    // Handling normalized result errors
    if (serve && serve.hasOwnProperty("errors") && serve.errors) {
        throw new Error(JSON.stringify(serve.errors || "Request Error."));
    }

    var access_token = response.headers.get("access-token");
    var refresh_token = response.headers.get("refresh-token");

    // Determine whether it is an invalid token
    if (access_token === "invalid_token") {
        clearAccessTokens();
        localStorage.removeItem(ConfigConstants.CURRENT_USER);
        historyApp.push({
            pathname: '/login',
            urlReturn: location.pathname
        })
        return new Promise((resolve, _) => {
            resolve({ redirected: true })
        });
    }
    // Determine if there is a refresh token, and if so, store it locally
    else if (
        refresh_token &&
        access_token &&
        access_token !== "invalid_token"
    ) {

        localStorage.setItem(ConfigConstants.TOKEN_ACCESS, access_token);
        localStorage.setItem(ConfigConstants.TOKEN_REFRESH, refresh_token);
    }

    return new Promise((resolve, reject) => {
        if (response.ok) {

            var contentType = response.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
                response.json().then(json => {
                    console.log('jsonResponse', json)
                    resolve(json)
                });
            } else {
                resolve(response);
            }
        } else {
            try {
                const { emitRedirectSignIn } = eventEmitterAuthenticate;

                switch (response.status) {
                    case 400:
                        response.json().then(json => {
                            let errorMsg = {};
                            if (typeof json === 'object') {
                                for (var propertyName in json) {
                                    var property = json[propertyName];
                                    //edited by nnhieu
                                    // if (propertyName === "error") {
                                    //     notifyError(property)
                                    //     return reject();
                                    // } else {
                                    //errorMserrorMsgg[propertyName] = property[0];
                                    //}
                                    if (propertyName === "error") {
                                        errorMsg[propertyName] = property;
                                    } else
                                        errorMsg[propertyName] = property[0];
                                }
                                return reject(errorMsg);
                            } else {
                                try {
                                    let jsonObj = JSON.parse(json);
                                    if (typeof jsonObj === 'object') {
                                        for (var propertyName in jsonObj) {
                                            var property = jsonObj[propertyName];
                                            if (propertyName === "error") {
                                                notifyError(property)
                                                return reject();
                                            } else {
                                                errorMsg[propertyName] = property;
                                            }
                                        }
                                    } else {
                                        notifyError(jsonObj);
                                    }
                                    return reject(errorMsg);
                                } catch (e) {
                                    errorMsg = json;
                                    notifyError(json);
                                    return reject(errorMsg);
                                }
                            }
                        });
                        break;
                    case 401:
                        console.log(response);
                        notifyError(
                            `${TextConstants.TEXT_LOGIN_AGAIN_MSG}. Tự động chuyển hướng sang trang đăng nhập.`
                        );
                        emitRedirectSignIn({
                            redirectUrl: '/login'
                        });
                        return reject(response);
                    case 403:
                        console.log(response);
                        notifyError(
                            `${TextConstants.TEXT_FORBIDDEN}. Tự động chuyển hướng sang trang đăng nhập.`
                        );
                        emitRedirectSignIn({
                            redirectUrl: '/login'
                        });
                        return reject(response);
                    case 404:
                        return reject("Không tìm thấy trang bạn yêu cầu");
                    default:
                        return reject(response);
                }
            }
            catch (ex) {
            }
        }
    });
};

function handleError(error) {
    // notifyError({ text: error.message })

    if (error.message)
        toast.error(error.message, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
    return Promise.reject(error && error.message);
}

export {
    login,
    logout,
    api_get,
    api_post,
    api_download,
    api_post_formdata,
    api_push_notify
};

