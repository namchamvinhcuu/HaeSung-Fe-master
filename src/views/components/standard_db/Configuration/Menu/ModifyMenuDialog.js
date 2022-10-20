import { MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import {
    Checkbox, FormControlLabel, Grid, Radio, RadioGroup, TextField
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'

import { menuService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'

const ModifyMenuDialog = (props) => {

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
        menuName: yup.string().required(intl.formatMessage({ id: 'menu.menuName_required' })),

        menuLevel: yup.number().required(),

        navigateUrl: yup.string()
            .when("menuLevel", (menuLevel) => {
                if (parseInt(menuLevel) === 3) {
                    return yup.string()
                        .required(intl.formatMessage({ id: 'menu.navigateUrl_required' }))
                }
            }),

        menuComponent: yup.string()
            .when("menuLevel", (menuLevel) => {
                if (parseInt(menuLevel) === 3) {
                    return yup.string()
                        .required(intl.formatMessage({ id: 'menu.menuComponent_required' }))
                }
            })
            .when("navigateUrl", (navigateUrl) => {
                if (navigateUrl && navigateUrl.length > 0) {
                    return yup.string()
                        .required(intl.formatMessage({ id: 'menu.navigateUrl_required' }))
                }

            }),
    });

    const { control, register, setValue, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
        mode: 'onChange',
        resolver: yupResolver(schema),
    });

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
            ...dialogState,
        })
    }

    const onSubmit = async (data) => {
        dataModalRef.current = { ...initModal, ...data };
        setDialogState({ ...dialogState, isSubmit: true });

        const res = await menuService.modifyMenu(dataModalRef.current);
        if (res && isRendered) {
            if (res.HttpResponseCode === 200 && res.Data) {
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
                setModifyData({ ...res.Data });

                handleCloseDialog();
            }
            else {
                ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
            }

            setDialogState({ ...dialogState, isSubmit: false });
        }
    };

    useEffect(() => {
        reset({ ...initModal });

        return () => {
            isRendered = false;
        }
    }, [initModal]);

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
                            <Grid item xs={6} style={{ display: 'flex', justifyContent: 'center' }}>

                                <span style={{ marginTop: '5px', marginRight: '16px', fontWeight: '700' }}>
                                    {intl.formatMessage({ id: 'general.level' })}
                                </span>
                                <Controller
                                    control={control}
                                    name="menuLevel"
                                    render={({ field: { onChange, value } }) => {
                                        return (
                                            <RadioGroup
                                                row
                                                value={value}
                                                onChange={(e) => {
                                                    onChange(e.target.value);
                                                    setDialogState({ ...dialogState, menuLevel: e.target.value });
                                                    clearErrors('parentId');
                                                    setValue('parentId', null);
                                                    const ele = clearParent.current.getElementsByClassName('MuiAutocomplete-clearIndicator')[0];
                                                    if (ele) ele.click();
                                                }}

                                            >
                                                <FormControlLabel disabled value={1} control={<Radio size="small" />} label="1" />
                                                <FormControlLabel disabled value={2} control={<Radio size="small" />} label="2" />
                                                <FormControlLabel disabled value={3} control={<Radio size="small" />} label="3" />
                                            </RadioGroup>
                                        );
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    autoFocus
                                    fullWidth
                                    size='small'
                                    label={intl.formatMessage({ id: 'general.name' })}
                                    {...register('menuName', {
                                        // onChange: (e) => handleInputChange(e)
                                    })}
                                    error={!!errors?.menuName}
                                    helperText={errors?.menuName ? errors.menuName.message : null}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label={intl.formatMessage({ id: 'general.icon' })}
                                    {...register('menuIcon', {
                                    })}
                                    error={!!errors?.menuIcon}
                                    helperText={errors?.menuIcon ? errors.menuIcon.message : null}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label={intl.formatMessage({ id: 'general.component' })}
                                    name="menuComponent"
                                    {...register('menuComponent', {
                                    })}
                                    error={!!errors?.menuComponent}
                                    helperText={errors?.menuComponent ? errors.menuComponent.message : null}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label={intl.formatMessage({ id: 'general.url' })}
                                    name="navigateUrl"
                                    {...register('navigateUrl', {
                                    })}
                                    error={!!errors?.navigateUrl}
                                    helperText={errors?.navigateUrl ? errors.navigateUrl.message : null}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type='number'
                                    size='small'
                                    label={intl.formatMessage({ id: 'general.sort_order' })}
                                    name="sortOrder"
                                    {...register('sortOrder', {
                                    })}
                                    error={!!errors?.sortOrder}
                                    helperText={errors?.sortOrder ? errors.sortOrder.message : null}
                                />
                            </Grid>
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
                                <FormControlLabel
                                    control={
                                        <Controller
                                            name='forApp'
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
                                    label='For App'
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label={intl.formatMessage({ id: 'general.language_key' })}
                                    name="languageKey"
                                    {...register('languageKey', {
                                    })}
                                    error={!!errors?.languageKey}
                                    helperText={errors?.languageKey ? errors.languageKey.message : null}
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

export default ModifyMenuDialog