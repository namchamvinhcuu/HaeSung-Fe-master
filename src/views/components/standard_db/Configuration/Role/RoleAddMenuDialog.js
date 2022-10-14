import React, { useEffect, useRef, useState } from 'react'
import { MuiDialog, MuiResetButton, MuiSubmitButton } from '@controls'
import { yupResolver } from '@hookform/resolvers/yup'
import { Autocomplete, Box, Checkbox, FormControlLabel, Grid, Radio, RadioGroup, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import * as yup from 'yup'
import { userService, roleService } from '@services'
import { ErrorAlert, SuccessAlert } from '@utils'

const RoleAddMenuDialog = ({ roleId, initModal, isOpen, onClose, setNewData, rowData, loadData }) => {
  const intl = useIntl();
  const [menuList, setMenuList] = useState([]);
  const [dialogState, setDialogState] = useState({ isSubmit: false })

  const schema = yup.object().shape({
    Menus: yup.array().min(1, intl.formatMessage({ id: 'menu.menuName_required' })).required(intl.formatMessage({ id: 'menu.menuName_required' }))
  });

  const { control, register, setValue, formState: { errors }, handleSubmit, clearErrors, reset } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
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

  const getMenus = async () => {
    const res = await roleService.getAllMenu();
    if (res.HttpResponseCode === 200 && res.Data) {
      setMenuList([...res.Data])
    }
  }

  const onSubmit = async (data) => {
    setDialogState({ ...dialogState, isSubmit: true });

    const res = await roleService.addMenu({ ...data, roleId: roleId });

    if (res.HttpResponseCode === 200) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }))
      setNewData({ ...res.Data });
      setDialogState({ ...dialogState, isSubmit: false });
      handleReset();
      handleCloseDialog();
      loadData(roleId);
    }
    else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
      setDialogState({ ...dialogState, isSubmit: false });
    }
  };

  useEffect(() => {
    getMenus();
  }, [])

  return (
    <MuiDialog
      maxWidth='sm'
      title={intl.formatMessage({ id: 'role.addMenu' })}
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
              name="Menus"
              render={({ field: { onChange, value } }) => {
                return (
                  <Autocomplete
                    multiple
                    fullWidth
                    size='small'
                    options={menuList}
                    autoHighlight
                    openOnFocus
                    getOptionLabel={option => option.menuName}
                    defaultValue={initModal}
                    groupBy={(option) => option.ParentMenuName}
                    onChange={(e, item) => {
                      if (item) {
                        setValue("Menus", item ?? []);
                      }
                      else {
                        setValue("Menus", []);
                      }
                    }}
                    disableCloseOnSelect={true}
                    renderGroup={(params) => {
                      return (
                        <div key={"group" + params.key}>
                          <div style={{ textIndent: '10px', marginBottom: 10 }}>
                            <span style={{ fontSize: 14 }} className="badge badge-primary">{params.group}</span>
                          </div>
                          <div style={{ textIndent: '30px', marginBottom: 10 }}>
                            {params.children}
                          </div>
                        </div>
                      )
                    }}
                    // renderOption={(props, option) => (
                    //   <Box  component="li" {...props} key={option.value}>
                    //     <Checkbox
                    //       checked={options_checked[option.value] ?? false}
                    //       sx={{ m: 0, p: 0 }}
                    //       onChange={(e) => setOptions_Checked({ ...options_checked, [option.value]: e.target.checked })}
                    //     />
                    //     <span style={{ marginLeft: "-20px" }}>{option.title}</span>
                    //   </Box>
                    // )}
                    renderInput={(params) => {
                      return <TextField
                        {...params}
                        label={intl.formatMessage({ id: 'menu.menuName' })}
                        error={!!errors.Menus}
                        helperText={errors?.Menus ? errors.Menus.message : null}
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
              {/* <MuiResetButton onClick={handleReset} disabled={dialogState.isSubmit} /> */}
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MuiDialog>
  )
}

export default RoleAddMenuDialog