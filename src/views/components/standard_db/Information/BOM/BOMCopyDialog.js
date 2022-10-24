import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiButton, MuiDateField, MuiSelectField, MuiDataGrid, MuiSubmitButton } from '@controls'
import { Checkbox, FormControlLabel, Grid, IconButton, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { bomDetailService, bomService } from '@services'
import { ErrorAlert, SuccessAlert, dateToTicks } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik'
import { useModal, useModal2 } from "@basesShared"
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

const BOMCopyDialog = ({ initModal, isOpen, onClose, resetData, newDataChild, setBomId, BomId }) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const [version, setVersion] = useState("");
  const [versionError, setVersionError] = useState("");
  const [MaterialList, setMaterialList] = useState([]);

  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 7,
    BomId: BomId
  });
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const [ParentList, setParentList] = useState([]);
  const [MaterialType, setMaterialType] = useState("");

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
            {params.row.BomLevel != 0 &&
              <>
                <Grid item xs={6} style={{ textAlign: "center" }}>
                  <IconButton
                    aria-label="delete"
                    color="error"
                    size="small"
                    sx={[{ '&:hover': { border: '1px solid red', }, }]}
                    onClick={() => handleDelete(params.row)}
                  >
                    <DeleteIcon fontSize="inherit" />
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
              </>}
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
    Amount: yup.number().nullable().moreThan(0, intl.formatMessage({ id: 'bom.min_value' })).required(intl.formatMessage({ id: 'general.field_required' })),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: defaultValue,
    enableReinitialize: true,
    onSubmit: async values => onSubmit(values)
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  useEffect(() => {
    if (isOpen) {
      fetchData(BomId);
      getParent(BomId);
      getMaterial(1, BomId);
    }
    return () => { isRendered = false; }
  }, [isOpen]);

  useEffect(() => {
    if (MaterialType == "BARE MATERIAL")
      getMaterial(2, BomId);
    else
      getMaterial(1, BomId);
  }, [MaterialType])

  //handle
  const handleDelete = async (row) => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
      let child = state.data.filter(x => x.ParentId == row.MaterialId);
      if (child.length == 0) {
        let newArr = [...state.data]
        newArr = newArr.filter(x => x.BomId != row.BomId);
        setState({ ...state, data: [...newArr] });
      }
      else {
        ErrorAlert(intl.formatMessage({ id: 'bom.delete_error' }));
      }
    }
  }

  const handleUpdate = (row) => {
    handleReset();
    setMode(UPDATE_ACTION);
    setFieldValue("BomId", row.BomId);
    setFieldValue("BomLevel", row.BomLevel);
    setFieldValue("ParentCode", row.ParentCode);
    setFieldValue("Remark", row.Remark);
    setFieldValue("Amount", row.Amount);
    setFieldValue("MaterialCode", row.MaterialCode);
    setFieldValue("MaterialId", row.MaterialId);
    setFieldValue("ParentId", row.ParentId);
  };

  async function fetchData(BomId) {
    setState({ ...state, isLoading: true });
    const params = {
      page: state.page,
      pageSize: state.pageSize,
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

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });
    data.BomCode = state.data[0].BomCode;
    if (mode == CREATE_ACTION) {
      data.BomId = dateToTicks(new Date());
      data.ParentCode = (data.ParentCode.split(" - "))[0];
      data.ParentId = data.MaterialParentId;
      const newData = [...state.data, data];
      setState({ ...state, data: newData });
      SuccessAlert(intl.formatMessage({ id: "general.success" }))
      setDialogState({ ...dialogState, isSubmit: false });
      resetForm();
      handleAddParent(data);
    }
    else {
      let newArr = [...state.data]
      const index = _.findIndex(newArr, function (o) { return o.BomId == data.BomId; });
      console.log(data, index, newArr)
      if (index !== -1) {
        newArr[index] = data
      }
      setState({ ...state, data: [...newArr] });
      SuccessAlert(intl.formatMessage({ id: "general.success" }))
      setDialogState({ ...dialogState, isSubmit: false });
      setMode(CREATE_ACTION);
      resetForm();
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
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
        handleCloseDialog();
        resetData();
        setBomId(null);
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

  const handleAddParent = (data) => {
    var option = {
      BomId: data.BomId,
      BomCode: data.MaterialCode + ' - ' + data.MaterialType,
      BomLevelGroup: data.BomLevel == 0 ? "FINISH GOOD" : "Level " + data.BomLevel,
      MaterialId: data.MaterialId,
      MaterialType: data.MaterialType,
      BomLevel: data.BomLevel
    }
    var newArr = [...ParentList, option];
    newArr = newArr.sort(x => x.BomLevelGroup);
    setParentList(newArr);
  }

  const handleCloseDialog = () => {
    resetForm(defaultValue);
    handleReset();
    onClose();
  }

  const handleReset = () => {
    setMode(CREATE_ACTION);
    setDialogState({ ...dialogState, isSubmit: false });
    resetForm();
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
                required
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
                  setFieldValue("BomLevel", value?.BomLevel + 1);
                  setFieldValue("MaterialParentId", value?.MaterialId);
                  setFieldValue("ParentCode", value?.BomCode);
                  setFieldValue("ParentId", value?.BomId);
                }}
                error={touched.ParentId && Boolean(errors.ParentId)}
                helperText={touched.ParentId && errors.ParentId}
              /> : <TextField
                fullWidth
                size='small'
                disabled
                value={values?.ParentCode}
                label={intl.formatMessage({ id: 'bom.ParentId' })}
              />}
            </Grid>
            <Grid item xs={12} sx={{ mb: 3 }}>
              <MuiSelectField
                required
                value={values.MaterialId ? { MaterialId: values.MaterialId, MaterialCode: values.MaterialCode } : null}
                disabled={dialogState.isSubmit}
                label={intl.formatMessage({ id: 'bomDetail.MaterialId' })}
                options={MaterialList}
                displayLabel="MaterialCode"
                displayValue="MaterialId"
                displayGroup="GroupMaterial"
                onChange={(e, value) => {
                  setFieldValue("MaterialCode", value?.MaterialCode, true);
                  setFieldValue("MaterialType", value?.GroupMaterial, true);
                  setFieldValue("MaterialId", value?.MaterialId, true);
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
                disabled={dialogState.isSubmit}
                value={values.Amount}
                onChange={handleChange}
                label={intl.formatMessage({ id: 'bomDetail.Amount' }) + ' *'}
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
              {mode == CREATE_ACTION ?
                <MuiButton text="create" type='submit' color='success' disabled={dialogState.isSubmit} sx={{ width: '100%', m: 0 }} /> :
                <>
                  <MuiResetButton onClick={handleReset} disabled={dialogState.isSubmit} sx={{ width: '47%', m: 0, mr: 1 }} />
                  <MuiButton text="edit" type='submit' color='warning' disabled={dialogState.isSubmit} sx={{ width: '48%', m: 0, ml: 1 }} />
                </>
              }
            </Grid>
          </Grid>
          <Grid item xs={9}>
            <MuiDataGrid
              showLoading={state.isLoading}
              isPagingServer={true}
              headerHeight={45}
              columns={columns}
              rows={state.data}
              row={[]}
              gridHeight={310}
              page={state.page - 1}
              pageSize={state.pageSize}
              rowCount={state.totalRow}
              getRowId={(rows) => rows.BomId}
            />
          </Grid>
        </Grid>
      </form>

      <Grid item xs={12} sx={{ mt: 1 }}>
        <Grid container direction="row-reverse">
          <MuiButton text="save" color='primary' onClick={handleSave} />
          <TextField
            required
            sx={{ width: 300, marginTop: '3px', mr: 1 }}
            fullWidth
            size='small'
            disabled={state.isLoading}
            onChange={(e) => {
              setVersion(e.target.value);
              setVersionError(e.target.value ? "" : intl.formatMessage({ id: "general.field_required" }));
            }}
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
  MaterialType: '',
  ParentId: null,
  ParentCode: '',
  Amount: '',
  MaterialParentId: null,
  Remark: ''
};

export default BOMCopyDialog