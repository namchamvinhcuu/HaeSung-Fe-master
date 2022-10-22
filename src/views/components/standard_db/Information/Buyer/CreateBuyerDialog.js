import { MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls'
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

import { buyerService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { margin } from '@mui/system'

const CreateBuyerDialog = (props) => {
    
    const intl = useIntl();

    const { initModal, isOpen, onClose, setNewData } = props;

    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    });

    const schema = yup.object().shape({
        BuyerCode: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
        BuyerName: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
        Description: yup.string().trim()
    });

    const formik = useFormik({
        validationSchema: schema,
        initialValues: { ...initModal },
        onSubmit: async values => {
            const res = await buyerService.createBuyer(values);
            if (res.HttpResponseCode === 200 && res.Data) {
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
                setNewData({ ...res.Data });
                setDialogState({ ...dialogState, isSubmit: false });
                //handleCloseDialog();
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
                    <Grid item xs={12}>
                        <Grid container item spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                   autoFocus
                                    fullWidth
                                    size='small'
                                    disabled={dialogState.isSubmit}
                                    label={intl.formatMessage({ id: 'buyer.BuyerCode' }) + ' *'}
                                    name='BuyerCode'
                                    value={values.BuyerCode}
                                    onChange={handleChange}
                                    error={touched.BuyerCode && Boolean(errors.BuyerCode)}
                                    helperText={touched.BuyerCode && errors.BuyerCode}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField

                                    fullWidth
                                    size='small'
                                    disabled={dialogState.isSubmit}
                                    label={intl.formatMessage({ id: 'buyer.BuyerName' }) + ' *'}
                                    name='BuyerName'
                                    value={values.BuyerName}
                                    onChange={handleChange}
                                    error={touched.BuyerName && Boolean(errors.BuyerName)}
                                    helperText={touched.BuyerName && errors.BuyerName}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                fullWidth
                                size='small'
                                multiline={true}
                                rows={2}
                                disabled={dialogState.isSubmit}
                                label={intl.formatMessage({ id: 'buyer.Description' })}
                                name='Description'
                                value={values.Description}
                                onChange={handleChange}
                            />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                fullWidth
                                size='small'
                                multiline={true}
                                rows={3}
                                disabled={dialogState.isSubmit}
                                label={intl.formatMessage({ id: 'buyer.Contact' })}
                                name='Contact'
                                value={values.Contact}
                                onChange={handleChange}
                            />
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

export default CreateBuyerDialog