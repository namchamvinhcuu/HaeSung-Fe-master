import React, { useState, useEffect } from "react";
import { api_post } from "@utils";
import { FormControl ,Box} from "@mui/material";
import { SelectBox, DraggableDialog } from "@basesShared";

const Modal_Menu = ({ isShowing, hide, data, refreshTable }) => {
    const [info, setInfo] = useState({});
  
    useEffect(() => {
      setInfo(data);
    }, [data]);
  

    const handleSave = () => {
      return api_post("sysRoleaApi/add-menu", {...info, role_id: data.id, menu_id:info.Id}).then((res) => {
        refreshTable();
        hide();
      });
    };
  

    return <DraggableDialog animate="slide_down"  isShowing={isShowing} hide={hide} onSave={handleSave} title={"Add Menu"} > 
    <FormControl margin="dense" fullWidth sx={{minWidth:"400px"}}>
        <SelectBox
          id="Id"
          placeholder="Menu"
          url="sysMenu/get-menu-list"
          groupBy={(option) => option.Parent_name}
          renderGroup={(params) => {
              
            return (
              <div key={"group" + params.key}>
                <div style={{textIndent:'10px', marginBottom:10}}>
                <span style={{fontSize:14}} className="badge badge-primary">{params.group}</span>
                  
                </div>
                  
                  <div style={{textIndent:'30px', marginBottom:10}}>
                  {params.children}
                  </div>
               
              </div>

            )
          }}

         
          onChange={(item) => {
            setInfo({ ...info, Id: item.value });
          }}
          defaultValue={{ title: data.Name, value: data.Id }}
        ></SelectBox>
      </FormControl>
    </DraggableDialog>      
  };
  
  export default Modal_Menu;
