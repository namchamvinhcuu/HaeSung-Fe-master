import { combineReducers } from 'redux';
import { Store } from './typeReducers';
import Dashboard_Reducer  from './dashBoard';


const reducers = combineReducers({
    [Store.Dashboard_Reducer]:Dashboard_Reducer,
});

export default reducers;

export {Store}
