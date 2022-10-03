import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

import { MuiButton, MuiDataGrid } from '@controls'
import { menuService } from '@services'

import CreateMenuDialog from './CreateMenuDialog'
import ModifyMenuDialog from './ModifyMenuDialog'

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

    const [menuState, setMenuState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 20,
        isOpenModifyDialog: false,
        isOpenCreateDialog: false,
    });

    const [selectedRow, setSelectedRow] = useState({
        ...initMenuModel
    })

    const [open, setopen] = useState(false)

    const toggleCreateMenuDialog = () => {
        setMenuState({ ...menuState, isOpenCreateDialog: !menuState.isOpenCreateDialog });
    }

    const toggleModifyMenuDialog = () => {
        setMenuState({ ...menuState, isOpenModifyDialog: !menuState.isOpenModifyDialog });
    }

    const handleRowSelection = (arrIds) => {

        let currentGridData = menuGridRef.current.getDataGrid();
        let selectedRow = currentGridData.filter(function (item) {
            return item.menuId === arrIds[0]
        });
        if (selectedRow && selectedRow.length > 0) {
            setSelectedRow({ ...selectedRow[0] });
        }
        else {
            setSelectedRow({ ...initMenuModel });
        }
    }

    const refreshGrid = async () => {
        return await fetchData();
    }

    async function fetchData() {
        const params = {
            page: menuState.page,
            pageSize: menuState.pageSize
        }
        const res = await menuService.getMenuList(params);
        setMenuState({
            ...menuState
            , data: [...res.Data]
            , totalRow: res.Data && res.Data.length > 0 ? res.Data[0].totalRow : 0
        });
    }

    useEffect(() => {
        // isRendered = true;
        // const params = {
        //     page: menuState.page,
        //     pageSize: menuState.pageSize
        // }
        // menuService.getMenuList(params)
        //     .then(res => {
        //         if (isRendered) {
        //             setMenuState({
        //                 ...menuState
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
    }, [menuState.page, menuState.pageSize]);

    const handleDeleteMenu = async (menu) => {
        if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
            try {
                console.log('row', menu)
                let res = await menuService.deleteMenu(menu);
                if (res && res.HttpResponseCode === 200) {
                    await fetchData();
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

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
                                onClick={toggleModifyMenuDialog}
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
                                onClick={() => handleDeleteMenu(params.row)}
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
        <React.Fragment>
            <MuiButton
                text="create"
                color='success'
                onClick={toggleCreateMenuDialog}
            />
            <MuiDataGrid
                ref={menuGridRef}
                showLoading={menuState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                // rowHeight={30}
                columns={columns}
                rows={menuState.data}
                page={menuState.page - 1}
                pageSize={menuState.pageSize}
                rowCount={menuState.totalRow}
                rowsPerPageOptions={[20, 30, 50]}

                onPageChange={(newPage) => {
                    setMenuState({ ...menuState, page: newPage + 1 });
                }}
                onPageSizeChange={(newPageSize) => {
                    setMenuState({ ...menuState, pageSize: newPageSize, page: 1 });
                }}
                getRowId={(rows) => rows.menuId}
                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}
            // selectionModel={menuState.selectedRowData}
            />

            {menuState.isOpenCreateDialog && <CreateMenuDialog
                initModal={initMenuModel}
                isOpen={menuState.isOpenCreateDialog}
                onClose={toggleCreateMenuDialog}
            />}

            {menuState.isOpenModifyDialog && <ModifyMenuDialog
                initModal={selectedRow}
                isOpen={menuState.isOpenModifyDialog}
                onClose={toggleModifyMenuDialog}
            />}

        </React.Fragment>

    )
}

export default Menu
