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
import { Button, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { stockAdjustmentService } from '@services';
import { ErrorAlert, SuccessAlert, isNumber } from '@utils';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormik } from 'formik';
import * as yup from 'yup';

export default function InventoryAdjustmentDetail({ StockAdjustmentId, newDataChild, handleUpdateQty }) {
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
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.isConfirm ? '' : intl.formatMessage({ id: 'material-so-detail.SOrderQty_tip' })}>
            <Typography sx={{ fontSize: 14, width: '100%' }}>{params.row.CheckQty}</Typography>
          </Tooltip>
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

  async function fetchData(StockAdjustmentId) {
    setState({ ...state, isLoading: true });
    const params = {
      CheckStatus: true,
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

  return (
    <>
      <Grid sx={{ mt: 4 }}>
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
            if (_.isEqual(params.row, newData) || _.isEqual(params.row, newDataChild)) return `Mui-created`;
          }}
        />
      </Grid>
    </>
  );
}
