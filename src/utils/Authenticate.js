
import * as ConfigConstants from '@constants/ConfigConstants';
import { Redirect, withRouter } from 'react-router-dom';
import React from 'react';


const firstLogin = {}
const isAuthenticate = () => {

    // return true;
    let isAuthen = false;
    let currentUser = null;
    if (localStorage.getItem(ConfigConstants.CURRENT_USER))
        currentUser = JSON.parse(localStorage.getItem(ConfigConstants.CURRENT_USER));

    if (currentUser) {

        if (currentUser.userId) {
            isAuthen = true;
        }
    }
    return isAuthen;
}

const AuthenticateRoute = (Component, route) => (props) => {
    if (!isAuthenticate()) {
        return <Redirect to={route || '/login'} />;
    }
    if (Component === null) {
        return null;
    }

    return <Component {...props} />;
}

const NotAuthenticateRoute = (Component, route) => (props) => {
    if (isAuthenticate()) {
        return <Redirect to={route || '/'} />;
    }


    if (Component === null) {
        return null;
    }
    return <Component {...props} />;
}

const LogoutRoute = () => (props) => {
    logOut();
    return <Redirect to={'/'} />;
}

const logOut = () => {
    localStorage.removeItem(ConfigConstants.CURRENT_USER);
    localStorage.removeItem(ConfigConstants.TOKEN_ACCESS);
    localStorage.removeItem(ConfigConstants.TOKEN_REFRESH);
};

export {
    firstLogin,
    isAuthenticate,
    AuthenticateRoute,
    NotAuthenticateRoute,
    // checkExpired,
    logOut,
    LogoutRoute
};
