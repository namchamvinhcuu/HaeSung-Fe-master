import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { createTheme, ThemeProvider, TextField } from "@mui/material"
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
const myTheme = createTheme({
    components: {
        //@ts-ignore - this isn't in the TS because DataGird is not exported from `@mui/material`
        MuiDataGrid: {
            styleOverrides: {
                row: {
                    "&.Mui-created": {
                        backgroundColor: "#A0DB8E",
                        //   "&:hover": {
                        //     backgroundColor: "#98958F"
                        //   }
                    }
                }
            }
        }
    }
});

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
        pageSize: 8,
        searchData: {
            keyWord: ''
        }
    });

    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false)
    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)
    const [showdataHidden, setshowdataHidden] = useState(false)



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
    }
    async function fetchData() {
        setcommomMasterState({
            ...commomMasterState
            , isLoading: true

        });
        const params = {
            page: commomMasterState.page,
            pageSize: commomMasterState.pageSize,
            keyword: commomMasterState.searchData.keyWord
        }
        const res = await commonService.getCommonMasterList(params);

        setcommomMasterState({
            ...commomMasterState
            , data: [...res.Data]
            , totalRow: res.TotalRow
            , isLoading: false
        });
    }
    async function fetchDataDeleted() {
        setcommomMasterState({
            ...commomMasterState
            , isLoading: true

        });
        const params = {
            page: commomMasterState.page,
            pageSize: commomMasterState.pageSize,
            keyword: commomMasterState.searchData.keyWord

        }
        const res = await commonService.getCommonMasterListDeleted(params);

        setcommomMasterState({
            ...commomMasterState
            , data: [...res.Data]
            , totalRow: res.TotalRow
            , isLoading: false
        });
    }

    useEffect(() => {

        if (showdataHidden) {
            fetchDataDeleted();
        }
        else {
            fetchData();
        }
    }, [commomMasterState.page, commomMasterState.pageSize]);

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

    const handleDeleteCommonMS = async (menu) => {
        if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
            try {
                let res = await commonService.deleteCommonMater(menu);
                if (res && res.HttpResponseCode === 200) {
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
    const handleRedoDeleteCommonMS = async (id) => {
        if (window.confirm(intl.formatMessage({ id: 'general.confirm_redo_deleted' }))) {
            try {
                let res = await commonService.deleteCommonMaterRedoDeleted(id);
                if (res && res.HttpResponseCode === 200) {
                    await fetchDataDeleted();
                }
               
            } catch (error) {
                console.log(error)
            }
        }
    }
    const handleChangeClick = async (event) => {
        setshowdataHidden(event.target.checked);
        if (showdataHidden) {
            fetchData();
        }
        else {
            fetchDataDeleted();
        }

    };

    const columns = [
        { field: 'commonMasterId', headerName: '', flex: 0.01, hide: true },
        {
            field: 'id', headerName: '', flex: 0.01,
            filterable: false,
            renderCell: (index) => index.api.getRowIndex(index.row.commonMasterId) + 1,
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
                            <IconButton
                                aria-label="edit"
                                color="warning"
                                size="small"
                                sx={[{ '&:hover': { border: '1px solid orange', }, }]}
                                onClick={toggleModifyCommonMSDialog}
                            >
                                <EditIcon fontSize="inherit" />
                            </IconButton>

                        </Grid>
                        <Grid item xs={6}>
                            {showdataHidden ?

                                <IconButton
                                    color="error"
                                    size="small"
                                    sx={[{ '&:hover': { border: '1px solid red', }, }]}
                                    onClick={() => handleRedoDeleteCommonMS(params.row)}
                                >
                                    <UndoIcon fontSize="inherit" />
                                </IconButton> :
                                <IconButton
                                    aria-label="delete"
                                    color="error"
                                    size="small"
                                    sx={[{ '&:hover': { border: '1px solid red', }, }]}
                                    onClick={() => handleDeleteCommonMS(params.row)}
                                >
                                    <DeleteIcon fontSize="inherit" />
                                </IconButton>

                            }

                        </Grid>
                    </Grid>
                );
            },
        },


        { field: 'commonMasterName', headerName: 'Common Master Name', flex: 0.3 },
        { field: 'isActived', headerName: 'isActived', flex: 0.3, hide: true },


        {
            field: 'createdDate', headerName: 'created Date', flex: 0.3,
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

        <Box
            sx={{
                pb: 5,
                height: 300,
                width: "100%",
            }}
        >
            <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="flex-end"

            >

                <Grid item xs={6}>
                    <MuiButton
                        text="create"
                        color='success'
                        onClick={toggleCreateCommonMSDialog}
                    />
                </Grid>
                <Grid item xs={2}>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox />}
                            label="Show data deleted"
                            onChange={handleChangeClick}
                        />
                    </FormGroup>
                </Grid>
                <Grid item xs={4}>
                    <MuiSearchField
                        label='general.name'
                        name='keyWord'
                        onClick={showdataHidden ? fetchDataDeleted : fetchData}
                        onChange={(e) => changeSearchData(e, 'keyWord')}
                    />
                </Grid>

            </Grid>
            {commomMasterState.data &&
                <MuiDataGrid
                    getData={commonService.getCommonMasterList}
                    showLoading={commomMasterState.isLoading}
                    isPagingServer={true}
                    headerHeight={45}

                    columns={columns}
                    rows={commomMasterState.data}
                    page={commomMasterState.page - 1}
                    pageSize={commomMasterState.pageSize}
                    rowCount={commomMasterState.totalRow}
                    onRowClick={(params, event) => {
                        master_row_click && master_row_click(params.row);
                    }}
                    rowsPerPageOptions={[8,20, 100, 200, 1000]}
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

            {isOpenCreateDialog && <CreateCommonMasterDialog
                initModal={initCommonMasterModel}
                setNewData={setNewData}
                isOpen={isOpenCreateDialog}
                onClose={toggleCreateCommonMSDialog}
            />}
            {isOpenModifyDialog && <ModifyCommonMasterDialog
                initModal={selectedRow}
                setModifyData={setSelectedRow}
                isOpen={isOpenModifyDialog}
                onClose={toggleModifyCommonMSDialog}
            />}

            <Grid item sm={6} sx={{ margin: 1, background: "#fff" }}>
                {rowmaster && <CommonDetail rowmaster={rowmaster} />}
            </Grid>

        </Box>


    )
}

export default CommonMaster
