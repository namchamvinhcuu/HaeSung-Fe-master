import React, { Component } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CloseIcon from "@mui/icons-material/Close";
import { withStyles } from "@mui/styles";
import {
  historyDashboard,
  historyApp,
  calDateAgo,
  UserManager,
  GetLocalStorage,
} from "@utils";
import {
  api_get,
  api_post,
  api_push_notify,
  SuccessAlert,
  ErrorAlert,
  RemoveLocalStorage,
} from "@utils";
import * as ConfigConstants from "@constants/ConfigConstants";

import { Document, Page } from "react-pdf/dist/esm/entry.webpack";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ReactDOM from "react-dom";
import Button from "@mui/material/Button";
import { withTranslation } from "react-i18next";
import NotifyUnread from "./NotifyUnread";
import { ChangeLanguage } from "@containers";
import { loginService, documentService } from "@services";

const styles = (theme) => ({
  tabs: {
    width: "100%",
    "& .MuiTab-root": {
      fontFamily: "Sora-Regular",
    },

    "& .MuiTabs-indicator": {
      backgroundColor: "orange",
      height: 3,
    },

    "& .MuiTab-root.Mui-selected": {
      color: "red",
      "& .MuiSvgIcon-root": {
        backgroundColor: "lightgrey",
      },

      //  backgroundColor: "papayawhip",
      background:
        "linear-gradient(0deg, rgba(166,166,166,0.6) 0%, rgba(255,255,255,1) 50%)",
      border: "1px solid lightgrey",
    },
    "& .MuiTabs-flexContainer": {
      "& button": { borderRadius: 2 },
      "& button:hover": { backgroundColor: "papayawhip" },
      "& button:focus": { backgroundColor: "transparent" },
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
      langselected: "en-US",
      isShowing: false,
      pdfURL: "",
      title_guide: "",
      showNotifyPopup: false,
    };

    // this.props.i18n.on('languageChanged', (lng)=> {
    //     alert(lng)
    // })
  }

  handleChange(event, newValue) {
    const { HistoryElementTabs } = this.props;

    let tab = HistoryElementTabs[newValue];
    historyDashboard.push(tab.router);
  }

  signOut = async (e) => {
    e.preventDefault();
    try {
      const res = await loginService.handleLogout();
      if (
        res.HttpResponseCode === 200 &&
        res.ResponseMessage === "general.success"
      ) {
        RemoveLocalStorage(ConfigConstants.TOKEN_ACCESS);
        RemoveLocalStorage(ConfigConstants.TOKEN_REFRESH);
        RemoveLocalStorage(ConfigConstants.CURRENT_USER);
        const { deleteAll } = this.props;
        deleteAll();
        historyApp.push("/logout");
      } else {
        ErrorAlert("System error");
      }
    } catch (error) {
      console.log(`logout error: ${error}`);
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
    var tab = HistoryElementTabs[index_tab_active_array];
    // console.log(tab);
    var funcRefreshChange = tab?.ref?.componentRefreshChange;
    funcRefreshChange && funcRefreshChange();
  }

  handleGuide = async (e) => {
    e.preventDefault();
    const { HistoryElementTabs, index_tab_active_array } = this.props;
    var tab = HistoryElementTabs[index_tab_active_array];
    var res = await documentService.downloadDocument(
      tab.component,
      this.props.language
    );
    if (res.Data) {
      var url_file = `${ConfigConstants.BASE_URL}/document/${res.Data.language}/${res.Data.urlFile}`;
      this.setState({
        isShowing: true,
        pdfURL: url_file,
        title_guide: res.Data.menuName,
      });
    } else {
      ErrorAlert(
        this.props.language == "VI"
          ? "Không có tài liệu hướng dẫn"
          : "No documentation available"
      );
    }
  };

  // handleLang(e, code) {
  //   e.preventDefault();
  //   var arr = code.split('-')

  //   this.props.i18n.changeLanguage(arr[0]);
  //   this.setState({ langselected: code })

  // }

  // handleGuide(e) {

  //   e.preventDefault();
  //   const { HistoryElementTabs, index_tab_active_array } = this.props
  //   var tab = HistoryElementTabs[index_tab_active_array];

  //   //language
  //   var curlang = window?.i18n.language;
  //   var guid_lang = "";
  //   if (curlang == 'vi') {
  //     guid_lang = "vietnam"
  //   } else if (curlang == 'en') {
  //     guid_lang = "english"
  //   } else if (curlang == 'zh') {
  //     guid_lang = "china"
  //   }
  //   api_get("EquipmentManagerApi/get-document_by_code/" + tab.code + "/" + guid_lang).then(res => {

  //     if (res) {
  //       var url_file = ConfigConstants.BASE_URL + "document/" + res.url_file
  //       this.setState({ isShowing: true, pdfURL: url_file, title_guide: res.title });
  //     } else {
  //       ErrorAlert("Chưa có hướng dẫn cho màn này")
  //     }
  //   });
  // }

  toggle() {
    this.setState({ isShowing: !this.state.isShowing });
  }

  componentDidMount() {
    // $('#notify_dropdown').on('show.bs.dropdown', () => {
    //   const { updateTimeAgo } = this.props
    //   updateTimeAgo();
    // });
  }

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
    const {
      HistoryElementTabs,
      index_tab_active_array,
      notify_list,
      total_notify,
    } = this.props;
    const { langselected } = this.state;
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
                    <a className="closeTab" title={"Close tab"}>
                      <CloseIcon
                        onClick={(e) => this.handleCloseTab(e, ele)}
                        sx={{
                          width: 20,
                          height: 20,
                          mt: -0.5,
                          ml: 3,
                          mr: -1,
                          border: "1px solid lightgrey",
                          // bgcolor:'lightgrey',
                          "&: hover": {
                            bgcolor: "lightgrey",
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

            {/* <li className="nav-item">
              <a
                className="nav-link" 
               onClick={this.handleGuide.bind(this)}
                href="#"
                role="button"
                title="help"
              >
                <i className="fa fa-question"></i>
              </a>
            </li> */}
            <li className="nav-item">
              <a
                className="nav-link"
                onClick={this.handleGuide.bind(this)}
                href="#"
                role="button"
                title="help"
              >
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
              <a
                className="nav-link"
                href="#"
                role="button"
                onClick={this.signOut}
                title="logout"
              >
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

        {this.state.showNotifyPopup && (
          <NotifyUnread onClose={this.handleNotifyUnreadClosed.bind(this)} />
        )}
      </>
    );
  }
}

const PDFModal = ({ isShowing, hide, pdfURL, title }) => {
  // useEffect(() => { }, [data]);

  console.log(pdfURL);
  const [numPages, setNumPages] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
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
            <Dialog open={true} maxWidth={"xl"} fullWidth={true}>
              <DialogTitle>{title}</DialogTitle>
              <DialogContent dividers={true}>
                <div>
                  <Document file={pdfURL} onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        width={1000}
                      />
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
