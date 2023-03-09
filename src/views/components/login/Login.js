import { yupResolver } from '@hookform/resolvers/yup';
import { useFormCustom } from '@hooks';
import { firstLogin } from '@utils';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import login_background from '@static/images/login_background.png';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormattedMessage, useIntl } from 'react-intl';

import * as ConfigConstants from '@constants/ConfigConstants';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { loginService, versionAppService } from '@services';
import store from '@states/store';
import { ErrorAlert, RemoveLocalStorage, SetLocalStorage } from '@utils';
import { delayDuration } from '@utils';

const theme = createTheme();

const Login = (props) => {
  const intl = useIntl();
  let isRendered = useRef(false);

  const { language, changeLanguage, history } = props;
  const countries = [
    {
      code: 'EN',
      title: 'English',
    },
    {
      code: 'VI',
      title: 'Tiếng Việt',
    },
  ];

  const appList = [
    {
      app_type: 1,
      name_file: 'hanlim_scan.apk',
    },
    {
      app_type: 2,
      name_file: 'hanlim_display.apk',
    },
    {
      app_type: 3,
      name_file: 'hanlim_actual.apk',
    },
  ];

  // const [languageSelected, setLanguageSelected] = useState(null)

  const [errorMessages, setErrorMessages] = useState(null);

  const initModal = {
    userName: '',
    userPassword: '1234@',
    // userName: '',
    // userPassword: '',
  };
  const { values, setValues, handleInputChange } = useFormCustom(initModal);

  const [btnDownloadState, setBtnDownloadState] = useState('loaded');
  const [btnDownloadDisplayState, setBtnDownloadDisplayState] = useState('loaded');
  const [btnDownloadActualState, setBtnDownloadActualState] = useState('loaded');

  const dataModalRef = useRef(initModal);

  const [isSubmit, setIsSubmit] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleDownload = async (appInfo) => {
    try {
      // appInfo.app_type === 1 ? setBtnDownloadState('loading') : setBtnDownloadDisplayState('loading');
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // await versionAppService.downloadApp(appInfo);
      // appInfo.app_type === 1 ? setBtnDownloadState('loaded') : setBtnDownloadDisplayState('loaded');

      switch (appInfo.app_type) {
        case 1:
          setBtnDownloadState('loading');
          break;

        case 2:
          setBtnDownloadDisplayState('loading');
          break;

        default:
          setBtnDownloadActualState('loading');
          break;
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
      // delayDuration(3000);

      switch (appInfo.app_type) {
        case 1:
          setBtnDownloadState('loaded');
          break;

        case 2:
          setBtnDownloadDisplayState('loaded');
          break;

        default:
          setBtnDownloadActualState('loaded');
          break;
      }

      versionAppService.downloadApp(appInfo);
    } catch (error) {
      console.log(`ERROR: ${error}`);
    }
  };

  const schema = yup.object().shape({
    userName: yup.string().required(<FormattedMessage id="login.userName_required" />),
    userPassword: yup.string().required(<FormattedMessage id="login.userPassword_required" />),

    // userName: yup.string().required(intl.formatMessage({ id: 'login.userName_required' })),
    // userPassword: yup.string().required(intl.formatMessage({ id: 'login.userPassword_required' })),
  });
  const {
    register,
    formState: { errors },
    handleSubmit,
    clearErrors,
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: { ...initModal },
  });

  const submitFormLogin = async (data) => {
    RemoveLocalStorage(ConfigConstants.TOKEN_ACCESS);
    RemoveLocalStorage(ConfigConstants.TOKEN_REFRESH);
    RemoveLocalStorage(ConfigConstants.CURRENT_USER);

    const res = await loginService.handleLogin(data.userName, data.userPassword);
    if (res && res.HttpResponseCode === 200) {
      SetLocalStorage(ConfigConstants.TOKEN_ACCESS, res.Data.accessToken);
      SetLocalStorage(ConfigConstants.TOKEN_REFRESH, res.Data.refreshToken);

      const returnData = await loginService.getUserInfo();

      if (returnData.HttpResponseCode === 200) {
        store.dispatch({
          type: 'Dashboard/USER_LOGIN',
        });

        SetLocalStorage(ConfigConstants.CURRENT_USER, returnData.Data);

        setIsSubmit(false);
        // setValues(initModal);
        clearErrors();

        let routername = history.urlreturn;
        // console.log('routername', routername)
        firstLogin.isfirst = true;

        history.push({
          pathname: routername ?? '/',
          closetab: true,
        });
      } else {
        // setErrorMessages(res.ResponseMessage);
        // errorMessages.push(res.ResponseMessage)
        ErrorAlert(intl.formatMessage({ id: 'login.lost_authorization' }));
        setIsSubmit(false);
      }
    } else {
      setErrorMessages(res.ResponseMessage);
      setIsSubmit(false);
    }
  };

  const setDefaultLanguage = () => {
    if (language === 'VI') {
      return countries[1];
    } else {
      return countries[0];
    }
  };

  // useLayoutEffect(() => {
  //     setLanguageSelected(language);
  // }, []);

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />

        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${login_background})`,
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Box className="content-login">
            <Typography variant="h3">HANLIM</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square className="background-login">
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              <FormattedMessage id="general.signin" />
            </Typography>

            <form onSubmit={handleSubmit(submitFormLogin)}>
              {/* <form onSubmit={(ev) => {
                            // ev.preventDefault()
                            handleSubmit(async (data, ev) => await submitFormLogin(data, ev))
                        }}> */}
              <Box sx={{ mt: 1 }}>
                <TextField
                  sx={{ backgroundColor: '#E8F0FE' }}
                  autoFocus
                  // required
                  fullWidth
                  label={<FormattedMessage id="user.userName" />}
                  name="userName"
                  {...register('userName', {
                    // onChange: (e) => handleInputChange(e)
                  })}
                  error={!!errors?.userName}
                  helperText={errors?.userName ? errors.userName.message : null}
                />
                <TextField
                  sx={{ backgroundColor: '#E8F0FE' }}
                  margin="normal"
                  // required
                  fullWidth
                  name="userPassword"
                  type={showPassword ? 'text' : 'password'}
                  label={<FormattedMessage id="user.userPassword" />}
                  {...register('userPassword', {
                    // onChange: (e) => handleInputChange(e)
                  })}
                  error={!!errors?.userPassword}
                  helperText={errors?.userPassword ? errors.userPassword.message : null}
                  InputProps={{
                    // <-- This is where the toggle button is added.
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Autocomplete
                  disablePortal
                  freeSolo
                  autoHighlight
                  options={countries}
                  sx={{ mt: 1, backgroundColor: '#E8F0FE' }}
                  defaultValue={setDefaultLanguage}
                  onChange={(event, newValue) => {
                    changeLanguage(newValue.code === 'VI' ? 'VI' : 'EN');
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                      {option.code === 'EN' ? (
                        <i className="flag-icon flag-icon-us mr-2"></i>
                      ) : (
                        <i className="flag-icon flag-icon-vi mr-2"></i>
                      )}
                      {option.title}
                    </Box>
                  )}
                  getOptionLabel={(option) => option.title}
                  renderInput={(params) => (
                    <TextField {...params} label={<FormattedMessage id="general.select_language" />} />
                  )}
                />

                <button
                  disabled={isSubmit}
                  style={{ width: '100%', marginTop: '25px' }}
                  type="submit"
                  className="btn btn-primary"
                >
                  {<FormattedMessage id="general.signin" />}
                  {isSubmit && (
                    <span className="spinner-border spinner-border-sm mx-3" role="status" aria-hidden="true"></span>
                  )}
                </button>
              </Box>
            </form>

            {errorMessages && (
              <p style={{ color: 'red', textAlign: 'center' }}>{<FormattedMessage id={errorMessages} />}</p>
            )}

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
              }}
            >
              <Box>
                <button
                  className="btn btn-success"
                  style={{ width: '100%', marginTop: '25px' }}
                  type="submit"
                  onClick={() => handleDownload(appList[0])}
                  disabled={btnDownloadState === 'loading'}
                >
                  {btnDownloadState === 'loaded' ? props.children : 'Loading...'}
                  <span className="d-block" aria-hidden="true">
                    <div
                      className="d-flex"
                      style={{
                        color: 'white',
                        minWidth: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PhoneAndroidIcon />

                      <div className="d-block">
                        <small style={{ opacity: 0.9, fontSize: '18px' }}>Scan</small>
                      </div>
                    </div>
                  </span>
                </button>
              </Box>

              <Box>
                <button
                  className="btn btn-info"
                  style={{ width: '100%', marginTop: '25px' }}
                  type="submit"
                  onClick={() => handleDownload(appList[1])}
                  disabled={btnDownloadDisplayState === 'loading'}
                >
                  {btnDownloadDisplayState === 'loaded' ? props.children : 'Loading...'}
                  <span className="d-block" aria-hidden="true">
                    <div
                      className="d-flex"
                      style={{
                        color: 'white',
                        minWidth: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PhoneAndroidIcon />

                      <div className="d-block">
                        <small style={{ opacity: 0.9, fontSize: '18px' }}>Display</small>
                      </div>
                    </div>
                  </span>
                </button>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
              }}
            >
              <Box>
                <button
                  className="btn btn-warning"
                  style={{ width: '100%', marginTop: '25px' }}
                  type="submit"
                  onClick={() => handleDownload(appList[2])}
                  disabled={btnDownloadActualState === 'loading'}
                >
                  {btnDownloadActualState === 'loaded' ? props.children : 'Loading...'}
                  <span className="d-block" aria-hidden="true">
                    <div
                      className="d-flex"
                      style={{
                        color: 'white',
                        minWidth: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PhoneAndroidIcon />
                      <div className="d-block">
                        <small style={{ opacity: 0.9, fontSize: '18px' }}>Actual</small>
                      </div>
                    </div>
                  </span>
                </button>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Login;
