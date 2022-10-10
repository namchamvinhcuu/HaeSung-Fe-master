import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Badge, Grid, IconButton, TextField } from '@mui/material'
import { createTheme, ThemeProvider } from "@mui/material"
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid } from '@controls'
import { userService, roleService, moldService } from '@services'
import { useModal, useModal2, useModal3 } from "@basesShared"
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
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
  const { isShowing2, toggle2 } = useModal2();
  const { isShowing3, toggle3 } = useModal3();
  const [moldState, setMoldState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
  });

  const [newData, setNewData] = useState({})
  const [rowData, setRowData] = useState({});
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState(0);
  const [selectMenu, setSelectMenu] = useState([]);
  const [selectPermission, setSelectPermission] = useState([]);

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
    { field: 'ETADate', headerName: intl.formatMessage({ id: "mold.ETADate" }), flex: 0.7, },
    { field: 'Cabity', headerName: intl.formatMessage({ id: "mold.Cabity" }), flex: 0.4, },
    {
      field: 'ETAStatus', headerName: intl.formatMessage({ id: "mold.ETAStatus" }), flex: 0.5, renderCell: (params) => {
        return (
          params.row.ETAStatus ? "Y" : "N"
        )
      }
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

  const handleRoleClick = async (Id) => {
    setRoleId(Id);
    fetchDataPermission(Id);
    fetchDataMenu(Id);
  }

  const handleAdd = () => {
    setMode(CREATE_ACTION);
    setRowData();
    toggle3();
  };

  const handleUpdate = (row) => {
    setMode(UPDATE_ACTION);
    setRowData({ ...row });
    toggle3();
  };

  const handleDeleteMenu = async () => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
      try {
        let res = await roleService.deleteMenu({ menuIds: selectMenu, roleId: roleId });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }))
          await fetchDataMenu(roleId);
        }
      } catch (error) {
        console.log(error)
      }
    }
  };

  const handleDeletePermission = async () => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
      try {
        let res = await roleService.deletePermission({ permissionIds: selectPermission, roleId: roleId });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }))
          await fetchDataPermission(roleId);
        }
      } catch (error) {
        console.log(error)
      }
    }
  };

  async function fetchData() {
    setMoldState({
      ...moldState
      , isLoading: true

    });
    const params = {
      page: moldState.page,
      pageSize: moldState.pageSize,
      keyword: search
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
        <Grid container sx={{ mb: 1 }}>
          <Grid item xs={8}>
            <MuiButton text="create" color='success' onClick={handleAdd} />
          </Grid>
          <Grid item xs={4} container>
            {/* <Grid item xs={9}>
              <TextField
                fullWidth
                size='small'
                label={intl.formatMessage({ id: 'user.userName' })}
                onChange={e => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={3}>
              <MuiButton text="search" color='info' onClick={fetchData} sx={{ m: 0, ml: 2 }} />
            </Grid> */}
          </Grid>
        </Grid>
        <MuiDataGrid
          getData={userService.getUserList}
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
          onPageChange={(newPage) => {
            setMoldState({ ...moldState, page: newPage + 1 });
          }}
          onPageSizeChange={(newPageSize) => {
            setMoldState({ ...moldState, pageSize: newPageSize, page: 1 });
          }}
          onCellClick={handleCellClick}
          onRowClick={(rowData) => handleRoleClick(rowData.row.roleId)}
          getRowId={(rows) => rows.MoldId}
          getRowClassName={(params) => {
            if (_.isEqual(params.row, newData)) {
              return `Mui-created`
            }
          }}
        />

        <MoldDialog setNewData={setNewData}
          initModal={rowData}
          isOpen={isShowing3}
          onClose={toggle3}
          loadData={fetchData}
          mode={mode}
        />

      </ThemeProvider>
    </React.Fragment>

  )
}
