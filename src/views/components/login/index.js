import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { HasValue, MapFormToModelData } from "@plugins/helperJS";
import { firstLogin, login } from "@utils";
import React, { Component } from "react";
import { reduxForm } from "redux-form";
import CountrySelect from "./contryselect";

import { api_download } from '@utils';
const theme = createTheme();

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessages: [],
      isLoading: false,
      langcode: "en-US",
    };
    this.username = React.createRef();
    this.password = React.createRef();
  }

  download_apk(e) {
    e.preventDefault();
    api_download('EquipmentManagerApi/download-apk', "android_setup.apk")
  }


  onLogin = (e) => {
    e.preventDefault();

    //    if (this.state.isLoading) return;
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

        login(
          model.username,
          model.password,
          this.state.langcode,
          model.rememberMe
        )
          .then((data) => {
            this.setState((previousState) => ({
              ...previousState,
              isLoading: false,
            }));

            var routername = this.props.history.urlreturn;
            firstLogin.isfirst = true;

            this.props.history.push({
              pathname: routername ?? "/",
              closetab: false,
            });
          })
          .catch((errors) => {
            const errorMessages = [];

            if (typeof errors === "string") {
              errorMessages.push(errors.trim());
            } else if (typeof errors === "object") {
              for (let key in errors) {
                errorMessages.push(errors[key]);
              }
            }
            this.setState((previousState) => ({
              ...previousState,
              errorMessages,
              isLoading: false,
            }));
          });
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
                  label="Username"
                  name="username"
                  value={'root'}
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
                  label="Password"
                  value={'1234@'}
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
                {/* <FormControlLabel
                      control={<Checkbox value="remember" color="primary" />}
                      label="Remember me"
                    /> */}

                <CountrySelect
                  onChange={(event, newValue) => {
                    this.setState({ langcode: newValue.code });
                  }}
                />

                <button
                  disabled={this.state.isLoading}
                  style={{ width: "100%", marginTop: "25px" }}
                  type="submit"
                  className="btn btn-primary"
                >
                  Sign In
                  {this.state.isLoading && (
                    <span
                      className="spinner-border spinner-border-sm mx-3"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                </button>

                {errorMessages.length ? (
                  <>
                    {errorMessages.map((errorMessage, index) => {
                      return <p key={"login_error_" + index} style={{ color: "red" }}>{errorMessage}</p>;
                    })}
                  </>
                ) : (
                  ""
                )}

              </Box>

            </Box>
          </Grid>
        </Grid>
      </ThemeProvider>
    );
  }
}

export default reduxForm({
  form: "Login",
})(Login);
