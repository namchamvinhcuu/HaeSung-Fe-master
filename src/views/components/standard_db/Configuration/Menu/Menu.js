import React, { useEffect, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'

import { MuiDataGrid } from '@controls'
import { menuService } from '@services'

import CreateMenuDialog from './CreateMenuDialog'

const Menu = () => {
    const intl = useIntl();
    let isRendered = useRef(false);
    const initMenuModel = {
        menuId: 0
        , parentId: ''
        , menuName: ''
        , menuLevel: ''
        , sortOrder: ''
        , menuIcon: ''
        , languageKey: ''
        , menuComponent: ''
        , navigateUrl: ''
        , forRoot: true
        , isActived: true
        , createdDate: null
        , createdBy: 0
        , modifiedDate: null
        , modifiedBy: null
        , row_version: null
    }

    const menuGridRef = useRef();

    const [menuGridState, setMenuGridState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 20,
        selectedRowData: { ...initMenuModel }
    })

    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false);

    const toggleModifyMenuDialog = async (user) => {
        setIsOpenModifyDialog(!isOpenModifyDialog);
        // emitter.emit('EVENT_BINDING_EDIT_USER_MODAL', { ...user });
    }

    const handleRowSelection = (arrIds) => {

        let currentGridData = menuGridRef.current.getDataGrid();
        let selectedRow = currentGridData.filter(function (item) {
            return item.menuId === arrIds[0]
        });
        if (selectedRow && selectedRow.length > 0) {
            setMenuGridState({ ...menuGridState, selectedRowData: { ...selectedRow[0] } });
        }
        else {
            setMenuGridState({ ...menuGridState, selectedRowData: { ...initMenuModel } });
        }
    }

    async function fetchData() {
        const params = {
            page: menuGridState.page,
            pageSize: menuGridState.pageSize
        }
        const res = await menuService.getMenuList(params);
        setMenuGridState({
            ...menuGridState
            , data: [...res.Data]
            , totalRow: res.Data && res.Data.length > 0 ? res.Data[0].totalRow : 0
        });
    }

    useEffect(() => {
        // isRendered = true;
        // const params = {
        //     page: menuGridState.page,
        //     pageSize: menuGridState.pageSize
        // }
        // menuService.getMenuList(params)
        //     .then(res => {
        //         if (isRendered) {
        //             setMenuGridState({
        //                 ...menuGridState
        //                 , data: [...res.Data]
        //                 , totalRow: res.Data && res.Data.length > 0 ? res.Data[0].totalRow : 0
        //             });
        //         }
        //         return null;
        //     })
        //     .catch(err => console.log(err));;
        // return () => {
        //     isRendered = false;
        // };
        fetchData();
    }, [menuGridState.page, menuGridState.pageSize]);

    // const handleDeleteUser = async (user) => {
    //     if (window.confirm("Delete the item?")) {
    //         try {
    //             let res = await userService.deleteUser(user.id);
    //             if (res && res.errCode === 0) {
    //                 await props.getUser();
    //             }
    //         } catch (error) {
    //             console.log(error)
    //         }
    //     }
    // }

    const columns = [
        { field: 'id', headerName: 'ID', hide: true },
        { field: 'parentId', headerName: 'ParentId', hide: true },
        {
            field: "action",
            headerName: "",
            flex: 0.4,
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
                            // onClick={() => toggleEditUserModal(params.row)}
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
                            // onClick={() => handleDeleteUser(params.row)}
                            >
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        </Grid>
                    </Grid>
                );
            },
        },
        { field: 'menuName', headerName: intl.formatMessage({ id: "general.name" }), flex: 0.7, },
        { field: 'parentMenuName', headerName: intl.formatMessage({ id: "general.parent" }), flex: 0.7, },
        { field: 'menuLevel', headerName: intl.formatMessage({ id: "general.level" }), flex: 0.3, },
        {
            field: 'sortOrder',
            headerName: 'Sort Order',
            description: 'This column has a value getter and is not sortable.',
            sortable: false,
            flex: 0.5,
            // valueGetter: (params) =>
            //   `${params.row.firstName || ''} ${params.row.lastName || ''}`,
        },
        { field: 'menuIcon', headerName: intl.formatMessage({ id: "general.icon" }), flex: 0.6, },
        { field: 'languageKey', headerName: intl.formatMessage({ id: "general.language_key" }), flex: 1, },
        { field: 'menuComponent', headerName: intl.formatMessage({ id: "general.component" }), flex: 0.7, },
        { field: 'navigateUrl', headerName: intl.formatMessage({ id: "general.url" }), flex: 0.6, },
        { field: 'forRoot', headerName: intl.formatMessage({ id: "general.root_only" }), flex: 0.5, },
    ];

    return (
        <>
            <MuiDataGrid
                ref={menuGridRef}
                showLoading={menuGridState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                // rowHeight={30}
                columns={columns}
                rows={menuGridState.data}
                page={menuGridState.page - 1}
                pageSize={menuGridState.pageSize}
                rowCount={menuGridState.totalRow}
                rowsPerPageOptions={[20, 30, 50]}

                onPageChange={(newPage) => {
                    setMenuGridState({ ...menuGridState, page: newPage + 1 });
                }}
                onPageSizeChange={(newPageSize) => {
                    setMenuGridState({ ...menuGridState, pageSize: newPageSize, page: 1 });
                }}
                getRowId={(rows) => rows.menuId}
                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}
                selectionModel={menuGridState.selectedRowData}
            />

            <CreateMenuDialog
                initModal={initMenuModel}
            />

        </>

    )
}

export default Menu
