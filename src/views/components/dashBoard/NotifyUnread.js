
import React, { Component, useState, useEffect, useRef } from "react";
import { useModal, ButtonAsync, DraggableDialog, DataTable } from "@basesShared";
import { api_post, SuccessAlert } from '@utils'


const NotifyUnread = ({ onClose }) => {
  const [rowselected, setRowSelected] = useState([]);
  const [refreshbell, setRefreshBell] = useState();

  const gridRef = useRef();

  const columns = [

    { field: "id", headerName: "ID", width: 200, editable: false, hide: true },
    { field: "Title", headerName: "Title", width: 100, editable: false },
    { field: "Content", headerName: "Content", width: 300, editable: false },
    { field: "PublicTimeStr", headerName: "Public Time", width: 180, editable: false },

  ];

  useEffect(() => {


  }, []);



  const handleSave = () => {
    if (rowselected && rowselected.length > 0) {
      return new Promise((resolve, reject) => {
        api_post(`sysNotice/setread`, { Notices: rowselected }).then(() => {
          gridRef.current.refreshGrid().then((res) => {
            setRefreshBell(true)
            SuccessAlert("save successful")
            resolve();
          });

        }).catch(err => reject(err));

      });

    }
  }

  const handleClear = () => {
    if (window.confirm("Are you sure clear all notices ?")) {
      return new Promise((resolve, reject) => {
        api_post(`sysNotice/clear`).then(() => {
          gridRef.current.refreshGrid().then((res) => {
            setRefreshBell(true)
            SuccessAlert("save successful")
            resolve();
          }).catch(err => reject(err))

        }).catch(err => reject(err));

      });
    }

  }
  return (
    <DraggableDialog fullWidth={true} size='sm' isShowing={true} hide={() => onClose(refreshbell, gridRef.current.getDataGrid())}
      onSave={handleSave}
      onClear={handleClear}
      title={"Your unread message"}
    >
      <DataTable
        ref={gridRef}
        url="sysNotice/unread"
        columns={columns}
        rowHeight={35}
        headerHeight={25}
        sx={{ height: 250 }}
        checkboxSelection={true}
        IsPagingServer={true}
        pageSize={15}
        onSelectionModelChange={(ids) => {
          setRowSelected(ids)

        }}
      />
    </DraggableDialog>

  );
}

export default NotifyUnread;

