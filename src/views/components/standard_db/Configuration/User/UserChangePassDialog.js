import { MuiDialog, MuiSubmitButton } from '@controls';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  FormControl,
  FormHelperText,
  Grid,
  TextField,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import { userService } from '@services';
import { ErrorAlert, SuccessAlert, GetLocalStorage } from '@utils';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { useFormik } from 'formik';
import * as ConfigConstants from '@constants/ConfigConstants';

const UserChangePassDialog = ({ isOpen, onClose }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const [hide, setHide] = useState({ userPassword: false, newPassword: false, confirmPassword: false });

  const schema = yup.object().shape({
    userPassword: yup
      .string()
      .nullable()
      .required(intl.formatMessage({ id: 'user.userPassword_required' })),
    newPassword: yup
      .string()
      .nullable()
      .required(intl.formatMessage({ id: 'user.newPassword_required' })),
    confirmPassword: yup
      .string()
      // .nullable()
      .required(intl.formatMessage({ id: 'user.confirmPassword_required' }))
      .oneOf([yup.ref('newPassword')], intl.formatMessage({ id: 'user.confirmPassword_notmatch' })),
  });

  const formik = useFormik({
    validationSchema: schema,
    initialValues: {
      userPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  //const { handleChange, handleSubmit, values, errors, resetForm, touched } = formik;
  const { handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched, isValid, resetForm } = formik;

  const handleCloseDialog = () => {
    resetForm();
    setDialogState({ ...dialogState });
    onClose();
  };

  const onSubmit = async (data) => {
    const currentUser = GetLocalStorage(ConfigConstants.CURRENT_USER);

    setDialogState({ ...dialogState, isSubmit: true });
    var data = { ...data, userName: currentUser.userName };
    const res = await userService.changePassword(data);

    if (res.HttpResponseCode === 200) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setDialogState({ ...dialogState, isSubmit: false });
      handleCloseDialog();
    } else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setDialogState({ ...dialogState, isSubmit: false });
    }
  };

  useEffect(() => {
    console.log('touched: ', touched);
    console.log('errors: ', errors);
  }, [values]);

  return (
    <MuiDialog
      maxWidth="sm"
      title={intl.formatMessage({ id: 'general.changepassword' })}
      isOpen={isOpen}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
    >
      <form onSubmit={handleSubmit}>
        <Grid container rowSpacing={2.5} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={12}>
            <TextField
              type={hide.userPassword ? 'text' : 'password'}
              autoFocus
              fullWidth
              size="small"
              name="userPassword"
              inputProps={{ maxLength: 10 }}
              disabled={dialogState.isSubmit}
              value={values.userPassword || ''}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'user.userPassword' })}
              error={touched.userPassword && Boolean(errors.userPassword)}
              helperText={touched.userPassword && errors.userPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setHide({ ...hide, userPassword: !hide.userPassword })} edge="end">
                      {hide.userPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              type={hide.newPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              name="newPassword"
              inputProps={{ maxLength: 10 }}
              disabled={dialogState.isSubmit}
              value={values.newPassword || ''}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'user.newPassword' })}
              error={touched.newPassword && Boolean(errors.newPassword)}
              helperText={touched.newPassword && errors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setHide({ ...hide, newPassword: !hide.newPassword })} edge="end">
                      {hide.newPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              type={hide.confirmPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              name="confirmPassword"
              inputProps={{ maxLength: 10 }}
              disabled={dialogState.isSubmit}
              value={values.confirmPassword || ''}
              onChange={handleChange}
              label={intl.formatMessage({ id: 'user.confirmPassword' })}
              error={touched.confirmPassword && Boolean(errors.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setHide({ ...hide, confirmPassword: !hide.confirmPassword })} edge="end">
                      {hide.confirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Grid container direction="row-reverse">
              <MuiSubmitButton text="save" loading={dialogState.isSubmit} />
            </Grid>
          </Grid>
        </Grid>
      </form>
    </MuiDialog>
  );
};

export default UserChangePassDialog;
