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

import CreateDialog from './CreateProductDialog'
import ModifyDialog from './ModifyProductDialog'


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

    const [productState, setproductState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 10,
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

        fetchData();
    }, [productState.page, productState.pageSize]);

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


    useEffect(() => {
        console.log(productState.data)
    }, [productState.data]);

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

    const columns = [
        { field: 'ProductId', headerName: '', flex: 0.01, hide: true },
        {
            field: 'id', headerName: '', flex: 0.01,
            filterable: false,
            renderCell: (index) => index.api.getRowIndex(index.row.ProductId) + 1,
        },
        {
            field: "action",
            headerName: "",
            flex: 0.1,
            disableClickEventBubbling: true,
            sortable: false,
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
                            //    onClick={() => handleDeleteCommonMS(params.row)}
                            >
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>

                        </Grid>
                    </Grid>
                );
            },
        },
        { field: 'ModelName', headerName: 'ModelName', flex: 0.3 },
        { field: 'Model', headerName: 'Model', flex: 0.3 },
        { field: 'ProductCode', headerName: 'ProductCode', flex: 0.3 },
        { field: 'Description', headerName: 'Description', flex: 0.3 },
        { field: 'ProductType', headerName: 'ProductType', flex: 0.3 },
        { field: 'ProductTypeName', headerName: 'ProductTypeName', flex: 0.3 },
        { field: 'Inch', headerName: 'Inch', flex: 0.3 },

        { field: 'isActived', headerName: 'isActived', flex: 0.3, hide: true },


        {
            field: 'createdDate', headerName: 'created Date', flex: 0.3,
            valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).format("YYYY-MM-DD HH:mm:ss")
                }
            },
        },
        { field: 'createdBy', headerName: 'createdBy', flex: 0.3, hide: true },
        {
            field: 'modifiedDate', headerName: 'Modified Date', flex: 0.3,
            valueFormatter: params => {
                if (params.value !== null) {
                    return moment(params?.value).format("YYYY-MM-DD HH:mm:ss")
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
                        // onChange={handleChangeClick}
                        />
                    </FormGroup>
                </Grid>
                <Grid item xs={4}>
                    <MuiSearchField
                        label='general.name'
                        name='keyWord'
                    //  onClick={showdataHidden ? fetchDataDeleted : fetchData}
                    // onChange={(e) => changeSearchData(e, 'keyWord')}
                    />
                </Grid>

            </Grid>

            <MuiDataGrid
                getData={productService.getProductList}
                showLoading={productState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                gridHeight={345}
                columns={columns}
                rows={productState.data}
                page={productState.page - 1}
                pageSize={productState.pageSize}
                rowCount={productState.totalRow}

                rowsPerPageOptions={[5, 10, 20, 30]}

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