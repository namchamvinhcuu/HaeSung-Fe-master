import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useFormCustom } from "@hooks";
import { firstLogin } from "@utils";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { FormattedMessage, useIntl } from "react-intl";

import { ErrorAlert, SuccessAlert } from "@utils";
import { loginService } from "@services";
import { GetLocalStorage, SetLocalStorage, RemoveLocalStorage } from "@utils";
import * as ConfigConstants from "@constants/ConfigConstants";
import store from "@states/store";

const theme = createTheme();

const Login = (props) => {
  const intl = useIntl();
  let isRendered = useRef(false);

  const { language, changeLanguage, history } = props;
  const countries = [
    {
      code: "EN",
      title: "English",
    },
    {
      code: "VI",
      title: "Tiếng Việt",
    },
  ];

  // const [languageSelected, setLanguageSelected] = useState(null)

  const [errorMessages, setErrorMessages] = useState(null);

  const initModal = {
    userName: "",
    userPassword: "1234@",
    // userName: '',
    // userPassword: '',
  };
  const { values, setValues, handleInputChange } = useFormCustom(initModal);

  const dataModalRef = useRef(initModal);

  const [isSubmit, setIsSubmit] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const schema = yup.object().shape({
    userName: yup
      .string()
      .required(<FormattedMessage id="login.userName_required" />),
    userPassword: yup
      .string()
      .required(<FormattedMessage id="login.userPassword_required" />),

    // userName: yup.string().required(intl.formatMessage({ id: 'login.userName_required' })),
    // userPassword: yup.string().required(intl.formatMessage({ id: 'login.userPassword_required' })),
  });
  const {
    register,
    formState: { errors },
    handleSubmit,
    clearErrors,
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: { ...initModal },
  });

  const submitFormLogin = async (data) => {
    RemoveLocalStorage(ConfigConstants.TOKEN_ACCESS);
    RemoveLocalStorage(ConfigConstants.TOKEN_REFRESH);
    RemoveLocalStorage(ConfigConstants.CURRENT_USER);

    const res = await loginService.handleLogin(
      data.userName,
      data.userPassword
    );
    if (res && res.HttpResponseCode === 200) {
      SetLocalStorage(ConfigConstants.TOKEN_ACCESS, res.Data.accessToken);
      SetLocalStorage(ConfigConstants.TOKEN_REFRESH, res.Data.refreshToken);

      const returnData = await loginService.getUserInfo();

      if (returnData.HttpResponseCode === 200) {
        store.dispatch({
          type: "Dashboard/USER_LOGIN",
        });

        SetLocalStorage(ConfigConstants.CURRENT_USER, returnData.Data);

        setIsSubmit(false);
        // setValues(initModal);
        clearErrors();

        let routername = history.urlreturn;
        // console.log('routername', routername)
        firstLogin.isfirst = true;

        history.push({
          pathname: routername ?? "/",
          closetab: true,
        });
      } else {
        // setErrorMessages(res.ResponseMessage);
        // errorMessages.push(res.ResponseMessage)
        ErrorAlert(intl.formatMessage({ id: "login.lost_authorization" }));
        setIsSubmit(false);
      }
    } else {
      setErrorMessages(res.ResponseMessage);
      setIsSubmit(false);
    }
  };

  const setDefaultLanguage = () => {
    if (language === "VI") {
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
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />

        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Box className="content-login">
            <Typography variant="h3">HANLIM</Typography>
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={6}
          square
          className="background-login"
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
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
                  sx={{ backgroundColor: "#E8F0FE" }}
                  autoFocus
                  // required
                  fullWidth
                  label={<FormattedMessage id="user.userName" />}
                  name="userName"
                  {...register("userName", {
                    // onChange: (e) => handleInputChange(e)
                  })}
                  error={!!errors?.userName}
                  helperText={errors?.userName ? errors.userName.message : null}
                />
                <TextField
                  sx={{ backgroundColor: "#E8F0FE" }}
                  margin="normal"
                  // required
                  fullWidth
                  name="userPassword"
                  type={showPassword ? "text" : "password"}
                  label={<FormattedMessage id="user.userPassword" />}
                  {...register("userPassword", {
                    // onChange: (e) => handleInputChange(e)
                  })}
                  error={!!errors?.userPassword}
                  helperText={
                    errors?.userPassword ? errors.userPassword.message : null
                  }
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
                  sx={{ mt: 1, backgroundColor: "#E8F0FE" }}
                  defaultValue={setDefaultLanguage}
                  onChange={(event, newValue) => {
                    changeLanguage(newValue.code === "VI" ? "VI" : "EN");
                  }}
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                      {...props}
                    >
                      {option.code === "EN" ? (
                        <i className="flag-icon flag-icon-us mr-2"></i>
                      ) : (
                        <i className="flag-icon flag-icon-vi mr-2"></i>
                      )}
                      {option.title}
                    </Box>
                  )}
                  getOptionLabel={(option) => option.title}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<FormattedMessage id="general.select_language" />}
                    />
                  )}
                />

                <button
                  disabled={isSubmit}
                  style={{ width: "100%", marginTop: "25px" }}
                  type="submit"
                  className="btn btn-primary"
                >
                  {<FormattedMessage id="general.signin" />}
                  {isSubmit && (
                    <span
                      className="spinner-border spinner-border-sm mx-3"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                </button>
              </Box>
            </form>

            {errorMessages && (
              <p style={{ color: "red", textAlign: "center" }}>
                {<FormattedMessage id={errorMessages} />}
              </p>
            )}
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Login;
