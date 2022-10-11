import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { api_get, api_post, SuccessAlert, ErrorAlert } from "@utils";
import { Button, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, FormControlLabel, Checkbox } from "@mui/material";
import { useModal, useModal2, useModal3, SelectBox, ButtonAsync, DataTable, DraggableDialog } from "@basesShared";
import moment from 'moment'

import Modal_ChangePassword from './Modals/Modal_ChangePassword'
import Modal_UserAccount from './Modals/Modal_UserAccount'
import Modal_Roles from './Modals/Modal_Roles'

export default function UserList() {
  const [mode, setMode] = useState("add");
  const [rowdata, setRowData] = useState({});
  const { isShowing, toggle } = useModal();
  const { isShowing2, toggle2 } = useModal2();
  const { isShowing3, toggle3 } = useModal3();

  const [searchName, setSearchName] = useState("");
  const gridRef = useRef();

  const columns = [
    {
      field: "edit",
      headerName: "Edit",
      width: 80,
      disableClickEventBubbling: true,
      renderCell: (params) => {
        return (
          params.row.AdminType !== 1 ?
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => editrow(params)}
            >
              Edit
            </Button>
            : ''
        );
      },
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 80,
      disableClickEventBubbling: true,
      renderCell: (params) => {
        return (
          params.row.AdminType !== 1 ?
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => deleterow(params)}
            >
              Delete
            </Button>
            : ''
        );
      },
    },
    {
      field: "changepassword",
      headerName: "Change Password",
      width: 170,
      disableClickEventBubbling: true,
      renderCell: (params) => {
        return (

          <Button
            variant="contained"
            color="warning"
            size="small"
            onClick={() => changepassword(params)}
          >
            Change Password
          </Button>

        );
      },
    },

    {
      field: "roles",
      headerName: "Roles",
      width: 80,
      disableClickEventBubbling: true,
      renderCell: (params) => {
        return (
          params.row.AdminType !== 1 ?
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => changeroles(params)}
            >
              Roles
            </Button>
            : ''
        );
      },
    },

    { field: "id", headerName: "ID", hide: true },
    { field: "Account", headerName: "Account", width: 100, },
    { field: "FullName", headerName: "Full name", width: 140, editable: false, },
    {
      field: "AdminType",
      headerName: "Type",
      width: 150,
      disableClickEventBubbling: true,
      renderCell: (params) => {

        if (params.row.AdminType == 1) return <span style={{ fontSize: 14 }} className="badge badge-danger">Super Admin</span>
        else if (params.row.AdminType == 2) return <span style={{ fontSize: 12 }} className="badge badge-secondary">Customer Admin</span>

        else if (params.row.AdminType == 3) return <b>Regular</b>

      },
    },
    {

      field: 'LastLoginTime',
      headerName: 'Last Login Time',
      width: 150,
      valueFormatter: params =>
        moment(params?.value).format("DD/MM/YYYY HH:mm:ss")
    },

  ];

  const changeroles = (params) => {
    var row_data = params.row;
    setRowData(row_data);
    toggle3();
  }
  const changepassword = (params) => {
    var row_data = params.row;
    setRowData(row_data);
    toggle2();
  };

  const addnew = () => {
    setMode("add");
    setRowData({});
    toggle();
  };

  const editrow = (params) => {
    var row_data = params.row;
    setMode("edit");
    setRowData(row_data);
    toggle();
  };

  const deleterow = (params) => {
    if (window.confirm("Delete the item?")) {
      api_post("account/delete", { ...params.row, Id: params.row.id }).then(() => {
        refreshTable();
      });
    }
  };

  const refreshTable = () => {
    gridRef.current.refreshGrid().then(() => SuccessAlert("save success"));
  };

  const search = () => {
    gridRef.current.search({ search_name: searchName });
  };

  return (
    <Box sx={{ pb: 5, height: "750px", width: "100%" }}>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <Button
            variant="contained"
            color="success"
            sx={{ boxShadow: 1, borderRadius: 2, mb: 1 }}
            onClick={addnew}
          >
            Add new
          </Button>
        </Grid>
        <Grid item>
          <TextField
            label="Search name"
            variant="standard"
            onChange={(e) => setSearchName(e.target.value)}
            sx={{ borderRadius: 2, mb: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ mx: 3, boxShadow: 1, mb: -4 }}
            onClick={search}
          >
            Search
          </Button>
        </Grid>
      </Grid>

      <DataTable
        ref={gridRef}
        url="account/getlist"
        columns={columns}

      />

      <Modal_UserAccount
        isShowing={isShowing}
        hide={toggle}
        mode={mode}
        data={rowdata}
        refreshTable={refreshTable}

      />
      <Modal_ChangePassword
        isShowing={isShowing2}
        hide={toggle2}
        data={rowdata}
        refreshTable={refreshTable}
      />

      <Modal_Roles
        isShowing={isShowing3}
        hide={toggle3}
        data={rowdata}
      />


    </Box>

  );
}
