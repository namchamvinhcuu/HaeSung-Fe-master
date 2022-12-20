import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiDateField, MuiSearchField } from '@controls';
import Grid from '@mui/material/Grid';
import { workOrderService, actualService } from '@services';
import { addDays, ErrorAlert } from '@utils';
import _ from 'lodash';
import moment from 'moment';
import { useIntl } from 'react-intl';
import { useModal, useModal2 } from '@basesShared';
import ActualDialog from './ActualDialog';
import { Button } from '@mui/material';
import PopupActualScanLots from './PopupActualScanLots';

const Actual = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const initStartDate = new Date();
  const { isShowing, toggle } = useModal();
  const [woId, setWoId] = useState(0);
  const { isShowing2, toggle2 } = useModal2();
  const [woIdProps, setWOIdProps] = useState('');
  const [updateData, setUpdateData] = useState({});
  const [disabledBtnParent, setDisabledBtnParent] = useState(false);

  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
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
      /*flex: 0.7,*/ width: 120,
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
      field: 'WOProcess',
      headerName: 'Process',
      /*flex: 0.7,*/ width: 100,
      renderCell: (params) => {
        return <span>{params.row.WOProcess === false ? 'Inject' : 'Assy'}</span>;
      },
    },
    {
      field: 'OrderQty',
      headerName: intl.formatMessage({ id: 'work_order.OrderQty' }),
      /*flex: 0.7,*/ width: 100,
    },
    {
      field: 'ActualQty',
      headerName: intl.formatMessage({ id: 'work_order.ActualQty' }),
      /*flex: 0.7,*/ width: 100,
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
    {
      field: 'WOProcessAction',
      headerName: 'Action',
      /*flex: 0.7,*/ width: 80,
      renderCell: (params) => {
        return params.row.WOProcess === true ? (
          <Button variant="contained" color="success" size="small" onClick={() => togglePopup(params)}>
            Scan
          </Button>
        ) : (
          ''
        );
      },
    },
  ];

  useEffect(() => {
    fetchData();
    return () => (isRendered = false);
  }, [state.page, state.pageSize, state.searchData.showDelete]);

  useEffect(() => {
    if (!_.isEmpty(updateData)) {
      let newArr = [...state.data];
      const index = _.findIndex(newArr, function (o) {
        return o.WoId == updateData.WoId;
      });
      if (index !== -1) {
        newArr[index] = updateData;
      }

      setState({ ...state, data: [...newArr] });
    }
  }, [updateData]);

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

      const res = await actualService.get(params);

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
  const togglePopup = (params) => {
    toggle2();
    setWOIdProps(params.row.WoId);
  };
  console.log(woId, disabledBtnParent);
  return (
    <React.Fragment>
      <Grid container spacing={2.5} justifyContent="space-between" alignItems="width-end">
        <Grid item xs={4}>
          <MuiButton
            text="create"
            color="success"
            disabled={woId == 0 ? true : disabledBtnParent}
            //disabled={disabledBtnParent}
            onClick={() => toggle()}
          />
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
        //disableSelectionOnClick
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
        onRowClick={(newSelectedRowId) => {
          setWoId(newSelectedRowId.row.WoId);
          setDisabledBtnParent(
            newSelectedRowId.row.WOProcess === true ? (newSelectedRowId.row.isChecked ? false : true) : false
          );
        }}
      />

      <ActualDialog isOpen={isShowing} onClose={toggle} woId={woId} setUpdateData={setUpdateData} />
      <PopupActualScanLots
        isShowing={isShowing2}
        hide={toggle2}
        woIdProps={woIdProps}
        fetchDataParent={fetchData}
        setDisabledBtnParent={setDisabledBtnParent}
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

export default connect(mapStateToProps, mapDispatchToProps)(Actual);
