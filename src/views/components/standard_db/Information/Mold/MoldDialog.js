import React, { useEffect, useRef, useState } from "react";
import {
  MuiDialog,
  MuiResetButton,
  MuiSubmitButton,
  MuiDateField,
  MuiSelectField,
} from "@controls";
import { Grid, TextField } from "@mui/material";
import { useIntl } from "react-intl";
import * as yup from "yup";
import { moldService } from "@services";
import { ErrorAlert, SuccessAlert } from "@utils";
import { CREATE_ACTION } from "@constants/ConfigConstants";
import { useFormik } from "formik";

const MoldDialog = ({
  initModal,
  isOpen,
  onClose,
  setNewData,
  setUpdateData,
  mode,
  valueOption,
}) => {
  const intl = useIntl();
  const ETAStatus = [
    { ETAStatus: "True", ETAStatusName: "YES" },
    { ETAStatus: "False", ETAStatusName: "NO" },
  ];
  const [dialogState, setDialogState] = useState({ isSubmit: false });

  const schema = yup.object().shape({
    MoldSerial: yup
      .string()
      .required(intl.formatMessage({ id: "mold.MoldSerial_required" })),
    MoldCode: yup
      .string()
      .required(intl.formatMessage({ id: "mold.MoldCode_required" })),
    Inch: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: "mold.Inch_required" }))
      .moreThan(0, intl.formatMessage({ id: "bom.min_value" })),
    MachineTon: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: "mold.MachineTon_required" }))
      .moreThan(0, intl.formatMessage({ id: "bom.min_value" })),
    Cabity: yup
      .string()
      .nullable()
      .required(intl.formatMessage({ id: "mold.Cabity_required" })),
    Model: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: "mold.Model_required" })),
    MoldType: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: "mold.MoldType_required" })),
    MachineType: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: "mold.MachineType_required" })),
    ETAStatus1: yup
      .string()
      .nullable()
      .required(intl.formatMessage({ id: "mold.ETAStatus_required" })),
    ETADate: yup
      .date()
      .nullable()
      .required(intl.formatMessage({ id: "mold.ETADate_required" })),
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
      const res = await moldService.createMold(data);
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
      const res = await moldService.modifyMold({
        ...data,
        MoldId: initModal.MoldId,
        row_version: initModal.row_version,
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
      maxWidth="md"
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
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <TextField
                autoFocus
                fullWidth
                size="small"
                name="MoldSerial"
                disabled={dialogState.isSubmit}
                value={values.MoldSerial}
                onChange={handleChange}
                label={intl.formatMessage({ id: "mold.MoldSerial" }) + " *"}
                error={touched.MoldSerial && Boolean(errors.MoldSerial)}
                helperText={touched.MoldSerial && errors.MoldSerial}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                name="MoldCode"
                disabled={dialogState.isSubmit}
                value={values.MoldCode}
                onChange={handleChange}
                label={intl.formatMessage({ id: "mold.MoldCode" }) + " *"}
                error={touched.MoldCode && Boolean(errors.MoldCode)}
                helperText={touched.MoldCode && errors.MoldCode}
              />
            </Grid>
          </Grid>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <MuiSelectField
                required
                value={
                  values.Model
                    ? {
                        commonDetailId: values.Model,
                        commonDetailName: values.ModelName,
                      }
                    : null
                }
                disabled={dialogState.isSubmit}
                label={intl.formatMessage({ id: "mold.Model" })}
                options={valueOption.PMList}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, value) => {
                  setFieldValue("ModelName", value?.commonDetailName || "");
                  setFieldValue("Model", value?.commonDetailId || "");
                }}
                error={touched.Model && Boolean(errors.Model)}
                helperText={touched.Model && errors.Model}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                size="small"
                name="Inch"
                disabled={dialogState.isSubmit}
                value={values.Inch}
                onChange={handleChange}
                label={intl.formatMessage({ id: "mold.Inch" }) + " *"}
                error={touched.Inch && Boolean(errors.Inch)}
                helperText={touched.Inch && errors.Inch}
              />
            </Grid>
          </Grid>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <MuiSelectField
                required
                value={
                  values.MoldType
                    ? {
                        commonDetailId: values.MoldType,
                        commonDetailName: values.MoldTypeName,
                      }
                    : null
                }
                disabled={dialogState.isSubmit}
                label={intl.formatMessage({ id: "mold.MoldType" })}
                options={valueOption.PTList}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, value) => {
                  setFieldValue("MoldTypeName", value?.commonDetailName || "");
                  setFieldValue("MoldType", value?.commonDetailId || "");
                }}
                error={touched.MoldType && Boolean(errors.MoldType)}
                helperText={touched.MoldType && errors.MoldType}
              />
            </Grid>
            <Grid item xs={6}>
              <MuiSelectField
                required
                value={
                  values.MachineType
                    ? {
                        commonDetailId: values.MachineType,
                        commonDetailName: values.MachineTypeName,
                      }
                    : null
                }
                disabled={dialogState.isSubmit}
                label={intl.formatMessage({ id: "mold.MachineType" })}
                options={valueOption.MTList}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, value) => {
                  setFieldValue(
                    "MachineTypeName",
                    value?.commonDetailName || ""
                  );
                  setFieldValue("MachineType", value?.commonDetailId || "");
                }}
                error={touched.MachineType && Boolean(errors.MachineType)}
                helperText={touched.MachineType && errors.MachineType}
              />
            </Grid>
          </Grid>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <MuiDateField
                required
                disabled={dialogState.isSubmit}
                label={intl.formatMessage({ id: "mold.ETADate" })}
                value={values.ETADate ?? null}
                onChange={(e) => setFieldValue("ETADate", e)}
                error={touched.ETADate && Boolean(errors.ETADate)}
                helperText={touched.ETADate && errors.ETADate}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                size="small"
                name="MachineTon"
                disabled={dialogState.isSubmit}
                value={values.MachineTon}
                onChange={handleChange}
                label={intl.formatMessage({ id: "mold.MachineTon" }) + " *"}
                error={touched.MachineTon && Boolean(errors.MachineTon)}
                helperText={touched.MachineTon && errors.MachineTon}
              />
            </Grid>
          </Grid>
          <Grid item container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                size="small"
                name="Cabity"
                inputProps={{ min: 0 }}
                disabled={dialogState.isSubmit}
                value={values.Cabity}
                onChange={handleChange}
                label={intl.formatMessage({ id: "mold.Cabity" }) + " *"}
                error={touched.Cabity && Boolean(errors.Cabity)}
                helperText={touched.Cabity && errors.Cabity}
              />
            </Grid>
            <Grid item xs={6}>
              <MuiSelectField
                required
                value={
                  values.ETAStatus1 != ""
                    ? {
                        ETAStatus: values.ETAStatus1,
                        ETAStatusName: values.ETAStatusName,
                      }
                    : null
                }
                disabled={dialogState.isSubmit}
                label={intl.formatMessage({ id: "mold.ETAStatus" })}
                options={ETAStatus}
                displayLabel="ETAStatusName"
                displayValue="ETAStatus"
                onChange={(e, value) => {
                  setFieldValue("ETAStatusName", value?.ETAStatusName || "");
                  setFieldValue("ETAStatus1", value?.ETAStatus || null);
                }}
                error={touched.ETAStatus1 && Boolean(errors.ETAStatus1)}
                helperText={touched.ETAStatus1 && errors.ETAStatus1}
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              name="Remark"
              disabled={dialogState.isSubmit}
              value={values.Remark}
              onChange={handleChange}
              label={intl.formatMessage({ id: "mold.Remark" })}
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

const defaultValue = {
  MoldSerial: "",
  MoldCode: "",
  Model: null,
  ModelName: "",
  MoldType: null,
  MoldTypeName: "",
  Inch: "",
  MachineType: null,
  MachineTypeName: "",
  MachineTon: "",
  ETADate: "",
  Cabity: "",
  ETAStatus: null,
  ETAStatus1: "",
  ETAStatusName: "",
  Remark: "",
};

export default MoldDialog;
