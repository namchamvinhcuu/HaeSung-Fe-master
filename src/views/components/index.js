import DashBoard from "./dashBoard";
import NavBar from "./dashBoard/navbar";
import ChangeLanguage from './dashBoard/ChangeLanguage'

import Login from "./login/Login";
// import Login from "./login";
import LanguageSelect from "./login/LanguageSelect";

import ContentBox from "./dashBoard/ContentBox";
import SuperAdminDashboard from "./dashBoard/SuperAdminDashboard";

import TabListContent from './dashBoard/TabListContent'

//STANDARD
import Menu from "./standard_db/Configuration/Menu/Menu";
import Permission from "./standard_db/Configuration/Permission/Permission";
import User from "./standard_db/Configuration/User/User";

//KPI
import RFDI_Dashboard from './KPI/RFDI_Dashboard'
import RFDI_Dashboard_Layout from './KPI/RFDI_Dashboard_Layout'


//account manager
import UserList from "./account_manager/User/UserList";
import RoleList from "./account_manager/Role/RoleList"

export {
  //SYSTEM
  TabListContent,
  DashBoard,
  NavBar,
  ChangeLanguage,
  Login,
  LanguageSelect,
  ContentBox,
  SuperAdminDashboard,

  //STANDARD
  Menu,
  Permission,
  User,

  //KPI
  RFDI_Dashboard,
  RFDI_Dashboard_Layout,

  UserList,
  RoleList,
};
