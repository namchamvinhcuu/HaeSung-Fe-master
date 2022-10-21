import { Store } from '@appstate'
import { User_Operations } from '@appstate/user'
import { MuiButton, MuiDataGrid, MuiSearchField, MuiSelectField } from '@controls'
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

import CreateDialog from './CreateDialog'
import ModifyDialog from './ModifyDialog'
import { qcMasterService } from '@services'
import { QCMasterDto } from "@models"
import QCDetail from "./QCDetail.js";

const QCMaster = (props) => {
    const intl = useIntl();

    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)
    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false)

    const [qCMasterState, setqCMasterState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 7,
        searchData: {
            QCMasterCode: null,
            Description: null,
            MaterialId: 0,
            QCType: 0,
            showDelete: true
        }
    });

    const [materialArr, setmaterialArr] = useState([]);
    const [qcArr, setqcArr] = useState([]);
    const [qcType, setqcType] = useState([""]);


    const [selectedRow, setSelectedRow] = useState({
        ...QCMasterDto
    })

    const [newData, setNewData] = useState({ ...QCMasterDto })

    const toggleCreateDialog = () => {

        setIsOpenCreateDialog(!isOpenCreateDialog);
    }
    const toggleModifyDialog = () => {
        setIsOpenModifyDialog(!isOpenModifyDialog);
    }

    useEffect(() => {
        getQC();
    }, [])

    useEffect(() => {
        fetchData();

    }, [qCMasterState.page, qCMasterState.pageSize, qCMasterState.searchData.showDelete]);


    useEffect(() => {
        if (!_.isEmpty(newData) && !_.isEqual(newData, QCMasterDto)) {
            const data = [newData, ...qCMasterState.data];
            if (data.length > qCMasterState.pageSize) {
                data.pop();
            }
            setqCMasterState({
                ...qCMasterState
                , data: [...data]
                , totalRow: qCMasterState.totalRow + 1
            });
        }
    }, [newData]);

    useEffect(() => {
        if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, QCMasterDto)) {
            let newArr = [...qCMasterState.data]
            const index = _.findIndex(newArr, function (o) { return o.QCMasterId == selectedRow.QCMasterId; });
            if (index !== -1) {
                newArr[index] = selectedRow
            }

            setqCMasterState({
                ...qCMasterState
                , data: [...newArr]
            });
        }
    }, [selectedRow]);

    async function fetchData() {
        setqCMasterState({ ...qCMasterState, isLoading: true });
        const params = {
            page: qCMasterState.page,
            pageSize: qCMasterState.pageSize,
            QCMasterCode: qCMasterState.searchData.QCMasterCode,
            MaterialId: qCMasterState.searchData.MaterialId,
            QCType: qCMasterState.searchData.QCType,
            Description: qCMasterState.searchData.Description,
            showDelete: qCMasterState.searchData.showDelete
        }
        const res = await qcMasterService.getQcMasterList(params);

        setqCMasterState({
            ...qCMasterState
            , data: [...res.Data]
            , totalRow: res.TotalRow
            , isLoading: false
        });
    }
    const handleRowSelection = (arrIds) => {

        const rowSelected = qCMasterState.data.filter(function (item) {
            return item.QCMasterId === arrIds[0]
        });
        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
        }
        else {
            setSelectedRow({ ...QCMasterDto });
        }
    }
    const handleSearch = (e, inputName) => {
        let newSearchData = { ...qCMasterState.searchData };
        newSearchData[inputName] = e;
        if (inputName == 'showDelete') {
            //  console.log(qCMasterState, inputName)
            setqCMasterState({ ...qCMasterState, page: 1, searchData: { ...newSearchData } })
        }
        else {

            setqCMasterState({ ...qCMasterState, searchData: { ...newSearchData } })
        }
    }
    const handleDelete = async (row) => {
        let message = qCMasterState.searchData.showDelete ? intl.formatMessage({ id: 'general.confirm_delete' }) : intl.formatMessage({ id: 'general.confirm_redo_deleted' })
        if (window.confirm(message)) {
            try {
                let res = await qcMasterService.deleteQCMaster({ QCMasterId: row.QCMasterId, row_version: row.row_version });
                if (res && res.HttpResponseCode === 200) {

                    SuccessAlert(intl.formatMessage({ id: 'general.success' }))
                    await fetchData();
                }
                if (res && res.HttpResponseCode === 300) {
                    ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
                    return;
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    useEffect(() => {
        getMaterial(qcType);
    }, [qcType])


    const getMaterial = async (qcType) => {

        const res = await qcMasterService.getMaterialForSelect({ qcType: qcType });
        if (res.HttpResponseCode === 200 && res.Data) {
            setmaterialArr([...res.Data])

        }
        else {
            setmaterialArr([])
        }
    }
    const getQC = async () => {
        const res = await qcMasterService.getQCTypeForSelect();
        if (res.HttpResponseCode === 200 && res.Data) {
            setqcArr([...res.Data])

        }
        else {
            setqcArr([])
        }
    }
    const columns = [
        { field: 'QCMasterId', headerName: '', flex: 0.3, hide: true },
        { field: 'QCType', headerName: "QCType", flex: 0.3, hide: true },
        { field: 'MaterialId', headerName: "MaterialId", flex: 0.3, hide: true },
        {
            field: 'id', headerName: '', flex: 0.1,
            filterable: false,
            renderCell: (index) => index.api.getRowIndex(index.row.QCMasterId) + 1 + (qCMasterState.page - 1) * qCMasterState.pageSize,
        },
        {
            field: "action",
            headerName: "",
            flex: 0.2,
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
        { field: 'QCMasterCode', headerName: intl.formatMessage({ id: "qcMaster.QCMasterCode" }), flex: 0.4 },
        { field: 'QCTypeName', headerName: intl.formatMessage({ id: "qcMaster.qcType" }), flex: 0.3 },
        { field: 'MaterialTypeName', headerName: intl.formatMessage({ id: "qcMaster.MaterialTypeName" }), flex: 0.3 },
        { field: 'MaterialCode', headerName: intl.formatMessage({ id: "material.MaterialCode" }), flex: 0.3 },
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
                <Grid item xs={3}>
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
                        label={intl.formatMessage({ id: 'qcMaster.QCMasterCode' })}
                        onChange={(e) => handleSearch(e.target.value, 'QCMasterCode')}
                    />
                </Grid>
                <Grid item>
                    <MuiSelectField
                        label={intl.formatMessage({ id: 'qcMaster.qcType' })}
                        options={qcArr}
                        displayLabel="commonDetailName"
                        displayValue="commonDetailId"
                        sx={{ width: 210 }}
                        variant="standard"
                        onChange={(e, item) => {
                            handleSearch(item ? item.commonDetailId ?? null : null, 'QCType');
                            setqcType(item?.commonDetailName || "");
                        }}
                    />
                </Grid>
                <Grid item>
                    <MuiSelectField

                        label={intl.formatMessage({ id: 'material.MaterialCode' })}
                        options={materialArr}
                        displayLabel="MaterialCode"
                        displayValue="MaterialId"
                        displayGroup="GroupMaterial"
                        sx={{ width: 210 }}
                        variant="standard"
                        onChange={(e, item) => handleSearch(item ? item.MaterialId ?? null : null, 'MaterialId')}
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
                        label={qCMasterState.searchData.showDelete ? "Active Data" : "Delete Data"} />
                </Grid>
            </Grid>
            <MuiDataGrid
                showLoading={qCMasterState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                columns={columns}
                gridHeight={736}
                rows={qCMasterState.data}
                page={qCMasterState.page - 1}
                pageSize={qCMasterState.pageSize}
                rowCount={qCMasterState.totalRow}

                rowsPerPageOptions={[5, 10, 20]}
                onPageChange={(newPage) => setqCMasterState({ ...qCMasterState, page: newPage + 1 })}
                onPageSizeChange={(newPageSize) => setqCMasterState({ ...qCMasterState, pageSize: newPageSize, page: 1 })}

                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}
                getRowId={(rows) => rows.QCMasterId}
                getRowClassName={(params) => {
                    if (_.isEqual(params.row, newData)) {
                        return `Mui-created`
                    }
                }}
            // onRowClick={(rowData) => master_row_click(rowData.row.QCMasterId)}
            />
            <CreateDialog
                initModal={QCMasterDto}
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
            {selectedRow && <QCDetail QCMasterId={selectedRow.QCMasterId} />}
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

export default connect(mapStateToProps, mapDispatchToProps)(QCMaster);