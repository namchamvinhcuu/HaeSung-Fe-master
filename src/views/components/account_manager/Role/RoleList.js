import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { api_get, api_post, SuccessAlert, ErrorAlert } from "@utils";
import {
  useModal,
  useModal2,
  SelectBox,
  ButtonAsync,
  DataTable,
  DraggableDialog,
} from "@basesShared";
import {
  Grid,
  TextField,
  Button,
  Box,
} from "@mui/material";

import Modal_Role from "./Modals/Modal_Role";
import Modal_Menu from "./Modals/Modal_Menu";

export default function RoleList() {
  const [mode, setMode] = useState("add");
  const [rowData, setRowData] = useState({});
  const { isShowing, toggle } = useModal();
  const { isShowing2, toggle2 } = useModal2();


  const [searchName, setSearchName] = useState("");
  const [roleId, setRoleId] = useState();

  const [searchName_Menu, setSearchName_Menu] = useState("");

  const gridRef = useRef();

  const gridRef_menu = useRef();

  //Functions
  const columns = [
    // { field: "active", headerName: "Use", width: 250, editable: false, renderCell: (params) => (params.row.active ? <Checkbox disabled checked /> : <Checkbox disabled />), },
    {
      field: "edit",
      headerName: "Edit",
      width: 80,
      disableClickEventBubbling: true,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={e => {

              editrow(e, params)
            }}
          >
            Edit
          </Button>
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
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={e => { deleterowrole(e, params) }}
          >
            Delete
          </Button>
        );
      },
    },

    { field: "id", headerName: "ID", hide: true },
    { field: "name", headerName: "Role Name", width: 450 },
    { field: "remark", headerName: "Remark", width: 500 },
  ];

  const columns_menu = [
    {
      field: "delete",
      headerName: "Delete",
      width: 80,
      disableClickEventBubbling: true,
      renderCell: (params) => {
        return (
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleterow(params);
            }}
          >
            Delete
          </Button>
        );
      },
    },

    { field: "id", headerName: "ID", hide: true },
    { field: "Name", headerName: "Menu Name", width: 200 },
    { field: "Code", headerName: "Menu Code", width: 200 },
    {
      field: "MenuType", headerName: "Type", width: 100,
      renderCell: (params) => {
        if (params.row.MenuType === 0) return <span style={{ fontSize: 14 }} className="badge badge-info">Folder</span>
        else return <b >Item</b>
      },

    },
  ];

  const addNewRole = () => {
    setMode("add");
    setRowData({});
    toggle();
  };

  const searchRoles = () => {
    gridRef.current.search({ search_name: searchName });
  };

  const editrow = (e, params) => {

    e.stopPropagation();
    var row_data = params.row;
    setMode("edit");
    setRowData({ ...row_data, ignore: true });
    toggle();
  };

  const deleterowrole = (e, params) => {
    e.stopPropagation();
    if (window.confirm("Delete the item?")) {
      api_post("sysRoleaApi/delete", params.row).then(() => {
        refreshTable();
        setRowData({})
      });
    }
  };

  const deleterow = (params) => {
    const infoDelete = {
      ...infoDelete,
      role_id: rowData.id,
      menu_id: params.row.id,
    };
    if (window.confirm("Delete the item?")) {
      api_post("sysRoleaApi/delete-menu", infoDelete).then(() => {
        refreshTable_menu();
      });
    }
  };

  const refreshTable = () => {
    gridRef.current.refreshGrid().then(() => SuccessAlert("save success"));
  };

  const refreshTable_menu = () => {
    gridRef_menu.current.refreshGrid().then(() => SuccessAlert("save success"));
  };

  const addMenu = () => {
    setRowData(rowData);
    toggle2();
  };

  const searchMenus = () => {
    gridRef_menu.current.search({ search_name: searchName_Menu });
  };

  return (
    <>
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
              onClick={addNewRole}
            >
              Add Role
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
              onClick={searchRoles}
            >
              Search
            </Button>
          </Grid>
        </Grid>

        <DataTable
          sx={{ height: 300 }}
          ref={gridRef}
          url={"sysRoleaApi"}
          columns={columns}
          getRowId={(rows) => rows.id}
          onRowClick={(params, event) => {

            setRoleId(params.row.id);
            setRowData(params.row)
          }}
          hideFooter={true}
        />


        <Box>
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
                onClick={addMenu}
              >
                Add Menu
              </Button>
            </Grid>
            <Grid item>
              <TextField
                label="Search name"
                variant="standard"
                onChange={(e) => setSearchName_Menu(e.target.value)}
                sx={{ borderRadius: 2, mb: 1 }}
              />

              <Button
                variant="contained"
                color="primary"
                sx={{ mx: 3, boxShadow: 1, mb: -4 }}
                onClick={searchMenus}
              >
                Search
              </Button>
            </Grid>
          </Grid>

          <DataTable
            ref={gridRef_menu}
            url={roleId ? ("sysRoleaApi/get-list-role-menu/" + roleId) : null}
            columns={columns_menu}
            getRowId={(rows) => rows.id}
            sx={{ height: 400 }}
          />
        </Box>


        <Modal_Role
          isShowing={isShowing}
          hide={toggle}
          mode={mode}
          data={rowData}
          refreshTable={refreshTable}
        />

        {
          <Modal_Menu
            isShowing={isShowing2}
            hide={toggle2}
            data={rowData}
            refreshTable={refreshTable_menu}
          />
        }
      </Box>
    </>
  );
}
