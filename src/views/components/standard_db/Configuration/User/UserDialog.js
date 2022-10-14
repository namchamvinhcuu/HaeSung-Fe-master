import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import { Autocomplete, Checkbox, FormControlLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { userService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'

const UserDialog = ({ initModal, isOpen, onClose, setNewData, rowData }) => {
  const intl = useIntl();
  const [roleList, setRoleList] = useState([]);
  const [dialogState, setDialogState] = useState({ isSubmit: false })
  const [roleUser, setRoleUser] = useState([]);

  const schema = yup.object().shape({
    userName: yup.string().required(intl.formatMessage({ id: 'user.userName_required' })),
    userPassword: yup.string().required(intl.formatMessage({ id: 'user.userPassword_required' })),
  });

  const { control, register, setValue, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      userName: '',
      userPassword: '',
    }
  });

  const handleReset = () => {
    reset();
    setRoleUser([]);
    clearErrors();
    setDialogState({ ...dialogState })
  }

  const handleCloseDialog = () => {
    reset();
    clearErrors();
    setDialogState({ ...dialogState })
    onClose();
  }

  const getRoles = async () => {
    const res = await userService.getAllRole();
    if (res.HttpResponseCode === 200 && res.Data) {
      setRoleList([...res.Data])
    }
  }

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    const res = await userService.createUser(data);

    if (res.HttpResponseCode === 200 && res.Data) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
      setNewData({ ...res.Data });
      setDialogState({ ...dialogState, isSubmit: false });
      handleReset();
      handleCloseDialog();
    }
    else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
      setDialogState({ ...dialogState, isSubmit: false });
    }
  };

  useEffect(() => {
    getRoles();
  }, [])

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
              label={intl.formatMessage({ id: 'user.userName' })}
              {...register('userName')}
              error={!!errors?.userName}
              helperText={errors?.userName ? errors.userName.message : null}
              defaultValue={rowData.userName}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
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
            <Controller
              control={control}
              name="Roles"
              render={({ field: { onChange, value } }) => {
                return (
                  <Autocomplete
                    multiple
                    fullWidth
                    size='small'
                    options={roleList}
                    autoHighlight
                    openOnFocus
                    value={roleUser}
                    getOptionLabel={option => option.roleName}
                    defaultValue={initModal}
                    onChange={(e, item) => {
                      setValue("Roles", item ?? []);
                      setRoleUser(item ?? []);
                    }}
                    disableCloseOnSelect
                    renderInput={(params) => {
                      return <TextField
                        {...params}
                        label={intl.formatMessage({ id: 'user.roleName' })}
                      // error={!!errors.parentId}
                      // helperText={errors?.parentId ? errors.parentId.message : null}
                      />
                    }}
                  />
                );
              }}
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

export default UserDialog