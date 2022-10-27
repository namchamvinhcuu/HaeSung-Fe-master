import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiDateField, MuiSelectField } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import { Autocomplete, Checkbox, FormControlLabel, Grid, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { materialService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik'

const MaterialDialog = ({ initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });

  const schema = yup.object().shape({
    MaterialCode: yup.string().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    MaterialType: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' })),

    Unit: yup.number().nullable().
      when("MaterialTypeName", (MaterialTypeName) => {
        if (MaterialTypeName !== "BARE MATERIAL")
          return yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' }))
      }),


    Suppliers: yup.array().nullable()
      .when("MaterialTypeName", (MaterialTypeName) => {
        if (MaterialTypeName !== "BARE MATERIAL")
          return yup.array().nullable().min(1, intl.formatMessage({ id: 'general.field_required' }))
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
    if (mode == CREATE_ACTION) {
      formik.initialValues = defaultValue
    }
    else {
      formik.initialValues = initModal;
    }
  }, [initModal, mode])

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
        var unitBare = valueOption.UnitList.filter(x => x.commonDetailName == "PCS");
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

  return (
    <MuiDialog
      maxWidth='sm'
      title={intl.formatMessage({ id: mode == CREATE_ACTION ? 'general.create' : 'general.modify' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit} >
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={12}>
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
          <Grid item xs={12}>
            <MuiSelectField
              required
              value={values.MaterialType ? { commonDetailId: values.MaterialType, commonDetailName: values.MaterialTypeName } : null}
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'material.MaterialType' })}
              options={valueOption.MaterialTypeList}
              displayLabel="commonDetailName"
              displayValue="commonDetailId"
              onChange={(e, value) => {
                if (value?.commonDetailName == "BARE MATERIAL")
                  setFieldValue("Suppliers", []);
                setFieldValue("MaterialTypeName", value?.commonDetailName || '');
                setFieldValue("MaterialType", value?.commonDetailId || '');
              }}
              defaultValue={mode == CREATE_ACTION ? null : { commonDetailId: initModal.MaterialType, commonDetailName: initModal.MaterialTypeName }}
              error={touched.MaterialType && Boolean(errors.MaterialType)}
              helperText={touched.MaterialType && errors.MaterialType}
            />
          </Grid>
          {values.MaterialTypeName != "BARE MATERIAL" &&
            <Grid item xs={12}>
              <MuiSelectField
                required
                value={values.Unit ? { commonDetailId: values.Unit, commonDetailName: values.UnitName } : null}
                disabled={dialogState.isSubmit}
                label={intl.formatMessage({ id: 'material.Unit' })}
                options={valueOption.UnitList}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, value) => {
                  setFieldValue("UnitName", value?.commonDetailName || '');
                  setFieldValue("Unit", value?.commonDetailId || '');
                }}
                defaultValue={mode == CREATE_ACTION ? null : { commonDetailId: initModal.Unit, commonDetailName: initModal.UnitName }}
                error={touched.Unit && Boolean(errors.Unit)}
                helperText={touched.Unit && errors.Unit}
              />
            </Grid>
          }
          {values.MaterialTypeName != "BARE MATERIAL" &&
            <Grid item xs={12}>
              <Autocomplete
                multiple
                fullWidth
                size='small'
                options={valueOption.SupplierList}
                disabled={dialogState.isSubmit}
                autoHighlight
                openOnFocus
                value={values.Suppliers}
                getOptionLabel={option => option.SupplierName}
                onChange={(e, item) => {
                  setFieldValue("Suppliers", item ?? []);
                }}
                disableCloseOnSelect
                renderInput={(params) => {
                  return <TextField
                    {...params}
                    label={intl.formatMessage({ id: 'material.SupplierId' }) + ' *'}
                    error={touched.Suppliers && Boolean(errors.Suppliers)}
                    helperText={touched.Suppliers && errors.Suppliers}
                  />
                }}
              />

            </Grid>

          }

          <Grid item xs={12}>
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
          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
              <MuiResetButton onClick={handleReset} disabled={dialogState.isSubmit} />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MuiDialog>
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
  Description: '',
  Suppliers: [],
};

export default MaterialDialog