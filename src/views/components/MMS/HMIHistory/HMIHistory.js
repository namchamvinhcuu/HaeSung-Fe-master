import React, { useEffect, useRef, useState } from 'react';
import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiDateField, MuiSearchField } from '@controls';
import { FormControlLabel, Grid, Switch } from '@mui/material';
import { WorkOrderDto } from '@models';
import { addDays, ErrorAlert, SuccessAlert } from '@utils';
import { useIntl } from 'react-intl';
import { hmiService, workOrderService } from '@services';
import moment from 'moment';
import HMIHistoryDetail from './HMIHistoryDetail';
const HMIHistory = (props) => {
  const initStartDate = new Date();
  const intl = useIntl();
  let isRendered = useRef(true);
  const [WoId, setWoId] = useState(null);
  const [showActivedData, setShowActivedData] = useState(true);
  const [workOrderState, setWorkOrderState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      ...WorkOrderDto,
      StartSearchingDate: initStartDate,
      EndSearchingDate: addDays(initStartDate, 30),
    },
  });
  const fetchData = async () => {
    setWoId(null);
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

      const res = await hmiService.get(params);

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
    const res = await hmiService.getMaterialModelTypeRaw();
    return res;
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
  useEffect(() => {
    fetchData();

    return () => {
      isRendered = false;
    };
  }, [workOrderState.page, workOrderState.pageSize, showActivedData]);
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

    // {
    //   field: 'action',
    //   headerName: '',
    //   width: 80,
    //   // headerAlign: 'center',
    //   disableClickEventBubbling: true,
    //   sortable: false,
    //   disableColumnMenu: true,
    //   renderCell: (params) => {
    //     return (
    //       <Grid container spacing={1} alignItems="center" justifyContent="center">
    //         <Grid item xs={6}>
    //           <IconButton
    //             aria-label="edit"
    //             color="warning"
    //             size="small"
    //             sx={[{ '&:hover': { border: '1px solid orange' } }]}
    //             onClick={() => {
    //               toggleDialog(UPDATE_ACTION);
    //             }}
    //           >
    //             <EditIcon fontSize="inherit" />
    //           </IconButton>
    //         </Grid>

    //         <Grid item xs={6}>
    //           <IconButton
    //             aria-label="delete"
    //             color="error"
    //             size="small"
    //             sx={[{ '&:hover': { border: '1px solid red' } }]}
    //             onClick={() => handleDelete(params.row)}
    //           >
    //             {showActivedData ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
    //           </IconButton>
    //         </Grid>
    //       </Grid>
    //     );
    //   },
    // },

    {
      field: 'WoCode',
      headerName: intl.formatMessage({ id: 'work_order.WoCode' }),
      /*flex: 0.7,*/ width: 150,
    },

    {
      field: 'MaterialCode',
      headerName: intl.formatMessage({ id: 'work_order.MaterialCode' }),
      /*flex: 0.7,*/ width: 150,
    },

    {
      field: 'FPoMasterCode',
      headerName: intl.formatMessage({ id: 'work_order.FPoMasterCode' }),
      /*flex: 0.7,*/ width: 150,
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
      field: 'HMIQty',
      headerName: 'HMI Qty',
      /*flex: 0.7,*/ width: 100,
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
  return (
    <React.Fragment>
      <Grid container spacing={2} justifyContent="flex-end" alignItems="flex-end">
        <Grid item xs={1.5}></Grid>
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
            label="Bare Code"
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
          setWorkOrderState({ ...workOrderState, page: newPage + 1 });
        }}
        getRowId={(rows) => rows.WoId}
        onSelectionModelChange={(newSelectedRowId) => setWoId(newSelectedRowId[0])}
        // getRowClassName={(params) => {
        //   if (_.isEqual(params.row, newData)) {
        //     return `Mui-created`;
        //   }
        // }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />
      <HMIHistoryDetail WoId={WoId} />
    </React.Fragment>
  );
};
export default HMIHistory;
