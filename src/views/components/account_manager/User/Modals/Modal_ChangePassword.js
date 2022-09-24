import React, { useState, useEffect, useRef } from "react";

import { api_post } from "@utils";
import {
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  DraggableDialog,
} from "@basesShared";
import { Visibility, VisibilityOff } from "@mui/icons-material";
const Modal_ChangePassword = ({ isShowing, hide, data, refreshTable }) => {
  const [info, setInfo] = useState({});
  const [showEyeCur, setShowEyeCur] = useState(false);
  const [showEyeNew, setShowEyeNew] = useState(false);
  useEffect(() => {
    setInfo(data);
  }, [data]);

  const handleSave = () => {
    return api_post("account/update_password", { ...info, Id: info.id }).then(
      (res) => {
        refreshTable();
        hide();
      }
    );
  };
  const _handleKeyDown = (e) => {
    if (e.key == " ") {
      e.preventDefault();
    } else {
      setInfo({ ...info, location_name: e.target.value });
    }
  };

  let iconCur = null;
  if (showEyeCur == false) {
    iconCur = <Visibility />;
  } else {
    iconCur = <VisibilityOff />;
  }

  let iconNew = null;
  if (showEyeNew == false) {
    iconNew = <Visibility />;
  } else {
    iconNew = <VisibilityOff />;
  }

  return (
    <DraggableDialog
      animate="slide_down"
      isShowing={isShowing}
      hide={hide}
      onSave={handleSave}
      title={"Change Password"}
    >
      <TextField
        type={showEyeNew ? "text" : "password"}
        autoFocus
        required={true}
        margin="dense"
        autoComplete="off"
        label="New Password"
        onChange={(e) => setInfo({ ...info, NewPassword: e.target.value })}
        onKeyDown={_handleKeyDown}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={() => setShowEyeNew(!showEyeNew)}>
                {iconNew}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        type={showEyeCur ? "text" : "password"}
        autoComplete="off"
        required={true}
        margin="dense"
        label="Confirm Password"
        onChange={(e) => setInfo({ ...info, ConfirmPassword: e.target.value })}
        onKeyDown={_handleKeyDown}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={() => setShowEyeCur(!showEyeCur)}>
                {iconCur}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </DraggableDialog>
  );
};

export default Modal_ChangePassword;
