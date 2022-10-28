import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Badge, Grid, IconButton, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls'
import { userService, roleService } from '@services'
import { useModal, useModal2, useModal3 } from "@basesShared"
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';

import RoleAddMenuDialog from './RoleAddMenuDialog'
import RoleAddPermissionDialog from './RoleAddPermissionDialog'
import RoleDialog from './RoleDialog'

export default function Role() {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const { isShowing, toggle } = useModal();
  const { isShowing2, toggle2 } = useModal2();
  const { isShowing3, toggle3 } = useModal3();
  const [roleState, setRoleState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 5,
    searchData: {
      keyWord: ''
    }
  });

  const [permissionState, setPermissionState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 10,
    searchData: {
      keyWord: ''
    }
  });

  const [menuState, setMenuState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 10,
    searchData: {
      keyWord: ''
    }
  });

  const [newData, setNewData] = useState({})
  const [rowData, setRowData] = useState({});
  const [roleId, setRoleId] = useState(0);
  const [selectMenu, setSelectMenu] = useState([]);
  const [selectPermission, setSelectPermission] = useState([]);

  const columns = [
    { field: 'roleId', hide: true },
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
                onClick={() => handleUpdate(params.row)}
              >
                <EditIcon fontSize="inherit" />
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
    { field: 'permissionName', headerName: intl.formatMessage({ id: "permission.permissionName" }), flex: 0.7, },
  ];

  const menuColumns = [
    { field: 'menuId', hide: true },
    { field: 'menuName', headerName: intl.formatMessage({ id: "menu.menuName" }), flex: 0.7, },
  ];

  useEffect(() => {
    fetchData();
    return () => { isRendered = false; }
  }, [roleState.page, roleState.pageSize]);

  useEffect(() => {
    fetchDataPermission(roleId);
  }, [permissionState.page, permissionState.pageSize]);

  useEffect(() => {
    fetchDataMenu(roleId);
  }, [menuState.page, menuState.pageSize]);

  const handleDelete = async (role) => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
      try {
        let res = await roleService.deleteRole(role.roleId);
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
        else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
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
        else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        }
      } catch (error) {
        console.log(error)
      }
    }
  };

  async function fetchData() {
    setRoleState({
      ...roleState
      , isLoading: true

    });
    const params = {
      page: roleState.page,
      pageSize: roleState.pageSize,
      keyWord: roleState.searchData.keyWord
    }
    const res = await roleService.getRoleList(params);
    if (res && res.Data && isRendered)
      setRoleState({
        ...roleState
        , data: res.Data ?? []
        , totalRow: res.TotalRow
        , isLoading: false
      });
  }

  async function fetchDataPermission(Id) {
    const permission = await roleService.GetPermissionByRole(Id, { page: permissionState.page, pageSize: permissionState.pageSize,
      keyWord: permissionState.searchData.keyWord });
    if (permission && permission.Data && isRendered)
      setPermissionState({
        ...permissionState
        , data: permission.Data ?? []
        , totalRow: permission.TotalRow
      });
  }

  async function fetchDataMenu(Id) {
    const menu = await roleService.GetMenuByRole(Id, { page: menuState.page, pageSize: menuState.pageSize, keyWord: menuState.searchData.keyWord });
    if (menu && menu.Data && isRendered)
      setMenuState({
        ...menuState
        , data: menu.Data ?? []
        , totalRow: menu.TotalRow
      });
  }

  const handleSearch = (e, inputName) => {
    let newSearchData = { ...roleState.searchData };
    newSearchData[inputName] = e.target.value;

    setRoleState({ ...roleState, searchData: { ...newSearchData } })
  }

  //Permission
  const handleSearchPermission = (e, inputName) => {
    let newSearchData = { ...permissionState.searchData };
    newSearchData[inputName] = e.target.value;

    setPermissionState({ ...permissionState, searchData: { ...newSearchData } })
  }

  //Menu
  const handleSearchMenu = (e, inputName) => {
    let newSearchData = { ...menuState.searchData };
    newSearchData[inputName] = e.target.value;

    setMenuState({ ...menuState, searchData: { ...newSearchData } })
  }


  useEffect(() => {
    if (!_.isEmpty(newData) && isRendered) {
      const data = [newData, ...roleState.data];
      if (data.length > roleState.pageSize) {
        data.pop();
      }
      setRoleState({
        ...roleState
        , data: [...data]
        , totalRow: roleState.totalRow + 1
      });
    }
  }, [newData]);

  // const handleCellClick = (param, event) => {
  //   event.defaultMuiPrevented = (param.field === "action");
  // };

  return (
    <React.Fragment>
      <Grid container
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end" sx={{ mb: 1, pr: 1 }}>
        <Grid item xs={9}>
          <MuiButton text="create" color='success' onClick={handleAdd} />
        </Grid>
        <Grid item>
          <TextField
            sx={{ width: 210 }}
            fullWidth
            variant="standard"
            size='small'
            label={intl.formatMessage({ id: "role.roleName" })}
            onChange={(e) => handleSearch(e, 'keyWord')}
          />
        </Grid>
        <Grid item>
          <MuiButton text="search" color='info' onClick={fetchData} sx={{ mt: 1, ml: 2 }} />
        </Grid>
      </Grid>
      <MuiDataGrid
        gridHeight={256}
        showLoading={roleState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={columns}
        rows={roleState.data}
        page={roleState.page - 1}
        pageSize={roleState.pageSize}
        rowCount={roleState.totalRow}
        onPageChange={(newPage) => setRoleState({ ...roleState, page: newPage + 1 })}
        onSelectionModelChange={(newSelectedRowId) => handleRoleClick(newSelectedRowId[0])}
        getRowId={(rows) => rows.roleId}
        getRowClassName={(params) => { if (_.isEqual(params.row, newData)) return `Mui-created` }}
      />

      <Grid container sx={{ mt: 1 }} spacing={3}>
        <Grid item xs={6} style={{ paddingTop: 0 }}>
          <Grid item xs={12}>
              <MuiButton text="Create" color='success' onClick={toggle} disabled={roleId != 0 ? false : true} />
              <Badge style={{ paddingRight: 200}} badgeContent={selectPermission.length} color="warning">
                <MuiButton text="Delete" color='error' onClick={handleDeletePermission} disabled={selectPermission.length > 0 ? false : true} />
              </Badge>
              <TextField
              sx={{ width: 210 }}
              fullWidth
              variant="standard"
              size='small'
              label={intl.formatMessage({ id: "role.PermissionName" })}
              onChange={(e) => handleSearchPermission(e, 'keyWord')}
            />
          <MuiButton text="search" color='info' onClick={() => fetchDataPermission(roleId)} sx={{ mt: 1, ml: 2 }} />
          </Grid>
          
          <MuiDataGrid
            showLoading={permissionState.isLoading}
            isPagingServer={true}
            headerHeight={45}
            columns={permissionColumns}
            rows={permissionState.data}
            page={permissionState.page - 1}
            pageSize={permissionState.pageSize}
            rowCount={permissionState.totalRow}
            onPageChange={(newPage) => setPermissionState({ ...permissionState, page: newPage + 1 })}
            checkboxSelection={true}
            onSelectionModelChange={(ids) => { setSelectPermission(ids) }}
            getRowId={(rows) => rows.permissionId}
          />
        </Grid>
        <Grid item xs={6} style={{ paddingTop: 0 }}>
          <Grid item xs={12}>
            <MuiButton text="Create" color='success' onClick={toggle2} disabled={roleId != 0 ? false : true} />
            <Badge style={{ paddingRight: 200}} badgeContent={selectMenu.length} color="warning">
              <MuiButton text="Delete" color='error' onClick={handleDeleteMenu} disabled={selectMenu.length > 0 ? false : true} />
            </Badge>
            <TextField
              sx={{ width: 210 }}
              fullWidth
              variant="standard"
              size='small'
              label={intl.formatMessage({ id: "role.MenuName" })}
              onChange={(e) => handleSearchMenu(e, 'keyWord')}
            />
            <MuiButton text="search" color='info' onClick={() => fetchDataMenu(roleId)} sx={{ mt: 1, ml: 2 }} />
          </Grid>

          <MuiDataGrid
            showLoading={menuState.isLoading}
            isPagingServer={true}
            headerHeight={45}
            columns={menuColumns}
            rows={menuState.data}
            page={menuState.page - 1}
            pageSize={menuState.pageSize}
            rowCount={menuState.totalRow}
            onPageChange={(newPage) => setMenuState({ ...menuState, page: newPage + 1 })}
            checkboxSelection={true}
            onSelectionModelChange={(ids) => setSelectMenu(ids)}
            getRowId={(rows) => rows.menuId}
          />
        </Grid>
      </Grid>

      <RoleAddPermissionDialog
        setNewData={setNewData}
        isOpen={isShowing}
        onClose={toggle}
        roleId={roleId}
        loadData={fetchDataPermission}
      />

      <RoleAddMenuDialog
        setNewData={setNewData}
        isOpen={isShowing2}
        onClose={toggle2}
        roleId={roleId}
        loadData={fetchDataMenu}
      />

      <RoleDialog
        setNewData={setNewData}
        initModal={rowData}
        isOpen={isShowing3}
        onClose={toggle3}
        loadData={fetchData}
        mode={mode}
      />
    </React.Fragment>

  )
}
