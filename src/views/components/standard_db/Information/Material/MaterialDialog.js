import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiDateField, MuiSelectField, MuiAutocomplete } from '@controls'
import { Autocomplete, Checkbox, FormControlLabel, Grid, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { materialService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik'

const MaterialDialog = ({ initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const [SupplierList, setSupplierList] = useState([]);
  const [UnitList, setUnitList] = useState([]);

  const schema = yup.object().shape({
    MaterialCode: yup.string().nullable().required(intl.formatMessage({ id: 'general.field_required' }))
      .matches(/(\w{4})-(\w{6})/, intl.formatMessage({ id: "general.field_format" }, { format: '****-******' })),
    MaterialType: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    Unit: yup.number().nullable()
      .when("MaterialTypeName", (MaterialTypeName) => {
        if (MaterialTypeName !== "BARE MATERIAL")
          return yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' }))
      }),
    QCMasterId: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    SupplierId: yup.number().nullable()
      .when("MaterialTypeName", (MaterialTypeName) => {
        if (MaterialTypeName !== "BARE MATERIAL")
          return yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' }))
      }),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: mode == CREATE_ACTION ? defaultValue : initModal,
    enableReinitialize: true,
    onSubmit: async values => onSubmit(values)
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  useEffect(() => {
    getSupplier();
    getUnit();
  }, [])

  const handleReset = () => {
    resetForm();
  }

  const handleCloseDialog = () => {
    resetForm();
    onClose();
  }

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    if (mode == CREATE_ACTION) {
      if (data.MaterialTypeName == "BARE MATERIAL") {
        var unitBare = UnitList.filter(x => x.commonDetailName == "PCS");
        data.Unit = unitBare[0].commonDetailId;
      }

      const res = await materialService.createMaterial(data);
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setNewData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
      }
      else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setDialogState({ ...dialogState, isSubmit: false });
      }
    }
    else {
      const res = await materialService.modifyMaterial(data);
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setUpdateData({ ...res.Data });
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

  const getSupplier = async () => {
    const res = await materialService.getSupplier();
    if (res.HttpResponseCode === 200 && res.Data) {
      setSupplierList([...res.Data]);
    }
  };

  const getUnit = async () => {
    const res = await materialService.getUnit();
    if (res.HttpResponseCode === 200 && res.Data) {
      setUnitList([...res.Data]);
    }
  };

  return (
    <MuiDialog
      maxWidth='md'
      title={intl.formatMessage({ id: mode == CREATE_ACTION ? 'general.create' : 'general.modify' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit} >
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={6}>
            <TextField
              autoFocus
              fullWidth
              size='small'
              name='MaterialCode'
              inputProps={{ maxLength: 11 }}
              disabled={dialogState.isSubmit}
              value={values.MaterialCode}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'material.MaterialCode' }) + ' *'}
              error={touched.MaterialCode && Boolean(errors.MaterialCode)}
              helperText={touched.MaterialCode && errors.MaterialCode}
            />
          </Grid>
          <Grid item xs={6}>
            <MuiAutocomplete
              required
              value={values.MaterialType ? { commonDetailId: values.MaterialType, commonDetailName: values.MaterialTypeName } : null}
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'material.MaterialType' })}
              fetchDataFunc={materialService.getMaterialType}
              displayLabel="commonDetailName"
              displayValue="commonDetailId"
              onChange={(e, value) => {
                if (value?.commonDetailName == "BARE MATERIAL") {
                  setFieldValue("SupplierName", '');
                  setFieldValue("SupplierId", null);
                  var unitBare = UnitList.filter(x => x.commonDetailName == "PCS");
                  setFieldValue("UnitName", unitBare[0].commonDetailName);
                  setFieldValue("Unit", unitBare[0].commonDetailId);
                }

                setFieldValue("QCMasterCode", '');
                setFieldValue("QCMasterId", null);
                setFieldValue("MaterialTypeName", value?.commonDetailName || '');
                setFieldValue("MaterialType", value?.commonDetailId || '');
              }}
              error={touched.MaterialType && Boolean(errors.MaterialType)}
              helperText={touched.MaterialType && errors.MaterialType}
            />
          </Grid>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <MuiAutocomplete
                required
                value={values.SupplierId ? { SupplierId: values.SupplierId, SupplierName: values.SupplierName } : null}
                disabled={values.MaterialTypeName == "BARE MATERIAL" || values.MaterialType == null ? true : dialogState.isSubmit}
                label={intl.formatMessage({ id: 'material.SupplierId' })}
                fetchDataFunc={materialService.getSupplier}
                displayLabel="SupplierName"
                displayValue="SupplierId"
                onChange={(e, value) => {
                  setFieldValue("SupplierName", value?.SupplierName || '');
                  setFieldValue("SupplierId", value?.SupplierId || '');
                }}
                error={touched.SupplierId && Boolean(errors.SupplierId)}
                helperText={touched.SupplierId && errors.SupplierId}
              />
            </Grid>
            <Grid item xs={6}>
              <MuiAutocomplete
                required
                value={values.QCMasterId ? { QCMasterId: values.QCMasterId, QCMasterCode: values.QCMasterCode } : null}
                disabled={values.MaterialType == null ? true : dialogState.isSubmit}
                label={intl.formatMessage({ id: 'material.QCMasterId' })}
                fetchDataFunc={() => materialService.getQCMasterByMaterialType(values.MaterialType)}
                displayLabel="QCMasterCode"
                displayValue="QCMasterId"
                onChange={(e, value) => {
                  setFieldValue("QCMasterCode", value?.QCMasterCode || '');
                  setFieldValue("QCMasterId", value?.QCMasterId || '');
                }}
                error={touched.QCMasterId && Boolean(errors.QCMasterId)}
                helperText={touched.QCMasterId && errors.QCMasterId}
              />
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <MuiAutocomplete
              required
              value={values.Unit ? { commonDetailId: values.Unit, commonDetailName: values.UnitName } : null}
              disabled={values.MaterialTypeName == "BARE MATERIAL" ? true : dialogState.isSubmit}
              label={intl.formatMessage({ id: 'material.Unit' })}
              fetchDataFunc={materialService.getUnit}
              displayLabel="commonDetailName"
              displayValue="commonDetailId"
              onChange={(e, value) => {
                setFieldValue("UnitName", value?.commonDetailName || '');
                setFieldValue("Unit", value?.commonDetailId || '');
              }}
              error={touched.Unit && Boolean(errors.Unit)}
              helperText={touched.Unit && errors.Unit}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size='small'
              name='Description'
              disabled={dialogState.isSubmit}
              value={values.Description}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'material.Description' })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size='small'
              name='Grade'
              disabled={dialogState.isSubmit}
              value={values.Grade}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'material.Grade' })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size='small'
              name='Color'
              disabled={dialogState.isSubmit}
              value={values.Color}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'material.Color' })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size='small'
              name='ResinType'
              disabled={dialogState.isSubmit}
              value={values.ResinType}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'material.ResinType' })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size='small'
              name='FlameClass'
              disabled={dialogState.isSubmit}
              value={values.FlameClass}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'material.FlameClass' })}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
              <MuiResetButton onClick={handleReset} disabled={dialogState.isSubmit} />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MuiDialog >
  )
}

const defaultValue = {
  MaterialId: null,
  MaterialCode: '',
  MaterialType: null,
  MaterialTypeName: '',
  Unit: null,
  UnitName: '',
  SupplierId: null,
  SupplierName: '',
  QCMasterId: null,
  QCMasterCode: '',
  Description: '',
  Suppliers: [],
  Grade: '',
  Color: '',
  ResinType: '',
  FlameClass: '',
};

export default MaterialDialog