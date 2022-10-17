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

import { menuService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'

const CreateMenuDialog = (props) => {
    const intl = useIntl();
    let isRendered = useRef(true);

    const { initModal, isOpen, onClose, setNewData } = props;

    const [parentMenuArr, setParentMenuArr] = useState([initModal]);

    const dataModalRef = useRef({ ...initModal });
    const clearParent = useRef(null);
    const [dialogState, setDialogState] = useState({
        isSubmit: false,
        menuLevel: 3,
    });

    const schema = yup.object().shape({
        menuName: yup.string().required(intl.formatMessage({ id: 'menu.menuName_required' })),

        // menuIcon: yup.string().required(intl.formatMessage({ id: 'menu.menuName_required' })),

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

        menuLevel: yup.number().required(),


        parentId: yup.string().nullable()
            .when("menuLevel", (menuLevel) => {
                if (parseInt(menuLevel) > 1) {
                    return yup.number()
                        .required()
                        .typeError(intl.formatMessage({ id: 'menu.parentId_required' }))
                }
            }),
    });
    const { control, register, setValue, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
        mode: 'onChange',
        resolver: yupResolver(schema),
        defaultValues: {
            ...initModal,
            menuLevel: 3,
            parentId: initModal.menuId

        },
    });

    const getParentMenus = async (menuLevel) => {
        const res = await menuService.getParentMenus(menuLevel);
        if (res && isRendered)
            if (res.HttpResponseCode === 200 && res.Data) {
                setParentMenuArr([...res.Data])
            }
            else {
                setParentMenuArr([])
            }
    }

    const handleReset = () => {
        reset();
        clearErrors();
        setDialogState({
            ...dialogState,
            menuLevel: 3
        })
    }

    const handleCloseDialog = () => {
        reset();
        clearErrors();
        setDialogState({
            ...dialogState,
            menuLevel: 3
        })
        onClose();
    }

    const onSubmit = async (data) => {
        dataModalRef.current = { ...initModal, ...data, sortOrder: 0, parentId: data.parentId === '' ? 0 : data.parentId };
        setDialogState({ ...dialogState, isSubmit: true });

        const res = await menuService.createMenu(dataModalRef.current);

        if (res && isRendered)
            if (res.HttpResponseCode === 200 && res.Data) {
                SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
                setNewData({ ...res.Data });
                setDialogState({ ...dialogState, isSubmit: false });
                handleReset();
                handleCloseDialog();
            }
            else {
                ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
            }

    };

    useEffect(() => {
        if (isOpen)
            getParentMenus(dialogState.menuLevel);

        return () => {
            isRendered = false;
        }
    }, [isOpen, dialogState.menuLevel])

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
                            <Grid item xs={6} style={{ display: 'flex', justifyContent: 'center' }}>

                                <span style={{ marginTop: '5px', marginRight: '16px', fontWeight: '700' }}>
                                    {intl.formatMessage({ id: 'general.level' })}
                                </span>
                                <Controller
                                    rules={{ required: true }}
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
                                                <FormControlLabel value={1} control={<Radio size="small" />} label="1" />
                                                <FormControlLabel value={2} control={<Radio size="small" />} label="2" />
                                                <FormControlLabel value={3} control={<Radio size="small" />} label="3" />
                                            </RadioGroup>
                                        );
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                {dialogState.menuLevel > 1
                                    && <Controller
                                        control={control}
                                        name="parentId"
                                        render={({ field: { onChange, value } }) => {
                                            return (
                                                <Autocomplete
                                                    // multiple
                                                    // disablePortal
                                                    freeSolo
                                                    ref={clearParent}
                                                    fullWidth
                                                    size='small'
                                                    options={parentMenuArr}
                                                    autoHighlight
                                                    openOnFocus
                                                    getOptionLabel={option => option.menuName}
                                                    isOptionEqualToValue={(option, value) => option.menuId === value.menuId}
                                                    // value={value => {
                                                    //     parentMenuArr.forEach(element => {
                                                    //         if (element.menuId === value) {
                                                    //             return element.menuName
                                                    //         }
                                                    //     })
                                                    // }}
                                                    // getOptionSelected={(option, value) =>
                                                    //     value === undefined || value === "" || option.menuId === value.menuId
                                                    // }
                                                    defaultValue={initModal}
                                                    onChange={(e, item) => {

                                                        if (item) {
                                                            onChange(item.menuId ?? '');
                                                        }
                                                        else {
                                                            onChange('')
                                                        }
                                                    }}
                                                    renderInput={(params) => {
                                                        return <TextField
                                                            {...params}
                                                            label={intl.formatMessage({ id: 'general.parent' })}
                                                            error={!!errors.parentId}
                                                            helperText={errors?.parentId ? errors.parentId.message : null}
                                                        />
                                                    }}
                                                />
                                            );
                                        }}
                                    />
                                }
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
                                    size='small'
                                    label={intl.formatMessage({ id: 'general.language_key' })}
                                    name="languageKey"
                                    {...register('languageKey', {
                                    })}
                                    error={!!errors?.languageKey}
                                    helperText={errors?.languageKey ? errors.languageKey.message : null}
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

export default CreateMenuDialog