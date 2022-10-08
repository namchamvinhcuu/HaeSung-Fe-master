import {
    APPEND_TAB, RESET_TAB, SWITCH_TAB, DELETE_TAB, DELETE_ALL, APPEND_NOTIFY, USER_LOGIN, UPDATE_TIME_AGO,
    SET_DATA_NOTIFY_USER,
    DELETE_OTHER
} from './types';
import { calDateAgo, toCamel, UserManager } from '@utils'

var indexNumber = -1;
const initializeState = {
    HistoryElementTabs: [],
    index_tab_active: -1,
    index_tab_active_array: 0,

    notify_list: [],
    total_notify: 0
};

const reducer = (state = initializeState, action) => {
    let newState = { ...state };

    switch (action.type) {
        case APPEND_TAB:
            //  console.log(action.data)
            //     var isexist=false; var code=action.data.code

            //      newState.HistoryElementTabs.forEach((obj,_index) => {
            //      if (obj.code === code ) {

            //             isexist=true
            //             newState.index_tab_active= obj.index;
            //             newState.index_tab_active_array=_index;
            //             return
            //      }

            //    });
            //    if (!isexist) {
            //     //neu so luong lon hon 5 thi dong tab dau tien
            //     if (newState.HistoryElementTabs.length >5) {
            //         newState.HistoryElementTabs.shift(); 
            //     }
            //     indexNumber ++;

            //     newState.HistoryElementTabs.push({...action.data, index:indexNumber})

            //     newState.index_tab_active=indexNumber;
            //     newState.index_tab_active_array=newState.HistoryElementTabs.length-1;
            //    } 
            var isexist = false;
            var code = action.data.code
            var lst = []
            newState.HistoryElementTabs.forEach((obj, _index) => {
                if (obj.code === code) {
                    isexist = true
                    if (action.data.is_reload_component) {
                        indexNumber++;

                        lst.push({ ...action.data, index: indexNumber, is_reload_component: false })
                        newState.index_tab_active = indexNumber;
                    } else {

                        lst.push(obj)
                        newState.index_tab_active = obj.index;
                    }


                    newState.index_tab_active_array = _index;

                } else {
                    lst.push(obj)
                }

            });
            if (!isexist) {
                indexNumber++;

                lst.push({ ...action.data, index: indexNumber, is_reload_component: false })


                if (lst.length > 6) {
                    lst.shift();
                }

                newState.index_tab_active = indexNumber;
                newState.index_tab_active_array = lst.length - 1;

            }
            newState.HistoryElementTabs = lst;
            break;

        case RESET_TAB:
            newState.HistoryElementTabs = [];
            newState.index_tab_active = -1;
            newState.index_tab_active_array = -1;
            break;

        case SWITCH_TAB:
            const index_switch = action.data;
            newState.index_tab_active = newState.HistoryElementTabs[index_switch].index
            newState.index_tab_active_array = index_switch;
            break;

        case DELETE_TAB:
            var HistoryElementTabs = newState.HistoryElementTabs;
            if (newState.index_tab_active === action.index) {

                const oldindex = HistoryElementTabs.findIndex(e => e.index == action.index);
                var next_index, lst = []
                newState.HistoryElementTabs.forEach((obj, index) => {
                    if (index < oldindex) next_index = index;
                    else if (index > oldindex && !next_index) next_index = index;

                    if (index != oldindex) lst.push(obj)

                });
                if (next_index === undefined) {
                    newState.index_tab_active = -1;
                    newState.index_tab_active_array = -1;

                } else {
                    newState.index_tab_active = newState.HistoryElementTabs[next_index].index;
                    newState.index_tab_active_array = lst.findIndex(e => e.index == newState.index_tab_active);

                }


                newState.HistoryElementTabs = lst;
            } else {

                newState.HistoryElementTabs = HistoryElementTabs.filter(item => item.index !== action.index);
                const index = newState.HistoryElementTabs.findIndex(e => e.index == newState.index_tab_active);
                newState.index_tab_active_array = index;

            }
            break;

        case DELETE_OTHER:
            var item = newState.HistoryElementTabs = newState.HistoryElementTabs[newState.index_tab_active_array];
            if (item) {
                newState.HistoryElementTabs = [item];
                newState.index_tab_active_array = 0;
            }

            else {
                newState.HistoryElementTabs = [];
                newState.index_tab_active_array = -1;
            }
            break;

        case DELETE_ALL:
            // newState.HistoryElementTabs = [];
            // newState.index_tab_active = -1;
            // newState.index_tab_active_array = 0;

            newState = { ...state };
            break;

        case USER_LOGIN:

            // newState.notify_list = UserManager.Noticafitions.notifies??[]
            // newState.total_notify = UserManager.Noticafitions.total??0

            //reset tab
            newState.HistoryElementTabs = [];
            newState.index_tab_active = -1;
            newState.index_tab_active_array = -1;


            break;
        case SET_DATA_NOTIFY_USER:
            //  console.log(toCamel(action.data.rows))
            newState.notify_list = toCamel(action.data.rows);
            newState.total_notify = action.data.total;
            UserManager.UpdateNocations(newState.notify_list, newState.total_notify)


            break;
        case APPEND_NOTIFY:
            const { notify_list } = newState;
            //cho phép tối đa 15 item trong danh sách
            if (action.data) {
                newState.notify_list = action.data.concat(notify_list).slice(0, 15);
                newState.total_notify += action.data.length;

                //cap nhat vao UserManager de khi refresh trinh duyet se ko clear du lieu
                UserManager.UpdateNocations(newState.notify_list, newState.total_notify)
            }


            break;
        case UPDATE_TIME_AGO:
            newState.notify_list = newState.notify_list.map(item => {

                item.timeago = calDateAgo(item.publicTimeStr);
                return item;
            })


            break;



        default:
            break;

    }
    return { ...newState };
};

export default reducer;


