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

    const [materialArr, setmaterialArr] = useState([initModal]);
    const [qcArr, setqcArr] = useState([]);

    const [qcType, setqcType] = useState([""]);

    const dataModalRef = useRef({ ...initModal });
    const [dialogState, setDialogState] = useState({
        isSubmit: false
    })
    const schema = yup.object().shape({

        QCMasterCode: yup.string().trim().required(intl.formatMessage({ id: 'general.field_required' })),
        MaterialId: yup.number().min(1,intl.formatMessage({ id: 'general.field_required' })).required(intl.formatMessage({ id: 'general.field_required' })),
        QCType: yup.number().min(1,intl.formatMessage({ id: 'general.field_required' })).required(intl.formatMessage({ id: 'general.field_required' })),
        Description: yup.string().trim()

    });

    const formik = useFormik({
        validationSchema: schema,
        initialValues: { ...initModal },
        onSubmit: async values => {
           
            const res = await qcMasterService.create(values);
            if (res.HttpResponseCode === 200) {
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
               // handleCloseDialog();
                setNewData({ ...res.Data });
                setDialogState({ ...dialogState, isSubmit: false });
              // handleReset();
            }
            else {
                ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
             //   handleCloseDialog();
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
           getQC();
    }, [isOpen])


    useEffect(() => {
        getMaterial(qcType);
    }, [qcType])


    const getMaterial = async (qcType) => {
    
        const res = await qcMasterService.getMaterialForSelect({qcType : qcType});
        if (res.HttpResponseCode === 200 && res.Data) {
            setmaterialArr([...res.Data])
          
        }
        else {
            setmaterialArr([])
        }
    }
    const getQC = async () => {
        const res = await qcMasterService.getQCTypeForSelect();
        if (res.HttpResponseCode === 200 && res.Data) {
            setqcArr([...res.Data])
            
        }
        else {
            setqcArr([])
        }
    }
    useEffect(() => {
        setqcType("");
        resetForm({ ...initModal });
    }, [initModal]);

    const handleReset = () => {
        setqcType("");
        resetForm();
        setDialogState({
            ...dialogState
        })
    }

    const handleCloseDialog = () => {
        setqcType("");
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
                            <Grid item xs={12} >
                                <TextField
                                    fullWidth
                                    type="text"
                                    size='small'
                                    name='QCMasterCode'
                                    disabled={dialogState.isSubmit}
                                    value={values.QCMasterCode}
                                    onChange={handleChange}
                                    label={intl.formatMessage({ id: 'qcMaster.QCMasterCode' }) + ' *'}
                                    error={touched.QCMasterCode && Boolean(errors.QCMasterCode)}
                                    helperText={touched.QCMasterCode && errors.QCMasterCode}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <MuiSelectField
                                    value={values.QCType ? { commonDetailId: values.QCType, commonDetailName: values.QCTypeName } : null}
                                    disabled={dialogState.isSubmit}
                                    label={intl.formatMessage({ id: 'qcMaster.qcType' }) + ' *'}
                                    options={qcArr}
                                    displayLabel="commonDetailName"
                                    displayValue="commonDetailId"
                               
                                    onChange={(e, value) => {
                                        setFieldValue("MaterialCode", "");
                                        setFieldValue("MaterialId",  0);
                                        setqcType(value?.commonDetailName || "");
                                        
                                        setFieldValue("QCTypeName", value?.commonDetailName || '');
                                        setFieldValue("QCType", value?.commonDetailId || "");
                                        
                                    }}
                                    error={touched.QCType && Boolean(errors.QCType)}
                                    helperText={touched.QCType && errors.QCType}
                               
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <MuiSelectField
                                    value={values.MaterialId ? { MaterialId: values.MaterialId, MaterialCode: values.MaterialCode } : null}
                                    disabled={dialogState.isSubmit}
                                    label={intl.formatMessage({ id: 'material.MaterialCode' }) + ' *'}
                                    options={materialArr}
                                    displayLabel="MaterialCode"
                                    displayValue="MaterialId"
                                    displayGroup="GroupMaterial"
                                    onChange={(e, value) => {
                                        setFieldValue("MaterialCode", value?.MaterialCode || '');
                                        setFieldValue("MaterialId", value?.MaterialId || "");
                                      
                                    }}
                                    error={touched.MaterialId && Boolean(errors.MaterialId)}
                                    helperText={touched.MaterialId && errors.MaterialId}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container item spacing={2}>
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