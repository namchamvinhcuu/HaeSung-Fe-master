import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo';
import { Autocomplete, FormControlLabel, Grid, IconButton, Switch, TextField } from '@mui/material'
import { createTheme, ThemeProvider } from "@mui/material"
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls'
import { moldService } from '@services'
import { useModal } from "@basesShared"
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import moment from 'moment';
import MoldDialog from './MoldDialog'

const myTheme = createTheme({
  components: {
    MuiDataGrid: {
      styleOverrides: {
        row: {
          "&.Mui-created": {
            backgroundColor: "#A0DB8E",
          }
        }
      }
    }
  }
});

export default function Mold() {
  const intl = useIntl();
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
  const [rowData, setRowData] = useState({});
  const [PMList, setPMList] = useState([]);// Product Model list
  const [PTList, setPTList] = useState([]);// Product Type list
  const [MTList, setMTList] = useState([]);// Machine Type list

  const columns = [
    { field: 'MoldId', hide: true },
    { field: 'row_version', hide: true },
    {
      field: "action",
      headerName: "",
      flex: 0.4,
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      //width: 150,
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
    { field: 'MoldSerial', headerName: intl.formatMessage({ id: "mold.MoldSerial" }), flex: 0.7, },
    { field: 'MoldCode', headerName: intl.formatMessage({ id: "mold.MoldCode" }), flex: 0.7, },
    { field: 'ModelName', headerName: intl.formatMessage({ id: "mold.ModelName" }), flex: 0.7, },
    { field: 'MoldTypeName', headerName: intl.formatMessage({ id: "mold.MoldTypeName" }), flex: 0.7, },
    { field: 'Inch', headerName: intl.formatMessage({ id: "mold.Inch" }), flex: 0.4, },
    { field: 'MachineTypeName', headerName: intl.formatMessage({ id: "mold.MachineTypeName" }), flex: 0.7, },
    {
      field: 'ETADate', headerName: intl.formatMessage({ id: "mold.ETADate" }), flex: 0.7,
      valueFormatter: params => moment(params?.value).format("DD/MM/YYYY")
    },
    { field: 'Cabity', headerName: intl.formatMessage({ id: "mold.Cabity" }), flex: 0.4, },
    {
      field: 'ETAStatus', headerName: intl.formatMessage({ id: "mold.ETAStatus" }), flex: 0.5,
      renderCell: params => params.row.ETAStatus ? "Y" : "N"
    },
    { field: 'Remark', headerName: intl.formatMessage({ id: "mold.Remark" }), flex: 0.7, },
    { field: 'createdName', headerName: intl.formatMessage({ id: "general.createdName" }), flex: 0.4, },
    {
      field: 'createdDate', headerName: intl.formatMessage({ id: "general.createdDate" }), flex: 0.5,
      valueFormatter: params => params?.value ? moment(params?.value).format("DD/MM/YYYY") : null
    },
    { field: 'modifiedName', headerName: intl.formatMessage({ id: "general.modifiedName" }), flex: 0.4, },
    {
      field: 'modifiedDate', headerName: intl.formatMessage({ id: "general.modifiedDate" }), flex: 0.5,
      valueFormatter: params => params?.value ? moment(params?.value).format("DD/MM/YYYY") : null
    },
  ];

  useEffect(() => {
    fetchData();
  }, [moldState.page, moldState.pageSize, moldState.searchData.showDelete]);

  const handleDelete = async (mold) => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
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
    console.log('a', inputName)
    let newSearchData = { ...moldState.searchData };
    newSearchData[inputName] = e;
    if (inputName == 'showDelete') {
      console.log(moldState, inputName)
      setMoldState({ ...moldState, page: 1, searchData: { ...newSearchData } })
    }
    else {

      setMoldState({ ...moldState, searchData: { ...newSearchData } })
    }
  }

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
    setMoldState({
      ...moldState
      , data: [...res.Data]
      , totalRow: res.TotalRow
      , isLoading: false
    });
  }

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

  const handleCellClick = (param, event) => {
    //disable click cell 
    event.defaultMuiPrevented = (param.field === "action");
  };

  useEffect(() => {
    getProductModel();
    getProductType();
    getMachineType();
  }, [])

  const getProductModel = async () => {
    const res = await moldService.getProductModel();
    if (res.HttpResponseCode === 200 && res.Data) {
      setPMList([...res.Data])
    }
  }

  const getProductType = async () => {
    const res = await moldService.getProductType();
    if (res.HttpResponseCode === 200 && res.Data) {
      setPTList([...res.Data])
    }
  }

  const getMachineType = async () => {
    const res = await moldService.getMachineType();
    if (res.HttpResponseCode === 200 && res.Data) {
      setMTList([...res.Data])
    }
  }

  return (
    <React.Fragment>
      <ThemeProvider theme={myTheme}>
        <Grid container

          direction="row"
          justifyContent="space-between"
          alignItems="flex-end" sx={{ mb: 1, pr: 1 }}>
          <Grid item xs={3}>
            <MuiButton text="create" color='success' onClick={handleAdd} />
          </Grid>
          <Grid item>
            <TextField
              sx={{ width: 200 }}
              fullWidth
              variant="standard"
              size='small'
              label='Code / Serial'
              onChange={(e) => handleSearch(e.target.value, 'keyWord')}
            />
          </Grid>
          <Grid item>
            <Autocomplete
              fullWidth
              size='small'
              options={PMList}
              autoHighlight
              openOnFocus
              getOptionLabel={option => option.commonDetailName}
              isOptionEqualToValue={(option, value) => option.commonDetailId === value.commonDetailId}
              onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'Model')}
              renderInput={(params) => {
                return <TextField {...params} label={intl.formatMessage({ id: 'mold.Model' })} variant="standard" sx={{ width: 200 }} />
              }}
            />
          </Grid>
          <Grid item>
            <Autocomplete
              fullWidth
              size='small'
              options={PTList}
              autoHighlight
              openOnFocus
              getOptionLabel={option => option.commonDetailName}
              isOptionEqualToValue={(option, value) => option.commonDetailId === value.commonDetailId}
              onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'MoldType')}
              renderInput={(params) => {
                return <TextField {...params} label={intl.formatMessage({ id: 'mold.MoldType' })} variant="standard" sx={{ width: 200 }} />
              }}
            />
          </Grid>
          <Grid item>
            <Autocomplete
              fullWidth
              size='small'
              options={MTList}
              autoHighlight
              openOnFocus
              getOptionLabel={option => option.commonDetailName}
              isOptionEqualToValue={(option, value) => option.commonDetailId === value.commonDetailId}
              onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'MachineType')}
              renderInput={(params) => {
                return <TextField {...params} label={intl.formatMessage({ id: 'mold.MachineType' })} variant="standard" sx={{ width: 200 }} />
              }}
            />
          </Grid>
          <Grid item>
            <MuiButton text="search" color='info' onClick={fetchData} sx={{ m: 0 }} />
          </Grid>
          <Grid item>
            <FormControlLabel
              sx={{ mb: 0 }}
              control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleSearch(e.target.checked, 'showDelete')} />}
              label={moldState.searchData.showDelete ? "Active Data" : "Delete Data"} />
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
          setNewData={setNewData}
          initModal={rowData}
          isOpen={isShowing}
          onClose={toggle}
          loadData={fetchData}
          mode={mode}
        />

      </ThemeProvider>
    </React.Fragment >

  )
}
