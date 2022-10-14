import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import { Autocomplete, Checkbox, FormControlLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { userService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'

const UserRoleDialog = ({ isOpen, onClose, setNewData, rowData, loadData }) => {
  const intl = useIntl();
  const [roleList, setRoleList] = useState([]);
  const [roleUser, setRoleUser] = useState([]);
  const [dialogState, setDialogState] = useState({ isSubmit: false })

  const schema = yup.object().shape({
    //Roles: yup.object().nullable(intl.formatMessage({ id: 'menu.menuName_required' })),
  });

  const { control, register, setValue, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {}
  });

  const handleReset = () => {
    reset();
    clearErrors();
    getRolesByUser(rowData.userId)
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

  const getRolesByUser = async (userId) => {
    const res = await userService.getRoleByUser(userId);
    if (res) {
      setValue("Roles", res);
      setRoleUser(res);
    }
  }

  const onSubmit = async (data) => {
    data = { ...data, userId: rowData.userId };
    setDialogState({ ...dialogState, isSubmit: true });

    const res = await userService.changeRoles(data);

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
  };

  useEffect(() => {
    getRoles();
    getRolesByUser(rowData.userId);
  }, [rowData])

  return (
    <MuiDialog
      maxWidth='sm'
      title={intl.formatMessage({ id: 'user.roleName' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
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
                    disableCloseOnSelect
                    getOptionLabel={option => option.roleName}
                    isOptionEqualToValue={(option, value) =>
                      option.roleId === value.roleId
                    }
                    onChange={(e, item) => {
                      setValue("Roles", item ?? []);
                      setRoleUser(item ?? []);
                    }}
                    renderInput={(params) => {
                      return <TextField
                        {...params}
                        label={intl.formatMessage({ id: 'user.roleName' })}
                        error={!!errors.Roles}
                        helperText={errors?.Roles ? errors.Roles.message : null}
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

export default UserRoleDialog