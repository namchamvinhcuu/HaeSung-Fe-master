import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Grid, IconButton, TextField } from '@mui/material'
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
      keyWord: ''
    }
  });
  const [newData, setNewData] = useState({})
  const [rowData, setRowData] = useState({});

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
                <DeleteIcon fontSize="inherit" />
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
  ];

  useEffect(() => {
    fetchData();
  }, [moldState.page, moldState.pageSize]);

  const handleDelete = async (mold) => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
      try {
        let res = await moldService.deleteMold(mold.MoldId);
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }))
          await fetchData();
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
    newSearchData[inputName] = e.target.value;

    setMoldState({ ...moldState, searchData: { ...newSearchData } })
  }

  async function fetchData() {
    setMoldState({ ...moldState, isLoading: true });
    const params = {
      page: moldState.page,
      pageSize: moldState.pageSize,
      keyWord: moldState.searchData.keyWord
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

  return (
    <React.Fragment>
      <ThemeProvider theme={myTheme}>
        <Grid container
          direction="row"
          justifyContent="space-between"
          alignItems="flex-end" sx={{ mb: 1, pr: 1 }}>
          <Grid item xs={6}>
            <MuiButton text="create" color='success' onClick={handleAdd} />
          </Grid>

          <Grid item>
            <MuiSearchField
              label='general.name'
              name='keyWord'
              onClick={fetchData}
              onChange={(e) => handleSearch(e, 'keyWord')}
            />
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

        <MoldDialog setNewData={setNewData}
          initModal={rowData}
          isOpen={isShowing}
          onClose={toggle}
          loadData={fetchData}
          mode={mode}
        />

      </ThemeProvider>
    </React.Fragment>

  )
}
