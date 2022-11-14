import React, { useEffect, useRef, useState } from "react";
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
import { useIntl } from "react-intl";

import { materialSOService } from "@services";
import { MaterialSOMasterDto, MaterialSODetailDto, } from "@models";

const MaterialSODetail = (props) => {
    let isRendered = useRef(true);
    const intl = useIntl();

    const [materialSODetailState, setMaterialSODetailState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 8,
        searchData: {
            ...MaterialSODetailDto,
        }
    });

    const [newData, setNewData] = useState({ ...MaterialSODetailDto });

    const [isOpenDialog, setIsOpenDialog] = useState(false);

    const [showActivedData, setShowActivedData] = useState(true);

    const [selectedRow, setSelectedRow] = useState({
        ...MaterialSODetailDto,
    });

    const changeSearchData = async (e, inputName) => {
        let newSearchData = { ...materialSODetailState.searchData };

        newSearchData[inputName] = e;

        switch (inputName) {
            case "StartSearchingDate":
            case "EndSearchingDate":
                newSearchData[inputName] = e;
                break;
            default:
                newSearchData[inputName] = e.target.value;
                break;
        }

        setMaterialSODetailState({
            ...materialSODetailState,
            searchData: { ...newSearchData },
        });
    };

    const handleshowActivedData = async (event) => {
        setShowActivedData(event.target.checked);
        if (!event.target.checked) {
            setMaterialSODetailState({
                ...materialSODetailState,
                page: 1,
            });
        }
    };

    const handleRowSelection = (arrIds) => {
        const rowSelected = materialSODetailState.data.filter(function (item) {
            return item.MsoDetailId === arrIds[0];
        });

        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
        } else {
            setSelectedRow({ ...MaterialSODetailDto });
        }
    };

    const handleDelete = async (materialSODetail) => {
        if (
            window.confirm(
                intl.formatMessage({
                    id: showActivedData
                        ? "general.confirm_delete"
                        : "general.confirm_redo_deleted",
                })
            )
        ) {
            try {
                let res = await materialSOService.handleDeleteSODetail(materialSODetail);
                if (res) {
                    if (res && res.HttpResponseCode === 200) {
                        await fetchData();
                    } else {
                        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
                    }
                } else {
                    ErrorAlert(intl.formatMessage({ id: "general.system_error" }));
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const fetchData = async () => {

    }

    const columns = [
        { field: "MsoDetailId", headerName: "", hide: true },
        // { field: "MsoId", headerName: "", hide: true },
        // { field: "MaterialId", headerName: "", hide: true },

        {
            field: "id",
            headerName: "",
            width: 100,
            filterable: false,
            renderCell: (index) =>
                index.api.getRowIndex(index.row.MsoDetailId) +
                1 +
                (materialSODetailState.page - 1) * materialSODetailState.pageSize,
        },

        {
            field: "action",
            headerName: "",
            width: 80,
            // headerAlign: 'center',
            disableClickEventBubbling: true,
            sortable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                return (
                    <Grid
                        container
                        spacing={1}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Grid item xs={6}>
                            <IconButton
                                aria-label="edit"
                                color="warning"
                                size="small"
                                sx={[{ "&:hover": { border: "1px solid orange" } }]}
                                onClick={() => {
                                    toggleDialog(UPDATE_ACTION);
                                }}
                            >
                                <EditIcon fontSize="inherit" />
                            </IconButton>
                        </Grid>

                        <Grid item xs={6}>
                            <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                sx={[{ "&:hover": { border: "1px solid red" } }]}
                                onClick={() => handleDelete(params.row)}
                            >
                                {showActivedData ? (
                                    <DeleteIcon fontSize="inherit" />
                                ) : (
                                    <UndoIcon fontSize="inherit" />
                                )}
                            </IconButton>
                        </Grid>
                    </Grid>
                );
            },
        },

        {
            field: "MsoCode",
            headerName: intl.formatMessage({ id: "material-so-detail.MsoCode" }),
      /*flex: 0.7,*/ width: 150,
        },

        {
            field: "MaterialColorCode",
            headerName: intl.formatMessage({ id: "material-so-detail.MaterialColorCode" }),
      /*flex: 0.7,*/ width: 200,
        },

        {
            field: "MsoDetailStatus",
            headerName: intl.formatMessage({ id: "material-so-detail.MsoDetailStatus" }),
      /*flex: 0.7,*/ width: 120,
        },

        {
            field: "SOrderQty",
            headerName: intl.formatMessage({ id: "material-so-detail.SOrderQty" }),
      /*flex: 0.7,*/ width: 150,
        },

    ];

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
                        label="material-so-detail.MaterialColorCode"
                        name="MaterialColorCode"
                        onClick={fetchData}
                        onChange={(e) => changeSearchData(e, "MaterialColorCode")}
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

                        {/* <Grid item>
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
                        </Grid> */}
                    </Grid>
                </Grid>
            </Grid>

            <MuiDataGrid
                showLoading={materialSODetailState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                // rowHeight={30}
                // gridHeight={736}
                columns={columns}
                rows={materialSODetailState.data}
                page={materialSODetailState.page - 1}
                pageSize={materialSODetailState.pageSize}
                rowCount={materialSODetailState.totalRow}
                onPageChange={(newPage) => {
                    setMaterialSODetailState({ ...materialSODetailState, page: newPage + 1 });
                }}
                getRowId={(rows) => rows.MsoDetailId}
                onSelectionModelChange={(newSelectedRowId) =>
                    handleRowSelection(newSelectedRowId)
                }
                getRowClassName={(params) => {
                    if (_.isEqual(params.row, newData)) {
                        return `Mui-created`;
                    }
                }}
                initialState={{ pinnedColumns: { right: ['action'] } }}
            />
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

export default connect(mapStateToProps, mapDispatchToProps)(MaterialSODetail);