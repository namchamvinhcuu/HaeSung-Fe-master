import { Store } from '@appstate'
import { User_Operations } from '@appstate/user'
import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo'
import { Autocomplete, createTheme, ThemeProvider, TextField, Switch, Tooltip, Typography } from "@mui/material"
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS'
import _ from 'lodash'
import moment from "moment"
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import FormControlLabel from '@mui/material/FormControlLabel';
import { ErrorAlert, SuccessAlert } from '@utils'

import CreateDialog from './CreateStandardQCDialog'
import ModifyDialog from './ModifyStandardQCDialog'
import { standardQCService } from '@services'
import { StandardQCDto } from "@models"

const StandardQC = (props) => {
    const intl = useIntl();

    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)
    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false)

    const [standardQCState, setstandardQCState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 20,
        searchData: {
            QCCode: null,
            Description: null,
            showDelete: true
        }
    });

    const [selectedRow, setSelectedRow] = useState({
        ...StandardQCDto
    })

    const [newData, setNewData] = useState({ ...StandardQCDto })

    const toggleCreateDialog = () => {

        setIsOpenCreateDialog(!isOpenCreateDialog);
    }
    const toggleModifyDialog = () => {
        setIsOpenModifyDialog(!isOpenModifyDialog);
    }
    useEffect(() => {
        fetchData();
    }, [standardQCState.page, standardQCState.pageSize, standardQCState.searchData.showDelete]);


    useEffect(() => {
        if (!_.isEmpty(newData) && !_.isEqual(newData, StandardQCDto)) {
            const data = [newData, ...standardQCState.data];
            if (data.length > standardQCState.pageSize) {
                data.pop();
            }
            setstandardQCState({
                ...standardQCState
                , data: [...data]
                , totalRow: standardQCState.totalRow + 1
            });
        }
    }, [newData]);

    useEffect(() => {
        if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, StandardQCDto)) {
            let newArr = [...standardQCState.data]
            const index = _.findIndex(newArr, function (o) { return o.QCId == selectedRow.QCId; });
            if (index !== -1) {
                newArr[index] = selectedRow
            }

            setstandardQCState({
                ...standardQCState
                , data: [...newArr]
            });
        }
    }, [selectedRow]);

    async function fetchData() {
        setstandardQCState({ ...standardQCState, isLoading: true });
        const params = {
            page: standardQCState.page,
            pageSize: standardQCState.pageSize,
            QCCode: standardQCState.searchData.QCCode,
            Description: standardQCState.searchData.Description,
            showDelete: standardQCState.searchData.showDelete
        }
        const res = await standardQCService.getStandardQCList(params);

        setstandardQCState({
            ...standardQCState
            , data: [...res.Data]
            , totalRow: res.TotalRow
            , isLoading: false
        });
    }
    const handleRowSelection = (arrIds) => {

        const rowSelected = standardQCState.data.filter(function (item) {
            return item.QCId === arrIds[0]
        });
        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
        }
        else {
            setSelectedRow({ ...StandardQCDto });
        }
    }
    const handleSearch = (e, inputName) => {
        console.log('a', inputName)
        let newSearchData = { ...standardQCState.searchData };
        newSearchData[inputName] = e;
        if (inputName == 'showDelete') {
            //  console.log(standardQCState, inputName)
            setstandardQCState({ ...standardQCState, page: 1, searchData: { ...newSearchData } })
        }
        else {

            setstandardQCState({ ...standardQCState, searchData: { ...newSearchData } })
        }
    }
    const handleDelete = async (row) => {
        let message = standardQCState.searchData.showDelete ? intl.formatMessage({ id: 'general.confirm_delete' }) : intl.formatMessage({ id: 'general.confirm_redo_deleted' })
        if (window.confirm(message)) {
            try {
                let res = await standardQCService.deleteStandardQC({ QCId: row.QCId, row_version: row.row_version });
                if (res && res.HttpResponseCode === 200) {

                    SuccessAlert(intl.formatMessage({ id: 'general.success' }))
                    await fetchData();
                }

            } catch (error) {
                console.log(error)
            }
        }
    }
    const columns = [
        { field: 'QCId', headerName: '', flex: 0.3, hide: true },
        {
            field: 'id', headerName: '', flex: 0.01,
            filterable: false,
            renderCell: (index) => index.api.getRowIndex(index.row.QCId) + 1 + (standardQCState.page - 1) * standardQCState.pageSize,
        },
        {
            field: "action",
            headerName: "",
            width: 100,
            // headerAlign: 'center',
            disableClickEventBubbling: true,
            sortable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                return (
                    <Grid container spacing={1} alignItems="center" justifyContent="center">
                        <Grid item xs={6}>
                            <IconButton
                                aria-label="edit"
                                color="warning"
                                size="small"
                                sx={[{ '&:hover': { border: '1px solid orange', }, }]}
                                onClick={toggleModifyDialog}
                            >
                                {params.row.isActived ? <EditIcon fontSize="inherit" /> : ""}
                            </IconButton>
                        </Grid>
                        <Grid item xs={6}>
                            <IconButton
                                color="error"
                                size="small"
                                sx={[{ '&:hover': { border: '1px solid red', }, }]}
                                onClick={() => handleDelete(params.row)}
                            >
                                {params.row.isActived ? <DeleteIcon fontSize="inherit" /> :
                                    <UndoIcon fontSize="inherit" />}
                            </IconButton>
                        </Grid>
                    </Grid>
                );
            },
        },
        { field: 'QCCode', headerName: intl.formatMessage({ id: "standardQC.QCCode" }), flex: 0.3 },
        {
            field: 'Description', headerName: intl.formatMessage({ id: "general.description" }), flex: 0.3, renderCell: (params) => {
                return (
                    <Tooltip title={params.row.Description} className="col-text-elip">
                        <Typography sx={{ fontSize: 14, maxWidth: 200 }}>{params.row.Description}</Typography>
                    </Tooltip>
                )
            }
        },
        { field: 'isActived', headerName: 'isActived', flex: 0.3, hide: true },
        { field: 'createdName', headerName: intl.formatMessage({ id: "general.createdName" }), flex: 0.3 },
        {
            field: 'createdDate', headerName: 'Created Date', flex: 0.3,
            valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        { field: 'modifiedName', headerName: intl.formatMessage({ id: "general.modifiedName" }), flex: 0.3 },
        {
            field: 'modifiedDate', headerName: intl.formatMessage({ id: "general.modifiedDate" }), flex: 0.3,
            valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
    ];
    return (
        <React.Fragment>
            <Grid container direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 1, pr: 1 }}>
                <Grid item xs={6}>
                    <MuiButton
                        text="create"
                        color='success'
                        onClick={toggleCreateDialog}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        sx={{ width: 200 }}
                        fullWidth
                        variant="standard"
                        size='small'
                        label={intl.formatMessage({ id: 'standardQC.QCCode' })}
                        onChange={(e) => handleSearch(e.target.value, 'QCCode')}
                    />
                </Grid>
                <Grid item >
                    <TextField
                        sx={{ width: 200 }}
                        fullWidth
                        variant="standard"
                        size='small'
                        label={intl.formatMessage({ id: 'general.description' })}
                        onChange={(e) => handleSearch(e.target.value, 'Description')}
                    />
                </Grid>

                <Grid item>
                    <MuiButton text="search" color='info' onClick={fetchData} sx={{ m: 0 }} />
                </Grid>
                <Grid item>
                    <FormControlLabel
                        sx={{ mb: 0 }}
                        control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleSearch(e.target.checked, 'showDelete')} />}
                        label={standardQCState.searchData.showDelete ? "Active Data" : "Delete Data"} />
                </Grid>
            </Grid>
            <MuiDataGrid
                showLoading={standardQCState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                columns={columns}
                gridHeight={736}
                rows={standardQCState.data}
                page={standardQCState.page - 1}
                pageSize={standardQCState.pageSize}
                rowCount={standardQCState.totalRow}

                rowsPerPageOptions={[5, 10, 20]}
                onPageChange={(newPage) => setstandardQCState({ ...standardQCState, page: newPage + 1 })}
                onPageSizeChange={(newPageSize) => setstandardQCState({ ...standardQCState, pageSize: newPageSize, page: 1 })}

                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}
                getRowId={(rows) => rows.QCId}
                getRowClassName={(params) => {
                    if (_.isEqual(params.row, newData)) {
                        return `Mui-created`
                    }
                }}
            />
            <CreateDialog
                initModal={StandardQCDto}
                setNewData={setNewData}
                isOpen={isOpenCreateDialog}
                onClose={toggleCreateDialog}
            />
            <ModifyDialog
                initModal={selectedRow}
                setModifyData={setSelectedRow}
                isOpen={isOpenModifyDialog}
                onClose={toggleModifyDialog}
            />
        </React.Fragment >
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

export default connect(mapStateToProps, mapDispatchToProps)(StandardQC);