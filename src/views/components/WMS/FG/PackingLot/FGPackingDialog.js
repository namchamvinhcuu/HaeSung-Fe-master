import React, { useEffect, useRef, useState } from 'react';
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiAutocomplete, MuiTextField } from '@controls';
import { Grid, TextField } from '@mui/material';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { bomService, fgPackingService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik';

const FGPackingDialog = ({ initModal, isOpen, onClose, setNewData, setUpdateData, mode }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });

  const schema = yup.object().shape({
    MaterialId: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' })),
    SamsungLabelCode: yup
      .string()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' })),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: mode == CREATE_ACTION ? defaultValue : initModal,
    enableReinitialize: true,
    onSubmit: async (values) => onSubmit(values),
  });

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    values,
    setFieldValue,
    errors,
    touched,
    isValid,
    resetForm,
    setValues,
  } = formik;

  useEffect(() => {
    if (mode == CREATE_ACTION) {
      formik.initialValues = defaultValue;
    } else {
      formik.initialValues = initModal;
    }
  }, [initModal, mode]);

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
      const res = await fgPackingService.createPA(data);
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setNewData(res.Data);
        setDialogState({ ...dialogState, isSubmit: false });
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setDialogState({ ...dialogState, isSubmit: false });
      }
    } else {
      const res = await fgPackingService.updatePA(data);
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
              value={values.MaterialId ? { MaterialId: values.MaterialId, MaterialCode: values.MaterialCode } : null}
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: 'bom.MaterialId' })}
              fetchDataFunc={fgPackingService.getMaterial}
              displayLabel="MaterialCode"
              displayValue="MaterialId"
              onChange={(e, value) => {
                setFieldValue('MaterialCode', value?.MaterialCode || '', true);
                setFieldValue('MaterialId', value?.MaterialId || '', true);
              }}
              error={touched.MaterialId && Boolean(errors.MaterialId)}
              helperText={touched.MaterialId && errors.MaterialId}
            />
          </Grid>
          <Grid item xs={12}>
            <MuiTextField
              fullWidth
              name="SamsungLabelCode"
              disabled={dialogState.isSubmit}
              value={values.SamsungLabelCode}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'packing.SamsungLabelCode' }) + ' *'}
              error={touched.SamsungLabelCode && Boolean(errors.SamsungLabelCode)}
              helperText={touched.SamsungLabelCode && errors.SamsungLabelCode}
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
  PackingLabelId: 0,
  PackingSerial: '',
  MaterialId: null,
  MaterialCode: '',
  SamsungLabelCode: '',
  Qty: 1,
  Version: '',
};

export default FGPackingDialog;
