import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiDateField, MuiSelectField } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import { Autocomplete, Checkbox, FormControlLabel, Grid, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { documentService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik'

const DocumentDialog = ({ initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const [selectedFile, setSelectedFile] = useState();

  const schema = yup.object().shape({
    menuComponent: yup.string().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    language: yup.string().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: mode == CREATE_ACTION ? defaultValue : initModal,
    enableReinitialize: true,
    onSubmit: async values => onSubmit(values)
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  const handleReset = () => {
    document.getElementById('file').value = null;
    setSelectedFile(null);
    resetForm();
  }

  const handleCloseDialog = () => {
    resetForm();
    onClose();
  }

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    if (mode == CREATE_ACTION) {
      const res = await documentService.createDocument(data, selectedFile);
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
      const res = await documentService.modifyDocument(data, selectedFile);
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

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
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
            {mode == CREATE_ACTION ?
              < MuiSelectField
                required
                value={values.menuComponent ? { menuComponent: values.menuComponent } : null}
                disabled={dialogState.isSubmit}
                label={intl.formatMessage({ id: 'document.menuComponent' })}
                options={valueOption.MenuComponentList}
                displayLabel="menuComponent"
                displayValue="menuComponent"
                onChange={(e, value) => setFieldValue("menuComponent", value?.menuComponent || '')}
                error={touched.menuComponent && Boolean(errors.menuComponent)}
                helperText={touched.menuComponent && errors.menuComponent}
              /> :
              <TextField
                fullWidth
                size='small'
                disabled
                value={values.menuComponent}
                label={intl.formatMessage({ id: 'document.menuComponent' })}
              />}
          </Grid>
          <Grid item xs={12}>
            <MuiSelectField
              required
              value={values.language ? { commonDetailName: values.language } : null}
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'document.language' })}
              options={valueOption.LanguageList}
              displayLabel="commonDetailName"
              displayValue="commonDetailName"
              onChange={(e, value) => setFieldValue("language", value?.commonDetailName || '')}
              error={touched.language && Boolean(errors.language)}
              helperText={touched.language && errors.language}
            />
          </Grid>
          <Grid item xs={12}>
            <input type="file" id="file" name="file" onChange={changeHandler} />
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
  documentId: null,
  menuComponent: '',
  menuName: '',
  language: '',
  urlFile: ''
};

export default DocumentDialog