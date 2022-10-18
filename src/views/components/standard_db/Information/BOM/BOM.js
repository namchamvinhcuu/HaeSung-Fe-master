import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo';
import { FormControlLabel, Grid, IconButton, Switch, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid, MuiSelectField } from '@controls'
import { bomService } from '@services'
import { useModal } from "@basesShared"
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import moment from 'moment';
import BOMDialog from './BOMDialog'
import BOMDetail from './BOMDetail'

export default function BOM() {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const { isShowing, toggle } = useModal();
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      keyWord: '',
      ProductId: null,
      showDelete: true
    }
  });
  const [newData, setNewData] = useState({})
  const [updateData, setUpdateData] = useState({})
  const [rowData, setRowData] = useState({});
  const [ProductList, setProductList] = useState([]);
  const [BomId, setBomId] = useState(null);

  const columns = [
    {
      field: 'id', headerName: '', flex: 0.1, align: 'center',
      filterable: false,
      renderCell: (index) => (index.api.getRowIndex(index.row.BomId) + 1) + (state.page - 1) * state.pageSize,
    },
    { field: 'BomId', hide: true },
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
    { field: 'BomCode', headerName: intl.formatMessage({ id: "bom.BomCode" }), flex: 0.5, },
    { field: 'ProductCode', headerName: intl.formatMessage({ id: "bom.ProductId" }), flex: 0.5, },
    { field: 'Remark', headerName: intl.formatMessage({ id: "bom.Remark" }), flex: 0.7, },
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
    getProduct();
  }, [])

  useEffect(() => {
    fetchData();
    return () => { isRendered = false; }
  }, [state.page, state.pageSize, state.searchData.showDelete]);

  useEffect(() => {
    if (!_.isEmpty(newData) && isRendered) {
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
    if (!_.isEmpty(updateData) && !_.isEqual(updateData, rowData) && isRendered) {
      let newArr = [...state.data]
      const index = _.findIndex(newArr, function (o) { return o.BomId == updateData.BomId; });
      if (index !== -1) {
        newArr[index] = updateData
      }

      setState({ ...state, data: [...newArr] });
    }
  }, [updateData]);

  //handle
  const handleDelete = async (bom) => {
    if (window.confirm(intl.formatMessage({ id: bom.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted' }))) {
      try {
        let res = await bomService.deleteBom({ BomId: bom.BomId, row_version: bom.row_version });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }))
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

  const handleUpdate = (row) => {
    setMode(UPDATE_ACTION);
    setRowData({ ...row });
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
    setBomId(null);

    const params = {
      page: state.page,
      pageSize: state.pageSize,
      keyWord: state.searchData.keyWord,
      ProductId: state.searchData.ProductId,
      showDelete: state.searchData.showDelete

    }
    const res = await bomService.getBomList(params);
    if (res && res.Data && isRendered)
      setState({
        ...state
        , data: res.Data ?? []
        , totalRow: res.TotalRow
        , isLoading: false
      });
  }

  const getProduct = async () => {
    const res = await bomService.getProduct();
    if (res.HttpResponseCode === 200 && res.Data) {
      setProductList([...res.Data])
    }
  }

  return (
    <React.Fragment>
      <Grid container
        direction="row"
        justifyContent="space-between"
        alignItems="width-end">
        <Grid item xs={6}>
          <MuiButton text="create" color='success' onClick={handleAdd} sx={{ mt: 1 }} />
        </Grid>
        <Grid item>
          <TextField
            sx={{ width: 210 }}
            fullWidth
            variant="standard"
            size='small'
            label='Code'
            onChange={(e) => handleSearch(e.target.value, 'keyWord')}
          />
        </Grid>
        <Grid item>
          <MuiSelectField
            label={intl.formatMessage({ id: 'bom.ProductId' })}
            options={ProductList}
            displayLabel="ProductCode"
            displayValue="ProductId"
            onChange={(e, item) => handleSearch(item ? item.ProductId ?? null : null, 'ProductId')}
            variant="standard"
            sx={{ width: 210 }}
          />
        </Grid>
        <Grid item>
          <MuiButton text="search" color='info' onClick={fetchData} sx={{ mt: 1 }} />
        </Grid>
        <Grid item>
          <FormControlLabel
            sx={{ mt: 1 }}
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
        //rowsPerPageOptions={[5, 8, 20]}
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        //onPageSizeChange={(newPageSize) => setState({ ...state, pageSize: newPageSize, page: 1 })}
        getRowId={(rows) => rows.BomId}
        //onRowClick={(rowData) => setBomId(rowData.row.BomId)}
        onSelectionModelChange={(newSelectedRowId) => setBomId(newSelectedRowId[0])}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`
        }}
      />

      <BOMDialog
        valueOption={{ ProductList: ProductList }}
        setNewData={setNewData}
        setUpdateData={setUpdateData}
        initModal={rowData}
        isOpen={isShowing}
        onClose={toggle}
        mode={mode}
      />
      {/* <BOMDetail BomId={BomId} /> */}
    </React.Fragment>

  )
}
