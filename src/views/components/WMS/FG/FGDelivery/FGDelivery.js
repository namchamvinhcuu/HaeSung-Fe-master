import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { MuiButton, MuiDataGrid, MuiDateField, MuiSearchField } from '@controls';
import { DeliveryOrderDto } from '@models';
import { Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { deliveryOrderService } from '@services';
import { ErrorAlert } from '@utils';
import _ from 'lodash';
import moment from 'moment';
import IconButton from '@mui/material/IconButton';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { useIntl } from 'react-intl';
import FGDeliveryDetail from './FGDeliveryDetail';

const FGDelivery = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const initETDLoad = new Date();
  const [dataRow, setDataRow] = useState(0);
  const [deliveryOrderState, setDeliveryOrderState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      ...DeliveryOrderDto,
      ETDLoad: moment(initETDLoad).format('YYYY-MM-DD'),
      // DeliveryTime: addDays(initETDLoad, 1),
    },
  });

  const [mode, setMode] = useState(CREATE_ACTION);

  const [selectedRow, setSelectedRow] = useState({
    ...DeliveryOrderDto,
  });

  const [newData, setNewData] = useState({ ...DeliveryOrderDto });

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const [showActivedData, setShowActivedData] = useState(true);

  const [materialArr, setMaterialArr] = useState([]);

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
      setDeliveryOrderState({
        ...deliveryOrderState,
        page: 1,
      });
    }
  };

  const handleRowSelection = (arrIds) => {
    const rowSelected = deliveryOrderState.data.filter(function (item) {
      return item.DoId === arrIds[0];
    });

    if (rowSelected && rowSelected.length > 0 && rowSelected[0]?.IsWorking === true) {
      setDataRow({
        arrIds: arrIds[0],
        IsWorking: rowSelected[0]?.IsWorking
      });
      setSelectedRow({ ...rowSelected[0] });
    } else {
      setDataRow(0)
      setSelectedRow({ ...DeliveryOrderDto });
    }
  };

  const handleDelete = async (deliveryOrder) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: showActivedData ? 'general.confirm_delete' : 'general.confirm_redo_deleted',
        })
      )
    ) {
      try {
        let res = await deliveryOrderService.handleDelete(deliveryOrder);
        if (res && res.HttpResponseCode === 200) {
          await fetchData();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const changeSearchData = (e, inputName) => {
    let newSearchData = { ...deliveryOrderState.searchData };

    newSearchData[inputName] = e;

    switch (inputName) {
      case 'ETDLoad':
      case 'DeliveryTime':
        newSearchData[inputName] = e;
        break;
      case 'FPoMasterId':
        newSearchData[inputName] = e ? e.FPoMasterId : DeliveryOrderDto.FPoMasterId;
        newSearchData['FPoMasterCode'] = e ? e.FPoMasterCode : DeliveryOrderDto.FPoMasterCode;
        newSearchData.MaterialId = 0;
        newSearchData.MaterialCode = '';
        break;
      case 'MaterialId':
        newSearchData[inputName] = e ? e.MaterialId : DeliveryOrderDto.MaterialId;
        newSearchData['MaterialCode'] = e ? e.MaterialCode : DeliveryOrderDto.MaterialCode;
        break;
      default:
        newSearchData[inputName] = e.target.value;
        break;
    }

    setDeliveryOrderState({
      ...deliveryOrderState,
      searchData: { ...newSearchData },
    });
  };

  const getPoMasterArr = async () => {
    return await deliveryOrderService.getPoMasterArr();
  };

  const getMaterialArr = async (fPoMasterId) => {
    const res = await deliveryOrderService.getMaterialArr(fPoMasterId);
    if (res && isRendered) {
      setMaterialArr(!res.Data ? [] : [...res.Data]);
    }
  };

  const fetchData = async () => {
    setDataRow(0);
    let flag = true;
    let message = '';
    const checkObj = { ...deliveryOrderState.searchData };
    _.forOwn(checkObj, (value, key) => {
      switch (key) {
        case 'ETDLoad':
          if (value == 'Invalid Date') {
            message = 'delivery_order.ETDLoad_invalid';
            flag = false;
          }
          break;
        case 'DeliveryTime':
          if (value == 'Invalid Date') {
            message = 'delivery_order.DeliveryTime_invalid';
            flag = false;
          }
          break;

        default:
          break;
      }
    });

    if (flag) {
      setDeliveryOrderState({
        ...deliveryOrderState,
        isLoading: true,
      });

      const params = {
        page: deliveryOrderState.page,
        pageSize: deliveryOrderState.pageSize,
        DoCode: deliveryOrderState.searchData.DoCode.trim(),
        FPoCode: deliveryOrderState.searchData.FPoCode.trim(),
        FPoMasterCode: deliveryOrderState.searchData.FPoMasterCode.trim(),
        FPoMasterId: deliveryOrderState.searchData.FPoMasterId,
        MaterialId: deliveryOrderState.searchData.MaterialId,
        ETDLoad: deliveryOrderState.searchData.ETDLoad,
        // DeliveryTime: deliveryOrderState.searchData.DeliveryTime,
        isActived: showActivedData,
      };

      const res = await deliveryOrderService.get(params);

      if (res && isRendered)
        setDeliveryOrderState({
          ...deliveryOrderState,
          data: !res.Data ? [] : [...res.Data],
          totalRow: res.TotalRow,
          isLoading: false,
        });

      console.log("🚀 ~ file: FGDelivery.js:193 ~ fetchData ~ res:", res.Data)
    } else {
      ErrorAlert(intl.formatMessage({ id: message }));
    }
  };

  useEffect(() => {
    if (isRendered)
      if (deliveryOrderState.searchData.FPoMasterId !== 0) {
        getMaterialArr(deliveryOrderState.searchData.FPoMasterId);
      } else {
        setMaterialArr([]);
      }
  }, [deliveryOrderState.searchData.FPoMasterId]);

  useEffect(() => {
    fetchData();

    return () => {
      isRendered = false;
    };
  }, [deliveryOrderState.page, deliveryOrderState.pageSize, showActivedData]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, DeliveryOrderDto)) {
      const data = [newData, ...deliveryOrderState.data];
      if (data.length > deliveryOrderState.pageSize) {
        data.pop();
      }
      if (isRendered)
        setDeliveryOrderState({
          ...deliveryOrderState,
          data: [...data],
          totalRow: deliveryOrderState.totalRow + 1,
        });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, DeliveryOrderDto)) {
      let newArr = [...deliveryOrderState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.DoId == selectedRow.DoId;
      });
      if (index !== -1) {
        newArr[index] = selectedRow;
      }

      setDeliveryOrderState({
        ...deliveryOrderState,
        data: [...newArr],
      });
    }
  }, [selectedRow]);


  const columns = [
    { field: 'DoId', headerName: '', hide: true },

    {
      field: 'id',
      headerName: '',
      width: 80,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.DoId) + 1 + (deliveryOrderState.page - 1) * deliveryOrderState.pageSize,
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
      field: 'DoCode',
      headerName: intl.formatMessage({ id: 'delivery_order.DoCode' }),
      /*flex: 0.7,*/ width: 135,
    },
    {
      field: 'FPoMasterCode',
      headerName: intl.formatMessage({ id: 'delivery_order.FPoMasterCode' }),
      /*flex: 0.7,*/ width: 120,
    },
    {
      field: 'FPoCode',
      headerName: intl.formatMessage({ id: 'delivery_order.PoCode' }),
      /*flex: 0.7,*/ width: 135,
    },

    {
      field: 'MaterialCode',
      headerName: intl.formatMessage({ id: 'delivery_order.MaterialCode' }),
      /*flex: 0.7,*/ width: 120,
    },

    {
      field: 'OrderQty',
      headerName: intl.formatMessage({ id: 'delivery_order.OrderQty' }),
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
      field: 'RemainQty',
      headerName: intl.formatMessage({ id: 'delivery_order.RemainQty' }),
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
      field: 'PackingNote',
      headerName: intl.formatMessage({ id: 'delivery_order.PackingNote' }),
      width: 200,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.PackingNote ?? ''} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>{params.row.PackingNote}</Typography>
          </Tooltip>
        );
      },
    },

    {
      field: 'InvoiceNo',
      headerName: intl.formatMessage({ id: 'delivery_order.InvoiceNo' }),
      width: 150,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.InvoiceNo ?? ''} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>{params.row.InvoiceNo}</Typography>
          </Tooltip>
        );
      },
    },

    {
      field: 'Dock',
      headerName: intl.formatMessage({ id: 'delivery_order.Dock' }),
      width: 150,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.Dock ?? ''} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>{params.row.Dock}</Typography>
          </Tooltip>
        );
      },
    },

    {
      field: 'ETDLoad',
      headerName: intl.formatMessage({ id: 'delivery_order.ETDLoad' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },

    {
      field: 'DeliveryTime',
      headerName: intl.formatMessage({ id: 'delivery_order.DeliveryTime' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },

    {
      field: 'Remark',
      headerName: intl.formatMessage({ id: 'delivery_order.Remark' }),
      width: 150,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.Remark ?? ''} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>{params.row.Remark}</Typography>
          </Tooltip>
        );
      },
    },

    {
      field: 'Truck',
      headerName: intl.formatMessage({ id: 'delivery_order.Truck' }),
      width: 150,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.Truck ?? ''} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>{params.row.Truck}</Typography>
          </Tooltip>
        );
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
      field: 'action',
      headerName: '',
      width: 60,
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
                color={params?.row?.IsWorking ? "primary" : "warning"}
                size="small"
                sx={[{ '&:hover': { border: '1px solid orange' } }]}
                onClick={async () => {
                  if (confirm(params.row.IsWorking ? "Do you want to disable it ?" : "Do you want to enable it ?")) {
                    const res = await deliveryOrderService.toggleWorking(params?.row.DoId, params?.row?.row_version);
                    if (res?.Data) {
                      fetchData();
                    } else {
                      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
                    }
                  }
                }}
              >
                <QuestionAnswerIcon color={params.row.IsWorking ? 'inherit' : "action"} fontSize="inherit" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <Grid container spacing={2} direction="row" justifyContent="space-between" alignItems="flex-end">
        <Grid item xs={1.5}>
          {/* <MuiButton
            text="create"
            color="success"
            onClick={() => {
              toggleDialog(CREATE_ACTION);
            }}
          /> */}
        </Grid>
        <Grid item xs>
          <MuiSearchField
            label="delivery_order.FPoMasterCode"
            name="FPoMasterCode"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, 'FPoMasterCode')}
          />
        </Grid>
        <Grid item xs>
          <MuiSearchField
            label="delivery_order.PoCode"
            name="FPoCode"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, 'FPoCode')}
          />
        </Grid>
        <Grid item xs>
          <MuiSearchField
            label="delivery_order.DoCode"
            name="DoCode"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, 'DoCode')}
          />
        </Grid>

        <Grid item xs>
          <MuiDateField
            disabled={deliveryOrderState.isLoading}
            label={intl.formatMessage({
              id: 'delivery_order.ETDLoad',
            })}
            value={deliveryOrderState.searchData.ETDLoad}
            onChange={(e) => {
              changeSearchData(e ? moment(e).format('YYYY-MM-DD') : null, 'ETDLoad');
            }}
            variant="standard"
          />
        </Grid>

        <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'right' }}>
          <MuiButton text="search" color="info" onClick={fetchData} sx={{ whiteSpace: 'nowrap' }} />
          {/* <FormControlLabel
            sx={{ mb: 0, ml: '1px' }}
            control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleshowActivedData(e)} />}
            label={showActivedData ? 'Actived' : 'Deleted'}
          /> */}
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={deliveryOrderState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        gridHeight={736}
        columns={columns}
        rows={deliveryOrderState.data}
        page={deliveryOrderState.page - 1}
        pageSize={deliveryOrderState.pageSize}
        rowCount={deliveryOrderState.totalRow}
        onPageChange={(newPage) => {
          setDeliveryOrderState({ ...deliveryOrderState, page: newPage + 1 });
        }}
        getRowId={(rows) => rows.DoId}
        onSelectionModelChange={(newSelectedRowId) => {
          console.log("🚀 ~ file: FGDelivery.js:606 ~ FGDelivery ~ newSelectedRowId:", newSelectedRowId)

          handleRowSelection(newSelectedRowId);
        }}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
        initialState={{
          pinnedColumns: { left: ['id', 'FPoMasterCode', 'FPoCode', 'DoCode', 'MaterialCode'], right: ['action'] },
        }}
      />
      {
        dataRow !== 0 ? <FGDeliveryDetail dataRow={dataRow} /> : ""
      }

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

export default connect(mapStateToProps, mapDispatchToProps)(FGDelivery);
