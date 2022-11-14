import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'

import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import {
    MuiAutocomplete,
    MuiButton,
    MuiDataGrid,
    MuiDateField,
    MuiSearchField
} from "@controls";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import { FormControlLabel, Switch } from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";

import { addDays, ErrorAlert, SuccessAlert } from "@utils";
import _ from "lodash";
import moment from "moment";

import { materialSOService } from "@services";
import { MaterialSOMasterDto, MaterialSODetailDto, } from "@models";

const MaterialSO = (props) => {
    return (
        <React.Fragment>
            <Grid
                container
                spacing={2}
                justifyContent="flex-end"
                alignItems="flex-end"
            >
                <Grid item xs={1.5}>
                    <MuiButton
                        text="create"
                        color="success"
                        onClick={() => {
                            toggleDialog(CREATE_ACTION);
                        }}
                    />
                </Grid>

                <Grid item xs>
                    <MuiSearchField
                        label="material-so-master.MsoCode"
                        name="MsoCode"
                        onClick={fetchData}
                        onChange={(e) => changeSearchData(e, "MsoCode")}
                    />
                </Grid>

                <Grid item>
                    <MuiDateField
                        disabled={workOrderState.isLoading}
                        label={intl.formatMessage({
                            id: "general.StartSearchingDate",
                        })}
                        value={workOrderState.searchData.StartSearchingDate}
                        onChange={(e) => {
                            changeSearchData(e, "StartSearchingDate");
                        }}
                        variant="standard"
                    />
                </Grid>

                <Grid item xs>
                    <MuiDateField
                        disabled={workOrderState.isLoading}
                        label={intl.formatMessage({
                            id: "general.EndSearchingDate",
                        })}
                        value={workOrderState.searchData.EndSearchingDate}
                        onChange={(e) => {
                            changeSearchData(e, "EndSearchingDate");
                        }}
                        variant="standard"
                    />
                </Grid>

                <Grid item xs={2.5}>
                    <Grid
                        container
                        justifyContent="space-around"
                        alignItems="flex-end"
                    >
                        <Grid item>
                            <MuiButton text="search" color="info" onClick={fetchData} />
                        </Grid>

                        <Grid item>
                            <FormControlLabel
                                sx={{ mb: 0, ml: "1px" }}
                                control={
                                    <Switch
                                        defaultChecked={true}
                                        color="primary"
                                        onChange={(e) => handleshowActivedData(e)}
                                    />
                                }
                                label={showActivedData ? "Actived" : "Deleted"}
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

export default connect(mapStateToProps, mapDispatchToProps)(MaterialSO);