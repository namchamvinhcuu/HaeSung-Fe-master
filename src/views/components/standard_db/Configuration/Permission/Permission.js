import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { createTheme, ThemeProvider, TextField } from "@mui/material"
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls'
import { permissionService } from '@services'
import _ from 'lodash'

import CreatePermissionDialog from './CreatePermissionDialog'
import ModifyPermissionDialog from './ModifyPermissionDialog'

const Permission = () => {
    const intl = useIntl();
    let isRendered = useRef(true);
    const initPermissionModel = {
        permissionId: 0
        , permissionName: ''
        , commonDetailId: ''
        , commonDetailName: ''
        , forRoot: false
    }
    const [menuState, setMenuState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 20,
        searchData: {
            keyWord: null
        }

    });

    const [newData, setNewData] = useState({ ...initPermissionModel })
    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)
    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false)

    const [selectedRow, setSelectedRow] = useState({
        ...initPermissionModel
    })

    const toggleCreatePermissionDialog = () => {
        setIsOpenCreateDialog(!isOpenCreateDialog);
    }

    const toggleModifyPermissionDialog = () => {
        setIsOpenModifyDialog(!isOpenModifyDialog);
    }

    const handleRowSelection = (arrIds) => {

        const rowSelected = menuState.data.filter(function (item) {
            return item.permissionId === arrIds[0]
        });
        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
        }
        else {
            setSelectedRow({ ...initPermissionModel });
        }
    }

    async function fetchData() {
        setMenuState({
            ...menuState
            , isLoading: true

        });
        const params = {
            page: menuState.page,
            pageSize: menuState.pageSize,
            keyWord: menuState.searchData.keyWord,
        }
        const res = await permissionService.getPermissionList(params);
        if (res && isRendered)
            setMenuState({
                ...menuState
                , data: [...res.Data]
                , totalRow: res.TotalRow
                , isLoading: false
            });
    }

    useEffect(() => {
        fetchData();

        return () => {
            isRendered = false;
        }
    }, [menuState.page, menuState.pageSize]);

    useEffect(() => {
        const data = [newData, ...menuState.data]
        data.pop();
        setMenuState({
            ...menuState
            , data: [...data]
            , totalRow: menuState.totalRow + 1
        });
    }, [newData]);

    useEffect(() => {
        let newArr = [];
        if (!_.isEqual(selectedRow, initPermissionModel)) {
            newArr = [...menuState.data]
            const index = _.findIndex(newArr, function (o) { return o.permissionId == selectedRow.permissionId; });
            if (index !== -1) {
                newArr[index] = selectedRow
            }
        }

        setMenuState({
            ...menuState
            , data: [...newArr]
        });
    }, [selectedRow]);

    const changeSearchData = (e, inputName) => {
        let newSearchData = { ...menuState.searchData };
        newSearchData[inputName] = e;
        setMenuState({ ...menuState, searchData: { ...newSearchData } })
    }

    const columns = [
        { field: 'permissionId', headerName: '', flex: 0.01, hide: true },
        {
            field: 'id', headerName: '', flex: 0.01,
            filterable: false,
            renderCell: (index) => index.api.getRowIndex(index.row.permissionId) + 1,
        },
        {
            field: "action",
            headerName: "",
            flex: 0.01,
            // headerAlign: 'center',
            disableClickEventBubbling: true,
            sortable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                return (
                    <Grid container spacing={1} alignItems="center" justifyContent="center">
                        <Grid item xs={12}>
                            <IconButton
                                aria-label="edit"
                                color="warning"
                                size="small"
                                sx={[{ '&:hover': { border: '1px solid orange', }, }]}
                                onClick={toggleModifyPermissionDialog}
                            >
                                <EditIcon fontSize="inherit" />
                            </IconButton>
                        </Grid>
                    </Grid>
                );
            },
        },


        { field: 'commonDetailName', headerName: 'Common Detail Name', flex: 0.3, },
        { field: 'permissionName', headerName: 'Permission Name', flex: 0.3, },

        { field: 'forRoot', headerName: 'forRoot', flex: 0.3, },
        { field: 'isActived', headerName: 'isActived', flex: 0.3, },
    ];

    return (
        <React.Fragment>
            <Grid container direction="row"
                justifyContent="space-between"
                alignItems="flex-end" sx={{ mb: 1, pr: 1 }}>
                <Grid item xs={8}>
                    <MuiButton
                        text="create"
                        color='success'
                        onClick={toggleCreatePermissionDialog}
                    />
                </Grid>
                {/* <Grid item xs>
                    <MuiSearchField
                        label='permission.permissionName'
                        name='keyWord'
                        onClick={fetchData}
                        onChange={(e) => changeSearchData(e.target.value, 'keyWord')}
                    />
                </Grid> */}
                <Grid item>
                    <TextField
                        sx={{ width: 300 }}
                        fullWidth
                        variant="standard"
                        size='small'
                        label={intl.formatMessage({ id: 'permission.permissionName' })}
                        onChange={(e) => changeSearchData(e.target.value, 'keyWord')}
                    />
                </Grid>
                <Grid item>
                    <MuiButton text="search" color='info' onClick={fetchData} sx={{ m: 0 }} />
                </Grid>
            </Grid>
            <MuiDataGrid
                showLoading={menuState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                columns={columns}
                rows={menuState.data}
                page={menuState.page - 1}
                pageSize={menuState.pageSize}
                rowCount={menuState.totalRow}
                // rowsPerPageOptions={[50, 100, 200]}

                onPageChange={(newPage) => {
                    setMenuState({ ...menuState, page: newPage + 1 });
                }}
                // onPageSizeChange={(newPageSize) => {
                //     setMenuState({ ...menuState, pageSize: newPageSize, page: 1 });
                // }}
                getRowId={(rows) => rows.permissionId}
                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}

                getRowClassName={(params) => {
                    if (_.isEqual(params.row, newData)) {
                        return `Mui-created`
                    }
                }}
            />
            <CreatePermissionDialog
                initModal={initPermissionModel}
                refreshGrid={fetchData}
                isOpen={isOpenCreateDialog}
                onClose={toggleCreatePermissionDialog}
            />
            {isOpenModifyDialog && <ModifyPermissionDialog
                initModal={selectedRow}
                setModifyData={setSelectedRow}
                isOpen={isOpenModifyDialog}
                onClose={toggleModifyPermissionDialog}
            />}
        </React.Fragment>

    )
}

export default Permission
