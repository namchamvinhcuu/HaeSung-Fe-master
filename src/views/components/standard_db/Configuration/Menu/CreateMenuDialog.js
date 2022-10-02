import React, { useEffect, useState, useRef } from 'react'
import {
    Grid
    , TextField
    , RadioGroup
    , FormControl
    , FormControlLabel
    , Radio
    , Autocomplete
} from '@mui/material'
import Typography from '@mui/material/Typography'
import { FormattedMessage, useIntl } from 'react-intl'
import { MuiDropDownList, MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import { API_URL } from '@constants/ConfigConstants'

const CreateMenuDialog = (props) => {
    const intl = useIntl();

    const { initModal, isOpen, onClose } = props;

    const [parentMenuArr, setParentMenuArr] = useState([]);

    const dataModalRef = useRef(initModal);
    const [dialogState, setDialogState] = useState({
        isSubmit: false,
        menuLevel: 3,
    })

    const schema = yup.object().shape({
        // menuName: yup.string().required(<FormattedMessage id="login.userName_required" />),
        // menuIcon: yup.string().required(<FormattedMessage id="login.userPassword_required" />),
    });
    const { control, register, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
        mode: 'onChange',
        resolver: yupResolver(schema),
        defaultValues: {
            ...initModal,
            menuLevel: 3,
        },
    });

    const handleCreateMenu = async (params) => {

    }

    const handleReset = () => {
        reset();
        clearErrors();
    }

    const handleCloseDialog = () => {
        reset();
        clearErrors();
        onClose();
    }

    const onSubmit = async (data) => {
        dataModalRef.current = { ...initModal, ...data };
        setDialogState({ ...dialogState, isSubmit: true });
        console.log(dataModalRef.current)

        // await handleCreateMenu(dataModalRef.current);
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();

        // handleCloseDialog();
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

                    <Grid item xs={6}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    autoFocus
                                    fullWidth
                                    size='small'
                                    label={<FormattedMessage id='general.name' />}
                                    {...register('menuName', {
                                        // onChange: (e) => handleInputChange(e)
                                    })}
                                    error={!!errors?.menuName}
                                    helperText={errors?.menuName ? errors.menuName.message : null}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label={<FormattedMessage id='general.icon' />}
                                    {...register('menuIcon', {
                                    })}
                                    error={!!errors?.menuIcon}
                                    helperText={errors?.menuIcon ? errors.menuIcon.message : null}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label={<FormattedMessage id='general.component' />}
                                    name="menuComponent"
                                    {...register('menuComponent', {
                                    })}
                                    error={!!errors?.menuComponent}
                                    helperText={errors?.menuComponent ? errors.menuComponent.message : null}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label={<FormattedMessage id='general.url' />}
                                    name="navigateUrl"
                                    {...register('navigateUrl', {
                                    })}
                                    error={!!errors?.navigateUrl}
                                    helperText={errors?.navigateUrl ? errors.navigateUrl.message : null}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={6}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>

                                <span style={{ marginTop: '5px', marginRight: '16px', fontWeight: '700' }}>
                                    <FormattedMessage id='general.level' />
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

                                                }}
                                            >
                                                <FormControlLabel value="1" control={<Radio size="small" />} label="1" />
                                                <FormControlLabel value="2" control={<Radio size="small" />} label="2" />
                                                <FormControlLabel value="3" control={<Radio size="small" />} label="3" />
                                            </RadioGroup>
                                        );
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                {/* <FormControl margin="dense" fullWidth>
                                    <MuiDropDownList
                                        fullWidth
                                        placeholder="general.parent"
                                        url={`${API_URL}menu/get-by-level?menuLevel=${dialogState.menuLevel}`}
                                        onChange={e => {
                                            setInfo({ ...info, menuName: e.value });
                                        }}
                                        defaultValue={{ title: info.menuName, value: info.menuId }}
                                    />
                                </FormControl> */}

                                <Autocomplete
                                    disablePortal
                                    fullWidth
                                    options={parentMenuArr}
                                    renderInput={(params) => <TextField size='small' {...params} label={intl.formatMessage({ id: 'general.parent' })} />}
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