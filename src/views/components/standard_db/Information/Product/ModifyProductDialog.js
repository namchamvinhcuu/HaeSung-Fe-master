import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiSelectField, MuiAutocomplete } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import {
    Autocomplete,
    Checkbox, FormControlLabel, Grid, Radio, RadioGroup, TextField
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { productService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'

const ModifyProductDialog = (props) => {

    const intl = useIntl();

    const { initModal, isOpen, onClose, setModifyData } = props;
    const clearParent = useRef(null);

    const dataModalRef = useRef({ ...initModal });
    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    })

    const schema = yup.object().shape({

        MaterialCode: yup.string().trim().required(intl.formatMessage({ id: 'general.field_required' })),
        ProductType: yup.number().min(1, intl.formatMessage({ id: 'general.field_required' })).required(intl.formatMessage({ id: 'general.field_required' })),
        Model: yup.number().min(1, intl.formatMessage({ id: 'general.field_required' })).required(intl.formatMessage({ id: 'general.field_required' })),
        Description: yup.string().trim(),
        Inch: yup.number().test(
            'is-decimal',
            'Invalid decimal',
            value => (value + "").match(/^\d*\.{1}\d*$/),
        ),

    });
    const formik = useFormik({
        validationSchema: schema,
        initialValues: { ...initModal },
        enableReinitialize: true,
        onSubmit: async values => {

            const res = await productService.modifyProduct(values);
            if (res.HttpResponseCode === 200) {
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
                handleCloseDialog();
                setModifyData({ ...res.Data });
                setDialogState({ ...dialogState, isSubmit: false });
                handleReset();
            }
            else {
                ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
                handleCloseDialog();
                setDialogState({ ...dialogState, isSubmit: false });
                handleReset();
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

    useEffect(() => {
        resetForm({ ...initModal });
    }, [initModal]);

    const handleCloseDialog = () => {
        resetForm();
        setDialogState({
            ...dialogState,
        })
        onClose();
    }

    const getModel = async () => {
        const res = await productService.getProductModel();
        return res;
    }
    const getproductType = async () => {
        const res = await productService.getProductType();
        return res;
    }
    const handleReset = () => {
        resetForm();
        setDialogState({
            ...dialogState
        })
    }




    return (
        <MuiDialog
            maxWidth='sm'
            title={intl.formatMessage({ id: 'general.modify' })}
            isOpen={isOpen}
            disabledCloseBtn={dialogState.isSubmit}
            disable_animate={300}
            onClose={handleCloseDialog}
        >
            <form onSubmit={handleSubmit} >
                <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

                    <Grid item xs={12}>
                        <Grid container spacing={2} marginBottom={3}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="text"
                                    size='small'
                                    name='MaterialCode'
                                    disabled={dialogState.isSubmit}
                                    value={values.MaterialCode}
                                    onChange={handleChange}
                                    label={intl.formatMessage({ id: 'general.code' }) + ' *'}
                                    error={touched.MaterialCode && Boolean(errors.MaterialCode)}
                                    helperText={touched.MaterialCode && errors.MaterialCode}
                                />

                            </Grid>
                            <Grid item xs={6} >
                                <TextField
                                    fullWidth
                                    type="text"
                                    size='small'
                                    name='Inch'
                                    label={intl.formatMessage({ id: 'product.Inch' }) + ' *'}
                                    disabled={dialogState.isSubmit}
                                    value={values.Inch}
                                    onChange={handleChange}
                                    error={touched.Inch && Boolean(errors.Inch)}
                                    helperText={touched.Inch && errors.Inch}
                                />

                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container item spacing={2} marginBottom={3}>
                                <Grid item xs={6} >
                                <MuiAutocomplete
                                    label={intl.formatMessage({ id: 'product.Model' }) + ' *'}
                                    fetchDataFunc={getModel}
                                    displayLabel="commonDetailName"
                                    displayValue="commonDetailId"
                                    // defaultValue={
                                    // mode == CREATE_ACTION
                                    //     ? null
                                    //     : { LineId: initModal.LineId, LineName: initModal.LineName }
                                    // }
                                    value={values.Model ? { commonDetailId: values.Model, commonDetailName: values.ModelName } : null}
                                    disabled={dialogState.isSubmit}
                                    onChange={(e, value) => {
                                        setFieldValue("ModelName", value?.commonDetailName || '');
                                        setFieldValue("Model", value?.commonDetailId || "");
                                    }}
                                    error={touched.Model && Boolean(errors.Model)}
                                    helperText={touched.Model && errors.Model}
                                    variant="outlined"
                                />
                                </Grid>
                                <Grid item xs={6}>
                                <MuiAutocomplete
                                    label={intl.formatMessage({ id: 'product.product_type' }) + ' *'}
                                    fetchDataFunc={getproductType}
                                    displayLabel="commonDetailName"
                                    displayValue="commonDetailId"
                                    // defaultValue={
                                    // mode == CREATE_ACTION
                                    //     ? null
                                    //     : { LineId: initModal.LineId, LineName: initModal.LineName }
                                    // }
                                    value={values.ProductType ? { commonDetailId: values.ProductType, commonDetailName: values.ProductTypeName } : null}
                                    disabled={dialogState.isSubmit}
                                    onChange={(e, value) => {
                                        setFieldValue("ProductTypeName", value?.commonDetailName || '');
                                        setFieldValue("ProductType", value?.commonDetailId || "");
                                    }}
                                    error={touched.ProductType && Boolean(errors.ProductType)}
                                    helperText={touched.ProductType && errors.ProductType}
                                    variant="outlined"
                                />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container item spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type="text"
                                        size='small'
                                        name='Description'
                                        disabled={dialogState.isSubmit}
                                        value={values.Description}
                                        onChange={handleChange}
                                        label={intl.formatMessage({ id: 'general.description' })}
                                        error={touched.Description && Boolean(errors.MaterialCode)}
                                        helperText={touched.Description && errors.Description}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
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
                                onClick={handleReset}
                                disabled={dialogState.isSubmit}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </MuiDialog>
    )
}

export default ModifyProductDialog