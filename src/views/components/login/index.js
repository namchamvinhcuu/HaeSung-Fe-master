import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from '@mui/material/TextField';
import Typography from "@mui/material/Typography";
import { HasValue, MapFormToModelData } from "@plugins/helperJS";
import { firstLogin, login } from "@utils";
import React, { Component } from "react";
import { FormattedMessage } from 'react-intl';
import { reduxForm } from "redux-form";

import { api_download } from '@utils';

import { loginService } from '@services'
import { GetLocalStorage, SetLocalStorage, RemoveLocalStorage } from '@utils'
import * as ConfigConstants from '@constants/ConfigConstants'
import store from '@states/store'

const theme = createTheme();
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // ...initModal,
      errorMessages: [],
      isLoading: false,
      langcode: "",
      countries: [
        {
          code: 'en-US',
          fcode: 'US',
          label: 'English',
        },
        {
          code: 'vi-VN'
          , fcode: 'VN'
          , label: 'Tiếng Việt'
        },
      ]
    };
    this.username = React.createRef();
    this.password = React.createRef();
  }

  // initModal = {
  //   userName: 'root',
  //   passWord: '1234@',
  //   isShowPassword: false,
  //   resErrorMessage: '',
  // }

  componentDidMount = () => {

  }

  changeLanguageValue = () => {
    if (this.state.countries && this.state.countries.length > 0) {
      if (this.props.language === "VI") {
        return this.state.countries[1];
      }
      if (this.props.language === "EN") {
        return this.state.countries[0];
      }
    }
    return null;
  }

  download_apk(e) {
    e.preventDefault();
    api_download('EquipmentManagerApi/download-apk', "android_setup.apk")
  }

  changeLanguage = async (language) => {
    //fire redux actions
    this.props.changeLanguage(language);
  }

  onLogin = async (e) => {
    e.preventDefault();
    this.setState((previousState) => ({
      ...previousState,
      errorMessages: [],
    }));

    const model = MapFormToModelData(e.target);
    if (model) {

      const errorMessages = [];
      if (model.username === "" || !HasValue(model.username)) {
        errorMessages.push("Bạn chưa nhập tên đăng nhập");
        this.username.current.focus();
      }
      if (model.password === "" || !HasValue(model.password)) {
        errorMessages.push("Bạn chưa nhập mật khẩu");
      }

      if (errorMessages.length > 0) {
        this.setState((previousState) => ({
          ...previousState,
          errorMessages,
        }));
      } else {
        this.setState((previousState) => ({
          ...previousState,
          isLoading: true,
        }));

        // login(
        //   model.username,
        //   model.password,
        //   this.state.langcode,
        //   model.rememberMe
        // )
        //   .then((data) => {
        //     this.setState((previousState) => ({
        //       ...previousState,
        //       isLoading: false,
        //     }));

        //     var routername = this.props.history.urlreturn;
        //     firstLogin.isfirst = true;

        //     this.props.history.push({
        //       pathname: routername ?? "/",
        //       closetab: false,
        //     });
        //   })
        //   .catch((errors) => {
        //     const errorMessages = [];

        //     if (typeof errors === "string") {
        //       errorMessages.push(errors.trim());
        //     } else if (typeof errors === "object") {
        //       for (let key in errors) {
        //         errorMessages.push(errors[key]);
        //       }
        //     }
        //     this.setState((previousState) => ({
        //       ...previousState,
        //       errorMessages,
        //       isLoading: false,
        //     }));
        //   });

        const res = await loginService.handleLogin(model.username, model.password);
        if (res && res.HttpResponseCode === 200) {
          RemoveLocalStorage(ConfigConstants.TOKEN_ACCESS);
          RemoveLocalStorage(ConfigConstants.TOKEN_REFRESH);

          SetLocalStorage(ConfigConstants.TOKEN_ACCESS, res.Data.accessToken);
          SetLocalStorage(ConfigConstants.TOKEN_REFRESH, res.Data.refreshToken);

          const returnData = await loginService.getUserInfo();
          if (returnData.HttpResponseCode === 200) {
            store.dispatch({
              type: 'Dashboard/USER_LOGIN',
            });

            RemoveLocalStorage(ConfigConstants.CURRENT_USER);
            SetLocalStorage(ConfigConstants.CURRENT_USER, returnData.Data)

            this.setState((previousState) => ({
              ...previousState,
              isLoading: false,
            }));

            let routername = this.props.history.urlreturn;
            firstLogin.isfirst = true;

            this.props.history.push({
              pathname: routername ?? "/",
              closetab: false,
            });

          }
          else {

          }
        }
        else {

          errorMessages.push(res.ResponseMessage)
          this.setState((previousState) => ({
            ...previousState,
            errorMessages: errorMessages,
            isLoading: false,
          }));
        }
      }
    }
  };

  render() {
    const { errorMessages, isLoading } = this.state;
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
              backgroundImage: "url(https://images.unsplash.com/photo-1483058712412-4245e9b90334?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80)",
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
                Sign in
              </Typography>
              <Box
                component="form"
                noValidate
                onSubmit={this.onLogin.bind(this)}
                sx={{ mt: 1 }}
              >
                <TextField
                  sx={{ backgroundColor: '#E8F0FE' }}
                  ref={this.username}
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label={<FormattedMessage id='user.userName' />}
                  name="username"
                  autoComplete="username"
                  autoFocus
                />
                <TextField
                  sx={{ backgroundColor: '#E8F0FE' }}
                  ref={this.password}
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label={<FormattedMessage id='user.userPassword' />}

                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
                {/* <FormControlLabel
                      control={<Checkbox value="remember" color="primary" />}
                      label="Remember me"
                    /> */}

                <Autocomplete
                  disablePortal
                  autoHighlight
                  options={this.state.countries}
                  sx={{ mt: 1, backgroundColor: '#E8F0FE' }}
                  defaultValue={this.changeLanguageValue}
                  onChange={(event, newValue) => {
                    this.setState({ langcode: newValue.code });
                    this.changeLanguage(newValue.code === "vi-VN" ? "VI" : "EN");
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                      {
                        option.fcode === "US" ?
                          <i className="flag-icon flag-icon-us mr-2"></i>
                          : <i className="flag-icon flag-icon-vi mr-2"></i>
                      }
                      {option.label}
                    </Box>
                  )}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="general.select_language" />} />}
                />

                <button
                  disabled={this.state.isLoading}
                  style={{ width: "100%", marginTop: "25px" }}
                  type="submit"
                  className="btn btn-primary"
                >
                  <FormattedMessage id='general.signin' />
                  {this.state.isLoading && (
                    <span
                      className="spinner-border spinner-border-sm mx-3"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                </button>

                {/* {errorMessages.length ? (
                  <>
                    {errorMessages.map((errorMessage, index) => {
                      return <p key={"login_error_" + index} style={{ color: "red" }}>{errorMessage}</p>;
                    })}
                  </>
                ) : (
                  ""
                )} */}

                {
                  errorMessages.length
                    ?

                    (<p style={{ color: 'red', textAlign: 'center' }}>
                      {<FormattedMessage id='login.account_password_invalid' />}
                    </p>)
                    :
                    (<p></p>)
                }

              </Box>

            </Box>
          </Grid>
        </Grid>
      </ThemeProvider>
    );
  }
}

// export default reduxForm({
//   form: "Login",
// })(Login);

export default Login;
