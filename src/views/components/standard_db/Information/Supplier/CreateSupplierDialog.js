import { Grid, TextField } from '@mui/material'
import { ErrorAlert, SuccessAlert } from '@utils'
import { useFormik } from 'formik'
import React, { useEffect, useState, useRef } from 'react'
import { useIntl } from 'react-intl'
import * as yup from 'yup'

import { MuiDialog, MuiSubmitButton, MuiResetButton } from '@controls'

import { supplierService } from '@services'

const CreateSupplierDialog = (props) => {
    const intl = useIntl();
    let isRendered = useRef(true);

    const { initModal, isOpen, onClose, setNewData } = props;

    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    });

    const schema = yup.object().shape({
        SupplierCode: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
        SupplierName: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
    });

    const formik = useFormik({
        validationSchema: schema,
        initialValues: { ...initModal },
        onSubmit: async values => {
            const res = await supplierService.create(values);

            if (res && isRendered)
                if (res.HttpResponseCode === 200 && res.Data) {
                    SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
                    setNewData({ ...res.Data });
                    setDialogState({ ...dialogState, isSubmit: false });
                    // handleCloseDialog();
                }
                else {
                    ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
                }
        }
    });



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
            maxWidth='md'
            title={intl.formatMessage({ id: 'general.create' })}
            isOpen={isOpen}
            disabledCloseBtn={dialogState.isSubmit}
            disable_animate={300}
            onClose={handleCloseDialog}
        >

            <form onSubmit={handleSubmit}>
                <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            fullWidth
                            size='small'
                            disabled={dialogState.isSubmit}
                            label={intl.formatMessage({ id: 'supplier.SupplierCode' }) + ' *'}
                            name='SupplierCode'
                            value={values.SupplierCode}
                            onChange={handleChange}
                            error={touched.SupplierCode && Boolean(errors.SupplierCode)}
                            helperText={touched.SupplierName && errors.SupplierCode}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            size='small'
                            disabled={dialogState.isSubmit}
                            label={intl.formatMessage({ id: 'supplier.SupplierName' }) + ' *'}
                            name='SupplierName'
                            value={values.SupplierName}
                            onChange={handleChange}
                            error={touched.SupplierName && Boolean(errors.SupplierName)}
                            helperText={touched.SupplierName && errors.SupplierName}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            size='small'
                            multiline={true}
                            rows={3}
                            disabled={dialogState.isSubmit}
                            label={intl.formatMessage({ id: 'supplier.SupplierContact' })}
                            name='SupplierContact'
                            value={values.SupplierContact}
                            onChange={handleChange}
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
                                disabled={!isValid}
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

export default CreateSupplierDialog