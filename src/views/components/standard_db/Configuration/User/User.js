import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Grid, IconButton } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock';
import { createTheme, ThemeProvider } from "@mui/material"
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid } from '@controls'
import { userService } from '@services'
import UserDialog from './UserDialog'
import { useModal, useModal2, useModal3 } from "@basesShared";
import { ErrorAlert, SuccessAlert } from '@utils'
import UserPasswordDialog from './UserPasswordDialog'
import UserRoleDialog from './UserRoleDialog'

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

export default function User() {
  const intl = useIntl();
  const { isShowing, toggle } = useModal();
  const { isShowing2, toggle2 } = useModal2();
  const { isShowing3, toggle3 } = useModal3();
  const [userState, setMenuState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
  });
  const [newData, setNewData] = useState({})
  const [rowData, setRowData] = useState({});

  const columns = [
    { field: 'userId', hide: true },
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
    { field: 'userName', headerName: intl.formatMessage({ id: "general.name" }), flex: 0.7, },
    { field: 'RoleNameList', headerName: intl.formatMessage({ id: "user.roleName" }), flex: 0.7, },
  ];

  useEffect(() => {
    fetchData();
  }, [userState.page, userState.pageSize]);

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

  const handleUpdate = (row) => {
    setRowData({ ...row });
    toggle3();
  };

  const handleChangePass = (row) => {
    setRowData({ ...row });
    toggle2();
  };

  async function fetchData() {
    setMenuState({
      ...userState
      , isLoading: true

    });
    const params = {
      page: userState.page,
      pageSize: userState.pageSize
    }
    const res = await userService.getUserList(params);
    setMenuState({
      ...userState
      , data: [...res.Data]
      , totalRow: res.TotalRow
      , isLoading: false
    });
  }

  useEffect(() => {
    if (!_.isEmpty(newData)) {
      const data = [newData, ...userState.data];
      if (data.length > userState.pageSize) {
        data.pop();
      }
      setMenuState({
        ...userState
        , data: [...data]
        , totalRow: userState.totalRow + 1
      });
    }
  }, [newData]);

  return (
    <React.Fragment>
      <ThemeProvider theme={myTheme}>
        <MuiButton text="create" color='success' onClick={toggle} />
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
            setMenuState({ ...userState, page: newPage + 1 });
          }}
          onPageSizeChange={(newPageSize) => {
            setMenuState({ ...userState, pageSize: newPageSize, page: 1 });
          }}
          getRowId={(rows) => rows.userId}
          getRowClassName={(params) => {
            if (_.isEqual(params.row, newData)) {
              return `Mui-created`
            }
          }}
        />

        {isShowing && <UserDialog
          setNewData={setNewData}
          rowData={rowData}
          isOpen={isShowing}
          onClose={toggle}
        />}

        {isShowing2 && <UserRoleDialog
          setNewData={setNewData}
          rowData={rowData}
          isOpen={isShowing2}
          onClose={toggle2}
          loadData={fetchData}
        />}

        {isShowing3 && <UserPasswordDialog
          setNewData={setNewData}
          rowData={rowData}
          isOpen={isShowing3}
          onClose={toggle3}
        />}

      </ThemeProvider>
    </React.Fragment>

  )
}
