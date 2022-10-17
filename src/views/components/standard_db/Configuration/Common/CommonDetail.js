import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { createTheme, ThemeProvider } from "@mui/material"
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid } from '@controls'
import { commonService } from '@services'
import _ from 'lodash'
import moment from "moment";
import CreateCommonDetailDialog from './CreateCommonDetailDialog'
import ModifyCommonDetailDialog from './ModifyCommonDetailDialog'

const CommonDetail = ({ rowmaster }) => {
    let isCancelled = false;
    const intl = useIntl();
    const initCommonDetailModel = {
        CommonDetailId: 0,
        commonMasterId: rowmaster.commonMasterId,
        commonDetailName: ''
    };


    const [menuState, setMenuState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 10,
    });

    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false);
    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false);

    const [selectedRow, setSelectedRow] = useState({
        ...initCommonDetailModel

    });

    const [newData, setNewData] = useState({
        ...initCommonDetailModel

    });

    const toggleCreateCommonDetailDialog = () => {
        setIsOpenCreateDialog(!isOpenCreateDialog);
    };

    const toggleModifyCommonDetailDialog = () => {
        setIsOpenModifyDialog(!isOpenModifyDialog);
    };

    const handleRowSelection = (arrIds) => {

        const rowSelected = menuState.data.filter(function (item) {
            return item.commonDetailId === arrIds[0]
        });
        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
        }
        else {
            setSelectedRow({ ...initCommonDetailModel });
        }
    };

    async function fetchData() {
        setMenuState({
            ...menuState
            , isLoading: true

        });
        const params = {

            commonMasterId: rowmaster.commonMasterId,
            page: menuState.page,
            pageSize: menuState.pageSize

        }

        const res = await commonService.getCommonDetailList(params);

        setMenuState({
            ...menuState
            , data: res && res.Data ? [...res.Data] : []
            , totalRow: res ? res.TotalRow : 0
            , isLoading: false
        });
    };

    useEffect(() => {

        // if (!isCancelled)
        fetchData();

        return () => {
            isCancelled = true
        }
    }, [rowmaster.commonMasterId, menuState.page, menuState.pageSize, rowmaster]);

    useEffect(() => {
        if (!_.isEmpty(newData) && !_.isEqual(newData, initCommonDetailModel)) {
            const data = [newData, ...menuState.data]
            if (data.length > menuState.pageSize) {
                data.pop();
            }
            setMenuState({
                ...menuState
                , data: [...data]
                , totalRow: menuState.totalRow + 1
            });
        }

    }, [newData]);

    useEffect(() => {
        let newArr = [];
        if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, initCommonDetailModel)) {
            newArr = [...menuState.data]
            const index = _.findIndex(newArr, function (o) { return o.commonDetailId == selectedRow.commonDetailId; });
            if (index !== -1) {
                newArr[index] = selectedRow
            }
            setMenuState({
                ...menuState
                , data: [...newArr]
            });
        }

    }, [selectedRow]
    );

    const handleDeleteCommonMS = async (menu) => {
        if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
            try {
                let res = await commonService.deleteCommonDetail(menu);
                if (res && res.HttpResponseCode === 200) {
                    await fetchData();
                }
            } catch (error) {

            }
        }
    };


    const columns = [
        { field: 'commonDetailId', headerName: '', flex: 0.1, hide: true },
        {
            field: 'id', headerName: '', flex: 0.1,
            filterable: false,
            renderCell: (index) => (index.api.getRowIndex(index.row.commonDetailId) + 1) + (menuState.page - 1) * menuState.pageSize,
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
                                onClick={toggleModifyCommonDetailDialog}
                            >
                                <EditIcon fontSize="inherit" />
                            </IconButton>

                        </Grid>
                        <Grid item xs={6}>
                            <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                sx={[{ '&:hover': { border: '1px solid red', }, }]}
                                onClick={() => handleDeleteCommonMS(params.row)}
                            >
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        </Grid>
                    </Grid>
                );
            },
        },
        { field: 'commonDetailName', headerName: 'Common Detail Name', flex: 0.3, },
        { field: 'isActived', headerName: 'isActived', flex: 0.3, hide: true },

        {
            field: 'createdDate', headerName: 'Created Date', flex: 0.3, valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        { field: 'createdBy', headerName: 'createdBy', flex: 0.3, hide: true },
        {
            field: 'modifiedDate', headerName: 'Modified Date', flex: 0.3, valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        { field: 'modifiedBy', headerName: 'modifiedBy', flex: 0.3, hide: true },
    ];


    return (
        <React.Fragment>
            <Grid container>
                <MuiButton
                    text="create"
                    color='success'
                    onClick={toggleCreateCommonDetailDialog}
                />
            </Grid>
            {menuState?.data &&
                <MuiDataGrid
                    // getData={commonService.getCommonDetailList}
                    showLoading={menuState.isLoading}
                    isPagingServer={true}
                    headerHeight={45}

                    gridHeight={345}
                    columns={columns}
                    rows={menuState.data}
                    page={menuState.page - 1}
                    pageSize={menuState.pageSize}
                    rowCount={menuState.totalRow}
                    rowsPerPageOptions={[5, 10, 20, 30]}

                    onPageChange={(newPage) => setMenuState({ ...menuState, page: newPage + 1 })}
                    onPageSizeChange={(newPageSize) => setMenuState({ ...menuState, pageSize: newPageSize, page: 1 })}

                    getRowId={(rows) => rows.commonDetailId}
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


            <CreateCommonDetailDialog
                initModal={initCommonDetailModel}
                setNewData={setNewData}
                isOpen={isOpenCreateDialog}
                onClose={toggleCreateCommonDetailDialog}
            />

            <ModifyCommonDetailDialog
                initModal={selectedRow}
                setModifyData={setSelectedRow}
                isOpen={isOpenModifyDialog}
                onClose={toggleModifyCommonDetailDialog}

            />


        </React.Fragment>
    )
}

export default CommonDetail

