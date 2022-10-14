import { MuiDialog, MuiResetButton, MuiSubmitButton,MuiSelectField } from '@controls'
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
import { margin } from '@mui/system'

const CreateDialog = (props) => {
    const intl = useIntl();
    const { initModal, isOpen, onClose, setNewData } = props;
    console.log(initModal, 'initModal');
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
    const { control, register, setValue, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({

        mode: 'onChange',
        resolver: yupResolver(schema),
        defaultValues: {
            ...initModal
        },
    });


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

        const res = await qcMasterService.create(dataModalRef.current);
        // console.log(dataModalRef.current, 'submit');

        if (res.HttpResponseCode === 200 && res.Data) {
            SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
            setNewData({ ...res.Data });
            setDialogState({ ...dialogState, isSubmit: false });
            handleReset();

        }
        else {
            ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
            setDialogState({ ...dialogState, isSubmit: false });
        }
        handleCloseDialog();
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
                        <Grid container spacing={2}>
                            <Grid item xs={6} >
                                <TextField
                                    autoFocus
                                    fullWidth
                                    size='small'
                                    label={intl.formatMessage({ id: 'qcMaster.QCMasterCode' })}

                                    name="QCMasterCode"
                                    {...register('QCMasterCode', {
                                    })}
                                    error={!!errors?.QCMasterCode}
                                    helperText={errors?.QCMasterCode ? errors.QCMasterCode.message : null}
                                />
                            </Grid>
                            <Grid item xs={6} >
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
                        <Grid container item spacing={2} marginBottom={2}>
                            <Grid item xs={6}>
                                <Controller
                                    control={control}
                                    name="ProductId"
                                    render={({ field: { onChange, value } }) => {
                                        return (
                                            <MuiSelectField
                                                disabled={dialogState.isSubmit}
                                                label={intl.formatMessage({ id: 'product.product_code' })}
                                                options={productArr}
                                                displayLabel="ProductCode"
                                                displayValue="ProductId"
                                                onChange={(e, item) => onChange(item ? item.ProductId ?? null : null)}
                                                defaultValue={initModal && { ProductId: initModal.ProductId, ProductCode: initModal.ProductCode }}
                                                error={!!errors.ProductId}
                                                helperText={errors?.ProductId ? errors.ProductId.message : null}
                                            />
                                        );
                                    }}
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