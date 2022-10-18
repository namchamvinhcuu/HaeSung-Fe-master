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

import { commonService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'

const CreateCommonDetailDialog = (props) => {



    const intl = useIntl();

    const { initModal, isOpen, onClose, setNewData } = props;



    const dataModalRef = useRef({ ...initModal });

    const [dialogState, setDialogState] = useState({
        isSubmit: false
    })

    const schema = yup.object().shape({

        commonDetailName: yup.string().required(intl.formatMessage({ id: 'general.name' })),

    });
    const { control, register, setValue, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({

        mode: 'onChange',
        resolver: yupResolver(schema),
        defaultValues: {
            ...initModal
        },
    });

    useEffect(() => {
        reset({ ...initModal });
    }, [initModal]);

    const handleReset = () => {
        reset();
        clearErrors();
        setDialogState({
            ...dialogState
        })
    }

    const handleCloseDialog = () => {
        reset();
        clearErrors();
        setDialogState({
            ...dialogState
        })
        onClose();
    }

    const onSubmit = async (data) => {


        dataModalRef.current = { ...initModal, ...data };
        setDialogState({ ...dialogState, isSubmit: true });

        const res = await commonService.createCommonDetail(dataModalRef.current);
        // console.log(dataModalRef.current, 'submit');

        if (res.HttpResponseCode === 200 && res.Data) {
            SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
            setNewData({ ...res.Data });
            setDialogState({ ...dialogState, isSubmit: false });
            handleReset();
            handleCloseDialog();



        }
        else {
            ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
            setDialogState({ ...dialogState, isSubmit: false });
        }

    };



    return (
        <MuiDialog
            maxWidth='sm'
            title={intl.formatMessage({ id: 'general.create' })}
            isOpen={isOpen}
            disabledCloseBtn={dialogState.isSubmit}
            disable_animate={300}
            onClose={handleCloseDialog}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>

                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            fullWidth
                            size='small'
                            label={intl.formatMessage({ id: 'general.name' })}

                            name="commonDetailName"
                            {...register('commonDetailName', {
                            })}
                            error={!!errors?.commonDetailName}
                            helperText={errors?.commonDetailName ? errors.commonDetailName.message : null}
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

export default CreateCommonDetailDialog