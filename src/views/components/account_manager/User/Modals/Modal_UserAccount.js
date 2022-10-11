import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { api_get, api_post, SuccessAlert, ErrorAlert } from "@utils";
import { Button, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, FormControlLabel, Checkbox } from "@mui/material";
import { useModal, SelectBox, ButtonAsync, DataTable, DraggableDialog } from "@basesShared";
import moment from 'moment'

const Modal_UserAccount = ({ isShowing, hide, mode, data, refreshTable }) => {
  const [info, setInfo] = useState({});

  useEffect(() => {
    var AdminType_Name = "";
    if (data.AdminType == 1) AdminType_Name = "Super Admin"
    else if (data.AdminType == 2) AdminType_Name = "Customer Admin"

    else if (data.AdminType == 3) AdminType_Name = "Customer Admin"
    data.AdminType_Name = AdminType_Name;
    setInfo(data);
  }, [data]);

  const handleSave = () => {
    return api_post("account/add-update", { ...info, Id: info.id }).then((res) => {
      refreshTable();
      hide();
    });
  };

  return <DraggableDialog animate="slide_down" isShowing={isShowing} hide={hide} onSave={handleSave} title={mode == "add" ? "ADD NEW" : "EDIT"} >
    <form noValidate>
      <TextField
        autoFocus
        required={true}
        margin="dense"

        label="Account"
        onChange={(e) =>
          setInfo({ ...info, Account: e.target.value })
        }
        fullWidth
        defaultValue={data.Account}
        disabled={data.id ? true : false}
      />

      {data.id ? '' : <TextField
        required={true}
        autoComplete='new-password'
        margin="dense"
        type={"password"}
        label="Password"
        onChange={(e) =>
          setInfo({ ...info, Password: e.target.value })
        }
        fullWidth

      />}

      <TextField
        required={true}
        margin="dense"

        label="Full Name"
        onChange={(e) =>
          setInfo({ ...info, FullName: e.target.value })
        }
        fullWidth
        defaultValue={data.FullName}
      />

      <TextField
        required={true}
        margin="dense"
        type={"email"}
        label="Email"
        onChange={(e) =>
          setInfo({ ...info, Email: e.target.value })
        }
        fullWidth
        defaultValue={data.Email}
      />
    </form>


    <FormControl margin="dense" fullWidth>
      <SelectBox
        placeholder="Admin type"
        url="account/get-admintype"
        defaultValue={{ title: data.AdminType_Name, value: data.AdminType }}
        onChange={(item) => {
          setInfo({ ...info, AdminType: item.value });
        }}
      >
      </SelectBox>
    </FormControl>

  </DraggableDialog>
};

export default Modal_UserAccount;
