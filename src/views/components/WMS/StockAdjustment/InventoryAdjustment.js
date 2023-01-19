import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { useModal, useModal2 } from '@basesShared';
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiDateField } from '@controls';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';
import { Badge, FormControlLabel, Grid, IconButton, Switch, Button, Typography } from '@mui/material';
import { stockAdjustmentService } from '@services';
import { addDays, ErrorAlert, SuccessAlert } from '@utils';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import InventoryAdjustmentgDialog from './InventoryAdjustmentgDialog';
import InventoryAdjustmentDetail from './InventoryAdjustmentDetail';
// import FGPackingDialog from './FGPackingDialog';
// import FGPackingLotDetail from './FGPackingLotDetail';
// import FGPackingLotPrintDialog from './FGPackingLotPrintDialog';

const InventoryAdjustment = (props) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const { isShowing, toggle } = useModal();
  const { isShowing2, toggle2 } = useModal2();
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      AreaId: null,
      StartDate: addDays(new Date(), -30),
      EndDate: new Date(),
      showDelete: true,
    },
  });

  const [newData, setNewData] = useState({});
  const [updateData, setUpdateData] = useState({});
  const [rowData, setRowData] = useState({});
  const [StockAdjustmentId, setStockAdjustmentId] = useState(null);
  const [DataPrint, setDataPrint] = useState([]);

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
      field: 'action',
      headerName: '',
      witdh: 90,
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center">
            <Grid item xs={6} style={{ textAlign: 'center' }}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ '&:hover': { border: '1px solid red' } }]}
                onClick={() => handleDelete(params.row)}
                disabled={params.row.AdjustmentStatus}
              >
                {params.row.isActived ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
              </IconButton>
            </Grid>
            <Grid item xs={6} style={{ textAlign: 'center' }}>
              <IconButton
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ '&:hover': { border: '1px solid orange' } }]}
                onClick={() => handleUpdate(params.row)}
                disabled={params.row.AdjustmentStatus}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },
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
      // valueFormatter: (params) => (params?.value ? 'Done' : 'Yet'),
      renderCell: (params) => {
        return params.row.AdjustmentStatus ? (
          <Typography sx={{ fontSize: 14, width: '100%' }}>Finished</Typography>
        ) : (
          <Button
            variant="contained"
            sx={{ lineHeight: 1, padding: '5px 10px' }}
            color={'success'}
            size="small"
            onClick={() => handleFinish(params.row)}
          >
            Finish
          </Button>
        );
      },
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

  useEffect(() => {
    if (!_.isEmpty(newData) && isRendered) {
      const data = [newData, ...state.data];
      if (data.length > state.pageSize) {
        data.pop();
      }
      setState({
        ...state,
        data: [...data],
        totalRow: state.totalRow + 1,
      });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(updateData) && !_.isEqual(updateData, rowData) && isRendered) {
      let newArr = [...state.data];
      const index = _.findIndex(newArr, function (o) {
        return o.StockAdjustmentId == updateData.StockAdjustmentId;
      });
      if (index !== -1) {
        newArr[index] = updateData;
      }

      setState({ ...state, data: [...newArr] });

      let newArrPrint = newArr.filter((x) => x.isPrint);
      setDataPrint(newArrPrint);
    }
  }, [updateData]);

  //handle
  const handleDelete = async (item) => {
    if (
      window.confirm(
        intl.formatMessage({ id: item.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted' })
      )
    ) {
      try {
        let res = await stockAdjustmentService.deleteSA(item);

        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }));
          await fetchData();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleFinish = async (item) => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_finish' }))) {
      try {
        let res = await stockAdjustmentService.finishSA(item);

        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }));
          // await fetchData();
          setUpdateData(res.Data);
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleAdd = () => {
    setMode(CREATE_ACTION);
    setRowData();
    toggle();
  };

  const handleUpdate = (row) => {
    setMode(UPDATE_ACTION);
    setRowData({ ...row });
    toggle();
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
          <MuiButton text="create" color="success" onClick={handleAdd} sx={{ mr: 1 }} />
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
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`;
        }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />

      <InventoryAdjustmentgDialog
        initModal={rowData}
        isOpen={isShowing}
        onClose={toggle}
        setNewData={setNewData}
        setUpdateData={setUpdateData}
        mode={mode}
      />

      <InventoryAdjustmentDetail StockAdjustmentId={StockAdjustmentId} />
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

export default connect(mapStateToProps, mapDispatchToProps)(InventoryAdjustment);
