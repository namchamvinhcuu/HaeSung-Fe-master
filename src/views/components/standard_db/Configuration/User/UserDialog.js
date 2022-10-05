import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import { Autocomplete, Checkbox, FormControlLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'

import { userService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION } from '../../../../../constants/ConfigConstants'

const UserDialog = ({ initModal, isOpen, onClose, setNewData, rowData, dialogMode }) => {
  const intl = useIntl();
  const [roleList, setRoleList] = useState([]);
  const dataModalRef = useRef({ ...initModal });
  const clearParent = useRef(null);
  const [dialogState, setDialogState] = useState({
    isSubmit: false,
    menuLevel: 3,
  })

  const schema = yup.object().shape({
    userName: yup.string().required(intl.formatMessage({ id: 'user.userName_required' })),
    userPassword: yup.string().required(intl.formatMessage({ id: 'user.userPassword_required' })),
  });

  const { control, register, setValue, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema)
  });

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

  const getRoles = async () => {
    const res = await userService.getAllRole();
    if (res.HttpResponseCode === 200 && res.Data) {
      setRoleList([...res.Data])
    }
  }

  const onSubmit = async (data) => {
    dataModalRef.current = { ...initModal, ...data };
    setDialogState({ ...dialogState, isSubmit: true });

    if (dialogMode == CREATE_ACTION) {

      const res = await userService.createUser(dataModalRef.current);

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
    }
    else {
      const res = await userService.createUser(dataModalRef.current);

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
              name="roles"
              render={({ field: { onChange, value } }) => {
                return (
                  <Autocomplete
                    multiple
                    ref={clearParent}
                    fullWidth
                    size='small'
                    options={roleList}
                    autoHighlight
                    openOnFocus
                    getOptionLabel={option => option.roleName}
                    defaultValue={initModal}
                    onChange={(e, item) => {
                      console.log(item)
                      if (item) {
                        onChange(item.roleId ?? '');
                      }
                      else {
                        onChange('')
                      }
                    }}
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