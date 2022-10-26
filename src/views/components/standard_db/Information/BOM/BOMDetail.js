import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo';
import { FormControlLabel, Grid, IconButton, Switch, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid, MuiSelectField } from '@controls'
import { bomDetailService, bomService } from '@services'
import { useModal } from "@basesShared"
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import moment from 'moment';
import BOMDetailDialog from './BOMDetailDialog'

export default function BOMDetail({ BomId, newDataChild }) {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const [MaterialList, setMaterialList] = useState([]);
  const { isShowing, toggle } = useModal();
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 7,
    searchData: { showDelete: true, MaterialId: null },
    BomId: BomId
  });
  const [newData, setNewData] = useState({})
  const [updateData, setUpdateData] = useState({})
  const [rowData, setRowData] = useState({});

  const columns = [
    {
      field: 'id', headerName: '', flex: 0.1, align: 'center',
      filterable: false,
      renderCell: (index) => (index.api.getRowIndex(index.row.BomId) + 1) + (state.page - 1) * state.pageSize,
    },
    { field: 'BomId', hide: true },
    { field: 'ParentId', hide: true },
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
    { field: 'ParentCode', headerName: intl.formatMessage({ id: "bom.ParentCode" }), flex: 0.5, },
    { field: 'MaterialCode', headerName: intl.formatMessage({ id: "bom.MaterialId" }), flex: 0.5, },
    { field: 'MaterialUnit', headerName: intl.formatMessage({ id: "bom.Unit" }), flex: 0.5, },
    { field: 'BomLevel', headerName: intl.formatMessage({ id: "bom.BomLevel" }), flex: 0.5, },
    { field: 'Amount', headerName: intl.formatMessage({ id: "bom.Amount" }), flex: 0.5, },
    { field: 'Remark', headerName: intl.formatMessage({ id: "bom.Remark" }), flex: 0.7, },
    { field: 'createdName', headerName: intl.formatMessage({ id: "general.createdName" }), flex: 0.5, },
    {
      field: 'createdDate', headerName: intl.formatMessage({ id: "general.createdDate" }), width: 150,
      valueFormatter: params => params?.value ? moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss") : null
    },
    { field: 'modifiedName', headerName: intl.formatMessage({ id: "general.modifiedName" }), flex: 0.5, },
    {
      field: 'modifiedDate', headerName: intl.formatMessage({ id: "general.modifiedDate" }), width: 150,
      valueFormatter: params => params?.value ? moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss") : null
    },
  ];

  //useEffect
  useEffect(() => {
    getMaterial();
  }, [])

  useEffect(() => {
    fetchData(BomId);
    return () => { isRendered = false; }
  }, [state.page, state.pageSize, BomId, state.searchData.showDelete]);

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
    if (!_.isEmpty(newDataChild)) {
      const data = [newDataChild, ...state.data];
      if (data.length > state.pageSize) {
        data.pop();
      }
      setState({
        ...state
        , data: [...data]
        , totalRow: state.totalRow + 1
      });
    }
  }, [newDataChild]);

  useEffect(() => {
    if (!_.isEmpty(updateData) && !_.isEqual(updateData, rowData)) {
      let newArr = [...state.data]
      const index = _.findIndex(newArr, function (o) { return o.BomId == updateData.BomId; });
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
        let child = state.data.filter(x => x.ParentId == bomDetail.BomId);
        if (child.length == 0) {
        let res = await bomDetailService.deleteBomDetail({ BomDetailId: bomDetail.BomId, row_version: bomDetail.row_version });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }))
          await fetchData(BomId);
        }
        else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        }
      }
      else {
        ErrorAlert(intl.formatMessage({ id: 'bom.delete_error' }));
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
      showDelete: state.searchData.showDelete,
      MaterialId: state.searchData.MaterialId,
      BomId: BomId
    }
    const res = await bomDetailService.getBomDetailList(params);
    if (res && res.Data && isRendered)
      setState({
        ...state
        , data: res.Data ?? []
        , totalRow: res.TotalRow
        , isLoading: false
      });
  }

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

  const getMaterial = async () => {
    const res = await bomService.getMaterial(-2);
    if (res.HttpResponseCode === 200 && res.Data) {
      setMaterialList([...res.Data])
    }
  }

  return (
    <>
      <Grid container
        direction="row"
        justifyContent="space-between"
        alignItems="width-end" sx={{ mb: 0, mt: 2 }} >
        <Grid item xs={8}>
          <MuiButton text="create" color='success' onClick={handleAdd} sx={{ mt: 1 }} disabled={BomId ? false : true} />
        </Grid>
        <Grid item>
          <MuiSelectField
            label={intl.formatMessage({ id: 'bomDetail.MaterialId' })}
            options={MaterialList}
            displayLabel="MaterialCode"
            displayValue="MaterialId"
            displayGroup="GroupMaterial"
            onChange={(e, item) => handleSearch(item ? item.MaterialId ?? null : null, 'MaterialId')}
            variant="standard"
            disabled={BomId ? false : true}
            sx={{ width: 250 }}
          />
        </Grid>
        <Grid item>
          <MuiButton text="search" color='info' onClick={() => fetchData(BomId)} sx={{ mt: 1 }} disabled={BomId ? false : true} />
        </Grid>
        <Grid item>
          <FormControlLabel
            sx={{ mt: 1 }}
            control={<Switch disabled={BomId ? false : true} defaultChecked={true} color="primary" onChange={(e) => handleSearch(e.target.checked, 'showDelete')} />}
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
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        getRowId={(rows) => rows.BomId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData) || _.isEqual(params.row, newDataChild)) return `Mui-created`
        }}
      />

      <BOMDetailDialog
        initModal={rowData}
        isOpen={isShowing}
        onClose={toggle}
        setNewData={setNewData}
        setUpdateData={setUpdateData}
        mode={mode}
        BomId={BomId}
      />
    </>
  )
}
