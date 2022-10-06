import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import { Autocomplete, Checkbox, FormControlLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { userService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'

const UserPasswordDialog = ({ initModal, isOpen, onClose, setNewData, rowData, dialogMode }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false })

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
            <TextField
              autoFocus
              fullWidth
              size='small'
              label={intl.formatMessage({ id: 'user.userPassword' })}
              {...register('userPassword')}
              error={!!errors?.userPassword}
              helperText={errors?.userPassword ? errors.userPassword.message : null}
              defaultValue={rowData.userPassword}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size='small'
              label={intl.formatMessage({ id: 'user.newPassword' })}
              {...register('newPassword')}
              error={!!errors?.newPassword}
              helperText={errors?.newPassword ? errors.newPassword.message : null}
              defaultValue={rowData.newPassword}
            />
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