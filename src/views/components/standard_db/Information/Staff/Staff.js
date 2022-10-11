import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'
import { createTheme, ThemeProvider, TextField } from "@mui/material"
import { staffService } from '@services'
import { useIntl } from 'react-intl'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from "@mui/material/Box";
import Grid from '@mui/material/Grid'
import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import StaffDto from "@models"
import EditIcon from '@mui/icons-material/Edit'
import moment from "moment";
import CreateDialog from './CreateStaffDialog'


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
const Staff = (props) => {

    const initStaffModel = {
        StaffId: 0
        , StaffCode: ''
        , StaffName: ''

    }
    const [newData, setNewData] = useState({ ...initStaffModel })

    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)
    const toggleCreateDialog = () => {

        setIsOpenCreateDialog(!isOpenCreateDialog);
    }

    const [selectedRow, setSelectedRow] = useState({
        ...StaffDto
    })


    const [staffState, setstaffState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 10,
        searchData: {
            keyWord: ''
        }
    });

    const handleRowSelection = (arrIds) => {

        const rowSelected = staffState.data.filter(function (item) {
            return item.StaffId === arrIds[0]
        });
        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
           
        }
        else {
            setSelectedRow({ ...StaffDto });
           
        }
    }

    async function fetchData() {
        setstaffState({
            ...staffState
            , isLoading: true

        });
        const params = {
            page: staffState.page,
            pageSize: staffState.pageSize,
            keyword: staffState.searchData.keyWord
        }
        const res = await staffService.getStaffList(params);
     
        setstaffState({
            ...staffState
            , data: [...res.Data]
            , totalRow: res.TotalRow
            , isLoading: false
        });
    }

    useEffect(() => {
        console.log(staffState.data)
    }, [staffState.data]);
    useEffect(() => {

        fetchData();
    }, [staffState.page, staffState.pageSize]);
    useEffect(() => {
        if (!_.isEmpty(newData)) {
            const data = [newData, ...staffState.data];
            if (data.length > staffState.pageSize) {
                data.pop();
            }
            setstaffState({
                ...staffState
                , data: [...data]
                , totalRow: staffState.totalRow + 1
            });
        }
    }, [newData]);


    useEffect(() => {
        if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, StaffDto)) {
            let newArr = [...staffState.data]
            const index = _.findIndex(newArr, function (o) { return o.StaffId == selectedRow.StaffId; });
            if (index !== -1) {
                newArr[index] = selectedRow
            }

            setstaffState({
                ...staffState
                , data: [...newArr]
            });
        }
    }, [selectedRow]);

    const columns = [
        { field: 'StaffId', headerName: '', flex: 0.01, hide: true },
        {
            field: 'id', headerName: '', flex: 0.01,
            filterable: false,
            renderCell: (index) => index.api.getRowIndex(index.row.StaffId) + 1,
        },
        {
            field: "action",
            headerName: "",
            width: 80,
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
                                //onClick={toggleModifyDialog}
                            >
                                <EditIcon fontSize="inherit" />
                            </IconButton>
                        </Grid>

                        <Grid item xs={6}>
                            {/* {showDeleteData ?
                                <IconButton
                                    aria-label="reuse"
                                    color="error"
                                    size="small"
                                    sx={[{ '&:hover': { border: '1px solid red', }, }]}
                                    //onClick={() => handleReuseSupplier(params.row)}
                                >
                                    <UndoIcon fontSize="inherit" />
                                </IconButton>
                                :
                                <IconButton
                                    aria-label="delete"
                                    color="error"
                                    size="small"
                                    sx={[{ '&:hover': { border: '1px solid red', }, }]}
                                    //onClick={() => handleDeleteSupplier(params.row)}
                                >
                                    <DeleteIcon fontSize="inherit" />
                                </IconButton>
                            } */}
                        </Grid>
                    </Grid>
                );
            },
        },
        { field: 'StaffCode', headerName: 'Staff Code', flex: 0.2 },
        { field: 'StaffName', headerName: 'Staff Name', flex: 0.3 },

        { field: 'isActived', headerName: 'isActived', flex: 0.3, hide: true },


        {
            field: 'createdDate', headerName: 'Created Date', flex: 0.3,
            valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        //{ field: 'createdBy', headerName: 'Created By', flex: 0.3, hide: true },
        {
            field: 'modifiedDate', headerName: 'Modified Date', flex: 0.3,
            valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },

        //{ field: 'modifiedBy', headerName: 'Modified By', flex: 0.3, hide: true },
    ];

    return (
        <React.Fragment>
            <ThemeProvider theme={myTheme}>
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
                        onClick={toggleCreateDialog}
                    />
                </Grid>
                <Grid item xs={2}>
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox />}
                            label="Show data deleted"
                           // onChange={handleChangeClick}
                        />
                    </FormGroup>
                </Grid>
                <Grid item xs>
                        <MuiSearchField
                            label='general.code'
                            name='StaffCode'
                            // onClick={fetchData}
                            // onChange={(e) => changeSearchData(e, 'SupplierCode')}
                        />
                </Grid>

                <Grid item xs>
                        <MuiSearchField
                            label='general.name'
                            name='StaffName'
                            // onClick={fetchData}
                            // onChange={(e) => changeSearchData(e, 'SupplierName')}
                        />
                </Grid>

            </Grid>

            <MuiDataGrid
                getData={staffService.getStaffList}
                showLoading={staffState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                gridHeight={345}
                columns={columns}
                rows={staffState.data}
                page={staffState.page - 1}
                pageSize={staffState.pageSize}
                rowCount={staffState.totalRow}

                rowsPerPageOptions={[5, 10, 20, 30]}

                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}
                getRowId={(rows) => rows.StaffId}

                getRowClassName={(params) => {
                    if (_.isEqual(params.row, newData)) {
                        return `Mui-created`
                    }
                }}
            />

            {/* <CreateDialog
                initModal={initStaffModel}
                setNewData={setNewData}
                isOpen={isOpenCreateDialog}
                onClose={toggleCreateDialog}
            /> */}
            </ThemeProvider>
        </React.Fragment >
    )
}

User_Operations.toString = function () {
    return 'User_Operations';
}

const mapStateToProps = state => {

    const { User_Reducer: { language } } = CombineStateToProps(state.AppReducer, [
        [Store.User_Reducer]
    ]);

    return { language };

};

const mapDispatchToProps = dispatch => {

    const { User_Operations: { changeLanguage } } = CombineDispatchToProps(dispatch, bindActionCreators, [
        [User_Operations]
    ]);

    return { changeLanguage }

};

export default connect(mapStateToProps, mapDispatchToProps)(Staff);