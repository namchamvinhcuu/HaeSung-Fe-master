import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo';
import { FormControlLabel, Grid, IconButton, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid, MuiSelectField } from '@controls'
import { materialService } from '@services'
import { useModal } from "@basesShared"
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import moment from 'moment';
import MaterialDialog from './MaterialDialog'

export default function Material() {
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
      MaterialType: null,
      Unit: null,
      SupplierId: null,
      showDelete: true
    }
  });
  const [newData, setNewData] = useState({})
  const [updateData, setUpdateData] = useState({})
  const [rowData, setRowData] = useState({});
  const [MaterialTypeList, setMaterialTypeList] = useState([]);
  const [UnitList, setUnitList] = useState([]);
  const [SupplierList, setSupplierList] = useState([]);

  const columns = [
    {
      field: 'id', headerName: '', flex: 0.1, align: 'center',
      filterable: false,
      renderCell: (index) => (index.api.getRowIndex(index.row.MaterialId) + 1) + (state.page - 1) * state.pageSize,
    },
    { field: 'MaterialId', hide: true },
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
    { field: 'MaterialCode', headerName: intl.formatMessage({ id: "material.MaterialCode" }), flex: 0.5, },
    { field: 'MaterialTypeName', headerName: intl.formatMessage({ id: "material.MaterialType" }), flex: 0.5, },
    { field: 'UnitName', headerName: intl.formatMessage({ id: "material.Unit" }), flex: 0.5, },
    {
      field: 'SupplierNames', headerName: intl.formatMessage({ id: "material.SupplierId" }), flex: 0.7, renderCell: (params) => {
        return (
          <Tooltip title={params.row.SupplierNames ?? ""} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>{params.row.SupplierNames}</Typography>
          </Tooltip>
        )
      }
    },
    { field: 'Description', headerName: intl.formatMessage({ id: "material.Description" }), flex: 0.7, renderCell: (params) => {
      return (
        <Tooltip title={params.row.Description ?? ""} className="col-text-elip">
          <Typography sx={{ fontSize: 14, maxWidth: 200 }}>{params.row.Description}</Typography>
        </Tooltip>
      )
    }},
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
    getMaterialType();
    getUnit();
    getSupplier();
  }, [])

  useEffect(() => {
    fetchData();
    return () => { isRendered = false; }
  }, [state.page, state.pageSize, state.searchData.showDelete]);

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
      const index = _.findIndex(newArr, function (o) { return o.MaterialId == updateData.MaterialId; });
      if (index !== -1) {
        newArr[index] = updateData
      }

      setState({ ...state, data: [...newArr] });
    }
  }, [updateData]);

  //handle
  const handleDelete = async (material) => {
    if (window.confirm(intl.formatMessage({ id: material.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted' }))) {
      try {
        let res = await materialService.deleteMaterial({ MaterialId: material.MaterialId, row_version: material.row_version });
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

  const handleUpdate = async (row) => {
    setMode(UPDATE_ACTION);
    setRowData({ ...row, Suppliers: [] });
    const res = await materialService.getSupplierById(row.MaterialId);
    if (res.HttpResponseCode === 200 && res.Data) {
      setRowData({ ...row, Suppliers: res.Data })
    }
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
      MaterialType: state.searchData.MaterialType,
      Unit: state.searchData.Unit,
      SupplierId: state.searchData.SupplierId,
      showDelete: state.searchData.showDelete

    }
    const res = await materialService.getMaterialList(params);
    if (res && res.Data && isRendered)
      setState({
        ...state
        , data: res.Data ?? []
        , totalRow: res.TotalRow
        , isLoading: false
      });
  }

  const getMaterialType = async () => {
    const res = await materialService.getMaterialType();
    if (res.HttpResponseCode === 200 && res.Data) {
      setMaterialTypeList([...res.Data])
    }
  }

  const getUnit = async () => {
    const res = await materialService.getUnit();
    if (res.HttpResponseCode === 200 && res.Data) {
      setUnitList([...res.Data])
    }
  }

  const getSupplier = async () => {
    const res = await materialService.getSupplier();
    if (res.HttpResponseCode === 200 && res.Data) {
      setSupplierList([...res.Data])
    }
  }

  return (
    <React.Fragment>
      <Grid container
        direction="row"
        justifyContent="space-between"
        alignItems="width-end">
        <Grid item xs={3}>
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
            label={intl.formatMessage({ id: 'material.MaterialType' })}
            options={MaterialTypeList}
            displayLabel="commonDetailName"
            displayValue="commonDetailId"
            onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'MaterialType')}
            variant="standard"
            sx={{ width: 210 }}
          />
        </Grid>
        <Grid item>
          <MuiSelectField
            label={intl.formatMessage({ id: 'material.Unit' })}
            options={UnitList}
            displayLabel="commonDetailName"
            displayValue="commonDetailId"
            onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'Unit')}
            variant="standard"
            sx={{ width: 210 }}
          />
        </Grid>
        <Grid item>
          <MuiSelectField
            label={intl.formatMessage({ id: 'material.SupplierId' })}
            options={SupplierList}
            displayLabel="SupplierName"
            displayValue="SupplierId"
            onChange={(e, item) => handleSearch(item ? item.SupplierId ?? null : null, 'SupplierId')}
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
        rowsPerPageOptions={[5, 10, 20]}
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        onPageSizeChange={(newPageSize) => setState({ ...state, pageSize: newPageSize, page: 1 })}
        getRowId={(rows) => rows.MaterialId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`
        }}
      />

      <MaterialDialog
        valueOption={{ MaterialTypeList: MaterialTypeList, UnitList: UnitList, SupplierList: SupplierList }}
        setNewData={setNewData}
        setUpdateData={setUpdateData}
        initModal={rowData}
        isOpen={isShowing}
        onClose={toggle}
        mode={mode}
      />
    </React.Fragment>

  )
}
