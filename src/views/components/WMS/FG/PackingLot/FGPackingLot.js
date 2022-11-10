import React, { useState, useRef, useEffect } from "react";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'

import moment from "moment";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { useIntl } from "react-intl";
import { ErrorAlert, SuccessAlert } from "@utils";
import {
    MuiButton,
    MuiDataGrid,
    MuiTextField
} from "@controls";

const FGPackingLot = (props) => {
    let isRendered = useRef(true);

    const lotInputRef = useRef(null);
    const intl = useIntl();



    return (
        <React.Fragment>
            <h1>FGPackingLot</h1>
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

export default connect(mapStateToProps, mapDispatchToProps)(FGPackingLot);