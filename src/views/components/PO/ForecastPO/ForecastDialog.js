import React, { useEffect, useState, useRef } from "react";
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiDateField, MuiSelectField } from '@controls'
import { useIntl } from 'react-intl';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Grid, TextField } from "@mui/material";
import { CREATE_ACTION } from '@constants/ConfigConstants';

const ForecastDialog = (props) => {
    const { initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption } = props;
    const intl = useIntl();
    const defaultValue = { MaterialId: null, LineId: null, Week: '', Year: '', Amount: ''  };
    const [dialogState, setDialogState] = useState({
        isSubmit: false,
    });
    useEffect(()=>{
      console.log("OKE")
    },[])
    const schema = yup.object().shape({
      // MaterialId: yup.number().nullable().required(intl.formatMessage({ id: 'forecast.MaterialId_required' })),
      MaterialId: yup.number().nullable().required(intl.formatMessage({ id: 'forecast.MaterialId_required' })),
      LineId: yup.number().nullable().required(intl.formatMessage({ id: 'forecast.LineId_required' })),
      Week: yup.number().nullable().required(intl.formatMessage({ id: 'forecast.Week_required' })),
      Year: yup.number().nullable().required(intl.formatMessage({ id: 'forecast.Year_required' })),
      Amount: yup.number().nullable().required(intl.formatMessage({ id: 'forecast.Amount_required' })),
    });
    const handleReset = () => {
      resetForm();
    }
    const handleCloseDialog = () => {
        setDialogState({
            ...dialogState
        });
        resetForm();
        onClose();
    }
    const formik = useFormik({
        validationSchema: schema,
        initialValues: mode == CREATE_ACTION ? defaultValue : initModal,
        enableReinitialize: true,
        onSubmit: async values => onSubmit(values)
    });
    const {
        handleChange
        , handleBlur
        , handleSubmit
        , values
        , setFieldValue
        , errors
        , touched
        , isValid
        , resetForm
    } = formik;
    const onSubmit = async (data) => { 
      console.log("SUBMITTT")
      //  setDialogState({ ...dialogState, isSubmit: true });
      // if (mode == CREATE_ACTION) {
      //   const res = await trayService.createTray(data);
      //   if (res.HttpResponseCode === 200 && res.Data) {
      //     SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
      //     setNewData({ ...res.Data });
      //     setDialogState({ ...dialogState, isSubmit: false });
      //     handleReset();
      //   }
      //   else {
      //     ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
      //     setDialogState({ ...dialogState, isSubmit: false });
      //   }
      // }
    }

  return (
    <MuiDialog
      maxWidth="sm"
      title={intl.formatMessage({ id: mode == CREATE_ACTION ? 'general.create' : 'general.modify' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit}>
        <Grid
          container
          rowSpacing={2.5}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        >
         <Grid item xs={12}>
            <MuiSelectField
              value={values.MaterialId ? { MaterialId: values.MaterialId, MaterialName: values.MaterialCode } : null}
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'forecast.MaterialId' }) + ' *'}
              options={valueOption.MaterialList}
              displayLabel="MaterialCode" 
              displayValue="MaterialId"
              onChange={(e, value) => {
                setFieldValue("MaterialCode", value?.MaterialName || '');
                setFieldValue("MaterialId", value?.MaterialId || "");
              }}
              defaultValue={mode == CREATE_ACTION ? null : { commonDetailId: initModal.MaterialId, commonDetailName: initModal.MaterialCode }}
              error={touched.MaterialId && Boolean(errors.MaterialId)}
              helperText={touched.MaterialId && errors.MaterialId}
            />
          </Grid>
          <Grid item xs={12}>
            <MuiSelectField
              value={values.LineId ? { commonDetailId: values.LineId, commonDetailName: values.LineName } : null}
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'forecast.LineId' }) + ' *'}
              options={valueOption.LineList}
              displayLabel="commonDetailName" 
              displayValue="commonDetailId"
              onChange={(e, value) => {
                setFieldValue("LineName", value?.commonDetailName || '');
                setFieldValue("LineId", value?.commonDetailId || "");
              }}
              defaultValue={mode == CREATE_ACTION ? null : { commonDetailId: initModal.LineId, commonDetailName: initModal.LineName }}
              error={touched.LineId && Boolean(errors.LineId)}
              helperText={touched.LineId && errors.LineId}
            />
          </Grid>
          <Grid item xs={12}>
              <TextField
                fullWidth
                type='number'
                size='small'
                name='Week'
                disabled={dialogState.isSubmit}
                value={values.Week}
                onChange={handleChange}
                label={intl.formatMessage({ id: 'forecast.Week' }) + ' *'}
                error={touched.Week && Boolean(errors.Week)}
                helperText={touched.Week && errors.Week}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type='number'
                size='small'
                name='Year'
                disabled={dialogState.isSubmit}
                value={values.Year}
                onChange={handleChange}
                label={intl.formatMessage({ id: 'forecast.Year' }) + ' *'}
                error={touched.Year && Boolean(errors.Year)}
                helperText={touched.Year && errors.Year}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type='number'
                size='small'
                name='Amount'
                disabled={dialogState.isSubmit}
                value={values.Amount}
                onChange={handleChange}
                label={intl.formatMessage({ id: 'forecast.Amount' }) + ' *'}
                error={touched.Amount && Boolean(errors.Amount)}
                helperText={touched.Amount && errors.Amount}
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
  );
};
export default ForecastDialog