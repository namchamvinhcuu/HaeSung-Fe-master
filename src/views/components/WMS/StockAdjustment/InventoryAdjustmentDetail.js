import { useModal } from '@basesShared';
import {
  MuiButton,
  MuiDataGrid,
  MuiTextField,
  MuiAutocomplete,
  MuiDialog,
  MuiResetButton,
  MuiSubmitButton,
} from '@controls';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import { Button, Grid, IconButton, Tooltip, Typography, TextField } from '@mui/material';
import { stockAdjustmentService } from '@services';
import { ErrorAlert, SuccessAlert, isNumber } from '@utils';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormik } from 'formik';
import * as yup from 'yup';

export default function InventoryAdjustmentDetail({ StockAdjustmentId }) {
  const intl = useIntl();
  let isRendered = useRef(true);
  const { isShowing, toggle } = useModal();
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 7,
    searchData: { showDelete: true, MaterialId: null },
    StockAdjustmentId: StockAdjustmentId,
  });
  const [newData, setNewData] = useState({});
  const [updateData, setUpdateData] = useState({});
  const [ShelfId, setShelfId] = useState(null);
  const [rowData, setRowData] = useState({});

  const lotInputRef = useRef(null);

  const columns = [
    {
      field: 'id',
      headerName: '',
      flex: 0.1,
      align: 'center',
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.Id) + 1 + (state.page - 1) * state.pageSize,
    },
    { field: 'StockAdjustmentId', hide: true },
    { field: 'row_version', hide: true },
    {
      field: 'action',
      headerName: '',
      witdh: 50,
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center">
            <IconButton
              aria-label="delete"
              color="error"
              size="small"
              sx={[{ '&:hover': { border: '1px solid red' } }]}
              onClick={() => handleDelete(params.row)}
              disabled={params.row.isConfirm}
            >
              {params.row.isActived ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
            </IconButton>
          </Grid>
        );
      },
    },
    {
      field: 'LotId',
      headerName: 'Lot',
      flex: 0.5,
    },
    {
      field: 'LotSerial',
      headerName: intl.formatMessage({ id: 'lot.LotSerial' }),
      flex: 0.5,
    },
    {
      field: 'BinCode',
      headerName: intl.formatMessage({ id: 'lot.BinCode' }),
      flex: 0.4,
    },
    {
      field: 'MaterialCode',
      headerName: intl.formatMessage({ id: 'material.MaterialCode' }),
      flex: 0.5,
    },
    {
      field: 'StockQty',
      headerName: intl.formatMessage({ id: 'stockAdjustment.StockQty' }),
      flex: 0.4,
    },
    {
      field: 'CheckQty',
      headerName: intl.formatMessage({ id: 'stockAdjustment.CheckQty' }),
      flex: 0.4,
      description: intl.formatMessage({ id: 'material-so-detail.SOrderQty_tip' }),
      editable: true,
      // renderCell: (params) => {
      //   return (
      //     <Tooltip title={params.row.isConfirm ? '' : intl.formatMessage({ id: 'material-so-detail.SOrderQty_tip' })}>
      //       <Typography sx={{ fontSize: 14, width: '100%' }}>{params.row.CheckQty}</Typography>
      //     </Tooltip>
      //   );
      // },
      renderCell: (params) => {
        return (
          <TextField
            variant="standard"
            fullWidth
            disabled={true}
            value={params.row.CheckQty ?? 0}
            // inputProps={{
            //   onDoubleClick: () => {
            //     setDisableText(false);
            //   },
            // }}
          />
        );
      },
    },

    {
      field: 'GapQty',
      headerName: intl.formatMessage({ id: 'stockAdjustment.GapQty' }),
      flex: 0.4,
    },
    {
      field: 'CheckStatus',
      headerName: intl.formatMessage({ id: 'stockAdjustment.CheckStatus' }),
      flex: 0.5,
      valueFormatter: (params) => (params?.value ? 'Match' : 'Un Match'),
    },
    {
      field: 'CheckDate',
      headerName: intl.formatMessage({ id: 'stockAdjustment.CheckDate' }),
      flex: 0.5,
      valueFormatter: (params) =>
        params?.value ? moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss') : null,
    },
    {
      field: 'confirmedName',
      headerName: intl.formatMessage({ id: 'stockAdjustment.confirmedBy' }),
      flex: 0.5,
      alignItems: 'center',
      renderCell: (params) => {
        return params.row.isConfirm ? (
          <Typography sx={{ fontSize: 14, width: '100%' }}>{params.row.confirmedName}</Typography>
        ) : (
          <Button
            variant="contained"
            sx={{ lineHeight: 1, padding: '5px 10px' }}
            color={'success'}
            size="small"
            onClick={() => handleConfirm(params.row)}
          >
            Confirm
          </Button>
        );
      },
    },
    {
      field: 'Remark',
      headerName: intl.formatMessage({ id: 'stockAdjustment.Remark' }),
      flex: 0.5,
    },
  ];

  //useEffect
  useEffect(() => {
    fetchData(StockAdjustmentId);
    return () => {
      isRendered = false;
    };
  }, [state.page, state.pageSize, StockAdjustmentId, state.searchData.showDelete]);

  useEffect(() => {
    if (!_.isEmpty(newData)) {
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
    if (!_.isEmpty(updateData) && isRendered) {
      let newArr = [...state.data];
      const index = _.findIndex(newArr, function (o) {
        return o.Id == updateData.Id;
      });
      if (index !== -1) {
        newArr[index] = updateData;
      }

      setState({ ...state, data: [...newArr] });
    }
  }, [updateData]);

  //handle
  const handleDelete = async (item) => {
    if (!item?.isConfirm) {
      if (
        window.confirm(
          intl.formatMessage({
            id: item.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted',
          })
        )
      ) {
        try {
          let res = await stockAdjustmentService.deleteSADetail(item);
          if (res && res.HttpResponseCode === 200) {
            SuccessAlert(intl.formatMessage({ id: 'general.success' }));
            await fetchData(StockAdjustmentId);
          } else {
            ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };

  const scanBtnClick = async () => {
    let inputVal = '';
    if (ShelfId != null) {
      if (lotInputRef.current.value) {
        inputVal = lotInputRef.current.value.trim().toUpperCase();

        var res = await stockAdjustmentService.createSADetail({
          ShelfId: ShelfId,
          LotIdScan: inputVal,
          StockAdjustmentId: StockAdjustmentId,
        });

        if (res.HttpResponseCode === 200 && res.Data) {
          setNewData(res.Data);
          lotInputRef.current.value = '';
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          lotInputRef.current.value = '';
        }
      }
    } else {
      return ErrorAlert(intl.formatMessage({ id: 'stockAdjustment.Error_SelectShelfForScan' }));
    }
  };

  async function fetchData(StockAdjustmentId) {
    setState({ ...state, isLoading: true });
    const params = {
      isConfirm: false,
      CheckStatus: false,
      page: state.page,
      pageSize: state.pageSize,
      StockAdjustmentId: StockAdjustmentId,
    };
    const res = await stockAdjustmentService.getSADetail(params);
    if (res && isRendered)
      setState({
        ...state,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  }

  const handleRowUpdate = async (newRow) => {
    if (!isNumber(newRow.CheckQty) || newRow.CheckQty < 0) {
      ErrorAlert(intl.formatMessage({ id: 'forecast.OrderQty_required_bigger' }));
      newRow.CheckQty = 0;
      return newRow;
    }

    var res = await stockAdjustmentService.modifySADetail({ ...newRow, CheckQty: Number(newRow.CheckQty) });

    if (res.HttpResponseCode === 200 && res.Data) {
      SuccessAlert(intl.formatMessage({ id: 'general.success' }));
      setUpdateData(res.Data);
      lotInputRef.current.value = '';
    } else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      lotInputRef.current.value = '';
    }

    return newRow;
  };

  const handleConfirm = async (row) => {
    setRowData(row);
    toggle();
  };

  const handleProcessRowUpdateError = React.useCallback((error) => {
    console.log('update error', error);
    ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
  }, []);

  return (
    <>
      <Grid container direction="row" justifyContent="space-between" sx={{ mb: 1, mt: 0 }} spacing={2}>
        <Grid item xs={3}>
          <MuiAutocomplete
            label={intl.formatMessage({ id: 'stockAdjustment.Shelf' })}
            fetchDataFunc={() => stockAdjustmentService.getShelf(StockAdjustmentId)}
            disabled={StockAdjustmentId ? false : true}
            displayLabel="ShelfCode"
            displayValue="ShelfId"
            onChange={(e, value) => setShelfId(value?.ShelfId)}
          />
        </Grid>
        <Grid item xs={3}>
          <MuiTextField
            fullWidth
            name="Lot"
            disabled={StockAdjustmentId ? false : true}
            ref={lotInputRef}
            label="lot"
            onChange={(e) => (lotInputRef.current.value = e.target.value)}
            onKeyDown={keyPress}
          />
        </Grid>
        <Grid item xs={1}>
          <MuiButton
            text="scan"
            color="success"
            onClick={scanBtnClick}
            sx={{ mt: 0.18, whiteSpace: 'nowrap' }}
            disabled={StockAdjustmentId ? false : true}
          />
        </Grid>
        <Grid item xs={5}></Grid>
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
        getRowId={(rows) => rows.Id}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`;
        }}
        processRowUpdate={handleRowUpdate}
        isCellEditable={(params) => !params.row.isConfirm}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        experimentalFeatures={{ newEditingApi: true }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />

      <ConfirmDialog initModal={rowData} isOpen={isShowing} onClose={toggle} setUpdateData={setUpdateData} />
    </>
  );
}

const ConfirmDialog = ({ initModal, isOpen, onClose, setUpdateData }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });

  const formik = useFormik({
    initialValues: initModal,
    enableReinitialize: true,
    onSubmit: async (values) => onSubmit(values),
  });

  const { handleChange, handleSubmit, values, setFieldValue, errors, touched, resetForm } = formik;

  const handleReset = () => {
    resetForm();
  };

  const handleCloseDialog = () => {
    resetForm();
    onClose();
  };

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    const res = await stockAdjustmentService.confirmSADetail(data);
    if (res.HttpResponseCode === 200) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setUpdateData(res.Data);
      setDialogState({ ...dialogState, isSubmit: false });
      handleCloseDialog();
    } else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setDialogState({ ...dialogState, isSubmit: false });
    }
  };

  return (
    <MuiDialog
      maxWidth="sm"
      title={intl.formatMessage({ id: 'stockAdjustment.confirm' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit}>
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={12}>
            <MuiTextField
              fullWidth
              name="Remark"
              disabled={dialogState.isSubmit}
              value={values.Remark}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'stockAdjustment.Remark' }) + ' *'}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
              <MuiResetButton onClick={handleReset} disabled={dialogState.isSubmit} />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MuiDialog>
  );
};
