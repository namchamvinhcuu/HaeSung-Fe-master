import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import { Autocomplete, Box, Checkbox, FormControlLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { userService, roleService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';

const RoleDialog = ({ roleId, initModal, isOpen, onClose, setNewData, mode, loadData }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false })
  const schema = yup.object().shape({
    roleName: yup.string().required(intl.formatMessage({ id: 'role.roleName_required' }))
  });

  const { control, register, setValue, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: initModal
  });

  useEffect(() => {
    if (mode == CREATE_ACTION)
      reset({});
    else
      reset(initModal);
  }, [initModal, mode])

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

    if (mode == CREATE_ACTION) {
      const res = await roleService.createRole({ ...data });
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
    }
    else {
      const res = await roleService.updateRole({ ...data, roleId: initModal.roleId, row_version: initModal.row_version });
      if (res.HttpResponseCode === 200) {
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setDialogState({ ...dialogState, isSubmit: false });
        handleReset();
        handleCloseDialog();
        loadData();
      }
      else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        setDialogState({ ...dialogState, isSubmit: false });
      }
    }

  };

  return (
    <MuiDialog
      maxWidth='sm'
      title={intl.formatMessage({ id: mode == CREATE_ACTION ? 'general.create' : 'general.modify' })}
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
              label={intl.formatMessage({ id: 'role.roleName' })}
              {...register('roleName')}
              error={!!errors?.roleName}
              helperText={errors?.roleName ? errors.roleName.message : null}
            //defaultValue={initModal.roleName}
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

export default RoleDialog