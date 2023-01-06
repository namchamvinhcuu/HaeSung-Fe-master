import React, { useEffect, useState } from 'react';
import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiSelectField, MuiTextField } from '@controls';
import { Grid, TextField } from '@mui/material';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { bomService, fgPackingService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import { CREATE_ACTION } from '@constants/ConfigConstants';
import { useFormik } from 'formik';

const FGPackingLotDetailDialog = ({
  initModal,
  isOpen,
  onClose,
  setNewData,
  setUpdateData,
  mode,
  PackingLabelId,
  handleUpdateQty,
}) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });

  const schema = yup.object().shape({
    LotId: yup
      .string()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' })),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: { LotId: '' },
    enableReinitialize: true,
    onSubmit: async (values) => onSubmit(values),
  });

  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  //handle
  const handleReset = () => {
    resetForm();
  };

  const handleCloseDialog = () => {
    resetForm();
    onClose();
  };

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    const res = await fgPackingService.createPADetail({ ...data, PackingLabelId: PackingLabelId });
    if (res.HttpResponseCode === 200 && res.Data) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setNewData(res.Data);
      handleUpdateQty(res.Data.Qty);
      setDialogState({ ...dialogState, isSubmit: false });
    } else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setDialogState({ ...dialogState, isSubmit: false });
    }
  };

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
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={12}>
            <MuiTextField
              fullWidth
              name="LotId"
              disabled={dialogState.isSubmit}
              value={values.Remark}
              onChange={handleChange}
              label="Lot"
              error={touched.LotId && Boolean(errors.LotId)}
              helperText={touched.LotId && errors.LotId}
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

export default FGPackingLotDetailDialog;
