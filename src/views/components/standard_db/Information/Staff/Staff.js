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
import Checkbox from '@mui/material/Checkbox';
import Box from "@mui/material/Box";
import Grid from '@mui/material/Grid'
import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import { StaffDto } from "@models"
import EditIcon from '@mui/icons-material/Edit'
import moment from "moment";
import CreateStaffDialog from './CreateStaffDialog'
import ModifyStaffDialog from './ModifyStaffDialog'
import _ from 'lodash'
import { FormControlLabel, Switch } from "@mui/material"
import UndoIcon from '@mui/icons-material/Undo'
import { ErrorAlert, SuccessAlert } from '@utils'


const Staff = (props) => {
    let isRendered = useRef(false);
    const intl = useIntl();

    // const initStaffModel = {
    //     StaffId: 0
    //     , StaffCode: ''
    //     , StaffName: ''

    // }
    const [newData, setNewData] = useState({ ...StaffDto });

    const [selectedRow, setSelectedRow] = useState({
        ...StaffDto
    })


    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)
    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false);
    const [showActivedData, setShowActivedData] = useState(true);

    const toggleCreateDialog = () => {

        setIsOpenCreateDialog(!isOpenCreateDialog);
    }

    const toggleModifyDialog = () => {
        setIsOpenModifyDialog(!isOpenModifyDialog);
    }


    const [staffState, setstaffState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 20,
        searchData: {
            StaffCode: null,
            StaffName: null
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

    const changeSearchData = (e, inputName) => {
        let newSearchData = { ...staffState.searchData };
        newSearchData[inputName] = e.target.value;

        setstaffState({ ...staffState, searchData: { ...newSearchData } })
    }

    async function fetchData() {
        setstaffState({
            ...staffState
            , isLoading: true

        });
        const params = {
            page: staffState.page,
            pageSize: staffState.pageSize,
            StaffCode: staffState.searchData.StaffCode,
            StaffName: staffState.searchData.StaffName,
            isActived: showActivedData,
        }
        const res = await staffService.getStaffList(params);
     

         if (res && isRendered)
            setstaffState({
                ...staffState
                , data: !res.Data ? [] : [...res.Data]
                , totalRow: res.TotalRow
                , isLoading: false
            });
    }

    const handleDeleteStaff = async (staff) => {
        if (window.confirm(intl.formatMessage({ id: showActivedData ? 'general.confirm_delete' : 'general.confirm_redo_deleted' }))) {
            try {
                let res = await staffService.deleteStaff(staff);
                if (res && res.HttpResponseCode === 200) {
                    SuccessAlert(intl.formatMessage({ id: 'general.success' }))
                    await fetchData();
                }
                else {
                    ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
                }
                // if (res && res.HttpResponseCode === 401) {
                //     ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))

                //     return;
                // }
            } catch (error) {
                console.log(error)
            }
        }
    }

    const handleshowActivedData = async (event) => {
        setShowActivedData(event.target.checked);
        if (!event.target.checked) {
            setstaffState({
                ...staffState
                , page: 1
            });
        }
    };

    useEffect(() => {

        isRendered = true;
        if (isRendered)
            fetchData();

        return () => {
            isRendered = false
        }
    }, [staffState.page, staffState.pageSize, showActivedData]); //
    useEffect(() => {
        if (!_.isEmpty(newData) && !_.isEqual(newData, StaffDto)) {
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
        { field: 'StaffId', headerName: '', hide: true},
        {
            field: 'id', headerName: '', flex: 0.01,
            filterable: false,
            renderCell: (index) => index.api.getRowIndex(index.row.StaffId) + 1,
        },
        {
            field: "action",
            headerName: "",
            width: 100,
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
                                onClick={toggleModifyDialog}
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
                                onClick={() => handleDeleteStaff(params.row)}
                            >
                               {showActivedData ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
                            </IconButton>
                        </Grid>
                    </Grid>
                );
            },
        },
        { field: 'StaffCode', headerName: intl.formatMessage({ id: "staff.StaffCode" }), /*flex: 0.7,*/  width: 150, },
        { field: 'StaffName', headerName: intl.formatMessage({ id: "staff.StaffName" }), flex: 1, },
        { field: 'createdName', headerName: 'User Create', width: 150, },
        {
            field: 'createdDate', headerName: intl.formatMessage({ id: "general.created_date" }), flex: 0.3, valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        
        { field: 'modifiedName', headerName: 'User Update', width: 150, },
        {
            field: 'modifiedDate', headerName: intl.formatMessage({ id: "general.modified_date" }), flex: 0.3, valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        //{ field: 'createdName', headerName: intl.formatMessage({ id: "general.createdName" }), width: 150, },
        //{ field: 'modifiedBy', headerName: 'Modified By', flex: 0.3},
    ];

    return (
        <React.Fragment>
            <Grid
                container
                spacing={2}
                direction="row"
                justifyContent="space-between"
                alignItems="flex-end"
            >

                <Grid item xs={5}>
                    <MuiButton
                        text="create"
                        color='success'
                        onClick={toggleCreateDialog}
                    />
                </Grid>
                
                <Grid item xs>
                        <MuiSearchField
                            label='general.code'
                            name='StaffCode'
                            onClick={fetchData}
                            onChange={(e) => changeSearchData(e, 'StaffCode')}
                        />
                </Grid>

                <Grid item xs>
                        <MuiSearchField
                            label='general.name'
                            name='StaffName'
                            onClick={fetchData}
                            onChange={(e) => changeSearchData(e, 'StaffName')}
                        />
                </Grid>

                <Grid item xs sx={{ display: 'flex', justifyContent: 'right' }}>
                    <MuiButton
                        text="search"
                        color='info'
                        onClick={fetchData}
                    />
                    <FormControlLabel
                        sx={{ mb: 0, ml: '1px' }}
                        control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleshowActivedData(e)} />}
                        label={showActivedData ? "Actived" : "Deleted"} 
                            
                        />
                </Grid>

            </Grid>

            <MuiDataGrid
                //getData={staffService.getStaffList}
                showLoading={staffState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                gridHeight={736}
                columns={columns}
                rows={staffState.data}
                page={staffState.page - 1}
                pageSize={staffState.pageSize}
                rowCount={staffState.totalRow}

                //rowsPerPageOptions={[5, 10, 20, 30]}
                disableGrid={staffState.isLoading}

                onPageChange={(newPage) => {
                    setstaffState({ ...staffState, page: newPage + 1 });
                }}
                // onPageSizeChange={(newPageSize) => {
                //     setstaffState({ ...staffState, pageSize: newPageSize, page: 1 });
                // }}
                getRowId={(rows) => rows.StaffId}
                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}

                getRowClassName={(params) => {
                    if (_.isEqual(params.row, newData)) {
                        return `Mui-created`
                    }
                }}
            />

            <CreateStaffDialog
                initModal={StaffDto}
                setNewData={setNewData}
                isOpen={isOpenCreateDialog}
                onClose={toggleCreateDialog}
            />
            <ModifyStaffDialog
                initModal={selectedRow}
                setModifyData={setSelectedRow}
                isOpen={isOpenModifyDialog}
                onClose={toggleModifyDialog}
            />
        </React.Fragment>
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