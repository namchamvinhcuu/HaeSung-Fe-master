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
import { useFormik } from 'formik'

import { qcDetailService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { QCDetailDto } from "@models"

const CreateQCDetailDialog = (props) => {
    const intl = useIntl();
    const { initModal, isOpen, onClose, setNewData } = props; 2

    const [QCCodeArr, setQCCodeArr] = useState([initModal]);
    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    })
    const schema = yup.object().shape({

        QCMasterId: yup.number().required(),
        QCId: yup.number().min(1, intl.formatMessage({ id: 'general.field_required' })).required(intl.formatMessage({ id: 'general.field_required' })),

    });

    const formik = useFormik({
        validationSchema: schema,
        initialValues: { ...initModal },
        enableReinitialize: true,

        onSubmit: async values => {

            const res = await qcDetailService.create(values);
            if (res.HttpResponseCode === 200) {
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
                // handleCloseDialog();
                setNewData({ ...res.Data });
                setDialogState({ ...dialogState, isSubmit: false });
                // handleReset();
            }
            else {
                ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
                // handleCloseDialog();
                setDialogState({ ...dialogState, isSubmit: false });
                // handleReset();
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
            // getQCMaster();
            getQC();
    }, [isOpen])

    const getQCMaster = async () => {
        const res = await qcDetailService.getQCMasterActive();
        if (res.HttpResponseCode === 200 && res.Data) {
            setQCMasterCodeArr([...res.Data])

        }
        else {
            setQCMasterCodeArr([])
        }
    }
    const getQC = async () => {
        const res = await qcDetailService.getStandardQCActive();
        if (res.HttpResponseCode === 200 && res.Data) {
            setQCCodeArr([...res.Data])

        }
        else {
            setQCCodeArr([])
        }
    }

    useEffect(() => {
        formik.resetForm();
        formik.initialValues = initModal
    }, [initModal])


    const handleReset = () => {
        resetForm();
    }
    const handleCloseDialog = () => {
        setDialogState({
            ...dialogState
        });
        formik.resetForm();
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
                        <Grid container item spacing={2} marginBottom={2}>
                            <Grid item xs={12}>
                                <MuiSelectField
                                    value={values.QCId ? { QCId: values.QCId, QCCode: values.QCCode } : null}
                                    disabled={dialogState.isSubmit}
                                    label={intl.formatMessage({ id: 'standardQC.QCCode' }) + ' *'}
                                    options={QCCodeArr}
                                    displayLabel="QCCode"
                                    displayValue="QCId"
                                    onChange={(e, value) => {
                                        setFieldValue("QCCode", value?.QCCode || '');
                                        setFieldValue("QCId", value?.QCId || "");
                                    }}
                                    defaultValue={initModal && { QCId: initModal.QCId, QCCode: initModal.QCCode }}
                                    error={touched.QCId && Boolean(errors.QCId)}
                                    helperText={touched.QCId && errors.QCId}
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

export default CreateQCDetailDialog