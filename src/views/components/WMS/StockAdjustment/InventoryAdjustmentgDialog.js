import { CREATE_ACTION } from '@constants/ConfigConstants';
import { MuiAutocomplete, MuiDialog, MuiResetButton, MuiSubmitButton, MuiTextField, MuiDateField } from '@controls';
import { Grid } from '@mui/material';
import { stockAdjustmentService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import { useFormik } from 'formik';
import * as yup from 'yup';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import moment from 'moment';

const InventoryAdjustmentgDialog = ({ initModal, isOpen, onClose, setNewData, setUpdateData, mode }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });

  const schema = yup.object().shape({
    AreaId: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' })),
    Requester: yup
      .string()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' })),
    DueDate: yup
      .date()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' })),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: mode == CREATE_ACTION ? defaultValue : initModal,
    enableReinitialize: true,
    onSubmit: async (values) => onSubmit(values),
  });

  const { handleChange, handleSubmit, values, setFieldValue, errors, touched, resetForm } = formik;

  const handleReset = () => {
    resetForm();
  };

  const handleCloseDialog = () => {
    resetForm();
    onClose();
  };

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    if (mode == CREATE_ACTION) {
      const res = await stockAdjustmentService.createSA(data);
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setNewData(res.Data);
        setDialogState({ ...dialogState, isSubmit: false });
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setDialogState({ ...dialogState, isSubmit: false });
      }
    } else {
      const res = await stockAdjustmentService.updateSA(data);
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setUpdateData(res.Data);
        setDialogState({ ...dialogState, isSubmit: false });
        handleCloseDialog();
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setDialogState({ ...dialogState, isSubmit: false });
      }
    }
  };

  return (
    <MuiDialog
      maxWidth="sm"
      title={intl.formatMessage({ id: 'general.create' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit}>
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={12}>
            <MuiAutocomplete
              required
              value={values.AreaId ? { commonDetailId: values.AreaId, commonDetailName: values.AreaName } : null}
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'stockAdjustment.AreaId' })}
              fetchDataFunc={stockAdjustmentService.getArea}
              displayLabel="commonDetailName"
              displayValue="commonDetailId"
              onChange={(e, value) => {
                setFieldValue('AreaName', value?.commonDetailName || '', true);
                setFieldValue('AreaId', value?.commonDetailId || '', true);
              }}
              error={touched.AreaId && Boolean(errors.AreaId)}
              helperText={touched.AreaId && errors.AreaId}
            />
          </Grid>

          <Grid item xs={12}>
            <MuiTextField
              fullWidth
              name="Requester"
              disabled={dialogState.isSubmit}
              value={values.Requester}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'stockAdjustment.Requester' }) + ' *'}
              error={touched.Requester && Boolean(errors.Requester)}
              helperText={touched.Requester && errors.Requester}
            />
          </Grid>
          <Grid item xs={12}>
            <MuiDateField
              required
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'stockAdjustment.DueDate' })}
              value={values.DueDate ?? null}
              onChange={(e) => setFieldValue('DueDate', moment(e).add(7, 'hours'))}
              error={touched.DueDate && Boolean(errors.DueDate)}
              helperText={touched.DueDate && errors.DueDate}
            />
          </Grid>
          <Grid item xs={12}>
            <MuiTextField
              fullWidth
              multiline
              name="Remark"
              disabled={dialogState.isSubmit}
              value={values.Remark}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'stockAdjustment.Remark' })}
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

const defaultValue = {
  Requester: '',
  AreaId: null,
  AreaName: '',
  Requester: '',
};

export default InventoryAdjustmentgDialog;
