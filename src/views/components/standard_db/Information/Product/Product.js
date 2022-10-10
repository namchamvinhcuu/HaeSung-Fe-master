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
import moment from "moment";

import CreateDialog from './CreateProductDialog'



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
    const initProductModel = {
        ProductId: 0
        , ProductCode: ''
        ,Description: ''
        ,Model :''
        ,ProductType : ''
        ,Inch : ''

    }
    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)

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
        ...initProductModel
    })

    const [newData, setNewData] = useState({ ...initProductModel })
    const toggleCreateDialog = () => {

        setIsOpenCreateDialog(!isOpenCreateDialog);
    }

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


    const columns = [
        { field: 'ProductId', headerName: '', flex: 0.01, hide: true },
        {
            field: 'id', headerName: '', flex: 0.01,
            filterable: false,
            renderCell: (index) => index.api.getRowIndex(index.row.ProductId) + 1,
        },
        
        { field: 'Model', headerName: 'Model', flex: 0.3 },
        { field: 'ProductCode', headerName: 'ProductCode', flex: 0.3 },
        { field: 'Description', headerName: 'Description', flex: 0.3 },
        { field: 'ProductType', headerName: 'ProductType', flex: 0.3 },
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
                  //  getData={commonService.getProductList}
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
                  
                   
                    getRowId={(rows) => rows.ProductId}
                   
                    getRowClassName={(params) => {
                        if (_.isEqual(params.row, newData)) {
                            return `Mui-created`
                        }
                    }}
                />
            
            <CreateDialog
                initModal={initProductModel}
                setNewData={setNewData}
                isOpen={isOpenCreateDialog}
                onClose={toggleCreateDialog}
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