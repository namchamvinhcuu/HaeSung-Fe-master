import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls';
import { Grid, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { wipStockService } from '@services';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

const WIPStock = (props) => {
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
    const res = await wipStockService.getMaterialList(params);
    if (res && res.Data && isRendered)
      setState({
        ...state,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  }

  const getDetailPanelContent = React.useCallback(({ row }) => <DetailPanelContent row={row} />, []);

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
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        getRowId={(rows) => rows.MaterialId}
        initialState={{ pinnedColumns: { left: ['id', 'MaterialCode', 'StockQty'], right: ['action'] } }}
        rowThreshold={0}
        getDetailPanelHeight={() => 450}
        getDetailPanelContent={getDetailPanelContent}
      />
    </React.Fragment>
  );
};

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

      const res = await wipStockService.getLotStock(params);

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
    { field: 'Id', headerName: 'Id', width: 250 },
    {
      field: 'LotSerial',
      headerName: 'Lot Serial',
      width: 250,
    },

    {
      field: 'Qty',
      headerName: 'Qty',
      width: 200,
    },
    {
      field: 'QCResult',
      headerName: 'QC Result',
      width: 200,
      renderCell: (params) => {
        return params.row.QCResult == true ? (
          <Typography sx={{ fontSize: '14px' }}>
            <b>OK</b>
          </Typography>
        ) : (
          <Typography sx={{ fontSize: '14px', color: 'red' }}>
            <b>NG</b>
          </Typography>
        );
      },
    },
    {
      field: 'createdDate',
      headerName: 'Create Date',
      width: 250,
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
            getRowId={(rows) => rows.Id}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

DetailPanelContent.propTypes = {
  row: PropTypes.object.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(WIPStock);
