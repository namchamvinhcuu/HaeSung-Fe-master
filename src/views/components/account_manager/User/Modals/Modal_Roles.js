import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { api_get, api_post } from "@utils";
import { FormControl } from "@mui/material";
import { DraggableDialog, SelectMultiple } from "@basesShared";

const Modal_Roles = ({ isShowing, hide, data }) => {
  const [info, setInfo] = useState({});
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    api_get("account/get-role-by-userid", { id: data.id }).then((data) => {
      setRoles(data);
    });
    setInfo(data);
  }, [data]);

  const handleSave = () => {
    return api_post("account/add-update-role", { Id: info.id, roles: roles }).then((res) => {
      hide();
    });
  };

  return <DraggableDialog animate="slide_down" fullWidth isShowing={isShowing} hide={hide} onSave={handleSave} title={"Change Roles"} >
    <FormControl margin="dense" fullWidth>
      <SelectMultiple
        placeholder="Role list"
        urlOptions="account/get-role"
        value={roles}
        onChange={(item) => {
          setRoles(item);
        }}
      ></SelectMultiple>
    </FormControl>
  </DraggableDialog>
};


export default Modal_Roles;
