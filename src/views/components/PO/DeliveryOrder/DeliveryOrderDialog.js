import React, { useEffect, useRef, useState } from "react";
import {
  MuiDialog,
  MuiResetButton,
  MuiSubmitButton,
  MuiDateTimeField,
  MuiSelectField,
  MuiAutoComplete,
  MuiTextField,
} from "@controls";
import { yupResolver } from "@hookform/resolvers/yup";
import { Checkbox, FormControlLabel, Grid, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import * as yup from "yup";
import { deliveryOrderService } from "@services";
import { ErrorAlert, SuccessAlert } from "@utils";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
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

  let isRendered = useRef(true);
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({
    ...initModal,
    isSubmit: false,
  });

  const schema = yup.object().shape({
    PoId: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: "general.field_required" }))
      .min(1, intl.formatMessage({ id: "general.field_min" }, { min: 1 })),
    MaterialId: yup
      .number()
      .nullable()
      .required(intl.formatMessage({ id: "general.field_required" }))
      .min(1, intl.formatMessage({ id: "general.field_min" }, { min: 1 })),
    DoCode: yup
      .string()
      .required(intl.formatMessage({ id: "general.field_required" }))
      .length(
        12,
        intl.formatMessage({ id: "general.field_length" }, { length: 12 })
      ),
    OrderQty: yup
      .number()
      .required(intl.formatMessage({ id: "general.field_required" }))
      .min(1, intl.formatMessage({ id: "general.field_min" }, { min: 1 })),
    ETDLoad: yup
      .date()
      .typeError(intl.formatMessage({ id: "general.field_invalid" }))
      .nullable()
      .required(intl.formatMessage({ id: "general.field_required" })),
    DeliveryTime: yup
      .date()
      .typeError(intl.formatMessage({ id: "general.field_invalid" }))
      .nullable()
      .required(intl.formatMessage({ id: "general.field_required" }))
      .min(yup.ref("ETDLoad"), "end date can't be before start date"),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues:
      mode === UPDATE_ACTION
        ? {
            ...initModal,
            ETDLoad: moment(initModal.ETDLoad).add(7, "hours"),
            DeliveryTime: moment(initModal.DeliveryTime).add(7, "hours"),
          }
        : { ...initModal },
    enableReinitialize: true,
    onSubmit: async (values, actions) => {
      await onSubmit(values);
      // actions.setFieldValue("PoId", values.PoId);
      // actions.setFieldValue("PoCode", values.PoCode);
      // actions.setFieldValue("MaterialId", values.MaterialId);
      // actions.setFieldValue("MaterialCode", values.MaterialCode);
      actions.setSubmitting(false);
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
      const res = await deliveryOrderService.create(data);
      if (res && isRendered) {
        if (res.HttpResponseCode === 200 && res.Data) {
          SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
          setNewData({ ...res.Data });
          setDialogState({ ...dialogState, isSubmit: false });
          // handleReset();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          setDialogState({ ...dialogState, isSubmit: false });
        }
      }
    } else {
      const res = await deliveryOrderService.modify(data);
      if (res) {
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
      } else {
        ErrorAlert(intl.formatMessage({ id: "general.system_error" }));
        setDialogState({ ...dialogState, isSubmit: false });
      }
    }
  };

  const getPoArr = async () => {
    return await deliveryOrderService.getPoArr();
  };

  const getMaterialArr = async () => {
    return await deliveryOrderService.getMaterialArr(values.PoId);
  };

  useEffect(() => {
    return () => {
      isRendered = false;
    };
  }, []);

  return (
    <React.Fragment>
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
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs>
                  <MuiAutoComplete
                    label={intl.formatMessage({ id: "delivery_order.PoCode" })}
                    fetchDataFunc={getPoArr}
                    displayLabel="PoCode"
                    displayValue="PoId"
                    value={
                      values.PoId !== 0
                        ? {
                            PoId: values.PoId,
                            PoCode: values.PoCode,
                          }
                        : null
                    }
                    onChange={(e, value) => {
                      setFieldValue("PoCode", value?.PoCode || "");
                      setFieldValue("PoId", value?.PoId || 0);

                      setFieldValue("MaterialCode", "");
                      setFieldValue("MaterialId", 0);
                    }}
                    error={touched.PoId && Boolean(errors.PoId)}
                    helperText={touched.PoId && errors.PoId}
                  />
                </Grid>
                <Grid item xs>
                  <MuiAutoComplete
                    label={intl.formatMessage({
                      id: "delivery_order.MaterialCode",
                    })}
                    fetchDataFunc={getMaterialArr}
                    displayLabel="MaterialCode"
                    displayValue="MaterialId"
                    value={
                      values.MaterialId !== 0
                        ? {
                            MaterialId: values.MaterialId,
                            MaterialCode: values.MaterialCode,
                          }
                        : null
                    }
                    onChange={(e, value) => {
                      setFieldValue("MaterialCode", value?.MaterialCode || "");
                      setFieldValue("MaterialId", value?.MaterialId || 0);
                    }}
                    error={touched.MaterialId && Boolean(errors.MaterialId)}
                    helperText={touched.MaterialId && errors.MaterialId}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs>
                  <MuiTextField
                    required
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({
                      id: "delivery_order.DoCode",
                    })}
                    name="DoCode"
                    value={values.DoCode}
                    onChange={handleChange}
                    error={touched.DoCode && Boolean(errors.DoCode)}
                    helperText={touched.DoCode && errors.DoCode}
                  />
                </Grid>
                <Grid item xs>
                  <MuiTextField
                    required
                    type="number"
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({
                      id: "delivery_order.OrderQty",
                    })}
                    name="OrderQty"
                    value={values.OrderQty}
                    onChange={handleChange}
                    error={touched.OrderQty && Boolean(errors.OrderQty)}
                    helperText={touched.OrderQty && errors.OrderQty}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs>
                  <MuiDateTimeField
                    required
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({
                      id: "delivery_order.ETDLoad",
                    })}
                    value={values.ETDLoad ?? null}
                    onChange={(e) => setFieldValue("ETDLoad", e)}
                    error={touched.ETDLoad && Boolean(errors.ETDLoad)}
                    helperText={touched.ETDLoad && errors.ETDLoad}
                  />
                </Grid>
                <Grid item xs>
                  <MuiDateTimeField
                    required
                    disabled={dialogState.isSubmit}
                    label={intl.formatMessage({
                      id: "delivery_order.DeliveryTime",
                    })}
                    value={values.DeliveryTime ?? null}
                    onChange={(e) => setFieldValue("DeliveryTime", e)}
                    error={touched.DeliveryTime && Boolean(errors.DeliveryTime)}
                    helperText={touched.DeliveryTime && errors.DeliveryTime}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs>
                  <MuiTextField
                    name="PackingNote"
                    disabled={dialogState.isSubmit}
                    value={values.PackingNote}
                    onChange={handleChange}
                    label={intl.formatMessage({
                      id: "delivery_order.PackingNote",
                    })}
                  />
                </Grid>
                <Grid item xs>
                  <MuiTextField
                    name="InvoiceNo"
                    disabled={dialogState.isSubmit}
                    value={values.InvoiceNo}
                    onChange={handleChange}
                    label={intl.formatMessage({
                      id: "delivery_order.InvoiceNo",
                    })}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs>
                  <MuiTextField
                    name="Dock"
                    disabled={dialogState.isSubmit}
                    value={values.Dock}
                    onChange={handleChange}
                    label={intl.formatMessage({
                      id: "delivery_order.Dock",
                    })}
                  />
                </Grid>
                <Grid item xs>
                  <MuiTextField
                    name="Truck"
                    disabled={dialogState.isSubmit}
                    value={values.Truck}
                    onChange={handleChange}
                    label={intl.formatMessage({
                      id: "delivery_order.Truck",
                    })}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <MuiTextField
                name="Remark"
                disabled={dialogState.isSubmit}
                value={values.Remark}
                onChange={handleChange}
                label={intl.formatMessage({
                  id: "delivery_order.Remark",
                })}
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
    </React.Fragment>
  );
};

export default DeliveryOrderDialog;
