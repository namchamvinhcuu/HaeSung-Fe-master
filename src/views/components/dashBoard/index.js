import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { NavBar, TabListContent } from "@containers";

import SiderBar from "./sidebar";
import Footer_DashBoard from "./footer";
import { ToastContainer, toast } from "react-toastify";
import ShortUniqueId from "short-unique-id";
import { api_post, api_get, GetMenus_LoginUser, eventBus } from "@utils";
import { Treeview } from "@static/js/adminlte.js";
import * as SignalR from '@microsoft/signalr'
import * as ConfigConstants from '@constants/ConfigConstants';
import { withRouter } from "react-router";
import { historyApp, historyDashboard, firstLogin } from '@utils';
import CustomRouter from '@utils/CustomRoutes';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { zhCN, enUS } from '@mui/material/locale';
import store from '@states/store';

class DashBoard extends Component {
  constructor(props) {
    super(props);
    this.state = { showAlert: false, tab: 0, language: this.props.language };
    var res = GetMenus_LoginUser();

    this.html = res[1];
    this.showRouters = res[2];

    this.Fullname = res[3];
    this.Component_Default = res[4];
    this.user = JSON.parse(localStorage.getItem(ConfigConstants.CURRENT_USER));
    this.access_token = localStorage.getItem(ConfigConstants.TOKEN_ACCESS);

    // let current_lang = this.props.language;
    // console.log('eee', props)

    // this.theme = ({});

    // if (current_lang) {
    //   if (window.i18n) {

    //     window.i18n.changeLanguage(current_lang.toString().toLowerCase());
    //   }

    //   if (current_lang === "VI")
    //     this.theme = createTheme({}, zhCN)
    //   else
    //     this.theme = createTheme({}, enUS)
    // }
  }

  componentWillUnmount() {
    // if (this.newConnection) {
    //   this.newConnection.stop().then(() => console.log("websocket is disconnected"));
    //   this.newConnection = null;
    // }


  }
  componentDidMount() {

    (async () => {
      var Treeview_slideMenu = new Treeview($("#main-slidebar-menu"), {
        accordion: false,
        animationSpeed: 300,
        expandSidebar: false,
        sidebarButtonSelector: '[data-widget="pushmenu"]',
        trigger: '[data-widget="treeview"] .nav-link',
        widget: "treeview",
      });
      Treeview_slideMenu.init();

      // this.newConnection = new SignalR.HubConnectionBuilder()
      //   .withUrl(
      //     ConfigConstants.BASE_URL + `hubs/userhub`, {
      //     accessTokenFactory: () => this.access_token,
      //     skipNegotiation: true,
      //     transport: SignalR.HttpTransportType.WebSockets
      //   }
      //   )
      //   .configureLogging(SignalR.LogLevel.None)
      //   .withAutomaticReconnect({
      //     nextRetryDelayInMilliseconds: retryContext => {
      //       //lien tuc reconnect  moi lan trong khoang 5-20s
      //       return 5000 + (Math.random() * 15000);
      //     }
      //   })
      //   .build();

      // await this.newConnection.start();
      // console.log("websocket is connected to server")

      // this.newConnection.onreconnected(() => {
      //   //lay thong tin tu server
      //   console.log('reconnected to server');
      //   api_get(`sysNotice/get_notify_user`, {}).then(res => {
      //     const { updatenotify } = this.props;
      //     updatenotify(res.notifies, res.total_Notification);
      //     console.log('messages user updated.');
      //   });
      // });

      // this.newConnection.onclose(() => {
      //   console.log('websocket closed');
      // });

      // this.newConnection.on('AppendNotice', (res) => {
      //   // console.log(res)
      //   // const {data, ...others}= res;
      //   store.dispatch({
      //     type: 'Dashboard/APPEND_NOTIFY',
      //     data: [res]
      //   });

      //   // if (messObj.typestring=="notifyupload") {
      //   //   eventBus.dispatch("new_file_uploaded", messObj.data);
      //   // }  
      // });

    })();


  }

  onTabChange(value) {
    this.setState({ tab: value })
  }

  render() {
    return (
      <>
        {/* <ThemeProvider theme={this.theme}> */}

        <div className="container-fluid">
          <CustomRouter history={historyDashboard}>

            <ToastContainer
              theme="colored"
              position="bottom-right"
              autoClose={5000}
              // hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              // draggable
              pauseOnHover
            />
            <NavBar />

            <SiderBar Menus={this.html} FullNameLogin={this.Fullname} />

            <Switch>

              {this.showRouters}
              {/* <Route path="menu">
                  <Menu />
                </Route> */}

              {<Route path="/"
                render={(props) => {
                  var isFromLogin = firstLogin.isfirst;
                  firstLogin.isfirst = null;
                  return isFromLogin ? <this.Component_Default  {...props} /> : null
                }}
              />

              }
            </Switch>
            <TabListContent />

            <Footer_DashBoard />
          </CustomRouter>
        </div>
        {/* </ThemeProvider> */}

      </>
    );
  }



}
export default withRouter(DashBoard);
