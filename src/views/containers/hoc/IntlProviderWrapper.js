import IntlProviderWrapper from '../../../hoc/IntlProviderWrapper'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS';
import { User_Operations } from '@appstate/user';
import { Store } from '@appstate';

User_Operations.toString = function () {
    return 'User_Operations';
}

const mapStateToProps = state => {

    const { User_Reducer: { text, language } } = CombineStateToProps(state.AppReducer, [
        [
            Store.User_Reducer
        ]
    ]);

    return { text, language };

};

const mapDispatchToProps = dispatch => {

    const { User_Operations: { funcTest } } = CombineDispatchToProps(dispatch, bindActionCreators, [
        [
            User_Operations
        ]
    ]);

    return { funcTest }

};

export default connect(mapStateToProps, mapDispatchToProps)(IntlProviderWrapper);