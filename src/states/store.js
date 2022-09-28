import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { persistStore } from 'redux-persist'
import { createStateSyncMiddleware } from 'redux-state-sync'
//import signalRMiddleware from '@state/signalr';

import { CHANGE_LANGUAGE } from './app/user/types'

import reducers from './reducers';

const reduxStateSyncConfig = {
    whitelist: [
        CHANGE_LANGUAGE,
    ]
}

const bindMiddleware = middleware => {
    if (process.env.NODE_ENV !== 'production') {
        const { composeWithDevTools } = require('redux-devtools-extension');
        return composeWithDevTools(applyMiddleware(...middleware));
    }
    return applyMiddleware(...middleware);
};

function reduxStore(state = {}) {
    const store = createStore(reducers(), state, bindMiddleware([
        thunkMiddleware,
        createStateSyncMiddleware(reduxStateSyncConfig),
        // signalRMiddleware,
    ]));
    return store;
};

const store = reduxStore();

export const persistor = persistStore(store);
export default store;
