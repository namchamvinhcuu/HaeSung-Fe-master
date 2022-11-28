import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS';
import { User_Operations } from '@appstate/user';
import { Store } from '@appstate';

import moment from 'moment';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { useIntl } from 'react-intl';
import { ErrorAlert, SuccessAlert } from '@utils';
import { MuiButton, MuiDataGrid, MuiAutocomplete, MuiSearchField } from '@controls';

import { ProductDto } from '@models';
import { fgStockService, productService } from '@services';

const FGStock = (props) => {
  let isRendered = useRef(true);

  const lotInputRef = useRef(null);
  const intl = useIntl();

  const [fgStockState, setFGStockState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      Model: null,
      MaterialCode: '',
      ProductType: 0,
      Description: '',
      //   ...ProductDto,
    },
  });

  const [selectedRow, setSelectedRow] = useState({
    ...ProductDto,
  });

  const fetchData = async () => {
    if (isRendered) {
      setFGStockState({ ...fgStockState, isLoading: true });
      const params = {
        page: fgStockState.page,
        pageSize: fgStockState.pageSize,
        Model: fgStockState.searchData.Model,
        MaterialCode: fgStockState.searchData.MaterialCode,
        ProductType: fgStockState.searchData.ProductType,
        Description: fgStockState.searchData.Description,
      };

      console.log('params: ', params);
      const res = await fgStockService.getFGStock(params);

      setFGStockState({
        ...fgStockState,
        data: [...res.Data],
        totalRow: res.TotalRow,
        isLoading: false,
      });
    }
  };

  const getproductType = async () => {
    return await productService.getProductType();
  };

  const getModel = async () => {
    return await productService.getProductModel();
  };

  const handleRowSelection = (arrIds) => {
    const rowSelected = fgStockState.data.filter(function (item) {
      return item.MaterialId === arrIds[0];
    });
    if (rowSelected && rowSelected.length > 0) {
      setSelectedRow({ ...rowSelected[0] });
    } else {
      setSelectedRow({ ...ProductDto });
    }
  };

  const handleSearch = (e, inputName) => {
    console.log('e: ', e);
    console.log('inputName: ', inputName);
    let newSearchData = { ...fgStockState.searchData };
    newSearchData[inputName] = e;
    setFGStockState({ ...fgStockState, searchData: { ...newSearchData } });
  };

  const columns = [
    { field: 'MaterialId', headerName: '', flex: 0.3, hide: true },
    {
      field: 'id',
      headerName: '',
      width: 70,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.MaterialId) + 1 + (fgStockState.page - 1) * fgStockState.pageSize,
    },

    {
      field: 'ModelName',
      headerName: intl.formatMessage({ id: 'product.Model' }),
      width: 150,
    },
    { field: 'MaterialCode', headerName: 'Product Code', width: 200 },
    {
      field: 'ProductTypeName',
      headerName: intl.formatMessage({ id: 'product.product_type' }),
      width: 200,
    },
    {
      field: 'Description',
      headerName: intl.formatMessage({ id: 'product.Description' }),
      width: 400,
    },
    {
      field: 'Inch',
      headerName: intl.formatMessage({ id: 'product.Inch' }),
      width: 100,
    },
    {
      field: 'StockQty',
      headerName: intl.formatMessage({ id: 'product.StockQty' }),
      width: 150,
    },
  ];

  useEffect(() => {
    fetchData();

    return () => {
      isRendered = false;
    };
  }, [fgStockState.page, fgStockState.pageSize]);

  return (
    <React.Fragment>
      <Grid container direction="row" justifyContent="space-between" alignItems="flex-end">
        <Grid item xs>
          <Grid container columnSpacing={2} direction="row" justifyContent="flex-end" alignItems="flex-end">
            <Grid item style={{ width: '21%' }}>
              <MuiAutocomplete
                label={intl.formatMessage({ id: 'product.Model' })}
                fetchDataFunc={getModel}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'Model')}
                variant="standard"
              />
            </Grid>

            <Grid item style={{ width: '21%' }}>
              <MuiAutocomplete
                label={intl.formatMessage({ id: 'product.product_type' })}
                fetchDataFunc={getproductType}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'ProductType')}
                variant="standard"
              />
            </Grid>

            <Grid item style={{ width: '21%' }}>
              <MuiSearchField
                variant="MaterialCode"
                label="product.product_code"
                onClick={fetchData}
                onChange={(e) => handleSearch(e.target.value, 'MaterialCode')}
              />
            </Grid>

            <Grid item style={{ width: '21%' }}>
              <MuiSearchField
                variant="Description"
                label="product.Description"
                onClick={fetchData}
                onChange={(e) => handleSearch(e.target.value, 'Description')}
              />
            </Grid>
            <Grid item style={{}}>
              <MuiButton text="search" color="info" onClick={fetchData} sx={{ mr: 3, mb: 1 }} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={fgStockState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={columns}
        rows={fgStockState.data}
        page={fgStockState.page - 1}
        pageSize={fgStockState.pageSize}
        rowCount={fgStockState.totalRow}
        onPageChange={(newPage) => setFGStockState({ ...fgStockState, page: newPage + 1 })}
        onPageSizeChange={(newPageSize) => setFGStockState({ ...fgStockState, pageSize: newPageSize, page: 1 })}
        onSelectionModelChange={(newSelectedRowId) => {
          handleRowSelection(newSelectedRowId);
        }}
        getRowId={(rows) => rows.MaterialId}
        initialState={{ pinnedColumns: { left: ['id', 'MaterialCode'] } }}
      />
    </React.Fragment>
  );
};

User_Operations.toString = function () {
  return 'User_Operations';
};

const mapStateToProps = (state) => {
  const {
    User_Reducer: { language },
  } = CombineStateToProps(state.AppReducer, [[Store.User_Reducer]]);

  return { language };
};

const mapDispatchToProps = (dispatch) => {
  const {
    User_Operations: { changeLanguage },
  } = CombineDispatchToProps(dispatch, bindActionCreators, [[User_Operations]]);

  return { changeLanguage };
};

export default connect(mapStateToProps, mapDispatchToProps)(FGStock);
