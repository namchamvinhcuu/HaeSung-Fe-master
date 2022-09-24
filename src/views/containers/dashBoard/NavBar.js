import { NavBar } from '@components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS';
import { Dashboard_Operations } from '@appstate/dashBoard';
import { Store } from '@appstate';

Dashboard_Operations.toString = function() {
    return 'Dashboard_Operations';
}

const mapStateToProps = state => {
  
    const {Dashboard_Reducer: {HistoryElementTabs,index_tab_active,index_tab_active_array, notify_list,total_notify} } =CombineStateToProps(state.AppReducer, [
        [
            Store.Dashboard_Reducer
        ]
    ]);

    return {HistoryElementTabs,index_tab_active,index_tab_active_array, notify_list,total_notify};

};

const mapDispatchToProps = dispatch => {

    const {Dashboard_Operations: {appendTab,switchTab,deleteTab,deleteAll , updateTimeAgo,updatenotify} } = CombineDispatchToProps(dispatch, bindActionCreators, [
        [
            Dashboard_Operations
        ]
    ]);

  return {appendTab,switchTab,deleteTab,deleteAll, updateTimeAgo,updatenotify}

};

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);


