import { NavBar } from '@components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS';
import { Dashboard_Operations } from '@appstate/dashBoard';
import { User_Operations } from '@appstate/user';
import { Store } from '@appstate';

Dashboard_Operations.toString = function () {
    return 'Dashboard_Operations';
}

User_Operations.toString = function () {
    return 'User_Operations';
}

const mapStateToProps = state => {
    const {
        Dashboard_Reducer: {
            HistoryElementTabs
            , index_tab_active
            , index_tab_active_array
            , notify_list
            , total_notify
        }
        , User_Reducer: {
            language
        }
    } = CombineStateToProps(state.AppReducer, [
        [Store.Dashboard_Reducer]
        , [Store.User_Reducer]
    ]);

    return {
        HistoryElementTabs
        , index_tab_active
        , index_tab_active_array
        , notify_list
        , total_notify

        , language
    };

};

const mapDispatchToProps = dispatch => {

    const {
        Dashboard_Operations: {
            appendTab
            , switchTab
            , deleteTab
            , deleteOtherTab
            , deleteAll
            , updateTimeAgo
            , updatenotify
        }
        // , User_Operations: {
        //     changeLanguage
        // }
    } = CombineDispatchToProps(dispatch, bindActionCreators, [
        [Dashboard_Operations]
        // , [User_Operations]
    ]);

    return {
        appendTab
        , switchTab
        , deleteTab
        , deleteOtherTab
        , deleteAll
        , updateTimeAgo
        , updatenotify

        // , changeLanguage
    }

};

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);


