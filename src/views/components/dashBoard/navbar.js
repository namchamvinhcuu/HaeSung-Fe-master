import React, { Component } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CloseIcon from '@mui/icons-material/Close';
import { withStyles } from '@mui/styles';
import _ from 'lodash';
import { historyDashboard, historyApp, calDateAgo, UserManager, GetLocalStorage } from '@utils';
import { api_get, api_post, api_push_notify, SuccessAlert, ErrorAlert, RemoveLocalStorage } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';

import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
// import { Document, Page, pdfjs } from 'react-pdf';
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
import { HubConnectionBuilder, LogLevel, HttpTransportType, HubConnectionState } from '@microsoft/signalr';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ReactDOM from 'react-dom';
import Button from '@mui/material/Button';
import { withTranslation } from 'react-i18next';
import NotifyUnread from './NotifyUnread';
import { ChangeLanguage } from '@containers';
import { loginService, documentService } from '@services';
import { useState } from 'react';
import { Abc, Visibility, VisibilityOff } from '@mui/icons-material';
import { TextField, InputAdornment, IconButton } from '@mui/material';

import UserChangePassDialog from '../standard_db/Configuration/User/UserChangePassDialog';

const styles = (theme) => ({
  tabs: {
    width: '100%',
    '& .MuiTab-root': {
      fontFamily: 'Sora-Regular',
    },

    '& .MuiTabs-indicator': {
      backgroundColor: 'orange',
      height: 3,
    },

    '& .MuiTab-root.Mui-selected': {
      color: 'red',
      '& .MuiSvgIcon-root': {
        backgroundColor: 'lightgrey',
      },

      //  backgroundColor: "papayawhip",
      background: 'linear-gradient(0deg, rgba(166,166,166,0.6) 0%, rgba(255,255,255,1) 50%)',
      border: '1px solid lightgrey',
    },
    '& .MuiTabs-flexContainer': {
      '& button': { borderRadius: 2 },
      '& button:hover': { backgroundColor: 'papayawhip' },
      '& button:focus': { backgroundColor: 'transparent' },
    },

    //"& button:active": { bgcolor:'lightgrey' }
    // "& .MuiTabs-flexContainer":{
    //   backgroundColor: 'papayawhip'
    // }
  },
});

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      langselected: 'en-US',
      isShowing: false,
      pdfURL: '',
      title_guide: '',

      isShowingChangePass: false,

      showNotifyPopup: false,
      onlineUsers: [],
    };

    this.connection = null;
    this._isMounted = false;

    // this.props.i18n.on('languageChanged', (lng)=> {
    //     alert(lng)
    // })
  }

  // startConnection = async () => {
  //   try {
  //     this.connection = new HubConnectionBuilder()
  //       .withUrl(`${ConfigConstants.BASE_URL}/signalr`, {
  //         // accessTokenFactory: () => GetLocalStorage(ConfigConstants.TOKEN_ACCESS),
  //         skipNegotiation: true,
  //         transport: HttpTransportType.WebSockets,
  //       })
  //       .configureLogging(LogLevel.None)
  //       .withAutomaticReconnect({
  //         nextRetryDelayInMilliseconds: (retryContext) => {
  //           //reconnect after 5-20s
  //           return 5000 + Math.random() * 15000;
  //         },
  //       })
  //       .build();

  //     if (this.connection.state === HubConnectionState.Disconnected) {
  //       await this.connection.start();
  //     }

  //     this.connection.on('ReceivedOnlineUsers', (data) => {
  //       if (data && data.length > 0) {
  //         this._isMounted &&
  //           this.setState({
  //             onlineUsers: [...data],
  //           });
  //       }
  //     });

  //     this.connection.on('WorkOrderGetDisplay', (res) => {
  //       if (res) {
  //         const { saveDisplayData } = this.props;
  //         saveDisplayData(res);
  //       }
  //     });

  //     await this.connection.invoke('SendOnlineUsers');
  //     await this.connection.invoke('GetDisplayWO');

  //     this.connection.onclose((e) => {
  //       // this.connection = null;
  //     });
  //   } catch (error) {
  //     console.log('[websocket error] :', error);
  //   }
  // };

  // startConnection function sets up a SignalR connection with the given URL and configures its behavior.

  startConnection = async () => {
    try {
      // Create a new HubConnection using the given URL and options
      this.connection = new HubConnectionBuilder()
        .withUrl(`${ConfigConstants.BASE_URL}/signalr`, {
          // accessTokenFactory: () => GetLocalStorage(ConfigConstants.TOKEN_ACCESS),
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
        .configureLogging(LogLevel.None) // Disable logging
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Return a random delay between 5s and 20s for automatic reconnect
            return 5000 + Math.random() * 15000;
          },
        })
        .build();

      // Check if the connection is disconnected, then start the connection
      if (this.connection.state === HubConnectionState.Disconnected) {
        await this.connection.start();
      }

      // Register a callback for the 'ReceivedOnlineUsers' event
      this.connection.on('ReceivedOnlineUsers', (data) => {
        if (data && data.length > 0) {
          // Update the onlineUsers state only if the component is mounted
          this._isMounted &&
            this.setState({
              onlineUsers: [...data],
            });
        }
      });

      // Register a callback for the 'WorkOrderGetDisplay' event
      this.connection.on('WorkOrderGetDisplay', (res) => {
        if (res) {
          // Call the saveDisplayData action creator
          const { saveDisplayData } = this.props;
          saveDisplayData(res);
        }
      });
      this.connection.on('ReceivedWorkingDeliveryOrder', (res) => {
        const { setDeliveryOrder } = this.props;
        setDeliveryOrder(res ?? []);
      });
      // Invoke the 'SendOnlineUsers' and 'GetDisplayWO' methods on the server
      await this.connection.invoke('SendOnlineUsers');
      await this.connection.invoke('GetDisplayWO');
      await this.connection.invoke('SendWorkingDeliveryOrder');

      // Register a callback for the close event
      this.connection.onclose((e) => {
        // this.connection = null;
      });
    } catch (error) {
      // Log the error if there is any
      console.log('[websocket error] :', error);
    }
  };

  closeConnection = async () => {
    try {
      await this.connection.stop();
    } catch (error) {
      console.log('[close connection errors] :', error);
    }
  };

  handleChange(event, newValue) {
    const { HistoryElementTabs } = this.props;

    let tab = HistoryElementTabs[newValue];
    historyDashboard.push(tab.router);
  }

  signOut = async (e) => {
    e.preventDefault();
    try {
      await this.closeConnection();
      const res = await loginService.handleLogout();
      if (res.HttpResponseCode === 200 && res.ResponseMessage === 'general.success') {
        RemoveLocalStorage(ConfigConstants.TOKEN_ACCESS);
        RemoveLocalStorage(ConfigConstants.TOKEN_REFRESH);
        RemoveLocalStorage(ConfigConstants.CURRENT_USER);
        const { deleteAll } = this.props;
        deleteAll();
        historyApp.push('/logout');
      } else {
        ErrorAlert('System error');
      }
    } catch (error) {
      console.log('[logout error]: ', error);
    }
    // window.location.reload(true);
  };

  handleCloseTab(e, ele) {
    e.stopPropagation();
    const { deleteTab } = this.props;
    deleteTab(ele.index);
  }

  handleCloseAllTabs(e) {
    e.preventDefault();
    const { deleteOtherTab } = this.props;
    deleteOtherTab();
  }

  handleRefreshTab(e) {
    e.preventDefault();
    const { HistoryElementTabs, index_tab_active_array } = this.props;

    let tab = HistoryElementTabs[index_tab_active_array];

    let funcRefreshChange = tab?.ref?.componentRefreshChange;

    funcRefreshChange && funcRefreshChange();
  }

  handleGuide = async (e) => {
    e.preventDefault();
    const { HistoryElementTabs, index_tab_active_array } = this.props;
    let tab = HistoryElementTabs[index_tab_active_array];
    let res = await documentService.downloadDocument(tab.component, this.props.language);

    if (res.Data) {
      let url_file = `${ConfigConstants.BASE_URL}/document/${res.Data.language}/${res.Data.urlFile}`;

      this.setState({
        isShowing: true,
        pdfURL: url_file,
        title_guide: res.Data.menuName,
      });
    } else {
      ErrorAlert(this.props.language == 'VI' ? 'Không có tài liệu hướng dẫn' : 'No documentation available');
    }
  };

  handleChangePass = async (e) => {
    e.preventDefault();

    this.setState({
      isShowingChangePass: true,
    });
  };

  // handleLang(e, code) {
  //   e.preventDefault();
  //   var arr = code.split('-')

  //   this.props.i18n.changeLanguage(arr[0]);
  //   this.setState({ langselected: code })

  // }

  toggle() {
    this.setState({ isShowing: !this.state.isShowing });
  }

  toggleChangePass() {
    this.setState({ isShowingChangePass: !this.state.isShowingChangePass });
  }

  forceLogout = async () => {
    const currentUser = GetLocalStorage(ConfigConstants.CURRENT_USER);

    const uArr = this.state.onlineUsers.filter(function (item) {
      return item.userId === currentUser?.userId && item.lastLoginOnWeb === currentUser?.lastLoginOnWeb;
    });

    if (uArr.length === 0 || !currentUser) {
      const { deleteAll } = this.props;
      deleteAll();

      RemoveLocalStorage(ConfigConstants.TOKEN_ACCESS);
      RemoveLocalStorage(ConfigConstants.TOKEN_REFRESH);
      RemoveLocalStorage(ConfigConstants.CURRENT_USER);
      await this.connection.stop();
      this.connection = null;
      this._isMounted = false;
      // console.log("websocket is disconnected");
      historyApp.push('/logout');
    }
  };

  reConnectToServer = async () => {
    // if (this.connection) {
    //   if (this.connection.state === HubConnectionState.Connected) {
    //     if (this.state.onlineUsers.length === 0) {
    //       // console.log('connected to server');
    //       await this.connection.invoke('SendOnlineUsers');
    //     }
    //   }

    //   if (this.connection.state === HubConnectionState.Disconnected) {
    //     // console.log('disconnected to server');
    //     if (this._isMounted) {
    //       await this.connection.stop();
    //       await this.connection.start();
    //       await this.connection.invoke('SendOnlineUsers');
    //     }
    //   }
    // } else {
    //   console.log('[reconnect fail]');
    //   await this.startConnection();
    // }

    if (!this.connection) {
      console.log('[reconnect fail]');
      await this.startConnection();
      return;
    }

    switch (this.connection.state) {
      case HubConnectionState.Connected:
        if (this.state.onlineUsers.length === 0) {
          await this.connection.invoke('SendOnlineUsers');
        }
        break;
      case HubConnectionState.Disconnected:
        if (this._isMounted) {
          await this.connection.stop();
          await this.connection.start();
          await this.connection.invoke('SendOnlineUsers');
        }
        break;
    }
  };

  componentDidMount = async () => {
    this._isMounted = true;

    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      await this.connection.stop();
    }
    await this.startConnection();
    // await this.forceLogout();
  };

  componentDidUpdate = async (prevProps, prevState) => {
    // $('#notify_dropdown').on('show.bs.dropdown', () => {
    //   const { updateTimeAgo } = this.props
    //   updateTimeAgo();
    // });

    if (!_.isEqual(prevState.onlineUsers, this.state.onlineUsers)) {
      // console.log('run when component is updated');
      await this.reConnectToServer();
      await this.forceLogout();
    }
  };

  componentWillUnmount = async () => {
    // if (this.connection && this.connection.state === HubConnectionState.Connected) {
    if (this.connection) {
      await this.connection.stop();
      // console.log("run when component is unmounted");
    }

    this.connection = null;
    this._isMounted = false;
  };

  handleClick_See_All_Notifies(e, self) {
    e.preventDefault();
    self.setState({ showNotifyPopup: true });
  }

  handleNotifyUnreadClosed(IsRefreshBell, datagrid) {
    this.setState({ showNotifyPopup: false });
    if (IsRefreshBell) {
      const { updatenotify } = this.props;
      updatenotify(datagrid.rows, datagrid.total);
    }
  }

  render() {
    const { classes } = this.props;
    const { HistoryElementTabs, index_tab_active_array, notify_list, total_notify } = this.props;
    // const { langselected } = this.state;
    // var flag = ""
    // if (this.props.language == "EN") flag = "flag-icon-us"
    // else if (this.props.language == "VI") flag = "flag-icon-vi"

    // console.log('HistoryElementTabs', HistoryElementTabs)

    return (
      <>
        <nav className="main-header navbar navbar-expand navbar-white navbar-light sticky-top shadow-sm  ">
          {/* <a class="navbar-brand" href="javascript:void(0)">Navbar</a> */}
          <Tabs
            className={classes.tabs}
            variant="scrollable"
            value={index_tab_active_array}
            onChange={this.handleChange.bind(this)}
            aria-label="tabs"
          >
            {HistoryElementTabs.map((ele) => (
              <Tab
                key={ele.index}
                sx={{ mx: 0.1 }}
                label={
                  <span>
                    {ele.name}
                    <a className="closeTab" title={'Close tab'}>
                      <CloseIcon
                        onClick={(e) => this.handleCloseTab(e, ele)}
                        sx={{
                          width: 20,
                          height: 20,
                          mt: -0.5,
                          ml: 3,
                          mr: -1,
                          border: '1px solid lightgrey',
                          // bgcolor:'lightgrey',
                          '&: hover': {
                            bgcolor: 'lightgrey',
                          },
                        }}
                      />
                    </a>
                  </span>
                }
              />
            ))}
          </Tabs>

          {/* <NotificationUpdater /> */}
          <ul className="navbar-nav ml-auto">
            {/* {total_notify > 0 && <li className="nav-item dropdown" id="notify_dropdown">

              <a onClick={(e) => e.preventDefault()} className="nav-link" data-toggle="dropdown" role="button" title="your message box" href="#" >
                <i className="far fa-bell"></i>

                <span className="badge badge-warning navbar-badge">{total_notify}</span>
              </a>
              <div className="dropdown-menu dropdown-menu-xxl dropdown-menu-right">
                <span className="dropdown-item dropdown-header d-flex align-items-center justify-content-center">
                  <span className="badge badge-dark mr-1">{total_notify} </span> Notifications</span>
                <div style={{ height: 400, overflowY: 'auto' }}>
                  {

                    notify_list.map((item, index) => {
                      return <div key={"notify_" + index}>
                        <div className="dropdown-divider"></div>
                        <a href="#" onClick={e => e.preventDefault()} className="dropdown-item">
                          <div><i className="fa fa-info-circle mr-2"></i><span className="badge badge-light">{item.title}</span></div>

                          {item.content}
                          <span className="float-right text-muted text-sm">{item.timeago}</span>
                        </a>

                      </div>
                    })
                  }
                </div>


                <div className="dropdown-divider"></div>
                <a href="#" onClick={e => this.handleClick_See_All_Notifies(e, this)} className="dropdown-item dropdown-footer">See All Notifications</a>
              </div>
            </li>
            } */}

            <li className="nav-item">
              <a
                className="nav-link"
                onClick={this.handleChangePass.bind(this)}
                href="#"
                role="button"
                title="change password"
              >
                <i className="fa fa-user"></i>
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" onClick={this.handleGuide.bind(this)} href="#" role="button" title="help">
                <i className="fa fa-question"></i>
              </a>
            </li>
            <li className="nav-item">
              <span
                className="nav-link"
                onClick={this.handleCloseAllTabs.bind(this)}
                // href="#"
                role="button"
                title="close all tabs except selected"
              >
                <i className="fa fa-window-close-o"></i>
              </span>
            </li>

            <li className="nav-item">
              <a
                className="nav-link"
                onClick={this.handleRefreshTab.bind(this)}
                href="#"
                role="button"
                title="refresh current tab"
              >
                <i className="fa fa-refresh"></i>
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link"
                data-widget="fullscreen"
                href="#"
                role="button"
                title="fullscreen"
                onClick={(e) => e.preventDefault()}
              >
                <i className="fas fa-expand-arrows-alt"></i>
              </a>
            </li>

            {/* <!-- Language Dropdown Menu --> */}
            <ChangeLanguage />

            <li className="nav-item">
              <a className="nav-link" href="#" role="button" onClick={this.signOut} title="logout">
                <i className="fas fa-sign-out-alt"></i>
              </a>
            </li>
          </ul>
        </nav>
        {this.state.isShowing && (
          <PDFModal
            isShowing={true}
            hide={this.toggle.bind(this)}
            pdfURL={this.state.pdfURL}
            title={this.state.title_guide}
          />
        )}
        {this.state.showNotifyPopup && <NotifyUnread onClose={this.handleNotifyUnreadClosed.bind(this)} />}

        <UserChangePassDialog isOpen={this.state.isShowingChangePass} onClose={this.toggleChangePass.bind(this)} />
      </>
    );
  }
}

const PDFModal = ({ isShowing, hide, pdfURL, title }) => {
  // useEffect(() => { }, [data]);

  const [numPages, setNumPages] = React.useState(null);
  // const [pageNumber, setPageNumber] = React.useState(1);
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function onLoadError(error) {
    console.log('load-error', error);
    // console.error;
  }

  // const renderPages=()=>{
  //   const pages = [];
  //   for (let i = 1; i <= numPages; i++) {
  //     pages.push(<Page pageNumber={i} width={1200}  />);
  //   }

  //   return pages
  // }
  return isShowing
    ? ReactDOM.createPortal(
        <React.Fragment>
          <div>
            <Dialog open={true} maxWidth={'xl'} fullWidth={true}>
              <DialogTitle>{title}</DialogTitle>
              <DialogContent dividers={true}>
                <div>
                  <Document file={pdfURL} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onLoadError}>
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page key={`page_${index + 1}`} pageNumber={index + 1} width={1000} />
                    ))}
                  </Document>
                  {/* <p>
                  Page {pageNumber} of {numPages}
                </p> */}
                </div>
              </DialogContent>

              <DialogActions>
                <Button variant="outlined" onClick={hide}>
                  OK
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </React.Fragment>,
        document.body
      )
    : null;
};

// export default (withStyles(styles)(NavBar));
export default withTranslation()(withStyles(styles)(NavBar));
