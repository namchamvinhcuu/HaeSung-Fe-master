import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import moment from 'moment';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

import { useIntl } from 'react-intl';

import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiSearchField } from '@controls';

import { ProductDto } from '@models';
import { fgStockService, productService } from '@services';

const DetailPanelContent = ({ row: rowProp }) => {
  let isDetailRendered = useRef(true);

  const [detailPanelState, setDetailPanelState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 5,
    MaterialId: rowProp.MaterialId,
  });

  const fetchDetailData = async () => {
    if (isDetailRendered) {
      setDetailPanelState({ ...detailPanelState, isLoading: true });
      const params = {
        page: detailPanelState.page,
        pageSize: detailPanelState.pageSize,
        MaterialId: detailPanelState.MaterialId,
      };

      const res = await fgStockService.getLotStock(params);

      setDetailPanelState({
        ...detailPanelState,
        data: !res.Data ? [] : [...res.Data],
        totalRow: res.TotalRow,
        isLoading: false,
      });
    }
  };

  const detailPanelColumns = [
    {
      field: 'id',
      headerName: '',
      width: 80,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.Id) + 1 + (detailPanelState.page - 1) * detailPanelState.pageSize,
    },

    { field: 'Id', headerName: 'Id', hide: false, width: 150 },

    {
      field: 'LotSerial',
      headerName: 'Lot Serial',
      width: 250,
    },

    {
      field: 'Qty',
      headerName: 'Qty',
      width: 100,
      renderCell: (params) => {
        if (params.value !== null) {
          return (
            params.value.toLocaleString()
          );
        }
      },
    },

    {
      field: 'LocationCode',
      headerName: 'Bin',
      width: 250,
    },

    {
      field: 'IncomingDate',
      headerName: 'Incoming Date',
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
  ];

  useEffect(() => {
    fetchDetailData();

    return () => {
      isDetailRendered = false;
    };
  }, [detailPanelState.page, detailPanelState.pageSize]);

  return (
    <Stack sx={{ py: 2, height: '100%', boxSizing: 'border-box' }} direction="column">
      <Paper sx={{ flex: 1, mx: 'auto', width: '95%', p: 1 }}>
        <Stack direction="column" spacing={1} sx={{ height: 1 }}>
          <Typography variant="h6">{`Assy Code: ${rowProp.MaterialCode}`}</Typography>
          <Grid container>
            <Grid item md={6}>
              <Typography variant="body2" align="right" color="textSecondary"></Typography>
              <Typography variant="body1">Model: {rowProp.ModelName}</Typography>
              <Typography variant="body1">Type: {rowProp.ProductTypeName}</Typography>
            </Grid>
            <Grid item md={6}>
              <Typography variant="body2" align="right" color="textSecondary"></Typography>
              <Typography variant="body1" align="right">
                Desc: {rowProp.Description}
              </Typography>
              <Typography variant="body1" align="right">
                Stock: {rowProp.StockQty ?? 0}
              </Typography>
            </Grid>
          </Grid>
          <MuiDataGrid
            showLoading={detailPanelState.isLoading}
            isPagingServer={true}
            headerHeight={45}
            columns={detailPanelColumns}
            rows={detailPanelState.data}
            page={detailPanelState.page - 1}
            pageSize={detailPanelState.pageSize}
            rowCount={detailPanelState.totalRow}
            onPageChange={(newPage) => setDetailPanelState({ ...detailPanelState, page: newPage + 1 })}
            onPageSizeChange={(newPageSize) =>
              setDetailPanelState({ ...detailPanelState, pageSize: newPageSize, page: 1 })
            }
            // onSelectionModelChange={(newSelectedRowId) => {
            //   handleRowSelection(newSelectedRowId);
            // }}
            getRowId={(rows) => rows.Id}
          // initialState={{ pinnedColumns: { left: ['id', 'MaterialCode'] } }}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

DetailPanelContent.propTypes = {
  row: PropTypes.object.isRequired,
};

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

      const res = await fgStockService.getFGStock(params);

      setFGStockState({
        ...fgStockState,
        data: res.Data ? [...res.Data] : [],
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
    { field: 'MaterialId', headerName: '', hide: true },
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
      renderCell: (params) => {
        if (params.value !== null) {
          return (
            params.value.toLocaleString("es-US")
          );
        }
      },
    },
  ];

  const getDetailPanelContent = React.useCallback(({ row }) => <DetailPanelContent row={row} />, []);

  const getDetailPanelHeight = React.useCallback(() => 450, []);

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
            <Grid item style={{ width: '10%' }}>
              <MuiButton text="excel" color="warning" onClick={fgStockService.downloadExcel} sx={{ mt: 1 }} />
            </Grid>
            <Grid item style={{ width: '20%' }}>
              <MuiSearchField
                variant="MaterialCode"
                label="product.product_code"
                onClick={fetchData}
                onChange={(e) => handleSearch(e.target.value, 'MaterialCode')}
              />
            </Grid>
            <Grid item style={{ width: '15%' }}>
              <MuiAutocomplete
                label={intl.formatMessage({ id: 'product.Model' })}
                fetchDataFunc={getModel}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'Model')}
                variant="standard"
              />
            </Grid>
            <Grid item style={{ width: '15%' }}>
              <MuiAutocomplete
                label={intl.formatMessage({ id: 'product.product_type' })}
                fetchDataFunc={getproductType}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'ProductType')}
                variant="standard"
              />
            </Grid>
            <Grid item style={{ width: '20%' }}>
              <MuiSearchField
                variant="Description"
                label="product.Description"
                onClick={fetchData}
                onChange={(e) => handleSearch(e.target.value, 'Description')}
              />
            </Grid>
            <Grid item style={{ width: '15%' }}>
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
        initialState={{ pinnedColumns: { left: ['id', 'MaterialCode', 'StockQty'] } }}
        rowThreshold={0}
        getDetailPanelHeight={getDetailPanelHeight}
        getDetailPanelContent={getDetailPanelContent}
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
