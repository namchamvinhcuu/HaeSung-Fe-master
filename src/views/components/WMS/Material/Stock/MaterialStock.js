import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS';
import { User_Operations } from '@appstate/user';
import { Store } from '@appstate';

import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiSearchField } from '@controls';
import { FormControlLabel, Grid, IconButton, Switch, Tooltip, Typography } from '@mui/material';
import { materialStockService } from '@services';
import moment from 'moment';
import { useIntl } from 'react-intl';

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
      width: 150,
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
    {
      field: 'QCMasterCode',
      headerName: intl.formatMessage({ id: 'material.QCMasterId' }),
      width: 150,
    },
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

  return (
    <React.Fragment>
      <Grid container direction="row" justifyContent="space-between" alignItems="width-end">
        <Grid item xs={3}></Grid>
        <Grid item xs>
          <Grid container columnSpacing={2} direction="row" justifyContent="flex-end" alignItems="flex-end">
            <Grid item style={{ width: '21%' }}>
              <MuiSearchField
                variant="keyWord"
                label="general.code"
                onClick={fetchData}
                onChange={(e) => handleSearch(e.target.value, 'keyWord')}
              />
            </Grid>
            <Grid item style={{ width: '21%' }}>
              <MuiAutocomplete
                label={intl.formatMessage({ id: 'material.MaterialType' })}
                fetchDataFunc={materialStockService.getMaterialType}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'MaterialType')}
                variant="standard"
              />
            </Grid>
            <Grid item style={{ width: '21%' }}>
              <MuiAutocomplete
                label={intl.formatMessage({ id: 'material.Unit' })}
                fetchDataFunc={materialStockService.getUnit}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'Unit')}
                variant="standard"
              />
            </Grid>
            <Grid item style={{ width: '21%' }}>
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
            <Grid item>
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
