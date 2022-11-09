import React, { useState, useRef, useEffect } from "react";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'

import Grid from "@mui/material/Grid";
import OutlinedInput from '@mui/material/OutlinedInput';
import { useIntl } from "react-intl";
import { ErrorAlert, SuccessAlert } from "@utils";
import {
    MuiButton,
    MuiDataGrid,
    MuiTextField
} from "@controls";

const MaterialReceiving = (props) => {
    let isRendered = useRef(true);
    const intl = useIntl();

    const [lotInput, setLotInput] = useState('');
    const [focus, setFocus] = useState(true);

    const handleLotInputChange = (e) => {
        setLotInput(e.target.value)
    }

    const keyPress = (e) => {
        if (e.key === "Enter") {
            setLotInput('');
            setFocus(true);
        }
    };

    useEffect(() => {

        return () => {
            isRendered = false;
        };
    }, []);

    return (
        <React.Fragment>
            <Grid
                container
                spacing={2}
                direction="row"
                justifyContent="space-between"
                alignItems="flex-end"
            >
                <Grid item xs={4}></Grid>
                <Grid item xs={8}>
                    <Grid
                        container
                        spacing={2}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-end"
                    >
                        <Grid item xs={9.5}>
                            <MuiTextField
                                label="Lot"
                                autoFocus={focus}
                                value={lotInput}
                                onChange={handleLotInputChange}
                                onKeyDown={keyPress}
                            />
                        </Grid>
                        <Grid item xs={2.5}>
                            <MuiButton
                                text="scan"
                                color="success"
                                onClick={() => {
                                    // toggleDialog(CREATE_ACTION);
                                }}
                            />
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
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

export default connect(mapStateToProps, mapDispatchToProps)(MaterialReceiving);