import { DashBoard } from '@components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS';
import { Dashboard_Operations } from '@appstate/dashBoard';
import { Store } from '@appstate';
function mapStateToProps(state) {
    return {
    };
}

const mapDispatchToProps = dispatch => {
    const {Dashboard_Operations: {updatenotify} } = CombineDispatchToProps(dispatch, bindActionCreators, [
        [
            Dashboard_Operations
        ]
    ]);

  return {updatenotify}

};

export default connect(mapStateToProps, mapDispatchToProps)(DashBoard);