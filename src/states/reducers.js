import { combineReducers } from 'redux'

import { reducer as formReducer } from 'redux-form'

import AppReducer from './app';
import { Store } from './app/typeReducers';

export default function createReducer() {
    return combineReducers({
        [Store.APP_REDUCER]: AppReducer,
        form: formReducer
    });
};




