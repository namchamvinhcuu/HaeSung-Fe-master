import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { DashBoard, Login } from '@containers';

import { I18nextProvider } from "react-i18next";
import IntlProviderWrapper from "../src/views/containers/hoc/IntlProviderWrapper";

import i18n from "./i18n";
import 'font-awesome/css/font-awesome.min.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import 'jquery.fancytree/dist/skin-lion/ui.fancytree.less';  // CSS or LESS
import '@mdi/font/css/materialdesignicons.css'
import 'react-photo-view/dist/react-photo-view.css';

//import "aos/dist/aos.css";
import "@styles/css/adminlte.min.css";
import '@styles/less/tool.less';
import '@styles/less/app.less';
import "./styles/css/App.css";
import "@styles/flag-icon-css/css/flag-icons.css";

import 'jquery';
import 'jquery-ui';
import 'bootstrap';

import { historyApp, firstLogin } from '@utils';
import CustomRouter from '@utils/CustomRoutes';

import store, { persistor } from './states/store';

import { AuthenticateRoute, NotAuthenticateRoute, LogoutRoute } from '@utils/Authenticate';
import App from './views/App';

function RouteWrapperLogin(props) {
    const ComponentWrapper = NotAuthenticateRoute(Login,
        '/');
    return <ComponentWrapper {...props} />;
}

function RouteWrapperRoot(props) {
    const ComponentWrapper = AuthenticateRoute(DashBoard,
        '/login');

    return <ComponentWrapper {...props} />;
}

function RouteWrapperLogout(props) {
    const ComponentWrapper = LogoutRoute();
    return <ComponentWrapper {...props} />;
}

ReactDOM.render(
    <I18nextProvider i18n={i18n}>
        <Provider store={store}>
            <IntlProviderWrapper>
                {/* <CustomRouter history={historyApp} persistor={persistor}>
                    <Switch>
                        <Route
                            exact
                            path='/login'
                            component={RouteWrapperLogin} />
                        <Route
                            exact
                            path='/logout'
                            component={RouteWrapperLogout} />

                        <Route
                            path='/'
                            render={() => <RouteWrapperRoot />} />

                    </Switch>
                </CustomRouter> */}
                <App persistor={persistor} />
            </IntlProviderWrapper>
        </Provider>


    </I18nextProvider>
    , document.getElementById('root')
);
