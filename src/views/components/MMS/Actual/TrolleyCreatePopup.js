import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiTextField } from '@controls';
import { Box, Grid } from '@mui/material';
import { actualService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import React, { memo, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormik } from 'formik';
import * as yup from 'yup';

const TrolleyCreatePopup = memo(({ woId, materialId, materialCode, isShowing, onClose, refreshLotDataGrid }) => {
  const intl = useIntl();

  const trolleyQtyRef = useRef();

  const handleTrolleyQtyChange = (e) => {
    trolleyQtyRef.current.value = e.target.value;
    setDialogState((prev) => {
      return { ...prev, woId, materialId, materialCode, trolleyQty: e.target.value };
    });
  };

  let timer;

  const [inputRef, setInputRef] = useState(null);
  const [dialogState, setDialogState] = useState({
    woId: woId,
    materialId: materialId,
    materialCode: materialCode,
    trolleyQty: null,
    isSubmit: false,
  });

  const schemaTrolleyQty = yup.object().shape({
    trolleyQty: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: 'general.field_required' }))
      .positive()
      .min(1),
  });

  const formik = useFormik({
    validationSchema: schemaTrolleyQty,
    initialValues: dialogState,
    enableReinitialize: true,
    onSubmit: async (values) => onSubmit(values),
  });
  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  const onSubmit = async (data) => {
    const { HttpResponseCode, ResponseMessage } = await actualService.createTrolleyStamp({
      LotNumber: 1,
      WoId: data.woId,
      Qty: data.trolleyQty,
    });

    if (HttpResponseCode === 200) {
      await refreshLotDataGrid(woId);
      await getWoInfo(woId, true);
      SuccessAlert(intl.formatMessage({ id: ResponseMessage }));
    } else {
      ErrorAlert(intl.formatMessage({ id: ResponseMessage }));
    }
  };

  useEffect(() => {
    trolleyQtyRef.current = inputRef;

    if (inputRef) {
      timer = setTimeout(() => trolleyQtyRef.current.focus(), 500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [inputRef]);

  useEffect(() => {
    setDialogState((prev) => {
      return { ...prev, woId, materialId, materialCode };
    });
  }, [woId, materialId, materialCode]);

  return (
    <MuiDialog
      maxWidth="md"
      title={`WO: ${woId} / Item: ${materialCode}`}
      isOpen={isShowing}
      disable_animate={300}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MuiTextField
              type="number"
              ref={(ele) => {
                setInputRef(ele);
              }}
              label="Input trolley quantity"
              value={values.trolleyQty}
              onChange={handleTrolleyQtyChange}
              error={touched.trolleyQty && Boolean(errors.trolleyQty)}
              helperText={touched.trolleyQty && errors.trolleyQty}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
              <MuiResetButton onClick={resetForm} disabled={dialogState.isSubmit} />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MuiDialog>
  );
});
export default TrolleyCreatePopup;
