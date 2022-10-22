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

import { permissionService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'

const ModifyPermissionDialog = (props) => {

    const intl = useIntl();
    let isRendered = useRef(true);

    const { initModal, isOpen, onClose, setModifyData } = props;

    const clearParent = useRef(null);

    const dataModalRef = useRef({ ...initModal });
    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    })



    const schema = yup.object().shape({

        forRoot: yup.bool().required(),
        permissionName: yup.string().required(),


    });
    const { control, register, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
        mode: 'onChange',
        resolver: yupResolver(schema),
        defaultValues: {
            ...initModal,

        },
    });



    const handleCloseDialog = () => {
        reset();
        clearErrors();
        if (isRendered)
            setDialogState({
                ...dialogState,
            })
        onClose();
    }



    const onSubmit = async (data) => {

        dataModalRef.current = { ...initModal, ...data };
        setDialogState({ ...dialogState, isSubmit: true });

        const res = await permissionService.modify(dataModalRef.current);
        if (res)
            if (res.HttpResponseCode === 200 && res.Data) {
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
                if (isRendered)
                    setModifyData({ ...res.Data });

                handleCloseDialog();
            }
            else {
                ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
            }
        if (isRendered)
            setDialogState({ ...dialogState, isSubmit: false });
    };

    useEffect(() => {
        return () => {
            isRendered = false
        }
    })



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
                                    disabled
                                    size='small'
                                    label={intl.formatMessage({ id: 'general.name' })}
                                    {...register('commonDetailName', {
                                        // onChange: (e) => handleInputChange(e)
                                    })}
                                    error={!!errors?.commonDetailName}
                                    helperText={errors?.commonDetailName ? errors.commonDetailName.message : null}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    autoFocus
                                    fullWidth
                                    disabled
                                    size='small'
                                    label={intl.formatMessage({ id: 'general.name' })}
                                    {...register('permissionName', {
                                        // onChange: (e) => handleInputChange(e)
                                    })}
                                    error={!!errors?.permissionName}
                                    helperText={errors?.permissionName ? errors.permissionName.message : null}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>

                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Controller
                                            name='forRoot'
                                            control={control}
                                            render={({ field: props }) => (
                                                <Checkbox
                                                    {...props}
                                                    checked={props.value}
                                                    onChange={(e) => props.onChange(e.target.checked)}
                                                />
                                            )}
                                        />
                                    }
                                    label='For Root'
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

export default ModifyPermissionDialog