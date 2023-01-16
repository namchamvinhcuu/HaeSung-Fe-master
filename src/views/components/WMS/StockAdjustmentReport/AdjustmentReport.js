import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { useModal } from '@basesShared';
import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiDateField } from '@controls';
import { FormControlLabel, Grid, Switch } from '@mui/material';
import { stockAdjustmentService } from '@services';
import { addDays, ErrorAlert } from '@utils';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import AdjustmentReportPrintDialog from './AdjustmentReportPrintDialog';
import InventoryAdjustmentDetail from './InventoryAdjustmentDetail';

const AdjustmentReport = (props) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const { isShowing, toggle } = useModal();
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      AreaId: null,
      StartDate: new Date(),
      EndDate: addDays(new Date(), 7),
      showDelete: true,
    },
  });

  const [StockAdjustmentId, setStockAdjustmentId] = useState(null);
  const [DataPrint, setDataPrint] = useState({});

  const columns = [
    {
      field: 'id',
      headerName: '',
      flex: 0.1,
      align: 'center',
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.StockAdjustmentId) + 1 + (state.page - 1) * state.pageSize,
    },
    { field: 'row_version', hide: true },
    {
      field: 'StockAdjustmentId',
      headerName: intl.formatMessage({ id: 'stockAdjustment.StockAdjustmentId' }),
      flex: 0.6,
    },
    {
      field: 'Requester',
      headerName: intl.formatMessage({ id: 'stockAdjustment.Requester' }),
      flex: 0.5,
    },
    {
      field: 'AreaName',
      headerName: intl.formatMessage({ id: 'stockAdjustment.AreaId' }),
      flex: 0.6,
    },
    {
      field: 'AdjustmentStatus',
      headerName: intl.formatMessage({ id: 'stockAdjustment.AdjustmentStatus' }),
      flex: 0.4,
      valueFormatter: (params) => (params?.value ? 'Done' : 'Yet'),
    },
    {
      field: 'DueDate',
      headerName: intl.formatMessage({ id: 'stockAdjustment.DueDate' }),
      flex: 0.5,
      valueFormatter: (params) => (params?.value ? moment(params?.value).format('YYYY-MM-DD') : null),
    },
    {
      field: 'Remark',
      headerName: intl.formatMessage({ id: 'stockAdjustment.Remark' }),
      flex: 0.6,
    },
    {
      field: 'createdName',
      headerName: intl.formatMessage({ id: 'general.createdName' }),
      flex: 0.4,
    },
    {
      field: 'createdDate',
      headerName: intl.formatMessage({ id: 'general.createdDate' }),
      flex: 0.5,
      valueFormatter: (params) =>
        params?.value ? moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss') : null,
    },
    {
      field: 'modifiedName',
      headerName: intl.formatMessage({ id: 'general.modifiedName' }),
      flex: 0.4,
    },
    {
      field: 'modifiedDate',
      headerName: intl.formatMessage({ id: 'general.modifiedDate' }),
      flex: 0.5,
      valueFormatter: (params) =>
        params?.value ? moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss') : null,
    },
  ];

  useEffect(() => {
    fetchData();
    return () => {
      isRendered = false;
    };
  }, [state.page, state.pageSize, state.searchData.showDelete]);

  const handlePrint = () => {
    if (StockAdjustmentId) {
      let data = state.data.find((x) => x.StockAdjustmentId == StockAdjustmentId);
      setDataPrint(data);
      toggle();
    }
  };

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
    let flag = true;
    let message = '';
    const checkObj = { ...state.searchData };
    _.forOwn(checkObj, (value, key) => {
      switch (key) {
        case 'StartSearchingDate':
          if (value == 'Invalid Date') {
            message = 'general.StartSearchingDate_invalid';
            flag = false;
          }
          break;
        case 'DeliveryTime':
          if (value == 'Invalid Date') {
            message = 'general.EndSearchingDate_invalid';
            flag = false;
          }
          break;

        default:
          break;
      }
    });

    if (flag && isRendered) {
      setState({ ...state, isLoading: true });
      setStockAdjustmentId(null);

      const params = {
        page: state.page,
        pageSize: state.pageSize,
        keyWord: state.searchData.keyWord,
        AreaId: state.searchData.AreaId,
        StartDate: state.searchData.StartDate,
        EndDate: state.searchData.EndDate,
        isActived: state.searchData.showDelete,
      };
      const res = await stockAdjustmentService.getSA(params);

      if (res && isRendered)
        setState({
          ...state,
          data: res.Data ?? [],
          totalRow: res.TotalRow,
          isLoading: false,
        });
    } else {
      ErrorAlert(intl.formatMessage({ id: message }));
    }
  }

  return (
    <React.Fragment>
      <Grid container direction="row" spacing={2} justifyContent="space-between" alignItems="width-end">
        <Grid item xs={5}>
          <MuiButton text="print" color="secondary" onClick={handlePrint} disabled={StockAdjustmentId ? false : true} />
        </Grid>
        <Grid item>
          <MuiAutocomplete
            label={intl.formatMessage({ id: 'stockAdjustment.AreaId' })}
            fetchDataFunc={stockAdjustmentService.getArea}
            displayLabel="commonDetailName"
            displayValue="commonDetailId"
            onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'AreaId')}
            sx={{ width: 250 }}
            variant="standard"
          />
        </Grid>
        <Grid item xs>
          <MuiDateField
            disabled={state.isLoading}
            label={intl.formatMessage({ id: 'general.StartSearchingDate' })}
            value={state.searchData.StartDate}
            onChange={(e) => handleSearch(e, 'StartDate')}
            variant="standard"
          />
        </Grid>
        <Grid item xs>
          <MuiDateField
            disabled={state.isLoading}
            label={intl.formatMessage({ id: 'general.EndSearchingDate' })}
            value={state.searchData.EndDate}
            onChange={(e) => handleSearch(e, 'EndDate')}
            variant="standard"
          />
        </Grid>
        <Grid item>
          <MuiButton text="search" color="info" onClick={fetchData} sx={{ mt: 1 }} />
        </Grid>
        <Grid item>
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Switch
                defaultChecked={true}
                color="primary"
                onChange={(e) => handleSearch(e.target.checked, 'showDelete')}
              />
            }
            label={intl.formatMessage({
              id: state.searchData.showDelete ? 'general.data_actived' : 'general.data_deleted',
            })}
          />
        </Grid>
      </Grid>
      <MuiDataGrid
        showLoading={state.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={columns}
        rows={state.data}
        gridHeight={736}
        page={state.page - 1}
        pageSize={state.pageSize}
        rowCount={state.totalRow}
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        getRowId={(rows) => rows.StockAdjustmentId}
        onSelectionModelChange={(newSelectedRowId) => setStockAdjustmentId(newSelectedRowId[0])}
        onCellClick={(param, e) => (e.defaultMuiPrevented = param.field === 'action')}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />

      <InventoryAdjustmentDetail StockAdjustmentId={StockAdjustmentId} />

      <AdjustmentReportPrintDialog isOpen={isShowing} onClose={toggle} DataPrint={DataPrint} />
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

export default connect(mapStateToProps, mapDispatchToProps)(AdjustmentReport);
