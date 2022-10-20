import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiButton, MuiDateField, MuiSelectField, MuiDataGrid, MuiSubmitButton } from '@controls'
import { Checkbox, FormControlLabel, Grid, IconButton, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { bomDetailService, bomService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik'
import { useModal, useModal2 } from "@basesShared"
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo';
import { da } from 'date-fns/locale'

const BOMCopyDialog = ({ initModal, isOpen, onClose, setNewDataChild, newDataChild, setBomId, BomId }) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const [version, setVersion] = useState("");
  const [versionError, setVersionError] = useState("");
  const [MaterialList, setMaterialList] = useState([]);
  const { isShowing, toggle } = useModal();
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 7,
    searchData: { showDelete: true, MaterialId: null },
    BomId: BomId
  });
  const [newData, setNewData] = useState({})
  const [updateData, setUpdateData] = useState({})
  const [rowData, setRowData] = useState({});
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const [ParentList, setParentList] = useState([]);
  const [MaterialType, setMaterialType] = useState("");
  const [MaterialTypeChild, setMaterialTypeChild] = useState("");

  const columns = [
    {
      field: 'id', headerName: '', flex: 0.1, align: 'center',
      filterable: false,
      renderCell: (index) => (index.api.getRowIndex(index.row.BomId) + 1) + (state.page - 1) * state.pageSize,
    },
    { field: 'BomId', hide: true },
    { field: 'ParentId', hide: true },
    { field: 'row_version', hide: true },
    {
      field: "action",
      headerName: "",
      flex: 0.3,
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid Grid container spacing={1} alignItems="center" justifyContent="center" >
            {params.row.BomLevel != 0 ?
              <>
                <Grid item xs={6} style={{ textAlign: "center" }}>
                  <IconButton
                    aria-label="delete"
                    color="error"
                    size="small"
                    sx={[{ '&:hover': { border: '1px solid red', }, }]}
                    onClick={() => handleDelete(params.row.BomId)}
                  >
                    {params.row.isActived ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
                  </IconButton>
                </Grid>
                <Grid item xs={6} style={{ textAlign: "center" }}>
                  <IconButton
                    aria-label="edit"
                    color="warning"
                    size="small"
                    sx={[{ '&:hover': { border: '1px solid orange', }, }]}
                    onClick={() => handleUpdate(params.row)}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                </Grid>
              </> : null}
          </Grid >
        );
      },
    },
    { field: 'BomCode', headerName: intl.formatMessage({ id: "bom.BomCode" }), flex: 0.5, },
    { field: 'ParentCode', headerName: intl.formatMessage({ id: "bom.ParentCode" }), flex: 0.6, },
    { field: 'MaterialCode', headerName: intl.formatMessage({ id: "bom.MaterialId" }), flex: 0.6, },
    { field: 'BomLevel', headerName: intl.formatMessage({ id: "bom.BomLevel" }), flex: 0.3, },
    { field: 'Amount', headerName: intl.formatMessage({ id: "bom.Amount" }), flex: 0.3, },
    { field: 'Remark', headerName: intl.formatMessage({ id: "bom.Remark" }), flex: 0.6, },
  ];


  const schema = yup.object().shape({
    ParentId: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    MaterialId: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    Amount: yup.number().nullable().min(0, intl.formatMessage({ id: 'bom.min_value' })).required(intl.formatMessage({ id: 'general.field_required' })),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: mode == CREATE_ACTION ? defaultValue : initModal,
    enableReinitialize: true,
    onSubmit: async values => onSubmit(values)
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  //useEffect
  // useEffect(() => {
  //   getParent(BomId);
  //   getMaterial();
  // }, [])

  useEffect(() => {
    if (isOpen) {
      getParent(BomId);
      fetchData(BomId);
      getMaterial(1, BomId);
    }
    return () => { isRendered = false; }
  }, [state.page, state.pageSize, BomId, isOpen]);

  useEffect(() => {
    if (MaterialType == "BARE MATERIAL")
      getMaterial(2, BomId);
    else
      getMaterial(1, BomId);
  }, [MaterialType])

  useEffect(() => {
    if (!_.isEmpty(newData)) {
      const data = [newData, ...state.data];
      if (data.length > state.pageSize) {
        data.pop();
      }
      setState({
        ...state
        , data: [...data]
        , totalRow: state.totalRow + 1
      });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(newDataChild)) {
      const data = [newDataChild, ...state.data];
      if (data.length > state.pageSize) {
        data.pop();
      }
      setState({
        ...state
        , data: [...data]
        , totalRow: state.totalRow + 1
      });
    }
  }, [newDataChild]);

  useEffect(() => {
    if (!_.isEmpty(updateData) && !_.isEqual(updateData, rowData)) {
      let newArr = [...state.data]
      const index = _.findIndex(newArr, function (o) { return o.BomId == updateData.BomId; });
      if (index !== -1) {
        newArr[index] = updateData
      }

      setState({ ...state, data: [...newArr] });
    }
  }, [updateData]);

  //handle
  const handleDelete = async (BomId) => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
      let newArr = [...state.data]
      newArr = newArr.filter(x => x.BomId != BomId)
      setState({ ...state, data: [...newArr] });
    }
  }

  const handleAdd = () => {
    setMode(CREATE_ACTION);
    setRowData();
    toggle();
  };

  const handleUpdate = (row) => {
    setMode(UPDATE_ACTION);
    setRowData({ ...row });
    toggle();
  };

  async function fetchData(BomId) {
    setState({ ...state, isLoading: true });
    const params = {
      page: 1,
      pageSize: -1,
      BomId: BomId
    }
    const res = await bomService.getBomForCopy(params);
    if (res && res.Data && isRendered)
      setState({
        ...state
        , data: res.Data ?? []
        , totalRow: res.TotalRow
        , isLoading: false
      });
  }

  const handleSearch = (e, inputName) => {
    let newSearchData = { ...state.searchData };
    newSearchData[inputName] = e;
    if (inputName == 'showDelete') {
      setState({ ...state, page: 1, searchData: { ...newSearchData } })
    }
    else {
      setState({ ...state, searchData: { ...newSearchData } })
    }
  }

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });
    console.log(data)
    if (mode == CREATE_ACTION) {

      const newData = [...state.data, data];
      setState({ ...state, data: newData });
      ErrorAlert(intl.formatMessage({ id: "general.success" }))
      setDialogState({ ...dialogState, isSubmit: false });
      resetForm();
    }
    else {
      const res = await bomService.modifyBom(data);
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setUpdateData(res.Data);
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
        handleCloseDialog();
      }
      else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setDialogState({ ...dialogState, isSubmit: false });
      }
    }
  };

  const getMaterial = async (id, BomId) => {
    const res = await bomService.getMaterial(id, BomId);
    if (res.Data) {
      setMaterialList([...res.Data])
    }
  }

  const handleSave = async () => {
    if (version != '' && version != null) {
      setDialogState({ ...dialogState, isSubmit: true });
      const res = await bomService.copyBom(BomId, version, state.data);

      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setDialogState({ ...dialogState, isSubmit: false });
        onClose();
      }
      else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setDialogState({ ...dialogState, isSubmit: false });
      }
    }
    else {
      setVersionError(intl.formatMessage({ id: "general.field_required" }))
    }
  }

  const handleCloseDialog = () => {
    onClose();
  }


  const getParent = async (BomId) => {
    const res = await bomService.getParent(BomId);
    if (res.Data) {
      setParentList([...res.Data])
    }
  }
  return (
    <MuiDialog
      maxWidth='xl'
      title={intl.formatMessage({ id: 'general.copy' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit} >
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={3}>
            <Grid item xs={12} sx={{ mb: 3 }}>
              {mode == CREATE_ACTION ? <MuiSelectField
                value={values.ParentId ? { BomId: values.ParentId, BomCode: values.ParentCode } : null}
                disabled={dialogState.isSubmit}
                label={intl.formatMessage({ id: 'bom.ParentId' })}
                options={ParentList}
                displayLabel="BomCode"
                displayValue="BomId"
                displayGroup="BomLevelGroup"
                onChange={(e, value) => {
                  setMaterialType(value?.MaterialType);
                  setFieldValue("MaterialCode", '');
                  setFieldValue("MaterialId", null);
                  setFieldValue("ParentCode", value?.BomCode || '');
                  setFieldValue("ParentId", value?.BomId || "");
                }}
                error={touched.ParentId && Boolean(errors.ParentId)}
                helperText={touched.ParentId && errors.ParentId}
              /> : <TextField
                fullWidth
                size='small'
                disabled
                value={values.ParentCode}
                label={intl.formatMessage({ id: 'bom.ParentId' })}
              />}
            </Grid>
            <Grid item xs={12} sx={{ mb: 3 }}>
              <MuiSelectField
                value={values.MaterialId ? { MaterialId: values.MaterialId, MaterialCode: values.MaterialCode } : null}
                disabled={dialogState.isSubmit}
                label={intl.formatMessage({ id: 'bomDetail.MaterialId' })}
                options={MaterialList}
                displayLabel="MaterialCode"
                displayValue="MaterialId"
                displayGroup="GroupMaterial"
                onChange={(e, value) => {
                  setMaterialTypeChild(value?.GroupMaterial);
                  if (value?.GroupMaterial == "BARE MATERIAL" || value?.GroupMaterial == "FINISH GOOD")
                    setFieldValue("Amount", '1', true);
                  else
                    setFieldValue("Amount", '', true);
                  setFieldValue("BomId", 5454684, true);
                  setFieldValue("MaterialCode", value?.MaterialCode || '', true);
                  setFieldValue("MaterialId", value?.MaterialId || "", true);
                }}
                error={touched.MaterialId && Boolean(errors.MaterialId)}
                helperText={touched.MaterialId && errors.MaterialId}
              />
            </Grid>
            <Grid item xs={12} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                type="number"
                size='small'
                name='Amount'
                disabled={MaterialTypeChild == "BARE MATERIAL" ? true : dialogState.isSubmit}
                value={values.Amount}
                onChange={handleChange}
                label={intl.formatMessage({ id: 'bomDetail.Amount' })}
                error={touched.Amount && Boolean(errors.Amount)}
                helperText={touched.Amount && errors.Amount}
              />
            </Grid>
            <Grid item xs={12} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                size='small'
                name='Remark'
                disabled={dialogState.isSubmit}
                value={values.Remark}
                onChange={handleChange}
                label={intl.formatMessage({ id: 'bomDetail.Remark' })}
              />
            </Grid>
            <Grid item xs={12} sx={{ mb: 3 }}>
              <MuiButton text="create" type='submit' color='success' loading={dialogState.isSubmit} sx={{ width: '100%', m: 0 }} />
            </Grid>
          </Grid>
          <Grid item xs={9}>
            <MuiDataGrid
              showLoading={state.isLoading}
              isPagingServer={true}
              headerHeight={45}
              columns={columns}
              rows={state.data}
              gridHeight={736}
              page={state.page - 1}
              pageSize={state.pageSize}
              rowCount={state.totalRow}
              onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
              getRowId={(rows) => rows.BomId}
              getRowClassName={(params) => {
                if (_.isEqual(params.row, newData) || _.isEqual(params.row, newDataChild)) return `Mui-created`
              }}
            />
          </Grid>
        </Grid>
      </form>

      <Grid item xs={12} sx={{ mt: 1 }}>
        <Grid container direction="row-reverse">
          <MuiButton text="save" color='primary' onClick={handleSave} />
          <TextField
            sx={{ width: 300, marginTop: '3px', mr: 1 }}
            fullWidth
            size='small'
            disabled={state.isLoading}
            onChange={(e) => setVersion(e.target.value)}
            label={intl.formatMessage({ id: 'bom.Version' })}
            error={Boolean(versionError)}
            helperText={versionError}
          />
        </Grid>
      </Grid>
    </MuiDialog>
  )
}

const defaultValue = {
  BomId: null,
  BomCode: '',
  MaterialId: null,
  MaterialCode: '',
  ParentId: null,
  ParentCode: '',
  Amount: '',
  // MaterialId: null,
  // MaterialCode: '',
  Remark: ''
};

export default BOMCopyDialog