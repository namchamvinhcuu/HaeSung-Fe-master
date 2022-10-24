import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo';
import { FormControlLabel, Grid, IconButton, Switch, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid, MuiSelectField } from '@controls'
import { trayService } from '@services'
import { useModal } from "@basesShared"
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import moment from 'moment';
import TrayDialog from './TrayDialog'
 
export default function Tray() {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const { isShowing, toggle } = useModal();
  const [trayState, setTrayState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      keyWord: '',
      TrayType: null,
      showDelete: true
    }
  });
  const [newData, setNewData] = useState({})
  const [updateData, setUpdateData] = useState({})
  const [rowData, setRowData] = useState({});
  const [TrayTypeList, setTrayTypeList] = useState([]);

  const columns = [
    {
      field: 'id', headerName: '', flex: 0.1, align: 'center',
      filterable: false,
      renderCell: (index) => (index.api.getRowIndex(index.row.TrayId) + 1) + (trayState.page - 1) * trayState.pageSize,
    },
    { field: 'TrayId', hide: true },
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
    { field: 'TrayCode', headerName: intl.formatMessage({ id: "tray.TrayCode" }), flex: 0.5, },
    { field: 'TrayTypeName', headerName: intl.formatMessage({ id: "tray.TrayType" }), flex: 0.5, },
    {
      field: 'IsReuse', headerName: intl.formatMessage({ id: "tray.IsReuse" }), flex: 0.5, align: 'center',
      renderCell: params => params.row.IsReuse ? "Y" : "N"
    },
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
    getTrayType();
    return () => { isRendered = false; }
  }, [])

  useEffect(() => {
    fetchData();
  }, [trayState.page, trayState.pageSize, trayState.searchData.showDelete]);

  useEffect(() => {
    if (!_.isEmpty(newData) && isRendered) {
      const data = [newData, ...trayState.data];
      if (data.length > trayState.pageSize) {
        data.pop();
      }
      setTrayState({
        ...trayState
        , data: [...data]
        , totalRow: trayState.totalRow + 1
      });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(updateData) && !_.isEqual(updateData, rowData) && isRendered) {
      let newArr = [...trayState.data]
      const index = _.findIndex(newArr, function (o) { return o.TrayId == updateData.TrayId; });
      if (index !== -1) {
        newArr[index] = updateData
      }

      setTrayState({ ...trayState, data: [...newArr] });
    }
  }, [updateData]);

  //handle
  const handleDelete = async (tray) => {
    if (window.confirm(intl.formatMessage({ id: tray.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted' }))) {
      try {
        let res = await trayService.deleteTray({ TrayId: tray.TrayId, row_version: tray.row_version });
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
    let newSearchData = { ...trayState.searchData };
    newSearchData[inputName] = e;
    if (inputName == 'showDelete') {
      setTrayState({ ...trayState, page: 1, searchData: { ...newSearchData } })
    }
    else {
      setTrayState({ ...trayState, searchData: { ...newSearchData } })
    }
  }

  async function fetchData() {
    setTrayState({ ...trayState, isLoading: true });
    const params = {
      page: trayState.page,
      pageSize: trayState.pageSize,
      keyWord: trayState.searchData.keyWord,
      TrayType: trayState.searchData.TrayType,
      showDelete: trayState.searchData.showDelete

    }
    const res = await trayService.getTrayList(params);
    if (res && res.Data && isRendered)
      setTrayState({
        ...trayState
        , data: res.Data ?? []
        , totalRow: res.TotalRow
        , isLoading: false
      });
  }

  const getTrayType = async () => {
    const res = await trayService.GetTrayType();
    if (res.HttpResponseCode === 200 && res.Data && isRendered) {
      setTrayTypeList([...res.Data])
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
            sx={{ width: 220 }}
            fullWidth
            variant="standard"
            size='small'
            label='Code'
            onChange={(e) => handleSearch(e.target.value, 'keyWord')}
          />
        </Grid>
        <Grid item>
          <MuiSelectField
            label={intl.formatMessage({ id: 'tray.TrayType' })}
            options={TrayTypeList}
            displayLabel="commonDetailName"
            displayValue="commonDetailId"
            onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'TrayType')}
            variant="standard"
            sx={{ width: 220 }}
          />
        </Grid>
        <Grid item>
          <MuiButton text="search" color='info' onClick={fetchData} sx={{ mt: 1 }} />
        </Grid>
        <Grid item>
          <FormControlLabel
            sx={{ mt: 1 }}
            control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleSearch(e.target.checked, 'showDelete')} />}
            label={intl.formatMessage({ id: trayState.searchData.showDelete ? 'general.data_actived' : 'general.data_deleted' })} />
        </Grid>
      </Grid>
      <MuiDataGrid
        showLoading={trayState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={columns}
        rows={trayState.data}
        gridHeight={736}
        page={trayState.page - 1}
        pageSize={trayState.pageSize}
        rowCount={trayState.totalRow}
        rowsPerPageOptions={[5, 10, 20]}
        onPageChange={(newPage) => setTrayState({ ...trayState, page: newPage + 1 })}
        onPageSizeChange={(newPageSize) => setTrayState({ ...trayState, pageSize: newPageSize, page: 1 })}
        getRowId={(rows) => rows.TrayId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`
        }}
      />

      <TrayDialog
        valueOption={{ TrayTypeList: TrayTypeList }}
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
