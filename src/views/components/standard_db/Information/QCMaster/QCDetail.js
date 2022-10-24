import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo';
import { FormControlLabel, Grid, IconButton, Switch, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid, MuiSelectField } from '@controls'
import { useModal } from "@basesShared"
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import moment from 'moment';

import CreateQCDetailDialog from './CreateQCDetailDialog'
import ModifyQCDetailDialog from './ModifyQCDetailDialog'
import { qcDetailService } from '@services'
import { QCDetailDto } from "@models"

export default function QCDetail({ QCMasterId }) {

  const intl = useIntl();
  const { isShowing, toggle } = useModal();

  const [newData, setNewData] =
    useState({ ...QCDetailDto })


  const [qcDetailState, setqcDetailState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 7,
    searchData: {
      QCMasterId: QCMasterId,
      showDelete: true
    }

  });
  const [QCCodeArr, setQCCodeArr] = useState([]);
  const [selectedRow, setSelectedRow] = useState({
    ...QCDetailDto
  })
  const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)
  const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false)
  const toggleCreateDialog = () => {
    setIsOpenCreateDialog(!isOpenCreateDialog);
  }
  const toggleModifyDialog = () => {
    setIsOpenModifyDialog(!isOpenModifyDialog);
  }
  const handleRowSelection = (arrIds) => {

    const rowSelected = qcDetailState.data.filter(function (item) {
      return item.QCDetailId === arrIds[0]
    });
    if (rowSelected && rowSelected.length > 0) {
      setSelectedRow({ ...rowSelected[0] });
    }
    else {
      setSelectedRow({ ...QCDetailDto });
    }
  }
  useEffect(() => {
    getQC();
  }, [])

  const getQC = async () => {
    const res = await qcDetailService.getStandardQCActive();
    if (res.HttpResponseCode === 200 && res.Data) {
      setQCCodeArr([...res.Data])
      //console.log(res.Data);
    }
    else {
      setQCCodeArr([])
    }
  }
  //useEffect
  useEffect(() => {
    fetchData(QCMasterId);
  }, [qcDetailState.page, qcDetailState.pageSize, QCMasterId, qcDetailState.searchData.showDelete]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, QCDetailDto)) {
      const data = [newData, ...qcDetailState.data];
      if (data.length > qcDetailState.pageSize) {
        data.pop();
      }
      setqcDetailState({
        ...qcDetailState
        , data: [...data]
        , totalRow: qcDetailState.totalRow + 1
      });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, QCDetailDto)) {
      let newArr = [...qcDetailState.data]
      const index = _.findIndex(newArr, function (o) { return o.QCDetailId == selectedRow.QCDetailId; });
      if (index !== -1) {
        newArr[index] = selectedRow
      }

      setqcDetailState({
        ...qcDetailState
        , data: [...newArr]
      });
    }
  }, [selectedRow]);


  async function fetchData(QCMasterId) {
    setqcDetailState({ ...qcDetailState, isLoading: true });
    const params = {
      page: qcDetailState.page,
      pageSize: qcDetailState.pageSize,
      QCMasterId: QCMasterId,
      QCId: qcDetailState.searchData.QCId,
      showDelete: qcDetailState.searchData.showDelete
    }
    const res = await qcDetailService.getQcDetailList(params);
    setqcDetailState({
      ...qcDetailState
      , data: [...res.Data]
      , totalRow: res.TotalRow
      , isLoading: false
    });
  }
  const handleSearch = (e, inputName) => {
    let newSearchData = { ...qcDetailState.searchData };
    newSearchData[inputName] = e;
    if (inputName == 'showDelete') {
      // console.log(qcDetailState, inputName)
      setqcDetailState({ ...qcDetailState, page: 1, searchData: { ...newSearchData } })
    }
    else {

      setqcDetailState({ ...qcDetailState, searchData: { ...newSearchData } })
    }
  }
  const handleDelete = async (row) => {
    let message = qcDetailState.searchData.showDelete ? intl.formatMessage({ id: 'general.confirm_delete' }) : intl.formatMessage({ id: 'general.confirm_redo_deleted' })
    if (window.confirm(message)) {
      try {
        let res = await qcDetailService.deleteQCDetail({ QCDetailId: row.QCDetailId, row_version: row.row_version });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }))
          await fetchData(QCMasterId);
        }
        if (res && res.HttpResponseCode === 300) {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
          return;
        }
      } catch (error) {
        // console.log(error)
      }
    }
  }
  const columns = [
    {
      field: 'id', headerName: '', flex: 0.1, align: 'center',
      filterable: false,
      renderCell: (index) => (index.api.getRowIndex(index.row.QCDetailId) + 1) + (qcDetailState.page - 1) * qcDetailState.pageSize,
    },
    { field: 'QCDetailId', hide: true },
    { field: 'QCMasterId', hide: true },
    { field: 'QCId', hide: true },
    { field: 'row_version', hide: true },
    {
      field: "action",
      headerName: "",
      flex: 0.2,
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
                onClick={toggleModifyDialog}
              >
                {params.row.isActived ? <EditIcon fontSize="inherit" /> : ""}
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
                {params.row.isActived ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },
    { field: 'QCMasterCode', headerName: intl.formatMessage({ id: "qcMaster.QCMasterCode" }), flex: 0.5, },
    {
      field: 'QCCode', headerName: intl.formatMessage({ id: "standardQC.QCCode" }), flex: 0.5,
      renderCell: (params) => (
        <div>
          {params.row.Description == null || params.row.Description == "" ? params.row.QCCode : params.row.QCCode + ' - ' + params.row.Description}
        </div>
      ),
    },
    { field: 'Description', headerName: intl.formatMessage({ id: "general.description" }), flex: 0.5, hide: true },
    { field: 'createdName', headerName: intl.formatMessage({ id: "general.createdName" }), flex: 0.5, },
    {
      field: 'createdDate', headerName: intl.formatMessage({ id: "general.createdDate" }), flex: 0.5,
      valueFormatter: params => params?.value ? moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss") : null
    },
    { field: 'modifiedName', headerName: intl.formatMessage({ id: "general.modifiedName" }), flex: 0.5, },
    {
      field: 'modifiedDate', headerName: intl.formatMessage({ id: "general.modifiedDate" }), flex: 0.5,
      valueFormatter: params => params?.value ? moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss") : null
    },
  ];


  return (
    <>
      <Grid container
        direction="row"
        justifyContent="space-between"
        alignItems="width-end" sx={{ mb: 1 }} >
        <Grid item xs={8}>
          <MuiButton text="create" color='success' onClick={toggleCreateDialog} sx={{ mt: 1 }}
            disabled={QCMasterId ? false : true} />
        </Grid>
        <Grid item>
          <MuiSelectField
            label={intl.formatMessage({ id: 'standardQC.QCCode' })}
            options={QCCodeArr}
            displayLabel="QCCode"
            displayValue="QCId"
            onChange={(e, item) => handleSearch(item ? item.QCId ?? null : null, 'QCId')}
            variant="standard"
            sx={{ width: 210 }}
          />

        </Grid>
        <Grid item>
          <MuiButton text="search" color='info' onClick={() => fetchData(QCMasterId)} sx={{ m: 1 }} />
        </Grid>
        <Grid item>
          <FormControlLabel
            sx={{ mb: 0 }}
            control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleSearch(e.target.checked, 'showDelete')} />}
            label={qcDetailState.searchData.showDelete ? "Active Data" : "Delete Data"} />
        </Grid>
      </Grid>
      <MuiDataGrid
        showLoading={qcDetailState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={columns}

        rows={qcDetailState.data}
        gridHeight={736}
        page={qcDetailState.page - 1}
        pageSize={qcDetailState.pageSize}
        rowCount={qcDetailState.totalRow}
        rowsPerPageOptions={[5, 8, 20]}
        onPageChange={(newPage) => setqcDetailState({ ...qcDetailState, page: newPage + 1 })}
        onPageSizeChange={(newPageSize) => setqcDetailState({ ...qcDetailState, pageSize: newPageSize, page: 1 })}
        getRowId={(rows) => rows.QCDetailId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`
        }}
        onSelectionModelChange={(newSelectedRowId) => {
          handleRowSelection(newSelectedRowId)
        }}
      />
      <CreateQCDetailDialog
        initModal={{ ...QCDetailDto, QCMasterId: QCMasterId }}
        setNewData={setNewData}
        isOpen={isOpenCreateDialog}
        onClose={toggleCreateDialog}
      />
      <ModifyQCDetailDialog
        initModal={selectedRow}
        setModifyData={setSelectedRow}
        isOpen={isOpenModifyDialog}
        onClose={toggleModifyDialog}
      />
    </>
  )
}
