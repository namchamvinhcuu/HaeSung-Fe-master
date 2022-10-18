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

import { standardQCService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'

const ModifyDialog = (props) => {

    const intl = useIntl();

    const { initModal, isOpen, onClose, setModifyData } = props;
   // console.log(initModal,'product111111');

    const clearParent = useRef(null);

    const dataModalRef = useRef({ ...initModal });
    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    })

  

    const schema = yup.object().shape({
        QCCode: yup.string().required(),
    });
    const { control, register, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
        mode: 'onChange',
        resolver: yupResolver(schema),
        defaultValues: {
            ...initModal,

        },
    });

    useEffect(() => {
        reset({ ...initModal });
    }, [initModal]);

    const handleCloseDialog = () => {
        reset();
        clearErrors();
        setDialogState({
            ...dialogState,
        })
        onClose();
    }

    const handleReset = () => {
        reset();
        clearErrors();
        setDialogState({
            ...dialogState
        })
    }
    const onSubmit = async (data) => {
       
        dataModalRef.current = { ...initModal, ...data };
        setDialogState({ ...dialogState, isSubmit: true });

        const res = await standardQCService.modify(dataModalRef.current);
        if (res.HttpResponseCode === 200 && res.Data) {
            SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
            setDialogState({ ...dialogState, isSubmit: false });
            setModifyData({ ...res.Data });
            handleReset();
        }
        else {
            setDialogState({ ...dialogState, isSubmit: false });
            ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        }
        handleCloseDialog(); 
    };



    return (
        <MuiDialog
            maxWidth='sm'
            title={intl.formatMessage({ id: 'general.modify' })}
            isOpen={isOpen}
            disabledCloseBtn={dialogState.isSubmit}
            disable_animate={300}
            onClose={handleCloseDialog}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    autoFocus
                                    fullWidth
                                    size='small'
                                    label={intl.formatMessage({ id: 'general.code' })}
                                    {...register('QCCode', {
                                        // onChange: (e) => handleInputChange(e)
                                    })}
                                    error={!!errors?.ProductCode}
                                    helperText={errors?.ProductCode ? errors.ProductCode.message : null}
                                />
                            </Grid>
                            <Grid item xs={6}  marginBottom= {2}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label={intl.formatMessage({ id: 'general.description' })}
                                    name="Description"
                                    {...register('Description', {
                                    })}
                                    error={!!errors?.Description}
                                    helperText={errors?.Description ? errors.Description.message : null}
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
                          
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </MuiDialog>
    )
}

export default ModifyDialog