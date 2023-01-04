import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { useModal, useModal2 } from '@basesShared';
import { CREATE_ACTION } from '@constants/ConfigConstants';
import { MuiButton, MuiDataGrid, MuiSearchField, MuiTextField } from '@controls';
import { FGSODetailDto } from '@models';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Dialog, DialogContent, DialogTitle, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import { fgSOService, eslService } from '@services';
import { ErrorAlert, isNumber, SuccessAlert } from '@utils';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import FGSODetailDialog from './FGSODetailDialog';

const FGSODetail = ({ FGsoId, fromPicking, FGsoStatus }) => {
  let isRendered = useRef(true);
  const { isShowing2, toggle2 } = useModal2();
  const intl = useIntl();
  const [mode, setMode] = useState(CREATE_ACTION);
  const { isShowing, toggle } = useModal();
  const [rowData, setRowData] = useState({ ...FGSODetailDto });
  const [updateData, setUpdateData] = useState({});
  const [fgSODetailState, setFGSODetailState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      ...FGSODetailDto,
      MaterialCode: '',
      isActived: true,
    },
    FGsoId: FGsoId,
  });

  const [newData, setNewData] = useState({ ...FGSODetailDto });
  const [newDataArr, setNewDataArr] = useState([]);
  const [rowConfirm, setRowConfirm] = useState([]);

  useEffect(() => {
    fetchData(FGsoId);
  }, [fgSODetailState.page, fgSODetailState.pageSize, FGsoId, fgSODetailState.searchData.isActived]);

  useEffect(() => {
    if (isRendered && newDataArr.length) {
      const data = [...newDataArr, ...fgSODetailState.data];
      while (data.length > fgSODetailState.pageSize) {
        data.pop();
      }
      setFGSODetailState({
        ...fgSODetailState,
        data: [...data],
        totalRow: fgSODetailState.totalRow + newDataArr.length,
      });
    }
  }, [newDataArr]);

  useEffect(() => {
    if (!_.isEmpty(updateData) && !_.isEqual(updateData, rowData) && isRendered) {
      let newArr = [...fgSODetailState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.FGsoDetailId == updateData.FGsoDetailId;
      });
      if (index !== -1) {
        newArr[index] = updateData;
      }
      setFGSODetailState({ ...fgSODetailState, data: [...newArr] });
    }
  }, [updateData]);

  const handleDelete = async (materialSODetail) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: materialSODetail.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted',
        })
      )
    ) {
      try {
        let res = await fgSOService.handleDeleteSODetail({
          FGsoDetailId: materialSODetail.FGsoDetailId,
          row_version: materialSODetail.row_version,
        });
        if (res) {
          if (res && res.HttpResponseCode === 200) {
            await fetchData(FGsoId);
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

  const fetchData = async (FGsoId) => {
    setNewDataArr([]);
    setFGSODetailState({ ...fgSODetailState, isLoading: true });
    const params = {
      page: fgSODetailState.page,
      pageSize: fgSODetailState.pageSize,
      MaterialCode: fgSODetailState.searchData.MaterialCode,
      isActived: fgSODetailState.searchData.isActived,
      FGsoId: FGsoId,
    };

    const res = await fgSOService.getFGSODetails(params);
    if (res && res.Data && isRendered) {
      setFGSODetailState({
        ...fgSODetailState,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
    }
  };

  const columns = [
    // { field: 'FGsoDetailId', headerName: '', hide: true },
    // { field: "FGsoId", headerName: "", hide: true },
    // { field: "MaterialId", headerName: "", hide: true },

    {
      field: 'id',
      headerName: '',
      width: 100,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.FGsoDetailId) + 1 + (fgSODetailState.page - 1) * fgSODetailState.pageSize,
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
                aria-label="delete"
                color="error"
                size="small"
                disabled={params.row.FGsoDetailStatus == false ? false : true}
                sx={[{ '&:hover': { border: '1px solid red' } }]}
                onClick={() => handleDelete(params.row)}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    { field: 'FGsoId', headerName: 'FG SO Code', width: 150 },

    {
      field: 'MaterialColorCode',
      headerName: 'Assy Code',
      /*flex: 0.7,*/ width: 200,
    },
    {
      field: 'Description',
      headerName: intl.formatMessage({
        id: 'general.description',
      }),
      /*flex: 0.7,*/ width: 200,
    },
    {
      field: 'Qty',
      headerName: intl.formatMessage({ id: 'material-so-detail.Qty' }),
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: 'TotalSOQty',
      headerName: intl.formatMessage({ id: 'material-so-detail.TotalSOQty' }),
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: 'FGsoOrderQty',
      headerName: 'Order Qty',
      /*flex: 0.7,*/ width: 150,
      editable: true,
      renderCell: (params) => {
        return (
          <Tooltip
            title={params.row.FGsoDetailStatus ? '' : intl.formatMessage({ id: 'material-so-detail.SOrderQty_tip' })}
          >
            <Typography sx={{ fontSize: 14, width: '100%' }}>{params.row.FGsoOrderQty}</Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'LotSerial',
      headerName: intl.formatMessage({ id: 'material-so-detail.LotSerial' }),
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: 'BinCode',
      headerName: intl.formatMessage({ id: 'material-so-detail.BinCode' }),
      /*flex: 0.7,*/ width: 150,
    },
  ];

  const columnsFromPicking = [
    { field: 'FGsoDetailId', headerName: '', hide: true },
    {
      field: 'BinId',
      headerName: intl.formatMessage({ id: 'material-so-detail.BinId' }),
      hide: true,
    },

    {
      field: 'id',
      headerName: '',
      width: 100,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.FGsoDetailId) + 1 + (fgSODetailState.page - 1) * fgSODetailState.pageSize,
    },

    // {
    //   field: 'FGsoCode',
    //   headerName: intl.formatMessage({ id: 'material-so-detail.MsoCode' }),
    //   /*flex: 0.7,*/ width: 150,
    // },

    {
      field: 'MaterialColorCode',
      headerName: 'Assy Code',
      /*flex: 0.7,*/ width: 200,
    },

    // {
    //   field: "FGsoDetailStatus",
    //   headerName: intl.formatMessage({
    //     id: "material-so-detail.FGsoDetailStatus",
    //   }),
    //   /*flex: 0.7,*/ width: 120,
    // },

    {
      field: 'Qty',
      headerName: intl.formatMessage({ id: 'material-so-detail.Qty' }),
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: 'FGsoOrderQty',
      headerName: 'Order Qty',
      /*flex: 0.7,*/ width: 150,
    },

    {
      field: 'BinCode',
      headerName: intl.formatMessage({ id: 'material-so-detail.BinCode' }),
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: 'action',
      headerName: '',
      align: 'center',
      width: 250,
      renderCell: (params) => {
        return (
          <>
            <Button
              disabled={params.row.FGsoDetailStatus}
              variant="contained"
              color="success"
              size="small"
              sx={{ textTransform: 'capitalize', fontSize: '14px', width: '100px' }}
              onClick={() => handleConfirm(params)}
            >
              {params.row.FGsoDetailStatus ? <span style={{ color: 'rgba(0,0,0,0.7)' }}>Picked</span> : 'Picking'}
            </Button>

            <Button
              // disabled={params.row.FGsoDetailStatus}
              variant="contained"
              color="secondary"
              size="small"
              sx={{ textTransform: 'capitalize', fontSize: '14px', marginLeft: '5px' }}
              onClick={() => handleFindBin(params.row.BinId)}
            >
              {/* {params.row.FGsoDetailStatus ? <span style={{ color: 'rgba(0,0,0,0.7)' }}>Picked</span> : 'Picking'} */}
              Find Bin
            </Button>
          </>
        );
      },
    },
    {
      field: 'PickingDate',
      headerName: 'Picking Date',
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
    {
      field: 'pickingUser',
      headerName: 'User Picking',
      width: 150,
    },
  ];

  const handleFindBin = async (binId) => {
    const res = await eslService.findBinByBinId(binId);
  };

  const handleConfirm = (params) => {
    toggle2();
    setRowConfirm(params.row);
  };

  const handleAdd = () => {
    setMode(CREATE_ACTION);
    setRowData({ ...FGSODetailDto });
    toggle();
  };

  const handleRowUpdate = async (newRow) => {
    const index = _.findIndex(fgSODetailState.data, function (o) {
      return o.FGsoDetailId == newRow.FGsoDetailId;
    });
    var oldRow = fgSODetailState.data[index];

    if (newRow.FGsoOrderQty == oldRow.FGsoOrderQty) {
      return oldRow;
    }

    setFGSODetailState({ ...fgSODetailState, isSubmit: true });
    if (!isNumber(newRow.FGsoOrderQty) || newRow.FGsoOrderQty < 0) {
      ErrorAlert(intl.formatMessage({ id: 'forecast.OrderQty_required_bigger' }));
      newRow.FGsoOrderQty = 0;
    }

    // if (newRow.FGsoOrderQty > newRow.Qty) {
    //   ErrorAlert(intl.formatMessage({ id: 'forecast.OrderQty_required_bigger_StockQty' }));
    //   newRow.FGsoOrderQty = newRow.Qty;
    // }

    newRow = { ...newRow, FGsoOrderQty: newRow.FGsoOrderQty };

    const res = await fgSOService.modifyFGSODetail(newRow);
    if (res.HttpResponseCode === 200 && res.Data) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      //setUpdateData(res.Data);
      setFGSODetailState({ ...fgSODetailState, isSubmit: false });
      await fetchData(FGsoId);
      return newRow;
    } else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setFGSODetailState({ ...fgSODetailState, isSubmit: false });
      const index = _.findIndex(fgSODetailState.data, function (o) {
        return o.FGsoDetailId == newRow.FGsoDetailId;
      });

      return fgSODetailState.data[index];
    }
  };

  const handleProcessRowUpdateError = React.useCallback((error) => {
    console.log('update error', error);
    ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
  }, []);

  const handleSearch = (e, inputName) => {
    let newSearchData = { ...fgSODetailState.searchData };
    newSearchData[inputName] = e;
    setFGSODetailState({
      ...fgSODetailState,
      searchData: { ...newSearchData },
    });
  };

  return (
    <React.Fragment>
      <Grid container spacing={2} justifyContent="flex-end" alignItems="flex-end">
        <Grid item xs={1.5}>
          {!fromPicking && (
            <MuiButton disabled={FGsoId ? FGsoStatus : true} text="create" color="success" onClick={handleAdd} />
          )}
        </Grid>

        <Grid item xs>
          <MuiSearchField
            disabled={FGsoId ? false : true}
            label="forecast.MaterialCode"
            name="MaterialColorCode"
            onClick={() => fetchData(FGsoId)}
            onChange={(e) => handleSearch(e.target.value, 'MaterialCode')}
          />
        </Grid>

        <Grid item xs={2.5}>
          <Grid container justifyContent="space-around" alignItems="flex-end">
            <Grid item>
              <MuiButton
                disabled={FGsoId ? false : true}
                text="search"
                color="info"
                onClick={() => fetchData(FGsoId)}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={fgSODetailState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        // gridHeight={736}
        columns={fromPicking ? columnsFromPicking : columns}
        rows={fgSODetailState.data}
        page={fgSODetailState.page - 1}
        pageSize={fgSODetailState.pageSize}
        rowCount={fgSODetailState.totalRow}
        processRowUpdate={handleRowUpdate}
        isCellEditable={(params) => params.row.FGsoDetailStatus == false}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        experimentalFeatures={{ newEditingApi: true }}
        onPageChange={(newPage) => {
          setFGSODetailState({
            ...fgSODetailState,
            page: newPage + 1,
          });
        }}
        getRowId={(rows) => rows.FGsoDetailId}
        // onSelectionModelChange={(newSelectedRowId) =>
        //   handleRowSelection(newSelectedRowId)
        // }
        getRowClassName={(params) => {
          var item = newDataArr.find((x) => x.FGsoDetailId == params.row.FGsoDetailId);
          if (item) {
            return `Mui-created`;
          }
        }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />

      <FGSODetailDialog
        initModal={rowData}
        setNewData={setNewDataArr}
        setUpdateData={setUpdateData}
        isOpen={isShowing}
        onClose={toggle}
        mode={mode}
        FGsoId={FGsoId}
      />
      <PopupConfirm isShowing={isShowing2} hide={toggle2} rowConfirm={rowConfirm} setUpdateData={setUpdateData} />
    </React.Fragment>
  );
};

const PopupConfirm = ({ isShowing, hide, rowConfirm, setUpdateData }) => {
  const intl = useIntl();
  const lotInputRef = useRef();
  const handleLotInputChange = (e) => {
    lotInputRef.current.value = e.target.value;
  };

  let timer;

  const [inputRef, setInputRef] = useState(null);

  const scanBtnClick = async () => {
    verifyConfirm();
    lotInputRef.current.value = '';
    lotInputRef.current.focus();
  };

  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };

  const verifyConfirm = async () => {
    const lot = lotInputRef.current.value.trim();
    if (lot.length < 1) {
      ErrorAlert(intl.formatMessage({ id: 'lot.lot_code_scan_required' }));
      return;
    }
    const rowConfirmData = { ...rowConfirm, LotCode: lot };

    const res = await fgSOService.pickingFGSODetail({
      ...rowConfirmData,
    });
    if (res.HttpResponseCode === 200) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setUpdateData({ ...res.Data });
      hide();

      await eslService.updateESLDataByBinCode(rowConfirmData.BinCode);
    } else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
    }
  };

  useEffect(() => {
    lotInputRef.current = inputRef;

    if (inputRef) {
      timer = setTimeout(() => lotInputRef.current.focus(), 500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [inputRef]);

  return (
    <Dialog open={isShowing} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: '22px' }}>Confirm Picking</Typography>
        <IconButton aria-label="delete" size="small" onClick={() => hide()} sx={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <Typography variant="h5"> Are you sure picking?</Typography>
        <Box className="d-flex align-items-center mt-1">
          <MuiTextField
            ref={(ele) => {
              setInputRef(ele);
              //   setTimeout(() => {
              //   ele.focus();
              // }, 1)
            }}
            label="Lot"
            // autoFocus={focus}
            // value={lotInputRef.current.value}
            onChange={handleLotInputChange}
            onKeyDown={keyPress}
          />
          <MuiButton text="scan" color="success" onClick={scanBtnClick} sx={{ whiteSpace: 'nowrap' }} />
        </Box>
      </DialogContent>
    </Dialog>
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

export default connect(mapStateToProps, mapDispatchToProps)(FGSODetail);
