import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'
import _ from 'lodash';
import moment from "moment";
import { useIntl } from 'react-intl';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { createTheme, ThemeProvider } from "@mui/material";
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls';

import { SupplierDto } from '@models'
import { supplierService } from '@services'

import CreateSupplierDialog from './CreateSupplierDialog'
import ModifySupplierDialog from './ModifySupplierDialog'

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

const Supplier = (props) => {
    const intl = useIntl();

    const [supplierState, setSupplierState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 20,
        searchData: {
            SupplierCode: null,
            SupplierName: null
        }
    });

    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false);
    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false);

    const [selectedRow, setSelectedRow] = useState({
        ...SupplierDto
    });

    const [newData, setNewData] = useState({ ...SupplierDto });

    const toggleCreateDialog = () => {
        setIsOpenCreateDialog(!isOpenCreateDialog);
    }

    const toggleModifyDialog = () => {
        setIsOpenModifyDialog(!isOpenModifyDialog);
    }

    const handleRowSelection = (arrIds) => {
        const rowSelected = supplierState.data.filter(function (item) {
            return item.SupplierId === arrIds[0]
        });

        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
        }
        else {
            setSelectedRow({ ...SupplierDto });
        }
    }

    const changeSearchData = (e, inputName) => {
        let newSearchData = { ...supplierState.searchData };
        newSearchData[inputName] = e.target.value;

        setSupplierState({ ...supplierState, searchData: { ...newSearchData } })
    }

    const fetchData = async () => {
        setSupplierState({
            ...supplierState
            , isLoading: true

        });
        const params = {
            page: supplierState.page,
            pageSize: supplierState.pageSize,
            SupplierCode: supplierState.searchData.SupplierCode,
            SupplierName: supplierState.searchData.SupplierName,
        }
        const res = await supplierService.getSuppliers(params);

        setSupplierState({
            ...supplierState
            , data: !res.Data ? [] : [...res.Data]
            , totalRow: res.TotalRow
            , isLoading: false
        });
    }

    useEffect(() => {
        fetchData();
    }, [supplierState.page, supplierState.pageSize]);

    useEffect(() => {
        if (!_.isEmpty(newData) && !_.isEqual(newData, SupplierDto)) {
            const data = [newData, ...supplierState.data]
            if (data.length > supplierState.pageSize) {
                data.pop();
            }
            setSupplierState({
                ...supplierState
                , data: [...data]
                , totalRow: supplierState.totalRow + 1
            });
        }
    }, [newData]);

    useEffect(() => {
        if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, SupplierDto)) {
            let newArr = [...supplierState.data]
            const index = _.findIndex(newArr, function (o) { return o.SupplierId == selectedRow.SupplierId; });
            if (index !== -1) {
                newArr[index] = selectedRow
            }

            setSupplierState({
                ...supplierState
                , data: [...newArr]
            });
        }
    }, [selectedRow]);

    const columns = [
        { field: 'SupplierId', headerName: '', hide: true },
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
                                onClick={() => handleDeleteSupplier(params.row)}
                            >
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        </Grid>
                    </Grid>
                );
            },
        },
        { field: 'SupplierCode', headerName: intl.formatMessage({ id: "supplier.SupplierCode" }), flex: 0.7, },
        { field: 'SupplierName', headerName: intl.formatMessage({ id: "supplier.SupplierName" }), flex: 0.7, },
        { field: 'SupplierContact', headerName: intl.formatMessage({ id: "supplier.SupplierContact" }), flex: 0.7, },
        {
            field: 'createdDate', headerName: intl.formatMessage({ id: "general.created_date" }), flex: 0.3, valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        {
            field: 'modifiedDate', headerName: intl.formatMessage({ id: "general.modified_date" }), flex: 0.3, valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
    ];

    return (
        <React.Fragment>
            <ThemeProvider theme={myTheme}>
                <Grid
                    container
                    spacing={2}
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

                    <Grid item xs>
                        <MuiSearchField
                            label='general.code'
                            name='SupplierCode'
                            onClick={fetchData}
                            onChange={(e) => changeSearchData(e, 'SupplierCode')}
                        />
                    </Grid>

                    <Grid item xs>
                        <MuiSearchField
                            label='general.name'
                            name='SupplierName'
                            onClick={fetchData}
                            onChange={(e) => changeSearchData(e, 'SupplierName')}
                        />
                    </Grid>

                </Grid>

                <MuiDataGrid
                    // ref={menuGridRef}
                    showLoading={supplierState.isLoading}
                    isPagingServer={true}
                    headerHeight={45}
                    // rowHeight={30}
                    gridHeight={736}
                    columns={columns}
                    rows={supplierState.data}
                    page={supplierState.page - 1}
                    pageSize={supplierState.pageSize}
                    rowCount={supplierState.totalRow}
                    rowsPerPageOptions={[5, 10, 20, 30]}

                    onPageChange={(newPage) => {
                        setSupplierState({ ...supplierState, page: newPage + 1 });
                    }}
                    onPageSizeChange={(newPageSize) => {
                        setSupplierState({ ...supplierState, pageSize: newPageSize, page: 1 });
                    }}
                    getRowId={(rows) => rows.SupplierId}
                    onSelectionModelChange={(newSelectedRowId) => {
                        handleRowSelection(newSelectedRowId)
                    }}
                    // selectionModel={selectedRow.menuId}
                    getRowClassName={(params) => {
                        if (_.isEqual(params.row, newData)) {
                            return `Mui-created`
                        }
                    }}
                />

                <CreateSupplierDialog
                    initModal={SupplierDto}
                    setNewData={setNewData}
                    isOpen={isOpenCreateDialog}
                    onClose={toggleCreateDialog}
                />

                <ModifySupplierDialog
                    initModal={selectedRow}
                    setModifyData={setSelectedRow}
                    isOpen={isOpenModifyDialog}
                    onClose={toggleModifyDialog}
                />

            </ThemeProvider>
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

export default connect(mapStateToProps, mapDispatchToProps)(Supplier);