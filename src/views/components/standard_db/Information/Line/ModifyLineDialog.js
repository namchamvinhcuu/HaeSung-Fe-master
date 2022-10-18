import { Grid, TextField } from '@mui/material'
import { ErrorAlert, SuccessAlert } from '@utils'
import { useFormik } from 'formik'
import React, { useEffect, useState, useRef } from 'react'
import { useIntl } from 'react-intl'
import * as yup from 'yup'

import { MuiDialog, MuiSubmitButton, MuiResetButton } from '@controls'

import { lineService } from '@services'

const ModifyLineDialog = (props) => {
    const intl = useIntl();
    let isRendered = useRef(true);

    const { initModal, isOpen, onClose, setModifyData } = props;

    const [dialogState, setDialogState] = useState({
        isSubmit: false,
    });

    const schema = yup.object().shape({
        LineName: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
    });

    const formik = useFormik({
        validationSchema: schema,
        initialValues: { ...initModal },
        enableReinitialize: true,
        onSubmit: async values => {

            const res = await lineService.modify(values);

            if (res && isRendered)
                if (res.HttpResponseCode === 200 && res.Data) {
                    SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
                    setModifyData({ ...res.Data });
                    setDialogState({ isSubmit: false });
                    handleCloseDialog();
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
        formik.initialValues = { ...initModal }

        return () => {
            isRendered = false;
        }
    }, [initModal]);

    return (
        <MuiDialog
            maxWidth='md'
            title={intl.formatMessage({ id: 'general.modify' })}
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
                            label={intl.formatMessage({ id: 'line.LineName' }) + ' *'}
                            name='LineName'
                            value={values.LineName}
                            onChange={handleChange}
                            error={touched.LineName && Boolean(errors.LineName)}
                            helperText={touched.LineName && errors.LineName}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            size='small'
                            multiline={true}
                            rows={3}
                            disabled={dialogState.isSubmit}
                            label={intl.formatMessage({ id: 'line.Description' })}
                            name='Description'
                            value={values.Description}
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

export default ModifyLineDialog