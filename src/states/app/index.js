import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import { Store } from './typeReducers';
import Dashboard_Reducer from './dashBoard';
import User_Reducer from './user';
import Display_Reducer from './display';

const persistCommonConfig = {
  storage: storage,
  stateReconciler: autoMergeLevel2,
};

const userPersistConfig = {
  ...persistCommonConfig,
  key: 'user',
  whitelist: ['language'],
};

const reducers = combineReducers({
  [Store.Dashboard_Reducer]: Dashboard_Reducer,
  [Store.User_Reducer]: persistReducer(userPersistConfig, User_Reducer),
  [Store.Display_Reducer]: Display_Reducer,
});

export { Store };
export default reducers;
