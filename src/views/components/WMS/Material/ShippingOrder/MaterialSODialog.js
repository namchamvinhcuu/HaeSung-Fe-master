import Grid from '@mui/material/Grid'
import { ErrorAlert, SuccessAlert } from '@utils'
import { useFormik } from 'formik'
import React, { useEffect, useState, useRef } from 'react'
import { useIntl } from 'react-intl'
import * as yup from 'yup'

import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";

import { MuiDialog, MuiSubmitButton, MuiResetButton, MuiTextField, MuiDateField } from '@controls'

const MaterialSODialog = (props) => {
    const intl = useIntl();
    let isRendered = useRef(true);

    const {
        initModal,
        isOpen,
        onClose,
        setNewData,
        setUpdateData,
        mode,
        valueOption,
    } = props;

    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    });

    const schema = yup.object().shape({
        // MsoCode: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
        Requester: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
        DueDate: yup
            .date()
            .typeError(intl.formatMessage({ id: "general.field_invalid" }))
            .nullable()
            .required(intl.formatMessage({ id: "general.field_required" })),
    });

    const formik = useFormik({
        validationSchema: schema,
        initialValues:
            mode === UPDATE_ACTION
                ? {
                    ...initModal,
                    StartDate: moment(initModal.StartDate).add(7, "hours"),
                }
                : { ...initModal },
        enableReinitialize: true,
        onSubmit: async (values, actions) => {
            await onSubmit(values);
            // actions.setSubmitting(false);
        },
    });

    const onSubmit = async (data) => {
        setDialogState({ ...dialogState, isSubmit: true });

        if (mode == CREATE_ACTION) {
            console.log(data);

            // const res = await workOrderService.create(data);
            // if (res && isRendered) {
            //     if (res.HttpResponseCode === 200 && res.Data) {
            //         SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
            //         setNewData({ ...res.Data });

            //         // handleReset();
            //     } else {
            //         ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
            //     }
            // }
            // else {
            //     ErrorAlert(intl.formatMessage({ id: "general.system_error" }));
            // }
            // setDialogState({ ...dialogState, isSubmit: false });
        } else {
            // const res = await workOrderService.modify(data);
            // if (res && isRendered) {
            //     if (res.HttpResponseCode === 200 && res.Data) {
            //         SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
            //         setUpdateData({ ...res.Data });
            //         setDialogState({ ...dialogState, isSubmit: false });
            //         handleReset();
            //         handleCloseDialog();
            //     } else {
            //         ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
            //     }
            // } else {
            //     ErrorAlert(intl.formatMessage({ id: "general.system_error" }));
            // }
        }
        setDialogState({ ...dialogState, isSubmit: false });
    };

    const {
        handleChange
        , handleBlur
        , handleSubmit
        , values
        , setFieldValue
        , errors
        , touched
        , isValid
        , resetForm
    } = formik;

    const handleCloseDialog = () => {
        setDialogState({
            ...dialogState
        });
        resetForm();
        onClose();
    }

    useEffect(() => {
        return () => {
            isRendered = false;
        }
    })

    return (
        <MuiDialog
            maxWidth='sm'
            title={intl.formatMessage({ id: 'general.create' })}
            isOpen={isOpen}
            disabledCloseBtn={dialogState.isSubmit}
            disable_animate={300}
            onClose={handleCloseDialog}
        >

            <form onSubmit={handleSubmit}>
                <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    {/* <Grid item xs={12}>
                        <MuiTextField
                            required
                            disabled={dialogState.isSubmit}
                            label={intl.formatMessage({
                                id: "material-so-master.MsoCode",
                            })}
                            name="MsoCode"
                            value={values.MsoCode ?? ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.MsoCode && Boolean(errors.MsoCode)}
                            helperText={touched.MsoCode && errors.MsoCode}
                        />
                    </Grid> */}

                    <Grid item xs={12}>
                        <MuiTextField
                            required
                            disabled={dialogState.isSubmit}
                            label={intl.formatMessage({
                                id: "material-so-master.Requester",
                            })}
                            name="Requester"
                            value={values.Requester ?? ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.Requester && Boolean(errors.Requester)}
                            helperText={touched.Requester && errors.Requester}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <MuiDateField
                            required
                            disabled={dialogState.isSubmit}
                            label={intl.formatMessage({
                                id: "material-so-master.DueDate",
                            })}
                            value={values.DueDate ?? null}
                            onChange={(e) => setFieldValue("DueDate", e)}
                            onBlur={handleBlur}
                            error={touched.DueDate && Boolean(errors.DueDate)}
                            helperText={touched.DueDate && errors.DueDate}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <MuiTextField
                            disabled={dialogState.isSubmit}
                            label={intl.formatMessage({
                                id: "material-so-master.Remark",
                            })}
                            name="DueDate"
                            value={values.Remark ?? ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        // error={touched.DueDate && Boolean(errors.DueDate)}
                        // helperText={touched.DueDate && errors.DueDate}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Grid
                            container
                            direction="row-reverse"
                        >
                            <MuiSubmitButton
                                text="save"
                                loading={dialogState.isSubmit}
                            />
                            <MuiResetButton
                                onClick={resetForm}
                                disabled={dialogState.isSubmit}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </MuiDialog>
    )
}

export default MaterialSODialog