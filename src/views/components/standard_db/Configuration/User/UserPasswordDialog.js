import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import { Autocomplete, Checkbox, FormControl, FormControlLabel, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, OutlinedInput, Radio, RadioGroup, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { userService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { Visibility, VisibilityOff } from '@mui/icons-material'

const UserPasswordDialog = ({ isOpen, onClose, setNewData, rowData }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false })
  const [hide, setHide] = useState({ userPassword: false, newPassword: false })

  const schema = yup.object().shape({
    userPassword: yup.string().required(intl.formatMessage({ id: 'user.userPassword_required' })),
    newPassword: yup.string().required(intl.formatMessage({ id: 'user.newPassword_required' })),
  });

  const { control, register, setValue, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      newPassword: '',
      userPassword: '',
      userName: rowData.userName
    }
  });

  const handleReset = () => {
    reset();
    clearErrors();
    setDialogState({ ...dialogState })
  }

  const handleCloseDialog = () => {
    reset();
    clearErrors();
    setDialogState({ ...dialogState })
    onClose();
  }

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });
    var data = { ...data, userName: rowData.userName }
    const res = await userService.changePassword(data);

    if (res.HttpResponseCode === 200) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
      setDialogState({ ...dialogState, isSubmit: false });
      handleReset();
      handleCloseDialog();
    }
    else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
      setDialogState({ ...dialogState, isSubmit: false });
    }
  };

  return (
    <MuiDialog
      maxWidth='sm'
      title={intl.formatMessage({ id: 'general.changepassword' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={12}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel size='small' htmlFor="userPassword" style={errors?.userPassword ? { color: "#d32f2f" } : null}>{intl.formatMessage({ id: 'user.userPassword' })}</InputLabel>
              <OutlinedInput
                autoFocus
                fullWidth
                id="userPassword"
                type={hide.userPassword ? 'text' : 'password'}
                size='small'
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => setHide({ ...hide, userPassword: !hide.userPassword })} edge="end">
                      {hide.userPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label={intl.formatMessage({ id: 'user.userPassword' })}
                {...register('userPassword')}
                error={!!errors?.userPassword}
                helperText={errors?.userPassword ? errors.userPassword.message : null}
              />
              {errors?.userPassword && <FormHelperText error id="userPassword"> {errors?.userPassword.message} </FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel size='small' htmlFor="newPassword" style={errors?.newPassword ? { color: "#d32f2f" } : null}>{intl.formatMessage({ id: 'user.newPassword' })}</InputLabel>
              <OutlinedInput
                fullWidth
                id="newPassword"
                type={hide.newPassword ? 'text' : 'password'}
                size='small'
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => setHide({ ...hide, newPassword: !hide.newPassword })} edge="end">
                      {hide.newPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label={intl.formatMessage({ id: 'user.newPassword' })}
                {...register('newPassword')}
                error={!!errors?.newPassword}
                helperText={errors?.newPassword ? errors.newPassword.message : null}
              />
              {errors?.newPassword && <FormHelperText error id="newPassword"> {errors?.newPassword.message} </FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
              <MuiResetButton onClick={handleReset} disabled={dialogState.isSubmit} />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MuiDialog>
  )
}

export default UserPasswordDialog