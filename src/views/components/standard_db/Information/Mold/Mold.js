import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo';
import { Autocomplete, FormControlLabel, Grid, IconButton, Switch, TextField } from '@mui/material'
import { createTheme, ThemeProvider } from "@mui/material"
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid, MuiSelectField } from '@controls'
import { moldService } from '@services'
import { useModal } from "@basesShared"
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import moment from 'moment';
import MoldDialog from './MoldDialog'

export default function Mold() {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const { isShowing, toggle } = useModal();
  const [moldState, setMoldState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      keyWord: '',
      Model: null,
      MoldType: null,
      MachineType: null,
      showDelete: true
    }
  });
  const [newData, setNewData] = useState({})
  const [updateData, setUpdateData] = useState({})
  const [rowData, setRowData] = useState({});
  const [PMList, setPMList] = useState([]);// Product Model list
  const [PTList, setPTList] = useState([]);// Product Type list
  const [MTList, setMTList] = useState([]);// Machine Type list

  const columns = [
    {
      field: 'id', headerName: '', width: 50, align: 'center',
      filterable: false,
      renderCell: (index) => (index.api.getRowIndex(index.row.MoldId) + 1) + (moldState.page - 1) * moldState.pageSize,
    },
    { field: 'MoldId', hide: true },
    { field: 'row_version', hide: true },
    {
      field: "action",
      headerName: "",
      width: 80,
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
    { field: 'MoldSerial', headerName: intl.formatMessage({ id: "mold.MoldSerial" }), width: 150, },
    { field: 'MoldCode', headerName: intl.formatMessage({ id: "mold.MoldCode" }), width: 150, },
    { field: 'ModelName', headerName: intl.formatMessage({ id: "mold.Model" }), width: 150, },
    { field: 'MoldTypeName', headerName: intl.formatMessage({ id: "mold.MoldType" }), width: 150, },
    { field: 'Inch', headerName: intl.formatMessage({ id: "mold.Inch" }), width: 100, },
    { field: 'MachineTypeName', headerName: intl.formatMessage({ id: "mold.MachineType" }), width: 150, },
    { field: 'MachineTon', headerName: intl.formatMessage({ id: "mold.MachineTon" }), width: 150, },
    {
      field: 'ETADate', headerName: intl.formatMessage({ id: "mold.ETADate" }), width: 150,
      valueFormatter: params => moment(params?.value).add(7, 'hours').format("YYYY-MM-DD")
    },
    { field: 'Cabity', headerName: intl.formatMessage({ id: "mold.Cabity" }), width: 100, },
    {
      field: 'ETAStatus', headerName: intl.formatMessage({ id: "mold.ETAStatus" }), width: 150, align: 'center',
      renderCell: params => params.row.ETAStatus ? "Y" : "N"
    },
    { field: 'Remark', headerName: intl.formatMessage({ id: "mold.Remark" }), width: 150, },
    { field: 'createdName', headerName: intl.formatMessage({ id: "general.createdName" }), width: 150, },
    {
      field: 'createdDate', headerName: intl.formatMessage({ id: "general.createdDate" }), width: 150,
      valueFormatter: params => params?.value ? moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss") : null
    },
    { field: 'modifiedName', headerName: intl.formatMessage({ id: "general.modifiedName" }), width: 150, },
    {
      field: 'modifiedDate', headerName: intl.formatMessage({ id: "general.modifiedDate" }), width: 150,
      valueFormatter: params => params?.value ? moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss") : null
    },
  ];

  //useEffect
  useEffect(() => {
    getProductModel();
    getProductType();
    getMachineType();
  }, [])

  useEffect(() => {
    fetchData();
    return () => { isRendered = false; }
  }, [moldState.page, moldState.pageSize, moldState.searchData.showDelete]);

  useEffect(() => {
    if (!_.isEmpty(newData)) {
      const data = [newData, ...moldState.data];
      if (data.length > moldState.pageSize) {
        data.pop();
      }
      setMoldState({
        ...moldState
        , data: [...data]
        , totalRow: moldState.totalRow + 1
      });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(updateData) && !_.isEqual(updateData, rowData)) {
      let newArr = [...moldState.data]
      const index = _.findIndex(newArr, function (o) { return o.MoldId == updateData.MoldId; });
      if (index !== -1) {
        newArr[index] = updateData
      }

      setMoldState({ ...moldState, data: [...newArr] });
    }
  }, [updateData]);

  //handle 
  const handleDelete = async (mold) => {
    if (window.confirm(intl.formatMessage({ id: mold.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted' }))) {
      try {
        let res = await moldService.deleteMold({ MoldId: mold.MoldId, row_version: mold.row_version });
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
    let newSearchData = { ...moldState.searchData };
    newSearchData[inputName] = e;
    if (inputName == 'showDelete') {
      setMoldState({ ...moldState, page: 1, searchData: { ...newSearchData } })
    }
    else {

      setMoldState({ ...moldState, searchData: { ...newSearchData } })
    }
  }

  const handleCellClick = (param, event) => {
    //disable click cell 
    event.defaultMuiPrevented = (param.field === "action");
  };

  async function fetchData() {
    setMoldState({ ...moldState, isLoading: true });
    const params = {
      page: moldState.page,
      pageSize: moldState.pageSize,
      keyWord: moldState.searchData.keyWord,
      Model: moldState.searchData.Model,
      MoldType: moldState.searchData.MoldType,
      MachineType: moldState.searchData.MachineType,
      showDelete: moldState.searchData.showDelete

    }
    const res = await moldService.getMoldList(params);
    if (res && res.Data && isRendered)
      setMoldState({
        ...moldState
        , data: res.Data ?? []
        , totalRow: res.TotalRow
        , isLoading: false
      });
  }

  const getProductModel = async () => {
    const res = await moldService.getProductModel();
    if (res.HttpResponseCode === 200 && res.Data && isRendered) {
      setPMList([...res.Data])
    }
  }

  const getProductType = async () => {
    const res = await moldService.getProductType();
    if (res.HttpResponseCode === 200 && res.Data && isRendered) {
      setPTList([...res.Data])
    }
  }

  const getMachineType = async () => {
    const res = await moldService.getMachineType();
    if (res.HttpResponseCode === 200 && res.Data && isRendered) {
      setMTList([...res.Data])
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
            sx={{ width: 200 }}
            fullWidth
            variant="standard"
            size='small'
            label='Serial / Code'
            onChange={(e) => handleSearch(e.target.value, 'keyWord')}
          />
        </Grid>
        <Grid item>
          <MuiSelectField
            label={intl.formatMessage({ id: 'mold.Model' })}
            options={PMList}
            displayLabel="commonDetailName"
            displayValue="commonDetailId"
            onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'Model')}
            variant="standard"
            sx={{ width: 200 }}
          />
        </Grid>
        <Grid item>
          <MuiSelectField
            label={intl.formatMessage({ id: 'mold.MoldType' })}
            options={PTList}
            displayLabel="commonDetailName"
            displayValue="commonDetailId"
            onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'MoldType')}
            variant="standard"
            sx={{ width: 200 }}
          />
        </Grid>
        <Grid item>
          <MuiSelectField
            label={intl.formatMessage({ id: 'mold.MachineType' })}
            options={MTList}
            displayLabel="commonDetailName"
            displayValue="commonDetailId"
            onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'MachineType')}
            variant="standard"
            sx={{ width: 200 }}
          />
        </Grid>
        <Grid item>
          <MuiButton text="search" color='info' onClick={fetchData} sx={{ mt: 1 }} />
        </Grid>
        <Grid item>
          <FormControlLabel
            sx={{ mt: 1 }}
            control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleSearch(e.target.checked, 'showDelete')} />}
            label={intl.formatMessage({ id: moldState.searchData.showDelete ? 'general.data_actived' : 'general.data_deleted' })} />
        </Grid>
      </Grid>
      <MuiDataGrid
        showLoading={moldState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={columns}
        rows={moldState.data}
        gridHeight={736}
        page={moldState.page - 1}
        pageSize={moldState.pageSize}
        rowCount={moldState.totalRow}
        rowsPerPageOptions={[5, 10, 20]}
        onPageChange={(newPage) => setMoldState({ ...moldState, page: newPage + 1 })}
        onPageSizeChange={(newPageSize) => setMoldState({ ...moldState, pageSize: newPageSize, page: 1 })}
        onCellClick={handleCellClick}
        getRowId={(rows) => rows.MoldId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`
        }}
      />

      <MoldDialog
        valueOption={{ PMList: PMList, PTList: PTList, MTList: MTList }}
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
