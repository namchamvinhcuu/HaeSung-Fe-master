import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { createTheme, ThemeProvider, TextField, Switch } from "@mui/material"
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls'
import { commonService } from '@services'
import _ from 'lodash'
import moment from "moment";
import CommonDetail from "./CommonDetail.js";
import { ErrorAlert, SuccessAlert } from '@utils'
import CreateCommonMasterDialog from './CreateCommonMasterDialog'
import ModifyCommonMasterDialog from './ModifyCommonMasterDialog'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import UndoIcon from '@mui/icons-material/Undo';
import { GetLocalStorage, SetLocalStorage, RemoveLocalStorage } from '@utils'
import * as ConfigConstants from '@constants/ConfigConstants';

const CommonMaster = () => {
    const intl = useIntl();
    const initCommonMasterModel = {
        commonMasterId: 0
        , commonMasterName: ''
        , forRoot: false
        , RoleArr: []

    }
    const [commomMasterState, setcommomMasterState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 10,
        searchData: {
            keyWord: '',
            showDelete: true
        }
    });

    const RoleUser = GetLocalStorage(ConfigConstants.CURRENT_USER);
    const setRoleArray = RoleUser.RoleNameList.replace(" ", "");
    const RoleArr = setRoleArray.split(',');

    const [role, setRole] = useState(false)

    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false)
    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)

    const changeSearchData = (e, inputName) => {
        let newSearchData = { ...commomMasterState.searchData };
        newSearchData[inputName] = e.target.value;

        setcommomMasterState({ ...commomMasterState, searchData: { ...newSearchData } })
    }

    const [selectedRow, setSelectedRow] = useState({
        ...initCommonMasterModel
    })

    const [newData, setNewData] = useState({ ...initCommonMasterModel })

    const toggleCreateCommonMSDialog = () => {

        setIsOpenCreateDialog(!isOpenCreateDialog);
    }

    const toggleModifyCommonMSDialog = () => {
        setIsOpenModifyDialog(!isOpenModifyDialog);
    }

    const handleRowSelection = (arrIds) => {

        const rowSelected = commomMasterState.data.filter(function (item) {
            return item.commonMasterId === arrIds[0]
        });

        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
        }
        else {
            setSelectedRow({ ...initCommonMasterModel });
        }
    }

    const [rowmaster, setRowmaster] = useState(null);

    const master_row_click = (row) => {
        setRowmaster(row);
        console.log(row,'row');
    }

    async function fetchData() {
        setcommomMasterState({
            ...commomMasterState
            , isLoading: true

        });
        const params = {
            page: commomMasterState.page,
            pageSize: commomMasterState.pageSize,
            keyword: commomMasterState.searchData.keyWord,
            showDelete: commomMasterState.searchData.showDelete
        }
        const res = await commonService.getCommonMasterList(params);

        setcommomMasterState({
            ...commomMasterState
            , data: [...res.Data]
            , totalRow: res.TotalRow
            , isLoading: false
        });
    }

    useEffect(() => {
        fetchData();

        RoleArr.includes('ROOT') ? setRole(false) : setRole(true);

    }, [commomMasterState.page, commomMasterState.pageSize, commomMasterState.searchData.showDelete]);

    useEffect(() => {
        if (!_.isEmpty(newData) && !_.isEqual(newData, initCommonMasterModel)) {
            const data = [newData, ...commomMasterState.data];
            if (data.length > commomMasterState.pageSize) {
                data.pop();
            }
            setcommomMasterState({
                ...commomMasterState
                , data: [...data]
                , totalRow: commomMasterState.totalRow + 1
            });
        }
    }, [newData]);

    useEffect(() => {
        if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, initCommonMasterModel)) {
            let newArr = [...commomMasterState.data]
            const index = _.findIndex(newArr, function (o) { return o.commonMasterId == selectedRow.commonMasterId; });
            if (index !== -1) {
                newArr[index] = selectedRow
            }

            setcommomMasterState({
                ...commomMasterState
                , data: [...newArr]
            });
        }
    }, [selectedRow]);

    const handleSearch = (e, inputName) => {
        let newSearchData = { ...commomMasterState.searchData };
        newSearchData[inputName] = e;
        if (inputName == 'showDelete') {
            setcommomMasterState({ ...commomMasterState, page: 1, searchData: { ...newSearchData } })
        }
        else {

            setcommomMasterState({ ...commomMasterState, searchData: { ...newSearchData } })
        }
    }

    const handleDeleteCommonMS = async (row) => {
        if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
            try {
                let res = await commonService.deleteCommonMater({ commonMasterId: row.commonMasterId, row_version: row.row_version });
                if (res && res.HttpResponseCode === 200) {
                    await fetchData();
                }
                else {
                    ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
                }
            } catch (error) {

            }
        }
    };

    const columns = [
        { field: 'commonMasterId', headerName: '', flex: 0.3, hide: true },
        {
            field: 'id', headerName: '', flex: 0.01,
            filterable: false,
            renderCell: (index) => (index.api.getRowIndex(index.row.commonMasterId) + 1) + (commomMasterState.page - 1) * commomMasterState.pageSize,
        },
        {
            field: "action",
            headerName: "",
            flex: 0.1,
            disableClickEventBubbling: true,
            sortable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                return (
                    <Grid container spacing={1} alignItems="center" justifyContent="center">
                        <Grid item xs={6}>
                            {params.row.isActived ?
                                <IconButton
                                    aria-label="edit"
                                    color="warning"
                                    size="small"
                                    sx={[{ '&:hover': { border: '1px solid orange', }, }]}
                                    onClick={toggleModifyCommonMSDialog}
                                >
                                    <EditIcon fontSize="inherit" />
                                </IconButton>
                                : ""
                            }
                        </Grid>
                        <Grid item xs={6}>
                            <IconButton
                                color="error"
                                size="small"
                                sx={[{ '&:hover': { border: '1px solid red', }, }]}
                                onClick={() => handleDeleteCommonMS(params.row)}
                            >
                                {params.row.isActived ? <DeleteIcon fontSize="inherit" /> :
                                    <UndoIcon fontSize="inherit" />}
                            </IconButton>
                        </Grid>
                    </Grid>
                );
            },
        },
        { field: 'commonMasterName', headerName: 'Common Master Name', flex: 0.3, },
        { field: 'isActived', headerName: 'isActived', flex: 0.3, hide: true },
        { field: 'forRoot', headerName: 'For Root', flex: 0.3, hide: role },
        {
            field: 'createdDate', headerName: 'Created Date', flex: 0.3,
            valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        { field: 'createdBy', headerName: 'createdBy', flex: 0.3, hide: true },
        {
            field: 'modifiedDate', headerName: 'Modified Date', flex: 0.3,
            valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },

        { field: 'modifiedBy', headerName: 'modifiedBy', flex: 0.3, hide: true },
        { field: 'row_version', headerName: 'row_version', flex: 0.3, hide: true },
    ];

    return (
        <React.Fragment>
            <Grid container direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 1, pr: 1 }}>
                <Grid item xs={6}>
                    <MuiButton
                        text="create"
                        color='success'
                        onClick={toggleCreateCommonMSDialog}
                    />
                </Grid>
                <Grid item >
                    <TextField
                        sx={{ width: 200 }}
                        fullWidth
                        variant="standard"
                        size='small'
                        label={intl.formatMessage({ id: 'general.name' })}
                        onChange={(e) => handleSearch(e.target.value, 'keyWord')}
                    />
                </Grid>
                <Grid item>
                    <MuiButton text="search" color='info' onClick={fetchData} sx={{ m: 0 }} />
                </Grid>
                <Grid item>
                    <FormControlLabel
                        sx={{ mb: 0 }}
                        control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleSearch(e.target.checked, 'showDelete')} />}
                        label={commomMasterState.searchData.showDelete ? "Active Data" : "Delete Data"} />
                </Grid>
            </Grid>
            <MuiDataGrid
                showLoading={commomMasterState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                gridHeight={345}
                columns={columns}
                rows={commomMasterState.data}
                page={commomMasterState.page - 1}
                pageSize={commomMasterState.pageSize}
                rowCount={commomMasterState.totalRow}

                // onRowClick={(params, event) => {
                //     master_row_click && master_row_click(params.row);
                // }}
                // rowsPerPageOptions={[5, 10, 20, 30]}

                onPageChange={(newPage) => setcommomMasterState({ ...commomMasterState, page: newPage + 1 })}
                // onPageSizeChange={(newPageSize) => setcommomMasterState({ ...commomMasterState, pageSize: newPageSize, page: 1 })}

                getRowId={(rows) => rows.commonMasterId}
                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}
                getRowClassName={(params) => {
                    if (_.isEqual(params.row, newData)) {
                        return `Mui-created`
                    }
                }}
            />

            <CreateCommonMasterDialog
                initModal={initCommonMasterModel}
                setNewData={setNewData}
                isOpen={isOpenCreateDialog}
                onClose={toggleCreateCommonMSDialog}
            />

            <ModifyCommonMasterDialog
                initModal={selectedRow}
                setModifyData={setSelectedRow}
                isOpen={isOpenModifyDialog}
                onClose={toggleModifyCommonMSDialog}
            />
            <Grid item sm={6} sx={{ margin: 1, background: "#fff" }}>
                {selectedRow && <CommonDetail rowmaster={selectedRow} />}
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
export default connect(mapStateToProps, mapDispatchToProps)(CommonMaster)
