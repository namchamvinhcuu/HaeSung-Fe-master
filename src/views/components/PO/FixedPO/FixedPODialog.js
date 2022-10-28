import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiDateField, MuiSelectField } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import { Checkbox, FormControlLabel, Grid, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { purchaseOrderService } from '@services'
import { ErrorAlert, SuccessAlert, WarningAlert } from '@utils'
import { CREATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik'
import moment from "moment";

const FixedPODialog = ({ initModal, isOpen, onClose, setNewData, setUpdateData, mode, valueOption }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const defaultValue = { PoCode: '', Description: '', Week: null, Year: null, TotalQty: null };
  const [YearList, setYearList] = useState([]);
  const schema = yup.object().shape({
    PoCode: yup.string().nullable().required(intl.formatMessage({ id: 'general.field_required' }))
      .length(10, intl.formatMessage({ id: 'general.field_length' }, { length: 10 })),
    Week: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' }))
    //.typeError(intl.formatMessage({ id: 'general.field_invalid' }))
    ,
    Year: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' })),
    TotalQty: yup.number().nullable().required(intl.formatMessage({ id: 'general.field_required' }))
  });
  const formik = useFormik({
    validationSchema: schema,
    initialValues: mode == CREATE_ACTION ? defaultValue : initModal,
    enableReinitialize: true,
    onSubmit: async values => onSubmit(values)
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  const handleReset = () => {
    resetForm();
  }

  const handleCloseDialog = () => {
    resetForm();
    onClose();
  }

  //useEffect
  useEffect(() => {
    getYearList();
  }, []);

  const handleChangeDate = (date, e) => {
    let x = new Date(e);
    let y = new Date();

    if (date === "DeliveryDate") {
      if (values.DueDate != null) {
        y = new Date(values.DueDate);
        if (+x >= +y) {
          e = values.DueDate;
          WarningAlert(intl.formatMessage({ id: "purchase_order.DeliveryDate_warning" }));
        }
      }
      setFieldValue(date, e)
    }
    else {
      if (values.DeliveryDate != null) {
        y = new Date(values.DeliveryDate);
        if (+x < +y) {
          e = values.DeliveryDate;
          WarningAlert(intl.formatMessage({ id: "purchase_order.DueDate_warning" }));
        }
      }
      setFieldValue(date, e)
    }
  };

  const getYearList = async () => {
    const currentYear = new Date().getFullYear();
    let yearList = [];
    for (let i = currentYear; i < 2100; i++) {
      yearList.push({ YearId: i, YearName: i.toString() });
    }
    setYearList(yearList);

  };

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    if (mode == CREATE_ACTION) {
      const res = await purchaseOrderService.createPO(data);
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
      const res = await purchaseOrderService.modifyPO(data);
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
              name='PoCode'
              inputProps={{ maxLength: 10 }}
              disabled={dialogState.isSubmit}
              value={values.PoCode}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'purchase_order.PoCode' }) + ' *'}
              error={touched.PoCode && Boolean(errors.PoCode)}
              helperText={touched.PoCode && errors.PoCode}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size='small'
              name='Description'
              disabled={dialogState.isSubmit}
              value={values.Description}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'purchase_order.Description' })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              size="small"
              name="TotalQty"
              disabled={dialogState.isSubmit}
              onChange={handleChange}
              label={intl.formatMessage({ id: "purchase_order.TotalQty" }) + " *"}
              error={touched.TotalQty && Boolean(errors.TotalQty)}
              helperText={touched.TotalQty && errors.TotalQty}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              size="small"
              name="Week"
              disabled={dialogState.isSubmit}
              onChange={handleChange}
              label={intl.formatMessage({ id: "forecast.Week" }) + " *"}
              error={touched.Week && Boolean(errors.Week)}
              helperText={touched.Week && errors.Week}
            />
          </Grid>
          <Grid item xs={12}>
            <MuiSelectField
              value={values.Year ? { YearId: values.Year, YearName: values.Year } : null}
              label={intl.formatMessage({ id: "forecast.Year" })}
              options={YearList}
              displayLabel="YearName"
              displayValue="YearId"
              onChange={(e, item) => setFieldValue("Year", item?.YearId || '')}
              error={touched.Year && Boolean(errors.Year)}
              helperText={touched.Year && errors.Year}
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

export default FixedPODialog