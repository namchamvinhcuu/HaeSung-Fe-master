import DashBoard from "./dashBoard";
import NavBar from "./dashBoard/navbar";
import Login from "./login";
import ContentBox from "./dashBoard/ContentBox";
import SuperAdminDashboard from "./dashBoard/SuperAdminDashboard";

import TabListContent from './dashBoard/TabListContent'
import Location from "./standard_db/Location";
//standard_ Lodb
import DataReaderList from './standard_db/DataReaderList'
import ReaderDeviceList from './standard_db/DataReaderDevice/ReaderDeviceList'
import ReaderDetail from './standard_db/DataReaderDevice/ReaderDetail'
import Product from './standard_db/Product'
import TagBlackList from './standard_db/TagBlackList'
import Menu from "./standard_db/Menu/Menu";
import Permission from "./standard_db/Permission/Permission";

import Staff from './standard_db/Staff'
import TagList from './standard_db/TagList'

import RFDI_Dashboard from './KPI/RFDI_Dashboard'
import RFDI_Dashboard_Layout from './KPI/RFDI_Dashboard_Layout'


//account manager
import UserList from "./account_manager/User/UserList";
import RoleList from "./account_manager/Role/RoleList"
export {
  TabListContent,
  DashBoard,
  NavBar,
  Login,
  Location,
  ContentBox,
  Product,
  SuperAdminDashboard,
  Staff,
  DataReaderList,
  ReaderDeviceList,
  TagList,
  TagBlackList,
  ReaderDetail,

  RFDI_Dashboard,
  RFDI_Dashboard_Layout,

  UserList,
  RoleList,

  Menu,
  Permission
};
