import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo';
import { FormControlLabel, Grid, IconButton, Switch } from '@mui/material'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid } from '@controls'
import { purchaseOrderService } from '@services'
import { useModal } from "@basesShared"
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import FixedPODetailDialog from './FixedPODetailDialog';
import moment from 'moment';

export default function FixedPODetail({ PoId, updateDataPO, setUpdateDataPO }) {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const { isShowing, toggle } = useModal();
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 7,
    searchData: {
      keyWord: '',
      MaterialType: null,
      Unit: null,
      SupplierId: null,
      showDelete: true
    }
  });
  const [newData, setNewData] = useState({})
  const [updateData, setUpdateData] = useState({})
  const [rowData, setRowData] = useState({});

  const columns = [
    {
      field: 'id', headerName: '', flex: 0.1, align: 'center',
      filterable: false,
      renderCell: (index) => (index.api.getRowIndex(index.row.PoDetailId) + 1) + (state.page - 1) * state.pageSize,
    },
    { field: 'PoDetailId', hide: true },
    { field: 'PoId', hide: true },
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
    { field: 'MaterialCode', headerName: intl.formatMessage({ id: "purchase_order.MaterialId" }), flex: 0.5, },
    { field: 'Description', headerName: intl.formatMessage({ id: "purchase_order.Description" }), flex: 0.8, },
    { field: 'Qty', headerName: intl.formatMessage({ id: "purchase_order.Qty" }), flex: 0.4, },
    { field: 'RemainQty', headerName: intl.formatMessage({ id: "purchase_order.RemainQty" }), flex: 0.4, },
    {
      field: "DeliveryDate", headerName: intl.formatMessage({ id: "purchase_order.DeliveryDate" }), width: 150,
      valueFormatter: (params) => { if (params.value !== null) { return moment(params?.value).format("YYYY-MM-DD"); } },
    },
    {
      field: "DueDate", headerName: intl.formatMessage({ id: "purchase_order.DueDate" }), width: 150,
      valueFormatter: (params) => { if (params.value !== null) { return moment(params?.value).format("YYYY-MM-DD"); } },
    },
    { field: 'createdName', headerName: intl.formatMessage({ id: "general.createdName" }), flex: 0.4, },
    {
      field: 'createdDate', headerName: intl.formatMessage({ id: "general.createdDate" }), flex: 0.5,
      valueFormatter: params => params?.value ? moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss") : null
    },
    { field: 'modifiedName', headerName: intl.formatMessage({ id: "general.modifiedName" }), flex: 0.4, },
    {
      field: 'modifiedDate', headerName: intl.formatMessage({ id: "general.modifiedDate" }), flex: 0.5,
      valueFormatter: params => params?.value ? moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss") : null
    },
  ];

  //useEffect
  useEffect(() => {
    if (PoId || PoId == 0)
      fetchData();
    return () => { isRendered = false; }
  }, [state.page, state.pageSize, state.searchData.showDelete, PoId]);

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
      const index = _.findIndex(newArr, function (o) { return o.PoDetailId == updateData.PoDetailId; });
      if (index !== -1) {
        newArr[index] = updateData
      }

      setState({ ...state, data: [...newArr] });
    }
  }, [updateData]);

  //handle
  const handleDelete = async (row) => {
    if (window.confirm(intl.formatMessage({ id: row.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted' }))) {
      try {
        let res = await purchaseOrderService.deletePODetail({ PoDetailId: row.PoDetailId, row_version: row.row_version });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }))
          //Update qty Po
          let TotalQtyNew = updateDataPO.TotalQty - row.Qty
          setUpdateDataPO({ ...updateDataPO, TotalQty: TotalQtyNew });
          await fetchData();
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

  const handleUpdate = async (row) => {
    setMode(UPDATE_ACTION);
    setRowData({ ...row, Suppliers: [] });
    toggle();
  };

  const handleSearch = (e, inputName) => {
    let newSearchData = { ...state.searchData };
    newSearchData[inputName] = e;
    if (inputName == 'showDelete') {
      setState({ ...state, page: 1, searchData: { ...newSearchData } })
    }
    else {
      setState({ ...state, searchData: { ...newSearchData } })
    }
  }

  async function fetchData() {
    setState({ ...state, isLoading: true });
    const params = {
      page: state.page,
      pageSize: state.pageSize,
      keyWord: state.searchData.keyWord,
      isActived: state.searchData.showDelete

    }
    const res = await purchaseOrderService.getPODetail(PoId, params);
    if (res && res.Data)
      setState({
        ...state
        , data: res.Data ?? []
        , totalRow: res.TotalRow
        , isLoading: false
      });
  }

  return (
    <React.Fragment>
      <Grid container
        direction="row"
        justifyContent="space-between"
        alignItems="width-end"
        sx={{ mt: 2 }}
      >
        <Grid item xs={9}>
          <MuiButton text="create" color='success' onClick={handleAdd} sx={{ mt: 1 }} disabled={PoId ? false : true} />
        </Grid>
        <Grid item>
          <FormControlLabel
            sx={{ mt: 1 }}
            disabled={PoId ? false : true}
            control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleSearch(e.target.checked, 'showDelete')} />}
            label={intl.formatMessage({ id: state.searchData.showDelete ? 'general.data_actived' : 'general.data_deleted' })} />
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
        rowsPerPageOptions={[5, 10, 20]}
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        onPageSizeChange={(newPageSize) => setState({ ...state, pageSize: newPageSize, page: 1 })}
        getRowId={(rows) => rows.PoDetailId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`
        }}
      />

      <FixedPODetailDialog
        PoId={PoId}
        setNewData={setNewData}
        setUpdateData={setUpdateData}
        updateDataPO={updateDataPO}
        setUpdateDataPO={setUpdateDataPO}
        initModal={rowData}
        isOpen={isShowing}
        onClose={toggle}
        mode={mode}
      />
    </React.Fragment>

  )
}
