import React, { useEffect, useState, useRef } from "react";
import {
  MuiDialog,
  MuiResetButton,
  MuiSubmitButton,
  MuiDateField,
  MuiSelectField,
} from "@controls";
import { useIntl } from "react-intl";
import { useFormik } from "formik";
import * as yup from "yup";
import { Grid, TextField } from "@mui/material";
import { CREATE_ACTION } from "@constants/ConfigConstants";
import { forecastMasterService } from "@services";
import { ErrorAlert, SuccessAlert } from "@utils";

const ForecastMasterDialog = (props) => {
  const {
    initModal,
    isOpen,
    onClose,
    setNewData,
    setUpdateData,
    mode,
 
  } = props;
 
  const intl = useIntl();
  const defaultValue = {
    FPoMasterCode: null,
  };
  const [dialogState, setDialogState] = useState({
    isSubmit: false,
  });
  useEffect(() => {}, []);
  const schema = yup.object().shape({
    FPoMasterCode: yup
      .string()
      .nullable()
      .required("Code required"),
  });
  const handleReset = () => {
    resetForm();
  };
  const handleCloseDialog = () => {
    setDialogState({
      ...dialogState,
    });
    resetForm();
    onClose();
  };
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
  } = formik;
  const onSubmit = async (data) => {
    console.log(data)
    setDialogState({ ...dialogState, isSubmit: true });
    if (mode == CREATE_ACTION) {
      const res = await forecastMasterService.createForecastMaster(data);
      console.log("RESS", res)
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setNewData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setDialogState({ ...dialogState, isSubmit: false });
      }
    } else {
      const res = await forecastMasterService.modifyForecastMaster({
         ...data,
        // FPOId: initModal.FPOId,
        // row_version: initModal.row_version,
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
            <TextField
              autoFocus
              fullWidth
              size='small'
              name='FPoMasterCode'
              inputProps={{ maxLength: 10 }}
              disabled={dialogState.isSubmit}
              value={values.FPoMasterCode || ""}
              onChange={handleChange}
              label={"FPO Master Code *"}
              error={touched.FPoMasterCode && Boolean(errors.FPoMasterCode)}
              helperText={touched.FPoMasterCode && errors.FPoMasterCode}
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
export default ForecastMasterDialog;
