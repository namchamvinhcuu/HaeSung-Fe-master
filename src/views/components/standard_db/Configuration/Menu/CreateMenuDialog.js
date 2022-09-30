import React, { useEffect, useState } from 'react'
import {
    Grid
    , TextField
    , FormControl
    , FormLabel
    , RadioGroup
    , FormControlLabel
    , Radio
} from '@mui/material'
import { FormattedMessage } from 'react-intl'
import { MuiDropDownList } from '@controls'
import { useFormCustom } from '@hooks'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const CreateMenuDialog = (props) => {

    const { initModal } = props;

    const {
        values,
        setValues,
        handleInputChange
    } = useFormCustom(initModal);

    const schema = yup.object().shape({
        userName: yup.string().required(<FormattedMessage id="login.userName_required" />),
        userPassword: yup.string().required(<FormattedMessage id="login.userPassword_required" />),
    });
    const { register, formState: { errors }, handleSubmit, clearErrors } = useForm({
        mode: 'onChange',
        resolver: yupResolver(schema)
    });

    return (
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <Grid container spacing={2}>

                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            fullWidth
                            label={<FormattedMessage id='general.name' />}
                            name="menuName"
                            value={values.menuName}
                            {...register('menuName', {
                                onChange: (e) => handleInputChange(e)
                            })}
                            error={!!errors?.menuName}
                            helperText={errors?.menuName ? errors.menuName.message : null}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            fullWidth
                            label={<FormattedMessage id='general.icon' />}
                            name="menuIcon"
                            value={values.menuIcon}
                            {...register('menuIcon', {
                                onChange: (e) => handleInputChange(e)
                            })}
                            error={!!errors?.menuIcon}
                            helperText={errors?.menuIcon ? errors.menuIcon.message : null}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            fullWidth
                            label={<FormattedMessage id='general.component' />}
                            name="menuComponent"
                            value={values.menuComponent}
                            {...register('menuComponent', {
                                onChange: (e) => handleInputChange(e)
                            })}
                            error={!!errors?.menuComponent}
                            helperText={errors?.menuComponent ? errors.menuComponent.message : null}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            fullWidth
                            label={<FormattedMessage id='general.url' />}
                            name="navigateUrl"
                            value={values.navigateUrl}
                            {...register('navigateUrl', {
                                onChange: (e) => handleInputChange(e)
                            })}
                            error={!!errors?.navigateUrl}
                            helperText={errors?.navigateUrl ? errors.navigateUrl.message : null}
                        />
                    </Grid>
                </Grid>
            </Grid>

            <Grid item xs={6}>
                <Grid container spacing={2}>

                    <Grid item xs={12}>
                        <FormControl>
                            <FormLabel>
                                <FormattedMessage id='general.level' />
                            </FormLabel>
                            <RadioGroup
                                row
                                name="menuLevel"
                            >
                                <FormControlLabel value="1" control={<Radio />} label="1" />
                                <FormControlLabel value="2" control={<Radio />} label="2" />
                                <FormControlLabel value="3" control={<Radio />} label="3" />

                            </RadioGroup>
                        </FormControl>
                    </Grid>

                    {/* <Grid item xs={12}>
                        <FormControl margin="dense" fullWidth>
                            <MuiDropDownList
                                required
                                fullWidth
                                placeholder="Product Model"
                                url={`${ApiName}/get-product-model`}
                                onChange={e => {
                                    setInfo({ ...info, model_id: e.value });
                                }}
                                defaultValue={{ title: data.model_name, value: data.model_id }}
                            />
                        </FormControl>
                    </Grid> */}

                    {/* <Grid item xs={12}>
                        <FastField
                            name="ForRoot"
                            label="For Root Only ?"
                            options={trueFalseItems}
                            row={+true}

                            component={FormikControl.RadioGroup}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FastField
                            name="SortOrder"
                            label="Sort Order"

                            component={FormikControl.Input}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <FormikControl.ButtonReset />
                            </Grid>
                            <Grid item xs={6}>
                                <FormikControl.ButtonSubmit />
                            </Grid>
                        </Grid>
                    </Grid> */}
                </Grid>
            </Grid>
        </Grid>
    )
}

export default CreateMenuDialog