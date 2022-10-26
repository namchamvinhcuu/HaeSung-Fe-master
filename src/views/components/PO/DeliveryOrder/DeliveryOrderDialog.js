import React, { useEffect, useRef, useState } from "react";
import {
  MuiDialog,
  MuiResetButton,
  MuiSubmitButton,
  MuiDateTimeField,
  MuiSelectField,
} from "@controls";
import { yupResolver } from "@hookform/resolvers/yup";
import { Checkbox, FormControlLabel, Grid, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import * as yup from "yup";
import { deliveryOrderService } from "@services";
import { ErrorAlert, SuccessAlert } from "@utils";
import { CREATE_ACTION } from "@constants/ConfigConstants";
import { useFormik } from "formik";
import moment from "moment";

const DeliveryOrderDialog = (props) => {
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
  const [dialogState, setDialogState] = useState({ isSubmit: false });

  const schema = yup.object().shape({
    PoCode: yup
      .string()
      .nullable()
      .required(intl.formatMessage({ id: "general.field_required" })),
    DeliveryDate: yup
      .date()
      .nullable()
      .required(intl.formatMessage({ id: "general.field_required" })),
    DueDate: yup
      .date()
      .nullable()
      .required(intl.formatMessage({ id: "general.field_required" })),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: { ...initModal },
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
      const res = await purchaseOrderService.createPO(data);
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
      const res = await purchaseOrderService.modifyPO(data);
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

  useEffect(() => {}, []);

  return (
    <React.Fragment>
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
              {/* <MuiSelectField
                fullWidth
                size="small"
                name="PoCode"
                disabled={dialogState.isSubmit}
                value={values.PoCode}
                onChange={handleChange}
                label={
                  intl.formatMessage({ id: "purchase_order.PoCode" }) + " *"
                }
                error={touched.PoCode && Boolean(errors.PoCode)}
                helperText={touched.PoCode && errors.PoCode}
              /> */}
              <MuiSelectField
                label={intl.formatMessage({ id: "delivery_order.PoCode" })}
                options={poArr}
                displayLabel="PoCode"
                displayValue="PoId"
                onChange={(e, item) => {
                  getMaterialArr(item.PoId);
                  // changeSearchData(item ? item.PoId ?? null : null, "PoId");
                }}
                variant="standard"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                name="Description"
                disabled={dialogState.isSubmit}
                value={values.Description}
                onChange={handleChange}
                label={intl.formatMessage({ id: "purchase_order.Description" })}
              />
            </Grid>
            <Grid item xs={12}>
              {/* <MuiDateTimeField
                required
                disabled={dialogState.isSubmit}
                label={intl.formatMessage({
                  id: "purchase_order.DeliveryDate",
                })}
                value={values.DeliveryDate ?? null}
                onChange={(e) => setFieldValue("DeliveryDate", e)}
                error={touched.DeliveryDate && Boolean(errors.DeliveryDate)}
                helperText={touched.DeliveryDate && errors.DeliveryDate}
              /> */}
            </Grid>
            <Grid item xs={12}>
              {/* <MuiDateTimeField
                required
                disabled={dialogState.isSubmit}
                label={intl.formatMessage({ id: "purchase_order.DueDate" })}
                value={values.DueDate ?? null}
                onChange={(e) => setFieldValue("DueDate", e)}
                error={touched.DueDate && Boolean(errors.DueDate)}
                helperText={touched.DueDate && errors.DueDate}
              /> */}
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
    </React.Fragment>
  );
};

export default DeliveryOrderDialog;
