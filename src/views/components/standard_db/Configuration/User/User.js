import React, { useEffect, useRef, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';
import { Grid, IconButton, Switch, FormControlLabel } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { createTheme, ThemeProvider } from '@mui/material';
import { useIntl } from 'react-intl';
import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls';
import { userService } from '@services';
import UserDialog from './UserDialog';
import { useModal, useModal2, useModal3 } from '@basesShared';
import { ErrorAlert, SuccessAlert } from '@utils';
import { GetLocalStorage } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';
import UserPasswordDialog from './UserPasswordDialog';
import UserRoleDialog from './UserRoleDialog';

const myTheme = createTheme({
  components: {
    MuiDataGrid: {
      styleOverrides: {
        row: {
          '&.Mui-created': {
            backgroundColor: '#A0DB8E',
          },
        },
      },
    },
  },
});

export default function User() {
  const intl = useIntl();
  let isRendered = useRef(true);
  const { isShowing, toggle } = useModal();
  const { isShowing2, toggle2 } = useModal2();
  const { isShowing3, toggle3 } = useModal3();
  const [userState, setUserState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      keyWord: '',
      showDelete: true,
    },
  });
  const [newData, setNewData] = useState({});
  const [rowData, setRowData] = useState({});

  const RoleUser = GetLocalStorage(ConfigConstants.CURRENT_USER);
  const RoleArr = RoleUser.RoleNameList.replace(' ', '').split(',');

  const columns = [
    { field: 'userId', hide: true },
    {
      field: 'action',
      headerName: '',
      flex: 0.4,
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center">
            <Grid
              item
              xs={RoleArr.includes('ROOT') || RoleArr.includes('ADMIN') ? 4 : 6}
              style={{ textAlign: 'center' }}
            >
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ '&:hover': { border: '1px solid red' } }]}
                onClick={() => handleDelete(params.row)}
              >
                {params.row.isActived ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
              </IconButton>
            </Grid>
            <Grid
              item
              xs={RoleArr.includes('ROOT') || RoleArr.includes('ADMIN') ? 4 : 6}
              style={{ textAlign: 'center' }}
            >
              <IconButton
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ '&:hover': { border: '1px solid orange' } }]}
                onClick={() => handleChangePass(params.row)}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Grid>
            {(RoleArr.includes('ROOT') || RoleArr.includes('ADMIN')) && (
              <Grid item xs={4} style={{ textAlign: 'center' }}>
                <IconButton
                  aria-label="edit"
                  color="success"
                  size="small"
                  sx={[{ '&:hover': { border: '1px solid green' } }]}
                  onClick={() => handleUpdate(params.row)}
                >
                  <LockIcon fontSize="inherit" />
                </IconButton>
              </Grid>
            )}
          </Grid>
        );
      },
    },
    { field: 'userName', headerName: intl.formatMessage({ id: 'general.name' }), flex: 0.7 },
    { field: 'RoleNameList', headerName: intl.formatMessage({ id: 'user.roleName' }), flex: 0.7 },
    { field: 'LineName', headerName: intl.formatMessage({ id: 'work_order.LineName' }), flex: 0.7 },
  ];

  useEffect(() => {
    fetchData();
    return () => {
      isRendered = false;
    };
  }, [userState.page, userState.pageSize, userState.searchData.showDelete]);

  const handleDelete = async (user) => {
    if (
      window.confirm(
        intl.formatMessage({ id: user.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted' })
      )
    ) {
      try {
        let res = await userService.deleteUser({
          userId: user.userId,
          row_version: user.row_version,
        });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }));
          await fetchData();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleUpdate = (row) => {
    setRowData({ ...row });
    toggle3();
  };

  const handleChangePass = (row) => {
    setRowData({ ...row });
    toggle2();
  };

  const handleSearch = (e, inputName) => {
    let newSearchData = { ...userState.searchData };
    newSearchData[inputName] = e;

    if (inputName == 'showDelete') {
      setUserState({
        ...userState,
        page: 1,
        searchData: { ...newSearchData },
      });
    } else {
      setUserState({
        ...userState,
        searchData: { ...newSearchData },
      });
    }
  };

  async function fetchData() {
    setUserState({
      ...userState,
      isLoading: true,
    });
    const params = {
      page: userState.page,
      pageSize: userState.pageSize,
      keyword: userState.searchData.keyWord,
      showDelete: userState.searchData.showDelete,
    };
    const res = await userService.getUserList(params);
    if (res && res.Data && isRendered)
      setUserState({
        ...userState,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  }

  useEffect(() => {
    if (!_.isEmpty(newData)) {
      const data = [newData, ...userState.data];
      if (data.length > userState.pageSize) {
        data.pop();
      }
      setUserState({
        ...userState,
        data: [...data],
        totalRow: userState.totalRow + 1,
      });
    }
  }, [newData]);

  return (
    <React.Fragment>
      <ThemeProvider theme={myTheme}>
        <Grid container direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 1, pr: 1 }}>
          <Grid item xs={6}>
            <MuiButton text="create" color="success" onClick={toggle} />
          </Grid>

          <Grid item xs>
            <Grid container columnSpacing={2} direction="row" justifyContent="flex-end" alignItems="flex-end">
              <Grid item xs={8}>
                <MuiSearchField
                  fullWidth
                  variant="keyWord"
                  size="small"
                  label="user.userName"
                  onClick={fetchData}
                  onChange={(e) => handleSearch(e.target.value, 'keyword')}
                />
              </Grid>
              <Grid item xs>
                <MuiButton text="search" color="info" onClick={fetchData} />
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
            <FormControlLabel
              sx={{ mb: 0 }}
              control={
                <Switch
                  defaultChecked={true}
                  color="primary"
                  onChange={(e) => handleSearch(e.target.checked, 'showDelete')}
                />
              }
              label={userState.searchData.showDelete ? 'Active Data' : 'Delete Data'}
            />
          </Grid>
        </Grid>

        <MuiDataGrid
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
          getRowId={(rows) => rows.userId}
          getRowClassName={(params) => {
            if (_.isEqual(params.row, newData)) {
              return `Mui-created`;
            }
          }}
        />

        {isShowing && <UserDialog setNewData={setNewData} rowData={rowData} isOpen={isShowing} onClose={toggle} />}

        {isShowing2 && (
          <UserRoleDialog
            setNewData={setNewData}
            rowData={rowData}
            isOpen={isShowing2}
            onClose={toggle2}
            loadData={fetchData}
          />
        )}

        {isShowing3 && (
          <UserPasswordDialog setNewData={setNewData} rowData={rowData} isOpen={isShowing3} onClose={toggle3} />
        )}
      </ThemeProvider>
    </React.Fragment>
  );
}
