import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiDateField, MuiSearchField } from '@controls';
import { WorkOrderDto } from '@models';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';
import { FormControlLabel, Switch } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { workOrderService } from '@services';
import { addDays, ErrorAlert, SuccessAlert } from '@utils';
import _ from 'lodash';
import moment from 'moment';
import { useIntl } from 'react-intl';
import WorkOrderDialog from './WorkOrderDialog';

const WorkOrder = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const initStartDate = new Date();

  // console.log('re-render')

  const [workOrderState, setWorkOrderState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      ...WorkOrderDto,
      StartSearchingDate: initStartDate,
      EndSearchingDate: addDays(initStartDate, 30),
    },
  });

  const [mode, setMode] = useState(CREATE_ACTION);

  const [selectedRow, setSelectedRow] = useState({
    ...WorkOrderDto,
  });

  const [newData, setNewData] = useState({ ...WorkOrderDto });

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const [showActivedData, setShowActivedData] = useState(true);

  const toggleDialog = (mode) => {
    if (mode === CREATE_ACTION) {
      setMode(CREATE_ACTION);
    } else {
      setMode(UPDATE_ACTION);
    }
    setIsOpenDialog(!isOpenDialog);
  };

  const handleshowActivedData = async (event) => {
    setShowActivedData(event.target.checked);
    if (!event.target.checked) {
      setWorkOrderState({
        ...workOrderState,
        page: 1,
      });
    }
  };

  const handleRowSelection = (arrIds) => {
    const rowSelected = workOrderState.data.filter(function (item) {
      return item.WoId === arrIds[0];
    });

    if (rowSelected && rowSelected.length > 0) {
      setSelectedRow({ ...rowSelected[0] });
    } else {
      setSelectedRow({ ...WorkOrderDto });
    }
  };

  const handleDelete = async (workOrder) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: showActivedData ? 'general.confirm_delete' : 'general.confirm_redo_deleted',
        })
      )
    ) {
      try {
        let res = await workOrderService.handleDelete(workOrder);
        if (res) {
          if (res && res.HttpResponseCode === 200) {
            await fetchData();
            SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
          } else {
            ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          }
        } else {
          ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const changeSearchData = (e, inputName) => {
    let newSearchData = { ...workOrderState.searchData };

    newSearchData[inputName] = e;

    switch (inputName) {
      case 'StartSearchingDate':
      case 'EndSearchingDate':
        newSearchData[inputName] = e;
        break;
      case 'MaterialId':
        newSearchData[inputName] = e ? e.MaterialId : WorkOrderDto.MaterialId;
        newSearchData['MaterialCode'] = e ? e.MaterialCode : WorkOrderDto.MaterialCode;
        break;

      default:
        newSearchData[inputName] = e.target.value;
        break;
    }

    setWorkOrderState({
      ...workOrderState,
      searchData: { ...newSearchData },
    });
  };

  const getSearchMaterialArr = async () => {
    const res = await workOrderService.getSearchMaterialArr(0, 0);
    return res;
  };

  const fetchData = async () => {
    let flag = true;
    let message = '';
    const checkObj = { ...workOrderState.searchData };
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
      setWorkOrderState({
        ...workOrderState,
        isLoading: true,
      });

      const params = {
        page: workOrderState.page,
        pageSize: workOrderState.pageSize,
        WoCode: workOrderState.searchData.WoCode.trim(),
        MaterialId: workOrderState.searchData.MaterialId,
        StartSearchingDate: workOrderState.searchData.StartSearchingDate,
        EndSearchingDate: workOrderState.searchData.EndSearchingDate,
        isActived: showActivedData,
      };

      const res = await workOrderService.get(params);

      if (res && isRendered)
        setWorkOrderState({
          ...workOrderState,
          data: !res.Data ? [] : [...res.Data],
          totalRow: res.TotalRow,
          isLoading: false,
        });
    } else {
      ErrorAlert(intl.formatMessage({ id: message }));
    }
  };

  useEffect(() => {
    fetchData();

    return () => {
      isRendered = false;
    };
  }, [workOrderState.page, workOrderState.pageSize, showActivedData]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, WorkOrderDto)) {
      const data = [newData, ...workOrderState.data];
      if (data.length > workOrderState.pageSize) {
        data.pop();
      }
      if (isRendered)
        setWorkOrderState({
          ...workOrderState,
          data: [...data],
          totalRow: workOrderState.totalRow + 1,
        });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, WorkOrderDto)) {
      let newArr = [...workOrderState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.WoId == selectedRow.WoId;
      });
      if (index !== -1) {
        newArr[index] = selectedRow;
      }

      setWorkOrderState({
        ...workOrderState,
        data: [...newArr],
      });
    }
  }, [selectedRow]);

  const columns = [
    { field: 'WoId', headerName: '', hide: true },

    {
      field: 'id',
      headerName: '',
      width: 100,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.WoId) + 1 + (workOrderState.page - 1) * workOrderState.pageSize,
    },

    {
      field: 'action',
      headerName: '',
      width: 80,
      // headerAlign: 'center',
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center">
            <Grid item xs={6}>
              <IconButton
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ '&:hover': { border: '1px solid orange' } }]}
                onClick={() => {
                  toggleDialog(UPDATE_ACTION);
                }}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Grid>

            <Grid item xs={6}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ '&:hover': { border: '1px solid red' } }]}
                onClick={() => handleDelete(params.row)}
              >
                {showActivedData ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
              </IconButton>
            </Grid>
          </Grid>
        );
      },
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
      field: 'OrderQty',
      headerName: intl.formatMessage({ id: 'work_order.OrderQty' }),
      /*flex: 0.7,*/ width: 120,
    },

    {
      field: 'ActualQty',
      headerName: intl.formatMessage({ id: 'work_order.ActualQty' }),
      /*flex: 0.7,*/ width: 120,
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

  return (
    <React.Fragment>
      <Grid container spacing={2} justifyContent="flex-end" alignItems="flex-end">
        <Grid item xs={1.5}>
          <MuiButton
            text="create"
            color="success"
            onClick={() => {
              toggleDialog(CREATE_ACTION);
            }}
          />
        </Grid>

        <Grid item xs>
          <MuiSearchField
            label="work_order.WoCode"
            name="WoCode"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, 'WoCode')}
          />
        </Grid>

        <Grid item xs>
          <MuiAutocomplete
            label={intl.formatMessage({ id: 'work_order.MaterialCode' })}
            fetchDataFunc={getSearchMaterialArr}
            displayLabel="MaterialCode"
            displayValue="MaterialId"
            displayGroup="GroupMaterial"
            value={
              workOrderState.searchData.MaterialId !== 0
                ? {
                    MaterialId: workOrderState.searchData.MaterialId,
                    MaterialCode: workOrderState.searchData.MaterialCode,
                  }
                : null
            }
            onChange={(e, item) => {
              changeSearchData(item ?? null, 'MaterialId');
            }}
            variant="standard"
          />
        </Grid>

        <Grid item>
          <MuiDateField
            disabled={workOrderState.isLoading}
            label={intl.formatMessage({
              id: 'general.StartSearchingDate',
            })}
            value={workOrderState.searchData.StartSearchingDate}
            onChange={(e) => {
              changeSearchData(e, 'StartSearchingDate');
            }}
            variant="standard"
          />
        </Grid>

        <Grid item xs>
          <MuiDateField
            disabled={workOrderState.isLoading}
            label={intl.formatMessage({
              id: 'general.EndSearchingDate',
            })}
            value={workOrderState.searchData.EndSearchingDate}
            onChange={(e) => {
              changeSearchData(e, 'EndSearchingDate');
            }}
            variant="standard"
          />
        </Grid>

        <Grid item xs={2.5}>
          <Grid container justifyContent="space-around" alignItems="flex-end">
            <Grid item>
              <MuiButton text="search" color="info" onClick={fetchData} />
            </Grid>

            <Grid item>
              <FormControlLabel
                sx={{ mb: 0, ml: '1px' }}
                control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleshowActivedData(e)} />}
                label={showActivedData ? 'Actived' : 'Deleted'}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={workOrderState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        gridHeight={736}
        columns={columns}
        rows={workOrderState.data}
        page={workOrderState.page - 1}
        pageSize={workOrderState.pageSize}
        rowCount={workOrderState.totalRow}
        onPageChange={(newPage) => {
          setDeliveryOrderState({ ...workOrderState, page: newPage + 1 });
        }}
        getRowId={(rows) => rows.WoId}
        onSelectionModelChange={(newSelectedRowId) => handleRowSelection(newSelectedRowId)}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />

      <WorkOrderDialog
        setNewData={setNewData}
        setUpdateData={setSelectedRow}
        initModal={mode === CREATE_ACTION ? WorkOrderDto : selectedRow}
        isOpen={isOpenDialog}
        onClose={toggleDialog}
        mode={mode}
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

export default connect(mapStateToProps, mapDispatchToProps)(WorkOrder);
