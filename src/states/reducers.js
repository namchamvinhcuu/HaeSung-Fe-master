import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import { reducer as formReducer } from 'redux-form'

import AppReducer from './app';
import { Store } from './app/typeReducers';

// const persistCommonConfig = {
//     storage: storage,
//     stateReconciler: autoMergeLevel2,
// };

// const appPersistConfig = {
//     ...persistCommonConfig,
//     key: 'app',
//     whitelist: ['language']
// };

export default function createReducer() {
    return combineReducers({
        [Store.APP_REDUCER]: AppReducer,
        form: formReducer
    });
};


// const reduxCombineReducers = (history) => combineReducers({
//     router: connectRouter(history),
//     // [Store.APP_REDUCER]: persistReducer(appPersistConfig, AppReducer),
//     [Store.APP_REDUCER]: AppReducer,
//     form: formReducer
//     // user: userReducer,
//     // app: appReducer
// });

//export default reduxCombineReducers;



