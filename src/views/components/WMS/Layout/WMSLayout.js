import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
    MuiButton,
    MuiTextField,
    MuiAutocomplete
} from "@controls";
import IconButton from "@mui/material/IconButton";
import { ErrorAlert, SuccessAlert } from "@utils";
import moment from "moment";
import { useIntl } from "react-intl";
import _ from 'lodash'

import Grid from "@mui/material/Grid";

import { locationService, wmsLayoutService } from "@services";

const WMSLayout = (props) => {

    let isRendered = useRef(true);
    const intl = useIntl();

    const initLocation = {
        LocationId: 0,
        LocationCode: ""
    }

    const [wmsLayoutState, setWMSLayoutState] = useState({
        commonDetailId: 0,
        commonDetailName: "",
        Location: {
            ...initLocation
        },
        ShelfCode: "",
        TotalLevel: 1,
        BinPerLevel: 1,
    });


    const handleDelete = async (lot) => {

    };

    const fetchData = async () => {

    };

    const getWarehouses = async () => {
        return await locationService.GetArea();
    }

    const getAisles = async () => {
        return await wmsLayoutService.getAisles(wmsLayoutState.commonDetailId);
    }

    const handleInputChange = (e, inputName) => {
        let newState = { ...wmsLayoutState };
        newState[inputName] = e;
        if (inputName === "commonDetailId") {
            newState.Location = {
                ...initLocation
            };
        }

        setWMSLayoutState({ ...newState });
    };

    const handleCreate = async () => {
        // const removeProp = 'Location';
        // const { [removeProp]: remove, ...rest } = wmsLayoutState;

        const {
            Location,
            ShelfCode,
            TotalLevel,
            BinPerLevel
        } = wmsLayoutState;

        const params = {
            LocationId: Location.LocationId,
            LocationCode: Location.LocationCode,
            ShelfCode: ShelfCode,
            TotalLevel: TotalLevel,
            BinPerLevel: BinPerLevel,
        }

        const res = await wmsLayoutService.createShelf(params);

        console.log(res, '[response]')
    }

    useEffect(() => {

        return () => {
            isRendered = false;
        };
    }, [wmsLayoutState.commonDetailId]);

    return (
        <React.Fragment>
            <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="width-end"
            >

                <Grid item xs>
                    <Grid
                        container
                        columnSpacing={2}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Grid item xs>
                            <Grid container
                                columnSpacing={2}
                                direction="row"
                                justifyContent="flex-start"
                                alignItems="center"
                            >
                                <Grid item style={{ width: "20%" }}>
                                    <MuiAutocomplete
                                        label={intl.formatMessage({ id: "wms-layout.warehouse" })}
                                        fetchDataFunc={getWarehouses}
                                        displayLabel="commonDetailName"
                                        displayValue="commonDetailId"
                                        onChange={(e, item) => {
                                            handleInputChange(
                                                item ? item.commonDetailId ?? null : null,
                                                "commonDetailId"
                                            );
                                        }}
                                        variant="standard"
                                    />

                                </Grid>
                                <Grid item style={{ width: "10%" }}>
                                    <MuiAutocomplete
                                        label={intl.formatMessage({ id: "wms-layout.aisle" })}
                                        fetchDataFunc={getAisles}
                                        displayLabel="LocationCode"
                                        displayValue="LocationId"
                                        value={
                                            !_.isEqual(wmsLayoutState.Location, initLocation)
                                                ? wmsLayoutState.Location
                                                : initLocation
                                        }
                                        onChange={(e, item) => {
                                            handleInputChange({ LocationId: item.LocationId, LocationCode: item.LocationCode }, "Location"
                                            );

                                        }}
                                        variant="standard"
                                    />
                                </Grid>
                                <Grid item style={{ width: "10%" }}>
                                    <MuiTextField
                                        label={intl.formatMessage({ id: "wms-layout.shelf" })}
                                        variant="standard"
                                        value={wmsLayoutState.ShelfCode}
                                        onChange={(e) => { handleInputChange(e.target.value, "ShelfCode") }}
                                    />
                                </Grid>
                                <Grid item style={{ width: "10%" }}>
                                    <MuiTextField
                                        label={intl.formatMessage({ id: "wms-layout.total_level" })}
                                        variant="standard"
                                        type="number"
                                        value={wmsLayoutState.TotalLevel}
                                        onChange={(e) => { handleInputChange(e.target.value, "TotalLevel") }}
                                    />
                                </Grid>
                                <Grid item style={{ width: "10%" }}>
                                    <MuiTextField
                                        label={intl.formatMessage({ id: "wms-layout.bin_per_level" })}
                                        variant="standard"
                                        type="number"
                                        value={wmsLayoutState.BinPerLevel}
                                        onChange={(e) => { handleInputChange(e.target.value, "BinPerLevel") }}
                                    />
                                </Grid>
                                <Grid item style={{ width: "10%" }}>
                                    <MuiButton
                                        text="create"
                                        color="success"
                                        onClick={handleCreate}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <MuiButton
                                text="search"
                                color="info"
                                onClick={fetchData}
                            // sx={{ mt: 1, mr: 3 }}
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

export default connect(mapStateToProps, mapDispatchToProps)(WMSLayout);