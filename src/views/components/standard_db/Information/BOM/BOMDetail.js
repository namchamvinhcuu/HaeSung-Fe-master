import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo';
import { FormControlLabel, Grid, IconButton, Switch, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid, MuiSelectField } from '@controls'
import { bomDetailService } from '@services'
import { useModal } from "@basesShared"
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import moment from 'moment';
import BOMDetailDialog from './BOMDetailDialog'

export default function BOMDetail({ BomId }) {
  console.log(BomId)
  const intl = useIntl();
  const [mode, setMode] = useState(CREATE_ACTION);
  const { isShowing, toggle } = useModal();
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    BomId: BomId
  });
  const [newData, setNewData] = useState({})
  const [updateData, setUpdateData] = useState({})
  const [rowData, setRowData] = useState({});

  const columns = [
    {
      field: 'id', headerName: '', flex: 0.1, align: 'center',
      filterable: false,
      renderCell: (index) => (index.api.getRowIndex(index.row.BomDetailId) + 1) + (state.page - 1) * state.pageSize,
    },
    { field: 'BomDetailId', hide: true },
    { field: 'row_version', hide: true },
    {
      field: "action",
      headerName: "",
      flex: 0.3,
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center">
            <Grid item xs={6} style={{ textAlign: "center" }}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ '&:hover': { border: '1px solid red', }, }]}
                onClick={() => handleDelete(params.row)}
              >
                {params.row.isActived ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
              </IconButton>
            </Grid>
            <Grid item xs={6} style={{ textAlign: "center" }}>
              <IconButton
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ '&:hover': { border: '1px solid orange', }, }]}
                onClick={() => handleUpdate(params.row)}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },
    { field: 'MaterialCode', headerName: intl.formatMessage({ id: "bomDetail.MaterialId" }), flex: 0.5, },
    { field: 'Amount', headerName: intl.formatMessage({ id: "bomDetail.Amount" }), flex: 0.5, },
    { field: 'Remark', headerName: intl.formatMessage({ id: "bomDetail.Remark" }), flex: 0.7, },
    { field: 'createdName', headerName: intl.formatMessage({ id: "general.createdName" }), flex: 0.5, },
    {
      field: 'createdDate', headerName: intl.formatMessage({ id: "general.createdDate" }), flex: 0.5,
      valueFormatter: params => params?.value ? moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss") : null
    },
    { field: 'modifiedName', headerName: intl.formatMessage({ id: "general.modifiedName" }), flex: 0.5, },
    {
      field: 'modifiedDate', headerName: intl.formatMessage({ id: "general.modifiedDate" }), flex: 0.5,
      valueFormatter: params => params?.value ? moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss") : null
    },
  ];

  //useEffect
  useEffect(() => {
    fetchData(BomId);
  }, [state.page, state.pageSize, BomId]);

  useEffect(() => {
    if (!_.isEmpty(newData)) {
      const data = [newData, ...state.data];
      if (data.length > state.pageSize) {
        data.pop();
      }
      setState({
        ...state
        , data: [...data]
        , totalRow: state.totalRow + 1
      });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(updateData) && !_.isEqual(updateData, rowData)) {
      let newArr = [...state.data]
      const index = _.findIndex(newArr, function (o) { return o.BomDetailId == updateData.BomDetailId; });
      if (index !== -1) {
        newArr[index] = updateData
      }

      setState({ ...state, data: [...newArr] });
    }
  }, [updateData]);

  //handle
  const handleDelete = async (bomDetail) => {
    if (window.confirm(intl.formatMessage({ id: bomDetail.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted' }))) {
      try {
        let res = await bomDetailService.deleteBomDetail({ BomDetailId: bomDetail.BomDetailId, row_version: bomDetail.row_version });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }))
          await fetchData(BomId);
        }
        else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

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

  async function fetchData(BomId) {
    setState({ ...state, isLoading: true });
    const params = {
      page: state.page,
      pageSize: state.pageSize,
      BomId: BomId
    }
    const res = await bomDetailService.getBomDetailList(params);
    if (res && res.Data)
      setState({
        ...state
        , data: res.Data ?? []
        , totalRow: res.TotalRow
        , isLoading: false
      });
  }

  return (
    <>
      <Grid container
        direction="row"
        justifyContent="space-between"
        alignItems="width-end" sx={{ mb: 1 }} >
        <Grid item xs={6}>
          <MuiButton text="create" color='success' onClick={handleAdd} sx={{ mt: 1 }} disabled={BomId ? false : true} />
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
        rowsPerPageOptions={[5, 8, 20]}
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        onPageSizeChange={(newPageSize) => setState({ ...state, pageSize: newPageSize, page: 1 })}
        getRowId={(rows) => rows.BomDetailId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`
        }}
      />

      <BOMDetailDialog
        BomId={BomId}
        setNewData={setNewData}
        setUpdateData={setUpdateData}
        initModal={rowData}
        isOpen={isShowing}
        onClose={toggle}
        mode={mode}
      />
    </>
  )
}
