import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
//import signalRMiddleware from '@state/signalr';

import reducers from './reducers';

const bindMiddleware = middleware => {
    if (process.env.NODE_ENV !== 'production') {
        const { composeWithDevTools } = require('redux-devtools-extension');
        return composeWithDevTools(applyMiddleware(...middleware));
    }
    return applyMiddleware(...middleware);
};

function reduxStore(state = {}) {
    const store = createStore(reducers(), state, bindMiddleware([
        thunk,
       // signalRMiddleware,
    ]));
    return store;
};

const store=reduxStore();
export default  store;
