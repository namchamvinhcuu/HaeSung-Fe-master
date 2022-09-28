import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { historyApp } from '@utils';
import CustomRouter from '@utils/CustomRoutes';
import { AuthenticateRoute, NotAuthenticateRoute, LogoutRoute } from '@utils/Authenticate';
import { DashBoard, Login } from '@containers';

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

class App extends Component {

    handlePersistorState = () => {
        const { persistor } = this.props;

        let { bootstrapped } = persistor.getState();
        if (bootstrapped) {
            if (this.props.onBeforeLift) {
                Promise.resolve(this.props.onBeforeLift())
                    .then(() => this.setState({ bootstrapped: true }))
                    .catch(() => this.setState({ bootstrapped: true }));
            } else {
                this.setState({ bootstrapped: true });
            }
        }
    };

    componentDidMount() {
        this.handlePersistorState();
    }

    render() {
        return (
            <Fragment>
                <CustomRouter history={historyApp}>
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
                </CustomRouter>
            </Fragment>
        )
    }
}

export default App;