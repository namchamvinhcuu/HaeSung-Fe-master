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

import CreateCommonDetailDialog from './CreateCommonDetailDialog'
import ModifyCommonDetailDialog from './ModifyCommonDetailDialog'

const myTheme = createTheme({
    components: {
        //@ts-ignore - this isn't in the TS because DataGird is not exported from `@mui/material`
        MuiDataGrid: {
            styleOverrides: {
                row: {
                    "&.Mui-created": {
                        backgroundColor: "#A0DB8E",
                      
                    }
                }
            }
        }
    }
});
//export default function CommonDetail({ t, rowmaster }) {
const CommonDetail = ({ t, rowmaster }) => {

    const intl = useIntl();
    const initCommonDetailModel = {
        CommonDetailId: 0,
        commonMasterId : rowmaster.commonMasterId  ,
        commonDetailName : ''
    };


    const [menuState, setMenuState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 20,
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
            , data: [...res.Data]
            , totalRow: res.TotalRow
            , isLoading: false
        });
    };

    useEffect(() => {
        fetchData();
    }, [menuState.commonMasterId, menuState.page, menuState.pageSize, rowmaster]);

   

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
        }

        setMenuState({
            ...menuState
            , data: [...newArr]
        });
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
        { field: 'commonDetailId', headerName: '', flex: 0.03, hide:true},
        { field: 'id', headerName: '', flex: 0.01,
            filterable: false,
        renderCell: (index) => index.api.getRowIndex(index.row.commonDetailId) + 1,
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
        { field: 'isActived', headerName: 'isActived', flex: 0.3, },

        { field: 'createdDate', headerName: 'createdDate', flex: 0.3, },
        { field: 'createdBy', headerName: 'createdBy', flex: 0.3, },
        { field: 'modifiedDate', headerName: 'modifiedDate', flex: 0.3, },
        { field: 'modifiedBy', headerName: 'modifiedBy', flex: 0.3, },
    ];


    return (
        <React.Fragment>
        <ThemeProvider theme={myTheme}>
            <MuiButton
                text="create"
                color='success'
                onClick={toggleCreateCommonDetailDialog}
            />
                {menuState?.data &&
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
                 
                
                    rowsPerPageOptions={[20, 50, 100,200,500,1000]}

                    onPageChange={(newPage) => {
                        setMenuState({ ...menuState, page: newPage + 1 });
                    }}
                    onPageSizeChange={(newPageSize) => {
                        setMenuState({ ...menuState, pageSize: newPageSize, page: 1 });
                    }}
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


            {isOpenCreateDialog && <CreateCommonDetailDialog
                    initModal={initCommonDetailModel}
                    setNewData={setNewData}
                    isOpen={isOpenCreateDialog}
                    onClose={toggleCreateCommonDetailDialog}
                />}

                {isOpenModifyDialog && <ModifyCommonDetailDialog
                    initModal={selectedRow}
                    setModifyData={setSelectedRow}
                    isOpen={isOpenModifyDialog}
                    onClose={toggleModifyCommonDetailDialog}

                />} 
         </ThemeProvider>
        </React.Fragment>
    )
}

export default CommonDetail
