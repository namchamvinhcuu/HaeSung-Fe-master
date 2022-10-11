import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { api_get, api_post, SuccessAlert, ErrorAlert } from "@utils";
import { Button, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, FormControlLabel, Checkbox } from "@mui/material";
import { useModal, SelectBox, ButtonAsync, DataTable, DraggableDialog } from "@basesShared";

const Modal_Role = ({ isShowing, hide, mode, data, refreshTable }) => {
  const [info, setInfo] = useState({});

  useEffect(() => {
    setInfo(data);
  }, [data]);

  const handleSave = () => {
    return api_post("sysRoleaApi/add-update", info).then((res) => {
      refreshTable();
      hide();
    });
  };

  return <DraggableDialog animate="slide_down" isShowing={isShowing} hide={hide} onSave={handleSave} title={mode == "add" ? "ADD NEW" : "EDIT"} >
    <TextField
      autoFocus
      required={true}
      margin="dense"
      id="name"
      label="Role Name"
      onChange={(e) =>
        setInfo({ ...info, name: e.target.value })
      }
      fullWidth
      defaultValue={data.name}
    />

    <TextField
      margin="dense"
      id="remark"
      label="Remark"
      onChange={(e) =>
        setInfo({ ...info, remark: e.target.value })
      }
      fullWidth
      defaultValue={data.remark}
    />
  </DraggableDialog>
};

export default Modal_Role;
