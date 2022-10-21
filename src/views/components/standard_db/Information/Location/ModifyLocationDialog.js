import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiSelectField} from '@controls'
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

import { locationService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { margin } from '@mui/system'

const ModifyLocationDialog = (props) => {
    
    const intl = useIntl();

    const { initModal, isOpen, onClose, setModifyData } = props;
    const [AreaList, setAreaList] = useState([]);
    const getArea = async () => {
        const res = await locationService.GetArea();
        if (res.HttpResponseCode === 200 && res.Data) {
            setAreaList([...res.Data])
        }
        else {
            setAreaList([])
        }
    }
    useEffect(() => {
        if (isOpen)
        getArea();
    }, [isOpen])

    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    });

    const schema = yup.object().shape({
        LocationCode: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
        AreaId: yup.number().min(1,intl.formatMessage({ id: 'general.field_required' })).required(intl.formatMessage({ id: 'general.field_required' })),
    });

    const formik = useFormik({
        validationSchema: schema,
        initialValues: { ...initModal },
        enableReinitialize: true,
        onSubmit: async values => {
            const res = await locationService.modifyLocation(values);
            if (res.HttpResponseCode === 200) {
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
                setModifyData({ ...res.Data });
                setDialogState({ ...dialogState, isSubmit: false });
                handleCloseDialog();
              }
              else {
                ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
                setDialogState({ ...dialogState, isSubmit: false });
              
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
            title={intl.formatMessage({ id: 'general.modify' })}
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
                                    label={intl.formatMessage({ id: 'location.LocationCode' }) + ' *'}
                                    name='LocationCode'
                                    value={values.LocationCode}
                                    onChange={handleChange}
                                    error={touched.LocationCode && Boolean(errors.LocationCode)}
                                    helperText={touched.LocationCode && errors.LocationCode}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <MuiSelectField
                                    value={values.AreaId ? { commonDetailId: values.AreaId, commonDetailName: values.AreaName } : null}
                                    disabled={dialogState.isSubmit}
                                    label={intl.formatMessage({ id: 'location.AreaId' }) + ' *'}
                                    options={AreaList}
                                    displayLabel="commonDetailName"
                                    displayValue="commonDetailId"
                                    onChange={(e, value) => {
                                    setFieldValue("AreaName", value?.commonDetailName || '');
                                    setFieldValue("AreaId", value?.commonDetailId || "");
                                }}
                                    error={touched.AreaId && Boolean(errors.AreaId)}
                                    helperText={touched.AreaId && errors.AreaId}
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

export default ModifyLocationDialog