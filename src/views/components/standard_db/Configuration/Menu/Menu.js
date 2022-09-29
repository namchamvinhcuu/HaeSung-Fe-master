import React, { useRef, useState, useEffect } from 'react'

import Grid from '@mui/material/Grid'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'

import { MuiDataGrid } from '@controls'
import { menuService } from '@services'

const Menu = () => {

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
    const [menuArr, setMenuArr] = useState([]);
    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [rowCount, setRowCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState({ ...initMenuModel });

    const toggleModifyMenuDialog = async (user) => {
        setIsOpenModifyDialog(!isOpenModifyDialog);
        // emitter.emit('EVENT_BINDING_EDIT_USER_MODAL', { ...user });
    }

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPage(1);
    };

    const handleRowSelection = (arrIds) => {

        let currentGridData = menuGridRef.current.getDataGrid();
        let selectedRow = currentGridData.filter(function (item) {
            return item.menuId === arrIds[0]
        });

        if (selectedRow && selectedRow.length > 0) {
            setSelectedRowData({ ...selectedRow[0] });
        }
        else {
            setSelectedRowData({});
        }
    }

    const getMenus = async () => {
        const params = {
            page: 1,
            pageSize: 5
        }
        let res = await menuService.getMenuList(params);

        setMenuArr(res.Data ?? []);
        setRowCount(res.Data[0].totalRow !== 0 ? res.Data[0].totalRow : 0)
    }

    useEffect(() => {
        getMenus();
    }, []);

    // useEffect(() => {
    //     if (menuArr.length > 0)
    //         setRowCount(menuArr[0].totalRow !== 0 ? menuArr[0].totalRow : 0)
    // }, [menuArr, setRowCount]);

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
        {
            field: "action",
            headerName: "",
            flex: 0.3,
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
        { field: 'menuName', headerName: 'Menu Name', flex: 1, },
        { field: 'parentId', headerName: 'Parent', flex: 1, },
        { field: 'menuLevel', headerName: 'Level', flex: 0.2, },
        {
            field: 'sortOrder',
            headerName: 'Sort Order',
            description: 'This column has a value getter and is not sortable.',
            sortable: false,
            flex: 0.2,
            // valueGetter: (params) =>
            //   `${params.row.firstName || ''} ${params.row.lastName || ''}`,
        },
        { field: 'menuIcon', headerName: 'Icon', flex: 1, },
        { field: 'languageKey', headerName: 'Language Key', flex: 1, },
        { field: 'menuComponent', headerName: 'Component', flex: 1, },
        { field: 'navigateUrl', headerName: 'Url', flex: 1, },
        { field: 'forRoot', headerName: 'For Root', flex: 0.2, },
    ];

    return (
        <>
            <MuiDataGrid
                ref={menuGridRef}
                showLoading={isLoading}
                isPagingServer={true}

                headerHeight={45}
                // rowHeight={30}

                columns={columns}
                rows={menuArr}

                page={page}
                pageSize={pageSize}
                rowCount={rowCount}
                rowsPerPageOptions={[5, 10, 20]}

                onPageChange={(newPage) => handlePageChange(newPage)}
                onPageSizeChange={(newPageSize) => handlePageSizeChange(newPageSize)}
                getRowId={(rows) => rows.menuId}
                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}
                selectionModel={selectedRowData}
            />
        </>

    )
}

export default Menu
