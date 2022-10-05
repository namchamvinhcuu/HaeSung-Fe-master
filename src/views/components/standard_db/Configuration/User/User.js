import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { createTheme, ThemeProvider } from "@mui/material"
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid } from '@controls'
import { userService } from '@services'
import UserDialog from './UserDialog'
import { useModal } from "@basesShared";
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants'
import { ErrorAlert, SuccessAlert } from '@utils'

const myTheme = createTheme({
  components: {
    MuiDataGrid: {
      styleOverrides: {
        row: {
          "&.Mui-created": {
            backgroundColor: "#A0DB8E",
            //   "&:hover": {
            //     backgroundColor: "#98958F"
            //   }
          }
        }
      }
    }
  }
});

export default function User() {
  const intl = useIntl();
  const { isShowing, toggle } = useModal();
  const [userState, setMenuState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 10,
  });
  const [newData, setNewData] = useState({})
  const [dialogMode, setDialogMode] = useState(CREATE_ACTION);
  const [rowData, setRowData] = useState({});


  const columns = [
    { field: 'userId', hide: true },
    {
      field: "action",
      headerName: "",
      flex: 0.4,
      // headerAlign: 'center',
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center">
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
          </Grid>
        );
      },
    },
    { field: 'userName', headerName: intl.formatMessage({ id: "general.name" }), flex: 0.7, },
    { field: 'roles', headerName: intl.formatMessage({ id: "user.roleName" }), flex: 0.7, },
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
    setDialogMode(UPDATE_ACTION);
    setRowData({ ...row });
    toggle();
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
        <MuiButton text="create" color='success'
          // onClick={toggleCreateMenuDialog}
          onClick={toggle}
        />

        <MuiDataGrid
          getData={userService.getUserList}
          showLoading={userState.isLoading}
          isPagingServer={true}
          headerHeight={45}
          // rowHeight={30}
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
          // onSelectionModelChange={(newSelectedRowId) => {
          //   handleRowSelection(newSelectedRowId)
          // }}
          // selectionModel={selectedRow.menuId}
          getRowClassName={(params) => {
            if (_.isEqual(params.row, newData)) {
              return `Mui-created`
            }
          }}
        // 
        />

        {isShowing && <UserDialog
          // initModal={selectedRow}
          // setModifyData={setSelectedRow}
          setNewData={setNewData}
          dialogMode={dialogMode}
          rowData={rowData}
          isOpen={isShowing}
          onClose={toggle}
        />}

      </ThemeProvider>
    </React.Fragment>

  )
}
