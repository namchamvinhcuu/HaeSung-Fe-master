import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiDateField, MuiSearchField } from '@controls';
import Grid from '@mui/material/Grid';
import { mmsReportService, workOrderService } from '@services';
import { addDays, ErrorAlert } from '@utils';
import _ from 'lodash';
import moment from 'moment';
import { useIntl } from 'react-intl';
import { useModal } from '@basesShared';
import MMSReportLotGrid from './MMSReportLotGrid';

const MMSReport = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const initStartDate = new Date();
  const [woId, setWoId] = useState(0);
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 7,
    searchData: {
      WoCode: '',
      MaterialId: 0,
      StartSearchingDate: initStartDate,
      EndSearchingDate: addDays(initStartDate, 30),
      showDelete: true,
    },
  });

  const columns = [
    { field: 'WoId', headerName: '', hide: true },
    {
      field: 'id',
      headerName: '',
      width: 100,
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.WoId) + 1 + (state.page - 1) * state.pageSize,
    },
    {
      field: 'WoCode',
      headerName: intl.formatMessage({ id: 'work_order.WoCode' }),
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: 'MaterialCode',
      headerName: intl.formatMessage({ id: 'work_order.MaterialCode' }),
      /*flex: 0.7,*/ width: 120,
    },
    {
      field: 'FPoMasterCode',
      headerName: intl.formatMessage({ id: 'work_order.FPoMasterCode' }),
      /*flex: 0.7,*/ width: 120,
    },
    {
      field: 'OrderQty',
      headerName: intl.formatMessage({ id: 'work_order.OrderQty' }),
      /*flex: 0.7,*/ width: 120,
      renderCell: (params) => {
        if (params.value !== null) {
          return (
            params.value.toLocaleString()
          );
        }
      },
    },
    {
      field: 'ActualQty',
      headerName: intl.formatMessage({ id: 'work_order.ActualQty' }),
      /*flex: 0.7,*/ width: 120,
      renderCell: (params) => {
        if (params.value !== null) {
          return (
            params.value.toLocaleString()
          );
        }
      },
    },
    {
      field: 'StartDate',
      headerName: intl.formatMessage({ id: 'work_order.StartDate' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
    {
      field: 'createdName',
      headerName: intl.formatMessage({ id: 'general.createdName' }),
      width: 150,
    },
    {
      field: 'createdDate',
      headerName: intl.formatMessage({ id: 'general.created_date' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
    {
      field: 'modifiedName',
      headerName: intl.formatMessage({ id: 'general.modifiedName' }),
      width: 150,
    },
    {
      field: 'modifiedDate',
      headerName: intl.formatMessage({ id: 'general.modified_date' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
  ];

  useEffect(() => {
    fetchData();
    return () => (isRendered = false);
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

  const fetchData = async () => {
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
      setState({
        ...state,
        isLoading: true,
      });

      const params = {
        page: state.page,
        pageSize: state.pageSize,
        WoCode: state.searchData.WoCode.trim(),
        MaterialId: state.searchData.MaterialId,
        StartSearchingDate: state.searchData.StartSearchingDate,
        EndSearchingDate: state.searchData.EndSearchingDate,
        isActived: state.searchData.showDelete,
      };

      const res = await mmsReportService.get(params);

      if (res && isRendered)
        setState({
          ...state,
          data: !res.Data ? [] : [...res.Data],
          totalRow: res.TotalRow,
          isLoading: false,
        });
    } else {
      ErrorAlert(intl.formatMessage({ id: message }));
    }
  };

  const getSearchMaterialArr = async () => {
    const res = await workOrderService.getSearchMaterialArr(0, 0);
    return res;
  };

  const handleDownload = async (e) => {
    try {
      const params = {
        WoCode: state.searchData.WoCode.trim(),
        MaterialId: state.searchData.MaterialId,
        StartSearchingDate: state.searchData.StartSearchingDate,
        EndSearchingDate: state.searchData.EndSearchingDate,
      };

      await mmsReportService.downloadWOReport(params);
    } catch (error) {
      console.log(`ERROR: ${error}`);
    }
  };

  return (
    <React.Fragment>
      <Grid container spacing={2.5} justifyContent="space-between" alignItems="width-end">
        <Grid item xs={4}>
          <MuiButton text="excel" color="success" onClick={handleDownload} />
        </Grid>
        <Grid item x={{ width: 220 }}>
          <MuiSearchField
            label="work_order.WoCode"
            name="WoCode"
            onClick={fetchData}
            onChange={(e) => handleSearch(e.target.value, 'WoCode')}
            sx={{ width: 200 }}
          />
        </Grid>
        <Grid item sx={{ width: 220 }}>
          <MuiAutocomplete
            label={intl.formatMessage({ id: 'work_order.MaterialCode' })}
            fetchDataFunc={getSearchMaterialArr}
            displayLabel="MaterialCode"
            displayValue="MaterialId"
            displayGroup="GroupMaterial"
            onChange={(e, item) => handleSearch(item ? item.MaterialId : null, 'MaterialId')}
            variant="standard"
          />
        </Grid>
        <Grid item sx={{ width: 220 }}>
          <MuiDateField
            disabled={state.isLoading}
            label={intl.formatMessage({ id: 'general.StartSearchingDate' })}
            value={state.searchData.StartSearchingDate}
            onChange={(e) => handleSearch(e, 'StartSearchingDate')}
            variant="standard"
          />
        </Grid>
        <Grid item sx={{ width: 220 }}>
          <MuiDateField
            disabled={state.isLoading}
            label={intl.formatMessage({ id: 'general.EndSearchingDate' })}
            value={state.searchData.EndSearchingDate}
            onChange={(e) => handleSearch(e, 'EndSearchingDate')}
            variant="standard"
          />
        </Grid>
        <Grid item>
          <MuiButton text="search" color="info" onClick={fetchData} />
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={state.isLoading}
        isPagingServer={true}
        headerHeight={45}
        gridHeight={736}
        columns={columns}
        rows={state.data}
        page={state.page - 1}
        pageSize={state.pageSize}
        rowCount={state.totalRow}
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        getRowId={(rows) => rows.WoId}
        onSelectionModelChange={(newSelectedRowId) => setWoId(newSelectedRowId[0])}
      />

      <MMSReportLotGrid woId={woId} />
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

export default connect(mapStateToProps, mapDispatchToProps)(MMSReport);
