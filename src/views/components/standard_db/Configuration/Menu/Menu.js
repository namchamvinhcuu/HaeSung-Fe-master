import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { createTheme, ThemeProvider } from "@mui/material"
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

import { MuiButton, MuiDataGrid } from '@controls'
import { menuService } from '@services'

import CreateMenuDialog from './CreateMenuDialog'
import ModifyMenuDialog from './ModifyMenuDialog'
import _ from 'lodash'


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
        pageSize: 5,
    });

    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)
    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false)

    const [selectedRow, setSelectedRow] = useState({
        ...initMenuModel
    })

    const [newData, setNewData] = useState({ ...initMenuModel })

    const toggleCreateMenuDialog = () => {
        // setMenuState({ ...menuState, isOpenCreateDialog: !menuState.isOpenCreateDialog });
        setIsOpenCreateDialog(!isOpenCreateDialog);
    }

    const toggleModifyMenuDialog = () => {
        // setMenuState({ ...menuState, isOpenModifyDialog: !menuState.isOpenModifyDialog });
        setIsOpenModifyDialog(!isOpenModifyDialog);
    }

    const handleRowSelection = (arrIds) => {

        // let currentGridData = menuGridRef.current.getDataGrid();
        // let selectedRow = menuState.data.filter(function (item) {
        //     return item.menuId === arrIds[0]
        // });

        const rowSelected = menuState.data.filter(function (item) {
            return item.menuId === arrIds[0]
        });
        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
        }
        else {
            setSelectedRow({ ...initMenuModel });
        }
    }

    async function fetchData() {
        setMenuState({
            ...menuState
            , isLoading: true

        });
        const params = {
            page: menuState.page,
            pageSize: menuState.pageSize
        }
        const res = await menuService.getMenuList(params);
        setMenuState({
            ...menuState
            , data: [...res.Data]
            , totalRow: res.TotalRow
            , isLoading: false
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
        if (!_.isEqual(selectedRow, initMenuModel)) {
            newArr = [...menuState.data]
            const index = _.findIndex(newArr, function (o) { return o.menuId == selectedRow.menuId; });
            if (index !== -1) {
                newArr[index] = selectedRow
            }
        }

        setMenuState({
            ...menuState
            , data: [...newArr]
        });
    }, [selectedRow]);

    const handleDeleteMenu = async (menu) => {
        if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
            try {
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
            <ThemeProvider theme={myTheme}>
                <MuiButton
                    text="create"
                    color='success'
                    onClick={toggleCreateMenuDialog}
                />
                <MuiDataGrid
                    // ref={menuGridRef}
                    showLoading={menuState.isLoading}
                    isPagingServer={true}
                    headerHeight={45}
                    // rowHeight={30}
                    columns={columns}
                    rows={menuState.data}
                    page={menuState.page - 1}
                    pageSize={menuState.pageSize}
                    rowCount={menuState.totalRow}
                    rowsPerPageOptions={[5, 10, 20]}

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
                    // selectionModel={selectedRow.menuId}
                    getRowClassName={(params) => {
                        if (_.isEqual(params.row, newData)) {
                            return `Mui-created`
                        }
                    }}
                // 
                />

                {isOpenCreateDialog && <CreateMenuDialog
                    initModal={initMenuModel}
                    setNewData={setNewData}
                    isOpen={isOpenCreateDialog}
                    onClose={toggleCreateMenuDialog}
                />}

                {isOpenModifyDialog && <ModifyMenuDialog
                    initModal={selectedRow}
                    setModifyData={setSelectedRow}
                    isOpen={isOpenModifyDialog}
                    onClose={toggleModifyMenuDialog}
                />}
            </ThemeProvider>
        </React.Fragment>

    )
}

export default Menu
