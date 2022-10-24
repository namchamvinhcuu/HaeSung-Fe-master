import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo';
import { FormControlLabel, Grid, IconButton, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid, MuiSelectField } from '@controls'
import { documentService } from '@services'
import { useModal } from "@basesShared"
import { ErrorAlert, SuccessAlert, GetLocalStorage } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION, TOKEN_ACCESS, BASE_URL } from '@constants/ConfigConstants';
import moment from 'moment';
import DocumentDialog from './DocumentDialog'

export default function Document() {
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
      language: '',
      showDelete: true
    }
  });
  const [newData, setNewData] = useState({})
  const [updateData, setUpdateData] = useState({})
  const [rowData, setRowData] = useState({});
  const [MenuComponentList, setMenuComponentList] = useState([]);
  const [LanguageList, setLanguageList] = useState([]);

  const columns = [
    {
      field: 'id', headerName: '', flex: 0.1, align: 'center',
      filterable: false,
      renderCell: (index) => (index.api.getRowIndex(index.row.documentId) + 1) + (state.page - 1) * state.pageSize,
    },
    { field: 'documentId', hide: true },
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
    { field: 'menuName', headerName: intl.formatMessage({ id: "document.menuName" }), flex: 0.5, },
    { field: 'menuComponent', headerName: intl.formatMessage({ id: "document.menuComponent" }), flex: 0.5, },
    { field: 'language', headerName: intl.formatMessage({ id: "document.language" }), flex: 0.5, },
    {
      field: 'urlFile', headerName: intl.formatMessage({ id: "document.urlFile" }), flex: 0.8,
      renderCell: (params) => {
        return <a href={`${BASE_URL}/document/${params.row.language}/${params.row.urlFile}`} style={{ fontSize: 14, cursor: 'pointer' }} target="_blank">
          {params.row.urlFile}
        </a>
      }
    },
    { field: 'createdName', headerName: intl.formatMessage({ id: "general.createdName" }), flex: 0.3, },
    {
      field: 'createdDate', headerName: intl.formatMessage({ id: "general.createdDate" }), flex: 0.4,
      valueFormatter: params => params?.value ? moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss") : null
    },
    { field: 'modifiedName', headerName: intl.formatMessage({ id: "general.modifiedName" }), flex: 0.3, },
    {
      field: 'modifiedDate', headerName: intl.formatMessage({ id: "general.modifiedDate" }), flex: 0.4,
      valueFormatter: params => params?.value ? moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss") : null
    },
  ];

  //useEffect
  useEffect(() => {
    getMenuComponent();
    getLanguage();
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
      const index = _.findIndex(newArr, function (o) { return o.documentId == updateData.documentId; });
      if (index !== -1) {
        newArr[index] = updateData
      }

      setState({ ...state, data: [...newArr] });
    }
  }, [updateData]);

  //handle
  const handleDelete = async (document) => {
    if (window.confirm(intl.formatMessage({ id: document.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted' }))) {
      try {
        let res = await documentService.deleteDocument({ documentId: document.documentId, row_version: document.row_version });
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
    setRowData(row);
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

  const handleDownload = async (row) => {
    const token = GetLocalStorage(TOKEN_ACCESS);
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': `Bearer ${token}`
      }
    }

    fetch(`${API_URL}Document/download/${row.menuComponent}/${row.language}`, options)
      .then(response => {
        if (response.status == 200) {
          response.blob().then(blob => {
            let url = URL.createObjectURL(blob);
            let downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'document.pdf';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
          });
        }
        else {
          ErrorAlert(intl.formatMessage({ id: "document.FileNotFound" }));
        }
      });
  };

  async function fetchData() {
    setState({ ...state, isLoading: true });
    const params = {
      page: state.page,
      pageSize: state.pageSize,
      keyWord: state.searchData.keyWord,
      language: state.searchData.language,
      showDelete: state.searchData.showDelete

    }
    const res = await documentService.getDocumentList(params);
    if (res && res.Data && isRendered)
      setState({
        ...state
        , data: res.Data ?? []
        , totalRow: res.TotalRow
        , isLoading: false
      });
  }

  const getMenuComponent = async () => {
    const res = await documentService.getMenu();
    if (res.HttpResponseCode === 200 && res.Data) {
      setMenuComponentList([...res.Data])
    }
  }

  const getLanguage = async () => {
    const res = await documentService.getLanguage();
    if (res.HttpResponseCode === 200 && res.Data) {
      setLanguageList([...res.Data])
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
            label={intl.formatMessage({ id: "document.menuComponent" })}
            onChange={(e) => handleSearch(e.target.value, 'keyWord')}
          />
        </Grid>
        <Grid item>
          <MuiSelectField
            label={intl.formatMessage({ id: 'document.language' })}
            options={LanguageList}
            displayLabel="commonDetailName"
            displayValue="commonDetailName"
            onChange={(e, item) => handleSearch(item ? item.commonDetailName ?? null : null, 'language')}
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
        getRowId={(rows) => rows.documentId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`
        }}
      />

      <DocumentDialog
        valueOption={{ MenuComponentList: MenuComponentList, LanguageList: LanguageList }}
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
