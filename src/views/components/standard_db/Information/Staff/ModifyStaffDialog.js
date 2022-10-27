import { Grid, TextField } from "@mui/material";
import { ErrorAlert, SuccessAlert } from "@utils";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import * as yup from "yup";

import { MuiDialog, MuiSubmitButton, MuiResetButton } from "@controls";

import { staffService } from "@services";

const ModifyStaffDialog = (props) => {
  const intl = useIntl();

  const { initModal, isOpen, onClose, setModifyData } = props;

  const [dialogState, setDialogState] = useState({
    ...initModal,
    isSubmit: false,
  });

  const schema = yup.object().shape({
    StaffCode: yup
      .string()
      .required(intl.formatMessage({ id: "general.field_required" })),
    StaffName: yup
      .string()
      .required(intl.formatMessage({ id: "general.field_required" })),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: { ...initModal },
    enableReinitialize: true,
    onSubmit: async (values) => {
      // console.log(values)
      const res = await staffService.modifyStaff(values);
      if (res.HttpResponseCode === 200 && res.Data) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        setModifyData({ ...res.Data });
        setDialogState({ ...dialogState, isSubmit: false });
        handleCloseDialog();
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      }
    },
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

  useEffect(() => {
    formik.initialValues = { ...initModal };
  }, [initModal]);

  return (
    <MuiDialog
      maxWidth="sm"
      title={intl.formatMessage({ id: "general.modify" })}
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
              size="small"
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: "staff.StaffCode" }) + " *"}
              name="StaffCode"
              value={values.StaffCode}
              onChange={handleChange}
              error={touched.StaffCode && Boolean(errors.StaffCode)}
              helperText={touched.StaffCode && errors.StaffCode}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              disabled={dialogState.isSubmit}
              label={intl.formatMessage({ id: "staff.StaffName" }) + " *"}
              name="StaffName"
              value={values.StaffName}
              onChange={handleChange}
              error={touched.StaffName && Boolean(errors.StaffName)}
              helperText={touched.StaffName && errors.StaffName}
            />
          </Grid>

          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
              <MuiResetButton
                onClick={resetForm}
                disabled={dialogState.isSubmit}
              />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MuiDialog>
  );
};

export default ModifyStaffDialog;
