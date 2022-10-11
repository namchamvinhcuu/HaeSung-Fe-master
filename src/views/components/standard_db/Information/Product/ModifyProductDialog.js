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

const ModifyProductDialog = (props) => {

    const intl = useIntl();

    const { initModal, isOpen, onClose, setModifyData } = props;
    console.log(initModal,'product111111');

    const clearParent = useRef(null);

    const dataModalRef = useRef({ ...initModal });
    const [dialogState, setDialogState] = useState({
        ...initModal,
        isSubmit: false,
    })

  

    const schema = yup.object().shape({
      
        ProductCode: yup.string().required(),


    });
    const { control, register, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
        mode: 'onChange',
        resolver: yupResolver(schema),
        defaultValues: {
            ...initModal,

        },
    });
    const [modelArr, setModelArr] = useState([initModal]);
    const [productTypeArr, setproductTypeArr] = useState([initModal]);

    useEffect(() => {
        if (isOpen)
            getModel();
        getproductType();
    }, [isOpen])

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

    const onSubmit = async (data) => {
       
        // dataModalRef.current = { ...initModal, ...data };
        // setDialogState({ ...dialogState, isSubmit: true });

        // const res = await commonService.modifyCommonMaster(dataModalRef.current);
        // if (res.HttpResponseCode === 200 && res.Data) {
        //     SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        //     setModifyData({ ...res.Data });

        //     handleCloseDialog(); 
        // }
        // else {
        //     ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        // }

        // setDialogState({ ...dialogState, isSubmit: false });
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
                                    {...register('ProductCode', {
                                        // onChange: (e) => handleInputChange(e)
                                    })}
                                    //defaultValue={initModal.commonMasterName}
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
                        <Grid item xs={12}>
                            <Grid container item spacing={2}  marginBottom= {2}>
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
                                                    getOptionLabel={option => option.ModelName}
                                                 
                                                    defaultValue={initModal}
                                                    // onChange={(e, item) => {
                                                    //     if (item) {
                                                    //         onChange(item.commonDetailId ?? '');
                                                    //     }
                                                    //     else {
                                                    //         onChange('')
                                                    //     }
                                                    // }}
                                                    renderInput={(params) => {
                                                        return <TextField
                                                            {...params}
                                                            label={intl.formatMessage({ id: 'general.model' })}
                                                            //error={!!errors.Model}
                                                          //  helperText={errors?.Model ? errors.Model.message : null}
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
                                                    getOptionLabel={option => option.ProductTypeName}
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

export default ModifyProductDialog