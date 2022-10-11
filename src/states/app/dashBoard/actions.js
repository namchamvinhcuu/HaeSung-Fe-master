import {
    APPEND_TAB,
    RESET_TAB,
    SWITCH_TAB,
    DELETE_TAB,
    DELETE_OTHER,
    DELETE_ALL,

    APPEND_NOTIFY,
    UPDATE_TIME_AGO,
    SET_DATA_NOTIFY_USER
} from './types';
import { api_get, api_post, SuccessAlert, ErrorAlert, historyDashboard, firstLogin } from "@utils";

const appendTab = (data) => {
    return (dispatch, getState) => {

        dispatch({
            type: APPEND_TAB,
            data: data
        });
    };
};

const resetTab = (text) => {
    return dispatch => {
        dispatch({
            type: RESET_TAB,
            data: text
        });
    };
};
const switchTab = (index) => {
    return dispatch => {


        dispatch({
            type: SWITCH_TAB,
            data: index
        });
    };
};
const deleteTab = (index) => {
    return (dispatch, getState) => {
        dispatch({
            type: DELETE_TAB,
            index: index
        });
        const { Dashboard_Reducer: { HistoryElementTabs, index_tab_active_array } } = getState().AppReducer;

        if (HistoryElementTabs.length) {
            const tab = HistoryElementTabs[index_tab_active_array];
            historyDashboard.push(tab.router)
        } else {
            firstLogin.isfirst = null;
            historyDashboard.push({
                pathname: '/'
            })
        }

    };
};

const deleteOtherTab = (index) => {
    return dispatch => {
        dispatch({
            type: DELETE_OTHER
        });
    };
};

const deleteAll = () => {
    return dispatch => {
        dispatch({
            type: DELETE_ALL
        });
    };
};

const appendNotify = (data) => {
    return dispatch => {

        dispatch({
            type: APPEND_NOTIFY,
            data: data
        });
    };
};


const updateTimeAgo = () => {
    return dispatch => {

        dispatch({
            type: UPDATE_TIME_AGO

        });
    };
};

const updatenotify = (rows, total) => {
    return dispatch => {

        dispatch({
            type: SET_DATA_NOTIFY_USER,
            data: { rows, total }

        });
    };
};



export {
    appendTab,
    switchTab,
    resetTab,
    deleteTab,
    deleteOtherTab,
    deleteAll,


    appendNotify,
    updateTimeAgo,
    updatenotify

};
