import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiDateField, MuiSelectField } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import { Checkbox, FormControlLabel, Grid, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { trayService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik'

const TrayDialog = ({ initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const defaultValue = { TrayCode: '', IsReuse: false, TrayType: null, TrayTypeName: '' };

  const schema = yup.object().shape({
    TrayCode: yup.string().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    TrayType: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' }))
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
      const res = await trayService.createTray(data);
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
      const res = await trayService.modifyTray({ ...data, TrayId: initModal.TrayId, row_version: initModal.row_version });
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
              name='TrayCode'
              disabled={dialogState.isSubmit}
              value={values.TrayCode}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'tray.TrayCode' }) + ' *'}
              error={touched.TrayCode && Boolean(errors.TrayCode)}
              helperText={touched.TrayCode && errors.TrayCode}
            />
          </Grid>
          <Grid item xs={12}>
            <MuiSelectField
              value={values.TrayType ? { commonDetailId: values.TrayType, commonDetailName: values.TrayTypeName } : null}
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'tray.TrayType' }) + ' *'}
              options={valueOption.TrayTypeList}
              displayLabel="commonDetailName" 
              displayValue="commonDetailId"
              onChange={(e, value) => {
                setFieldValue("TrayTypeName", value?.commonDetailName || '');
                setFieldValue("TrayType", value?.commonDetailId || "");
              }}
              defaultValue={mode == CREATE_ACTION ? null : { commonDetailId: initModal.TrayType, commonDetailName: initModal.TrayTypeName }}
              error={touched.TrayType && Boolean(errors.TrayType)}
              helperText={touched.TrayType && errors.TrayType}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              checked={values.IsReuse}
              onChange={(e) => setFieldValue("IsReuse", e.target.checked)}
              control={<Checkbox />}
              label={intl.formatMessage({ id: 'tray.IsReuse' })}
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

export default TrayDialog