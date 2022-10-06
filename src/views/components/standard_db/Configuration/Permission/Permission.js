import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { createTheme, ThemeProvider } from "@mui/material"
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid } from '@controls'
import { permissionService } from '@services'
import _ from 'lodash'
import ModifyPermissionDialog from './ModifyPermissionDialog'

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

const Permission = () => {
    const intl = useIntl();
    let isRendered = useRef(false);
    const initMenuModel = {
        permissionId: 0
        , permissionName: ''
        , commonDetailId: ''
        , commonDetailName: ''
        , forRoot: ''
    }

    const menuGridRef = useRef();

    const [menuState, setMenuState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 50,
    });

    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false)

    const [selectedRow, setSelectedRow] = useState({
        ...initMenuModel
    })

    const [newData, setNewData] = useState({ ...initMenuModel })

 

    const toggleModifyMenuDialog = () => {
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
       const res = await permissionService.getPermissionList(params);
      
        setMenuState({
            ...menuState
            , data: [...res.Data]
            , totalRow: res.TotalRow
            , isLoading: false
        });
    }

    useEffect(() => {
       
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



    const columns = [
        { field: 'permissionId', headerName: '', flex: 0.01, hide: true},
        { field: 'id', headerName: '', flex: 0.01,
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
                                onClick={toggleModifyMenuDialog}
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
            <ThemeProvider theme={myTheme}>
                <MuiDataGrid
          
                    showLoading={menuState.isLoading}
                    isPagingServer={true}
                    headerHeight={45}
                    // rowHeight={30}
                    columns={columns}
                    rows={menuState.data}
                    page={menuState.page - 1}
                    pageSize={menuState.pageSize}
                    rowCount={menuState.totalRow}
                   
                
                    rowsPerPageOptions={[50, 100, 200]}

                    onPageChange={(newPage) => {
                        setMenuState({ ...menuState, page: newPage + 1 });
                    }}
                    onPageSizeChange={(newPageSize) => {
                        setMenuState({ ...menuState, pageSize: newPageSize, page: 1 });
                    }}
                    getRowId={(rows) => rows.permissionId}
                    onSelectionModelChange={(newSelectedRowId) => {
                        handleRowSelection(newSelectedRowId)
                    }}
                  
                    getRowClassName={(params) => {
                        if (_.isEqual(params.row, newData)) {
                            return `Mui-created`
                        }
                    }}
                // 
                />
          
                {isOpenModifyDialog && <ModifyPermissionDialog
                    initModal={selectedRow}
                    setModifyData={setSelectedRow}
                    isOpen={isOpenModifyDialog}
                    onClose={toggleModifyMenuDialog}
                />}
            </ThemeProvider>
        </React.Fragment>

    )
}

export default Permission
