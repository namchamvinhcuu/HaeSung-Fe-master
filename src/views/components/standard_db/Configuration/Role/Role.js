import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Badge, Grid, IconButton, TextField } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock';
import { createTheme, ThemeProvider } from "@mui/material"
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid } from '@controls'
import { userService, roleService } from '@services'

import { useModal, useModal2, useModal3 } from "@basesShared";
import { ErrorAlert, SuccessAlert } from '@utils'
import RoleAddMenuDialog from './RoleAddMenuDialog'
import RoleAddPermissionDialog from './RoleAddPermissionDialog'

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

export default function Role() {
  const intl = useIntl();
  const { isShowing, toggle } = useModal();
  const { isShowing2, toggle2 } = useModal2();
  const { isShowing3, toggle3 } = useModal3();
  const [userState, setUserState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 10,
  });

  const [permissionState, setPermissionState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 10,
  });

  const [menuState, setMenuState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 10,
  });

  const [newData, setNewData] = useState({})
  const [rowData, setRowData] = useState({});
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState(0);
  const [selectMenu, setSelectMenu] = useState([]);
  const [selectPermission, setSelectPermission] = useState([]);

  const columns = [
    { field: 'roleId', hide: true },
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
            <Grid item xs={4} style={{ textAlign: "center" }}>
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
            <Grid item xs={4} style={{ textAlign: "center" }}>
              <IconButton
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ '&:hover': { border: '1px solid orange', }, }]}
                onClick={() => handleChangePass(params.row)}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Grid>
            <Grid item xs={4} style={{ textAlign: "center" }}>
              <IconButton
                aria-label="edit"
                color="success"
                size="small"
                sx={[{ '&:hover': { border: '1px solid green', }, }]}
                onClick={() => handleUpdate(params.row)}
              >
                <LockIcon fontSize="inherit" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },
    { field: 'roleName', headerName: intl.formatMessage({ id: "role.roleName" }), flex: 0.7, },

  ];

  const permissionColumns = [
    { field: 'permissionId', hide: true },
    { field: 'permissionName', headerName: intl.formatMessage({ id: "role.permissionName" }), flex: 0.7, },
  ];

  const menuColumns = [
    { field: 'menuId', hide: true },
    { field: 'menuName', headerName: intl.formatMessage({ id: "role.menuName" }), flex: 0.7, },
  ];

  useEffect(() => {
    fetchData();
  }, [userState.page, userState.pageSize]);

  useEffect(() => {
    fetchDataPermission(roleId);
  }, [permissionState.page, permissionState.pageSize, roleId]);

  useEffect(() => {
    fetchDataMenu(roleId);
  }, [menuState.page, menuState.pageSize, roleId]);

  const handleDelete = async (user) => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
      try {
        let res = await userService.deleteUser(user.userId);
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

  const handleUpdate = (row) => {
    setRowData({ ...row });
    toggle3();
  };

  const handleChangePass = (row) => {
    setRowData({ ...row });
    toggle2();
  };

  const handleDeleteMenu = async () => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
      try {
        let res = await roleService.deleteMenu({ menuIds: selectMenu, roleId: roleId });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }))
          await fetchDataMenu();
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
          await fetchDataPermission();
        }
      } catch (error) {
        console.log(error)
      }
    }
  };

  async function fetchData() {
    setUserState({
      ...userState
      , isLoading: true

    });
    const params = {
      page: userState.page,
      pageSize: userState.pageSize,
      keyword: search
    }
    const res = await roleService.getRoleList(params);
    setUserState({
      ...userState
      , data: [...res.Data]
      , totalRow: res.TotalRow
      , isLoading: false
    });
  }

  async function fetchDataPermission(Id) {
    const permission = await roleService.GetPermissionByRole(Id, { page: permissionState.page, pageSize: permissionState.pageSize });
    setPermissionState({
      ...permissionState
      , data: permission.Data
      , totalRow: permission.TotalRow
    });
  }

  async function fetchDataMenu(Id) {
    const menu = await roleService.GetMenuByRole(Id, { page: menuState.page, pageSize: menuState.pageSize });
    setMenuState({
      ...menuState
      , data: menu.Data
      , totalRow: menu.TotalRow
    });
  }

  useEffect(() => {
    if (!_.isEmpty(newData)) {
      const data = [newData, ...userState.data];
      if (data.length > userState.pageSize) {
        data.pop();
      }
      setUserState({
        ...userState
        , data: [...data]
        , totalRow: userState.totalRow + 1
      });
    }
  }, [newData]);

  return (
    <React.Fragment>
      <ThemeProvider theme={myTheme}>
        <Grid container sx={{ mb: 1 }}>
          <Grid item xs={8}>
            <MuiButton text="create" color='success' onClick={toggle} />
          </Grid>
          <Grid item xs={4} container>
            <Grid item xs={9}>
              <TextField
                fullWidth
                size='small'
                label={intl.formatMessage({ id: 'user.userName' })}
                onChange={e => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={3}>
              <MuiButton text="search" color='info' onClick={fetchData} sx={{ m: 0, ml: 2 }} />
            </Grid>
          </Grid>
        </Grid>
        <MuiDataGrid
          getData={userService.getUserList}
          showLoading={userState.isLoading}
          isPagingServer={true}
          headerHeight={45}
          columns={columns}
          rows={userState.data}
          page={userState.page - 1}
          pageSize={userState.pageSize}
          rowCount={userState.totalRow}
          rowsPerPageOptions={[5, 10, 20]}
          onPageChange={(newPage) => {
            setUserState({ ...userState, page: newPage + 1 });
          }}
          onPageSizeChange={(newPageSize) => {
            setUserState({ ...userState, pageSize: newPageSize, page: 1 });
          }}
          onRowClick={(rowData) => handleRoleClick(rowData.row.roleId)}
          getRowId={(rows) => rows.roleId}
          getRowClassName={(params) => {
            if (_.isEqual(params.row, newData)) {
              return `Mui-created`
            }
          }}
        />
        <Grid container sx={{ mt: 1 }} spacing={3}>
          <Grid item xs={6}>
            <Grid container >
              <MuiButton text="Create" color='success' onClick={toggle} />
              <Badge badgeContent={selectPermission.length} color="warning">
                <MuiButton text="Delete" color='error' onClick={handleDeletePermission} />
              </Badge>
            </Grid>
            <MuiDataGrid
              getData={userService.getUserList}
              showLoading={permissionState.isLoading}
              isPagingServer={true}
              headerHeight={45}
              columns={permissionColumns}
              rows={permissionState.data}
              page={permissionState.page - 1}
              pageSize={permissionState.pageSize}
              rowCount={permissionState.totalRow}
              rowsPerPageOptions={[5, 10, 20]}
              onPageChange={(newPage) => {
                setPermissionState({ ...permissionState, page: newPage + 1 });
              }}
              onPageSizeChange={(newPageSize) => {
                setPermissionState({ ...permissionState, pageSize: newPageSize, page: 1 });
              }}
              checkboxSelection={true}
              onSelectionModelChange={(ids) => {
                setSelectPermission(ids)
              }}
              getRowId={(rows) => rows.permissionId}
              getRowClassName={(params) => {
                if (_.isEqual(params.row, newData)) {
                  return `Mui-created`
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <Grid container>
              <MuiButton text="Create" color='success' onClick={toggle2} />
              <Badge badgeContent={selectMenu.length} color="warning">
                <MuiButton text="Delete" color='error' onClick={handleDeleteMenu} />
              </Badge>
            </Grid>
            <MuiDataGrid
              getData={userService.getUserList}
              showLoading={menuState.isLoading}
              isPagingServer={true}
              headerHeight={45}
              columns={menuColumns}
              rows={menuState.data}
              page={menuState.page - 1}
              pageSize={menuState.pageSize}
              rowCount={menuState.totalRow}
              rowsPerPageOptions={[5, 10, 20]}
              onPageChange={(newPage) => {
                setMenuState({ ...menuState, page: newPage + 1 });
              }}
              onPageSizeChange={(newPageSize) => {
                setMenuState({ ...menuState, pageSize: newPageSize, page: 1 });
              }}
              checkboxSelection={true}
              onSelectionModelChange={(ids) => {
                setSelectMenu(ids)
              }}
              getRowId={(rows) => rows.menuId}
              getRowClassName={(params) => {
                if (_.isEqual(params.row, newData)) {
                  return `Mui-created`
                }
              }}
            />
          </Grid>
        </Grid>
        {isShowing && <RoleAddMenuDialog
          setNewData={setNewData}
          rowData={rowData}
          isOpen={isShowing}
          onClose={toggle}
        />}

        {isShowing2 && <RoleAddPermissionDialog
          setNewData={setNewData}
          rowData={rowData}
          isOpen={isShowing2}
          onClose={toggle2}
          loadData={fetchData}
        />}

        {/* {isShowing3 && <UserPasswordDialog
          setNewData={setNewData}
          rowData={rowData}
          isOpen={isShowing3}
          onClose={toggle3}
        />} */}

      </ThemeProvider>
    </React.Fragment>

  )
}
