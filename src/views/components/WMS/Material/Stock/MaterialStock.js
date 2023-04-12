import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiSearchField } from '@controls';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import { materialStockService } from '@services';
import { useIntl } from 'react-intl';
import moment from 'moment';

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

      const res = await materialStockService.getLotStock(params);

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
    {
      field: 'Id',
      headerName: 'Id',
      width: 150,
    },

    {
      field: 'LotSerial',
      headerName: 'Lot Serial',
      width: 250,
    },

    {
      field: 'Qty',
      headerName: 'Qty',
      width: 100,
    },

    {
      field: 'LocationCode',
      headerName: 'Bin',
      width: 250,
    },
    {
      field: 'WarehouseTypeName',
      headerName: 'Warehouse Type Name',
      width: 250,
    },
    {
      field: 'LotStatus',
      headerName: 'Lot Status',
      width: 150,
      renderCell: (params) => {
        return <Typography sx={{ fontSize: 14 }}>{params.row.LotStatus ? 'Received' : 'Not received'}</Typography>;
      },
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
      <Paper sx={{ flex: 1, mx: 'auto', width: '80%', p: 1 }}>
        <Stack direction="column" spacing={1} sx={{ height: 1 }}>
          <Typography variant="h6">{`Material Code: ${rowProp.MaterialCode}`}</Typography>
          <Grid container>
            <Grid item md={6}>
              <Typography variant="body2" align="right" color="textSecondary"></Typography>
              <Typography variant="body1">Type: {rowProp.MaterialTypeName}</Typography>
              <Typography variant="body1">Supplier: {rowProp.SupplierName}</Typography>
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

const MaterialStock = (props) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      keyWord: '',
      MaterialType: null,
      Unit: null,
      SupplierId: null,
      showDelete: true,
    },
  });

  const columns = [
    {
      field: 'id',
      headerName: '',
      width: 70,
      align: 'center',
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.MaterialId) + 1 + (state.page - 1) * state.pageSize,
    },
    { field: 'MaterialId', hide: true },
    { field: 'row_version', hide: true },
    {
      field: 'MaterialCode',
      headerName: intl.formatMessage({ id: 'material.MaterialCode' }),
      width: 190,
    },
    {
      field: 'StockQty',
      align: 'right',
      headerName: intl.formatMessage({ id: 'material.StockQty' }),
      width: 120,
    },
    {
      field: 'MaterialTypeName',
      headerName: intl.formatMessage({ id: 'material.MaterialType' }),
      width: 150,
    },
    {
      field: 'UnitName',
      headerName: intl.formatMessage({ id: 'material.Unit' }),
      width: 120,
    },
    // {
    //   field: 'QCMasterCode',
    //   headerName: intl.formatMessage({ id: 'material.QCMasterId' }),
    //   width: 150,
    // },
    {
      field: 'SupplierName',
      headerName: intl.formatMessage({ id: 'material.SupplierId' }),
      width: 200,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.SupplierName ?? ''} className="col-text-elip">
            <Typography sx={{ fontSize: 14 }}>{params.row.SupplierName}</Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'Description',
      headerName: intl.formatMessage({ id: 'material.Description' }),
      width: 200,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.Description ?? ''} className="col-text-elip">
            <Typography sx={{ fontSize: 14 }}>{params.row.Description}</Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'Grade',
      headerName: intl.formatMessage({ id: 'material.Grade' }),
      width: 120,
    },
    {
      field: 'Color',
      headerName: intl.formatMessage({ id: 'material.Color' }),
      width: 120,
    },
    {
      field: 'ResinType',
      headerName: intl.formatMessage({ id: 'material.ResinType' }),
      width: 120,
    },
    {
      field: 'FlameClass',
      headerName: intl.formatMessage({ id: 'material.FlameClass' }),
      width: 120,
    },
  ];

  //useEffect
  useEffect(() => {
    fetchData();
    return () => {
      isRendered = false;
    };
  }, [state.page, state.pageSize, state.searchData.showDelete]);

  const handleSearch = (e, inputName) => {
    let newSearchData = { ...state.searchData };
    newSearchData[inputName] = e;
    if (inputName == 'showDelete') {
      setState({ ...state, page: 1, searchData: { ...newSearchData } });
    } else {
      setState({ ...state, searchData: { ...newSearchData } });
    }
  };

  async function fetchData() {
    setState({ ...state, isLoading: true });
    const params = {
      page: state.page,
      pageSize: state.pageSize,
      keyWord: state.searchData.keyWord,
      MaterialType: state.searchData.MaterialType,
      Unit: state.searchData.Unit,
      SupplierId: state.searchData.SupplierId,
      showDelete: state.searchData.showDelete,
    };
    const res = await materialStockService.getMaterialList(params);
    if (res && res.Data && isRendered)
      setState({
        ...state,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  }

  const getDetailPanelContent = React.useCallback(({ row }) => <DetailPanelContent row={row} />, []);

  const getDetailPanelHeight = React.useCallback(() => 450, []);

  return (
    <React.Fragment>
      <Grid container direction="row" justifyContent="space-between" alignItems="width-end">
        <Grid item xs={3}></Grid>
        <Grid item xs>
          <Grid container columnSpacing={2} direction="row" justifyContent="flex-end" alignItems="flex-end">
            <Grid item style={{ width: '10%' }}>
              <MuiButton text="excel" color="warning" onClick={materialStockService.downloadExcel} sx={{ mt: 1 }} />
            </Grid>
            <Grid item style={{ width: '18%' }}>
              <MuiSearchField
                variant="keyWord"
                label="general.code"
                onClick={fetchData}
                onChange={(e) => handleSearch(e.target.value, 'keyWord')}
              />
            </Grid>
            <Grid item style={{ width: '18%' }}>
              <MuiAutocomplete
                label={intl.formatMessage({ id: 'material.MaterialType' })}
                fetchDataFunc={materialStockService.getMaterialType}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'MaterialType')}
                variant="standard"
              />
            </Grid>
            <Grid item style={{ width: '15%' }}>
              <MuiAutocomplete
                label={intl.formatMessage({ id: 'material.Unit' })}
                fetchDataFunc={materialStockService.getUnit}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'Unit')}
                variant="standard"
              />
            </Grid>
            <Grid item style={{ width: '18%' }}>
              <MuiAutocomplete
                label={intl.formatMessage({ id: 'material.SupplierId' })}
                fetchDataFunc={materialStockService.getSupplier}
                displayLabel="SupplierName"
                displayValue="SupplierId"
                onChange={(e, item) => handleSearch(item ? item.SupplierId ?? null : null, 'SupplierId')}
                variant="standard"
                fullWidth
              />
            </Grid>
            <Grid item style={{ width: '15%' }}>
              <MuiButton text="search" color="info" onClick={fetchData} sx={{ mr: 3, mb: 1 }} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={state.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={columns}
        rows={state.data}
        page={state.page - 1}
        pageSize={state.pageSize}
        rowCount={state.totalRow}
        rowsPerPageOptions={[5, 10, 20]}
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        onPageSizeChange={(newPageSize) => setState({ ...state, pageSize: newPageSize, page: 1 })}
        getRowId={(rows) => rows.MaterialId}
        // getRowClassName={(params) => {
        //   if (_.isEqual(params.row, newData)) return `Mui-created`;
        // }}
        initialState={{ pinnedColumns: { left: ['id', 'MaterialCode', 'StockQty'], right: ['action'] } }}
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

export default connect(mapStateToProps, mapDispatchToProps)(MaterialStock);
