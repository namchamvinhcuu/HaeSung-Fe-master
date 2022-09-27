import { combineReducers } from 'redux';
import { Store } from './typeReducers';
import Dashboard_Reducer from './dashBoard';
import User_Reducer from "./user";

const reducers = combineReducers({
    [Store.Dashboard_Reducer]: Dashboard_Reducer,

    [Store.User_Reducer]: User_Reducer
});

export { Store }
export default reducers;

