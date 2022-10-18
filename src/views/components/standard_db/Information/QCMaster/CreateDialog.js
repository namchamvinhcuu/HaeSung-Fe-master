import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiSelectField } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import {
    Autocomplete,
    Checkbox, FormControlLabel, Grid, Radio, RadioGroup, TextField
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'

import { qcMasterService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { useFormik } from 'formik'

const CreateDialog = (props) => {
    const intl = useIntl();
    const { initModal, isOpen, onClose, setNewData } = props;

    const [productArr, setproducArr] = useState([initModal]);

    const dataModalRef = useRef({ ...initModal });
    const [dialogState, setDialogState] = useState({
        isSubmit: false
    })
    const schema = yup.object().shape({

        QCMasterCode: yup.string().trim().required(intl.formatMessage({ id: 'general.field_required' })),
        ProductId: yup.number().required(),
        Description: yup.string().trim()

    });

    const formik = useFormik({
        validationSchema: schema,
        initialValues: { ...initModal },
        onSubmit: async values => {
           
            const res = await qcMasterService.create(values);
            if (res.HttpResponseCode === 200) {
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
                handleCloseDialog();
                setNewData({ ...res.Data });
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
        if (isOpen)
            getProduct();
    }, [isOpen])

    const getProduct = async () => {
        const res = await qcMasterService.getProductActive();
        if (res.HttpResponseCode === 200 && res.Data) {
            setproducArr([...res.Data])
            console.log(res.Data);
        }
        else {
            setproducArr([])
        }
    }

    useEffect(() => {
        resetForm({ ...initModal });
    }, [initModal]);

    const handleReset = () => {
        resetForm();
        setDialogState({
            ...dialogState
        })
    }

    const handleCloseDialog = () => {
        resetForm();
        setDialogState({
            ...dialogState
        })
        onClose();
    }
    return (
        <MuiDialog
            maxWidth='sm'
            title={intl.formatMessage({ id: 'general.create' })}
            isOpen={isOpen}
            disabledCloseBtn={dialogState.isSubmit}
            disable_animate={300}
            onClose={handleCloseDialog}
        >
            <form onSubmit={handleSubmit} >
                <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={6} >
                                <TextField
                                    fullWidth
                                    type="text"
                                    size='small'
                                    name='QCMasterCode'
                                    disabled={dialogState.isSubmit}
                                    value={values.QCMasterCode}
                                    onChange={handleChange}
                                    label={intl.formatMessage({ id: 'qcMaster.QCMasterCode' })}
                                    error={touched.Amount && Boolean(errors.Amount)}
                                    helperText={touched.Amount && errors.Amount}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <MuiSelectField
                                    value={values.ProductId ? { ProductId: values.ProductId, ProductCode: values.ProductCode } : null}
                                    disabled={dialogState.isSubmit}
                                    label={intl.formatMessage({ id: 'product.product_code' })}
                                    options={productArr}
                                    displayLabel="ProductCode"
                                    displayValue="ProductId"
                                    onChange={(e, value) => {
                                        setFieldValue("ProductCode", value?.ProductCode || '');
                                        setFieldValue("ProductId", value?.ProductId || "");
                                    }}
                                    defaultValue={initModal && { ProductId: initModal.ProductId, ProductCode: initModal.ProductCode }}
                                    error={!!errors.ProductId}
                                    helperText={errors?.ProductId ? errors.ProductId.message : null}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container item spacing={2} marginBottom={2}>
                            <Grid item xs={12} >
                            <TextField
                                    fullWidth
                                    type="text"
                                    size='small'
                                    name='Description'
                                    disabled={dialogState.isSubmit}
                                    value={values.Description}
                                    onChange={handleChange}
                                    label={intl.formatMessage({ id: 'general.description' })}
                                    error={touched.Description && Boolean(errors.Description)}
                                    helperText={touched.Description && errors.Description}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Grid container direction="row-reverse">
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

export default CreateDialog