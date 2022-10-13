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
import Checkbox from '@mui/material/Checkbox';
import Box from "@mui/material/Box";
import UndoIcon from '@mui/icons-material/Undo';
const CommonMaster = () => {
    const intl = useIntl();
    const initCommonMasterModel = {
        commonMasterId: 0
        , commonMasterName: ''
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

        // console.log(row, 'row');
        setRowmaster(row);

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
    }, [commomMasterState.page, commomMasterState.pageSize, commomMasterState.searchData.showDelete]);

    useEffect(() => {
        if (!_.isEmpty(newData)) {
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
        console.log(commomMasterState.data)
    }, [commomMasterState.data]);

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
        console.log('a', inputName)
        let newSearchData = { ...commomMasterState.searchData };
        newSearchData[inputName] = e;
        if (inputName == 'showDelete') {
            //  console.log(commomMasterState, inputName)
            setcommomMasterState({ ...commomMasterState, page: 1, searchData: { ...newSearchData } })
        }
        else {

            setcommomMasterState({ ...commomMasterState, searchData: { ...newSearchData } })
        }
    }

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
            // headerAlign: 'center',
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
                                onClick={() => handleRedoDeleteCommonMS(params.row)}
                            >
                                {params.row.isActived ? <DeleteIcon fontSize="inherit" /> :
                                    <UndoIcon fontSize="inherit" />}
                            </IconButton>
                        </Grid>
                    </Grid>
                );
            },
        },
        { field: 'commonMasterName', headerName: 'Common Master Name', flex: 0.3 },
        { field: 'isActived', headerName: 'isActived', flex: 0.3, hide: true },
        { field: 'forRoot', headerName: 'forRoot', flex: 0.3 },


        {
            field: 'createdDate', headerName: 'Created Date', flex: 0.3,
            valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        { field: 'createdBy', headerName: 'createdBy', flex: 0.3, hide: true },
        {
            field: 'modifiedDate', headerName: 'Modified Date', flex: 0.3,
            valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },

        { field: 'modifiedBy', headerName: 'modifiedBy', flex: 0.3, hide: true },
    ];

    return (
        <React.Fragment>
            <Grid container direction="row" justifyContent="space-between" alignItems="flex-end" >
                <Grid item xs={6}>
                    <MuiButton
                        text="create"
                        color='success'
                        onClick={toggleCreateCommonMSDialog}
                    />
                </Grid>

                <Grid item xs={4}>
                    <MuiSearchField
                        label='general.name'
                        name='keyWord'
                        onClick={fetchData}
                        onChange={(e) => changeSearchData(e, 'keyWord')}
                    />
                </Grid>
                <Grid item>
                    <FormControlLabel
                        sx={{ mb: 0 }}
                        control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleSearch(e.target.checked, 'showDelete')} />}
                        label={commomMasterState.searchData.showDelete ? "Active Data" : "Delete Data"} />
                </Grid>
            </Grid>
            {commomMasterState.data &&
                <MuiDataGrid
                    getData={commonService.getCommonMasterList}
                    showLoading={commomMasterState.isLoading}
                    isPagingServer={true}
                    headerHeight={45}
                    gridHeight={345}
                    columns={columns}
                    rows={commomMasterState.data}
                    page={commomMasterState.page - 1}
                    pageSize={commomMasterState.pageSize}
                    rowCount={commomMasterState.totalRow}
                    onRowClick={(params, event) => {
                        master_row_click && master_row_click(params.row);
                    }}
                    rowsPerPageOptions={[5, 10, 20, 30]}
                    onPageChange={(newPage) => {
                        setcommomMasterState({ ...commomMasterState, page: newPage + 1 });
                    }}
                    onPageSizeChange={(newPageSize) => {
                        setcommomMasterState({ ...commomMasterState, pageSize: newPageSize, page: 1 });
                    }}
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
            }

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
                {rowmaster && <CommonDetail rowmaster={rowmaster} />}
            </Grid>
        </React.Fragment>
    )
}

export default CommonMaster
