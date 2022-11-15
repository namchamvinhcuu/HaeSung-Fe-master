import React, { useEffect, useState, useRef } from "react";
import {
  MuiDialog,
  MuiSubmitButton,
  MuiResetButton,
  MuiTextField,
  MuiDateField,
  MuiAutocomplete
} from "@controls";
import { useIntl } from "react-intl";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import { useFormik } from "formik";
import * as yup from "yup";
import { Grid, TextField } from "@mui/material";
import { iqcService } from "@services";
import { materialSOService } from "@services";
import { ErrorAlert, SuccessAlert } from '@utils';

const MaterialSODetailDialog = (props) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({
    isSubmit: false,
  });
  const { initModal, isOpen, onClose, setNewData, setUpdateData, mode, MsoId } = props;
  const schema = yup.object().shape({
    MaterialId: yup
    .number()
    .required(intl.formatMessage({ id: "forecast.MaterialId_required" }))
    .min(1, intl.formatMessage({ id: "forecast.MaterialId_required" })),
    SOrderQty: yup.number().nullable().required(intl.formatMessage({ id: "lot.Qty_required" })).min(1, intl.formatMessage({ id: "lot.Qty_bigger_1" })),
    
  });
  const handleReset = () => {
    resetForm();
  };
  const formik = useFormik({
    validationSchema: schema,
    initialValues: initModal,
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
      } = formik;
  const handleCloseDialog = () => {
    setDialogState({
      ...dialogState,
    });
    resetForm();
    onClose();
  };
  const getMaterialTypeRawAndSub = async () => {
    const res = await iqcService.getMaterialModelTypeRaw();
    return res;
  };
  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });
    if (mode == CREATE_ACTION) {
        const dataPush ={...data, MsoId:MsoId}

      const res = await materialSOService.createMsoDetail(dataPush);
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        console.log(res.Data,"SSWWW")
        setNewData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setDialogState({ ...dialogState, isSubmit: false });
      }
    } else {
      const res = await materialSOService.modifyMsoDetail({
        ...data,
      });
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setUpdateData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
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
      title={intl.formatMessage({
        id: mode == CREATE_ACTION ? "general.create" : "general.modify",
      })}
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
                <MuiAutocomplete
                label={intl.formatMessage({ id: "forecast.MaterialId" }) + " *"}
                fetchDataFunc={getMaterialTypeRawAndSub}
                displayLabel="MaterialCode"
                displayValue="MaterialId"
                displayGroup="GroupMaterial"
                defaultValue={
                    mode == CREATE_ACTION
                    ? null
                    : {
                        MaterialId: initModal.MaterialId,
                        MaterialCode: initModal.MaterialCode,
                        }
                }
                value={
                    values.MaterialId
                    ? {
                        MaterialId: values.MaterialId,
                        MaterialCode: values.MaterialCode,
                        }
                    : null
                }
                onChange={(e, value) => {
                    setFieldValue("MaterialCode", value?.MaterialCode);
                    setFieldValue("MaterialId", value?.MaterialId);
                    // setMaterialId(value?.MaterialId);
                }}
                error={touched.MaterialId && Boolean(errors.MaterialId)}
                helperText={touched.MaterialId && errors.MaterialId}
                variant="outlined"
                disabled={dialogState.isSubmit}
                />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              size="small"
              name="SOrderQty"
              disabled={dialogState.isSubmit}
              value={values.SOrderQty}
              onChange={handleChange}
              label="Oder Qty"
              error={touched.SOrderQty && Boolean(errors.SOrderQty)}
              helperText={touched.SOrderQty && errors.SOrderQty}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
              <MuiResetButton
                onClick={handleReset}
                disabled={dialogState.isSubmit}
              />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MuiDialog>
  );
};
export default MaterialSODetailDialog;
