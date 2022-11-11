import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
    MuiButton,
    MuiDataGrid,
    MuiTextField
} from "@controls";
import IconButton from "@mui/material/IconButton";
import { ErrorAlert, SuccessAlert } from "@utils";
import moment from "moment";
import { useIntl } from "react-intl";

const WMSLayout = (props) => {

    let isRendered = useRef(true);
    const intl = useIntl();

    const handleDelete = async (lot) => {

    };

    const fetchData = async () => {

    };

    useEffect(() => {

        return () => {
            isRendered = false;
        };
    }, []);

    return (
        <React.Fragment>
            <h1>WMS - Layout</h1>
        </React.Fragment>
    )
}

User_Operations.toString = function () {
    return 'User_Operations';
}

const mapStateToProps = state => {

    const { User_Reducer: { language } } = CombineStateToProps(state.AppReducer, [
        [Store.User_Reducer]
    ]);

    return { language };

};

const mapDispatchToProps = dispatch => {

    const { User_Operations: { changeLanguage } } = CombineDispatchToProps(dispatch, bindActionCreators, [
        [User_Operations]
    ]);

    return { changeLanguage }

};

export default connect(mapStateToProps, mapDispatchToProps)(WMSLayout);