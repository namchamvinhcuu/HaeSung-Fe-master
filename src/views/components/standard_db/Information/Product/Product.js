import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'
import { createTheme, ThemeProvider, TextField } from "@mui/material"
import { productService } from '@services'
import { useIntl } from 'react-intl'
import React, { useEffect, useRef, useState } from 'react'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from "@mui/material/Box";
import Grid from '@mui/material/Grid'
import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import moment from "moment"
import ProductDto from "@models"
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo';
import CreateDialog from './CreateProductDialog'
import ModifyDialog from './ModifyProductDialog'
import { ErrorAlert, SuccessAlert } from '@utils'

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

const Product = () => {
    const intl = useIntl();

    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)
    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false)
    const [showdataHidden, setshowdataHidden] = useState(false)
   
    const [productState, setproductState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 2,
        searchData: {
            keyWord: ''

        }
    });

    const [selectedRow, setSelectedRow] = useState({
        ...ProductDto
    })

    const [newData, setNewData] = useState({ ...ProductDto })
    const toggleCreateDialog = () => {

        setIsOpenCreateDialog(!isOpenCreateDialog);
    }
    const toggleModifyDialog = () => {
        setIsOpenModifyDialog(!isOpenModifyDialog);
    }
    useEffect(() => {
        console.log(productState.data)
    }, [productState.data]);

    useEffect(() => {
        if (showdataHidden) {
            fetchDataDeleted();
        }
        else {
            fetchData();
        }
    }, [productState.page, productState.pageSize,showdataHidden]);

    useEffect(() => {
        if (!_.isEmpty(newData)) {
            const data = [newData, ...productState.data];
            if (data.length > productState.pageSize) {
                data.pop();
            }
            setproductState({
                ...productState
                , data: [...data]
                , totalRow: productState.totalRow + 1
            });
        }
    }, [newData]);

    useEffect(() => {
        if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, ProductDto)) {
            let newArr = [...productState.data]
            const index = _.findIndex(newArr, function (o) { return o.ProductId == selectedRow.ProductId; });
            if (index !== -1) {
                newArr[index] = selectedRow
            }

            setproductState({
                ...productState
                , data: [...newArr]
            });
        }
    }, [selectedRow]);

    async function fetchData() {
        setproductState({
            ...productState
            , isLoading: true

        });
        const params = {
            page: productState.page,
            pageSize: productState.pageSize,
            keyword: productState.searchData.keyWord
        }
        const res = await productService.getProductList(params);

        setproductState({
            ...productState
            , data: [...res.Data]
            , totalRow: res.TotalRow
            , isLoading: false
        });
    }
    async function fetchDataDeleted() {
        setproductState({
            ...productState
            , isLoading: true

        });
        const params = {
            page: productState.page,
            pageSize: productState.pageSize,
            keyword: productState.searchData.keyWord
        }
        const res = await productService.getProductListDeleted(params);

        setproductState({
            ...productState
            , data: [...res.Data]
            , totalRow: res.TotalRow
            , isLoading: false
        });
    }
    const handleRowSelection = (arrIds) => {

        const rowSelected = productState.data.filter(function (item) {
            return item.ProductId === arrIds[0]
        });
        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });

        }
        else {
            setSelectedRow({ ...ProductDto });

        }
    }
    const handleDelete = async (ProductId) => {

        if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
            try {
                let res = await productService.deleteProduct(ProductId);
                if (res && res.HttpResponseCode === 200) {

                    SuccessAlert(intl.formatMessage({ id: 'general.success' }))
                    await fetchData();
                }
                if (res && res.HttpResponseCode === 300) {
                    ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))

                    return;
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    const changeSearchData = (e, inputName) => {

        let newSearchData = { ...productState.searchData };
        newSearchData[inputName] = e.target.value;

        setproductState({ ...productState, searchData: { ...newSearchData } })

    }

    const handleChangeClick = async (event) => {
        setshowdataHidden(event.target.checked);
        
        if (event.target.checked) {
            // fetchData();
            setproductState({
                ...productState
                , page: 1
            });
        }
    };
    const handleRedoDelete = async (id) => {
        if (window.confirm(intl.formatMessage({ id: 'general.confirm_redo_deleted' }))) {
            try {
                let res = await productService.RedoDataDeleted(id);
                if (res && res.HttpResponseCode === 200) {
                    SuccessAlert(intl.formatMessage({ id: 'general.success' }))
                    await fetchDataDeleted();
                }

            } catch (error) {
                console.log(error)
            }
        }
    }
    const columns = [
        { field: 'ProductId', headerName: '', flex: 0.3, hide: true },
        {
            field: 'id', headerName: '', flex: 0.01,
            filterable: false,
            renderCell: (index) => index.api.getRowIndex(index.row.ProductId) + 1,
        },
        {
            field: "action",
            headerName: "",
            flex: 0.2,
            // headerAlign: 'center',
            disableClickEventBubbling: true,
            sortable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                return (
                    <Grid container spacing={1} alignItems="center" justifyContent="center">
                        <Grid item xs={6}>
                            {
                                showdataHidden ?
                                    ""
                                    :
                                    <IconButton
                                        aria-label="edit"
                                        color="warning"
                                        size="small"
                                        sx={[{ '&:hover': { border: '1px solid orange', }, }]}
                                        onClick={toggleModifyDialog}
                                    >
                                        <EditIcon fontSize="inherit" />
                                    </IconButton>
                            }

                        </Grid>
                        <Grid item xs={6}>
                            {showdataHidden ?

                                <IconButton
                                    color="error"
                                    size="small"
                                    sx={[{ '&:hover': { border: '1px solid red', }, }]}
                                    onClick={() => handleRedoDelete(params.row.ProductId)}
                                >
                                    <UndoIcon fontSize="inherit" />
                                </IconButton> :
                                <IconButton
                                    aria-label="delete"
                                    color="error"
                                    size="small"
                                    sx={[{ '&:hover': { border: '1px solid red', }, }]}
                                    onClick={() => handleDelete(params.row.ProductId)}
                                >
                                    <DeleteIcon fontSize="inherit" />
                                </IconButton>

                            }


                        </Grid>
                    </Grid>
                );
            },
        },
        { field: 'ModelName', headerName: 'Model', flex: 0.3 },
        { field: 'Model', headerName: 'Model', flex: 0.3, hide: true },
        { field: 'ProductCode', headerName: 'Product Code', flex: 0.3 },
        { field: 'Description', headerName: 'Description', flex: 0.3 },
        { field: 'ProductType', headerName: 'Product Type', flex: 0.3, hide: true },
        { field: 'ProductTypeName', headerName: 'Product Type', flex: 0.3 },
        { field: 'Inch', headerName: 'Inch', flex: 0.3 },

        { field: 'isActived', headerName: 'isActived', flex: 0.3, hide: true },


        {
            field: 'createdDate', headerName: 'Created Date', flex: 0.3,
            valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        { field: 'createdBy', headerName: 'Created By', flex: 0.3, hide: true },
        {
            field: 'modifiedDate', headerName: 'Modified Date', flex: 0.3,
            valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },

        { field: 'modifiedBy', headerName: 'modifiedBy', flex: 0.3, hide: true },
    ];

    return (

        <>
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
                            onChange={handleChangeClick}
                        />
                    </FormGroup>
                </Grid>
                <Grid item xs={4}>
                    <MuiSearchField
                        label='general.name'
                        name='keyWord'
                        onClick={showdataHidden ? fetchDataDeleted : fetchData}
                        onChange={(e) => changeSearchData(e, 'keyWord')}
                    />
                </Grid>

            </Grid>

            <MuiDataGrid
                getData={productService.getProductList}
                showLoading={productState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                columns={columns}
                gridHeight={736}
                rows={productState.data}
                page={productState.page - 1}
                pageSize={productState.pageSize}
                rowCount={productState.totalRow}

                rowsPerPageOptions={[5, 10, 20]}
                onPageChange={(newPage) => setproductState({ ...productState, page: newPage + 1 })}
                onPageSizeChange={(newPageSize) => setproductState({ ...productState, pageSize: newPageSize, page: 1 })}
               
                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}
                getRowId={(rows) => rows.ProductId}
                getRowClassName={(params) => {
                    if (_.isEqual(params.row, newData)) {
                        return `Mui-created`
                    }
                }}
            />

            <CreateDialog
                initModal={ProductDto}
                setNewData={setNewData}
                isOpen={isOpenCreateDialog}
                onClose={toggleCreateDialog}
            />
            <ModifyDialog
                initModal={selectedRow}
                setModifyData={setSelectedRow}
                isOpen={isOpenModifyDialog}
                onClose={toggleModifyDialog}
            />
        </>

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

export default connect(mapStateToProps, mapDispatchToProps)(Product);