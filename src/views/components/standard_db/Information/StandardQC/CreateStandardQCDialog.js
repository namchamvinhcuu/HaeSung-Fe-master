import { Grid, TextField } from '@mui/material'
import { ErrorAlert, SuccessAlert } from '@utils'
import { useFormik } from 'formik'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { MuiDialog, MuiSubmitButton, MuiResetButton } from '@controls'
import { standardQCService } from '@services'

const CreateDialog = (props) => {
    const intl = useIntl();

    const { initModal, isOpen, onClose, setNewData } = props;

    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    });

    const schema = yup.object().shape({
        QCCode: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
    });

    const formik = useFormik({
        validationSchema: schema,
        initialValues: { ...initModal },
        onSubmit: async values => {
            const res = await standardQCService.create(values);
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
                        <TextField
                            autoFocus
                            fullWidth
                            size='small'
                            disabled={dialogState.isSubmit}
                            label={intl.formatMessage({ id: 'standardQC.QCCode' }) + ' *'}
                            name='QCCode'
                            value={values.QCCode}
                            onChange={handleChange}
                            error={touched.QCCode && Boolean(errors.QCCode)}
                            helperText={touched.QCCode && errors.QCCode}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            size='small'
                            disabled={dialogState.isSubmit}
                            label={intl.formatMessage({ id: 'general.description' })}
                            name='Description'
                            value={values.Description}
                            onChange={handleChange}
                            error={touched.Description && Boolean(errors.Description)}
                            helperText={touched.Description && errors.Description}
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

export default CreateDialog