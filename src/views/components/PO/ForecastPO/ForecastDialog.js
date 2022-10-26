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
import { forecastService } from "@services";
import { ErrorAlert, SuccessAlert } from "@utils";

const ForecastDialog = (props) => {
  const {
    initModal,
    isOpen,
    onClose,
    setNewData,
    setUpdateData,
    mode,
    valueOption,
  } = props;
 
  const intl = useIntl();
  const defaultValue = {
    MaterialId: null,
    LineId: null,
    Week: undefined,
    Year: undefined,
    Amount: undefined,
  };
  const [dialogState, setDialogState] = useState({
    isSubmit: false,
  });
  useEffect(() => {}, []);
  const schema = yup.object().shape({
    MaterialId: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: "forecast.MaterialId_required" })),
    LineId: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: "forecast.LineId_required" })),
    Week: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: "forecast.Week_required" }))
      .integer(intl.formatMessage({ id: "forecast.Required_Int" }))
      .min(1, intl.formatMessage({ id: "forecast.Week_required_bigger" }))
      .max(52, intl.formatMessage({ id: "forecast.Week_required_less" })),
    Year: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: "forecast.Year_required" }))
      .integer(intl.formatMessage({ id: "forecast.Required_Int" }))
      .min(
        new Date().getFullYear(),
        intl.formatMessage({ id: "forecast.Year_required_bigger" })
      ).max(2050,intl.formatMessage({ id: "forecast.Max_2050" })),
    Amount: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: "forecast.Amount_required" }))
      .min(1, intl.formatMessage({ id: "forecast.Amount_required_bigger" })),
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
    setDialogState({ ...dialogState, isSubmit: true });
    if (mode == CREATE_ACTION) {
      const res = await forecastService.createForecast(data);
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
      const res = await forecastService.modifyForecast({
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
            <MuiSelectField
              value={
                values.MaterialId
                  ? {
                      MaterialId: values.MaterialId,
                      MaterialCode: values.MaterialCode,
                    }
                  : null
              }
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: "forecast.MaterialId" }) + " *"}
              options={valueOption.MaterialList}
              displayLabel="MaterialCode"
              displayValue="MaterialId"
              onChange={(e, value) => {
                setFieldValue("MaterialCode", value?.MaterialCode || "");
                setFieldValue("MaterialId", value?.MaterialId || "");
              }}
              defaultValue={
                mode == CREATE_ACTION
                  ? null
                  : {
                      MaterialId: initModal.MaterialId,
                      MaterialCode: initModal.MaterialCode,
                    }
              }
              error={touched.MaterialId && Boolean(errors.MaterialId)}
              helperText={touched.MaterialId && errors.MaterialId}
            />
          </Grid>
          <Grid item xs={12}>
            <MuiSelectField
              value={
                values.LineId
                  ? { LineId: values.LineId, LineName: values.LineName }
                  : null
              }
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: "forecast.LineId" }) + " *"}
              options={valueOption.LineList}
              displayLabel="LineName"
              displayValue="LineId"
              onChange={(e, value) => {
                setFieldValue("LineName", value?.LineName || "");
                setFieldValue("LineId", value?.LineId || "");
              }}
              defaultValue={
                mode == CREATE_ACTION
                  ? null
                  : { LineId: initModal.LineId, LineName: initModal.LineName }
              }
              error={touched.LineId && Boolean(errors.LineId)}
              helperText={touched.LineId && errors.LineId}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              size="small"
              name="Week"
              disabled={dialogState.isSubmit}
              value={values.Week}
              onChange={handleChange}
              label={intl.formatMessage({ id: "forecast.Week" }) + " *"}
              error={touched.Week && Boolean(errors.Week)}
              helperText={touched.Week && errors.Week}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              size="small"
              name="Year"
              disabled={dialogState.isSubmit}
              value={values.Year}
              onChange={handleChange}
              label={intl.formatMessage({ id: "forecast.Year" }) + " *"}
              error={touched.Year && Boolean(errors.Year)}
              helperText={touched.Year && errors.Year}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              size="small"
              name="Amount"
              disabled={dialogState.isSubmit}
              value={values.Amount}
              onChange={handleChange}
              label={intl.formatMessage({ id: "forecast.Amount" }) + " *"}
              error={touched.Amount && Boolean(errors.Amount)}
              helperText={touched.Amount && errors.Amount}
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
export default ForecastDialog;
