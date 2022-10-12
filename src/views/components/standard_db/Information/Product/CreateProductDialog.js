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

import { productService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { margin } from '@mui/system'

const CreateDialog = (props) => {
    const intl = useIntl();
    const { initModal, isOpen, onClose, setNewData } = props;

    const [modelArr, setModelArr] = useState([initModal]);
    const [productTypeArr, setproductTypeArr] = useState([initModal]);

    const dataModalRef = useRef({ ...initModal });
    const [dialogState, setDialogState] = useState({
        isSubmit: false
    })
    const schema = yup.object().shape({

        ProductCode: yup.string().required(intl.formatMessage({ id: 'general.field_required' })),
        ProductType: yup.number().required(),
        Model: yup.number().required(),
        Inch: yup.number().required(),


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
            getModel();
        getproductType();
    }, [isOpen])

    const getModel = async () => {
        const res = await productService.getProductModel();
        if (res.HttpResponseCode === 200 && res.Data) {
            setModelArr([...res.Data])
        }
        else {
            setModelArr([])
        }
    }
    const getproductType = async () => {
        const res = await productService.getProductType();
        if (res.HttpResponseCode === 200 && res.Data) {
            setproductTypeArr([...res.Data])
        }
        else {
            setproductTypeArr([])
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

        const res = await productService.createProduct(dataModalRef.current);
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
                                    label={intl.formatMessage({ id: 'general.code' })}

                                    name="ProductCode"
                                    {...register('ProductCode', {
                                    })}
                                    error={!!errors?.ProductCode}
                                    helperText={errors?.ProductCode ? errors.ProductCode.message : null}
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
                            <Grid item xs={6} >
                                <Controller
                                    control={control}
                                    name="Model"
                                    render={({ field: { onChange, value } }) => {
                                        return (
                                            <Autocomplete
                                                freeSolo
                                                fullWidth
                                                size='small'
                                                options={modelArr}
                                                autoHighlight
                                                openOnFocus
                                                getOptionLabel={option => option.commonDetailName}
                                                isOptionEqualToValue={(option, value) => option.commonDetailId === value.commonDetailId}
                                                defaultValue={initModal}
                                                onChange={(e, item) => {
                                                    if (item) {
                                                        onChange(item.commonDetailId ?? '');
                                                    }
                                                    else {
                                                        onChange('')
                                                    }
                                                }}
                                                renderInput={(params) => {
                                                    return <TextField
                                                        {...params}
                                                        label={intl.formatMessage({ id: 'product.Model' })}
                                                        error={!!errors.Model}
                                                        helperText={errors?.Model ? errors.Model.message : null}
                                                    />
                                                }}
                                            />
                                        );
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Controller
                                    control={control}
                                    name={'ProductType'}
                                    render={({ field: { onChange, value } }) => {
                                        return (
                                            <Autocomplete
                                                freeSolo
                                                fullWidth
                                                size='small'
                                                options={productTypeArr}
                                                autoHighlight
                                                openOnFocus
                                                getOptionLabel={option => option.commonDetailName}
                                                isOptionEqualToValue={(option, value) => option.commonDetailId === value.commonDetailId}
                                                defaultValue={initModal}
                                                onChange={(e, item) => {
                                                    if (item) {
                                                        onChange(item.commonDetailId ?? '');
                                                    }
                                                    else {
                                                        onChange('')
                                                    }
                                                }}
                                                renderInput={(params) => {
                                                    return <TextField
                                                        {...params}
                                                        label={intl.formatMessage({ id: 'product.product_type' })}
                                                        error={!!errors.ProductType}
                                                        helperText={errors?.ProductType ? errors.ProductType.message : null}
                                                    />
                                                }}
                                            />
                                        );
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container item spacing={2}>
                            <Grid item xs={6}>

                                <TextField
                                    fullWidth
                                    size='small'
                                    label={intl.formatMessage({ id: 'product.Inch' })}
                                    name="Inch"
                                    {...register('Inch', {
                                    })}
                                    error={!!errors?.Inch}
                                    helperText={errors?.Inch ? errors.Inch.message : null}
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