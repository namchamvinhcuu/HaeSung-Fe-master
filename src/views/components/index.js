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
//STANDARD - Configuration
import Menu from "./standard_db/Configuration/Menu/Menu";
import Permission from "./standard_db/Configuration/Permission/Permission";
import User from "./standard_db/Configuration/User/User";
import Role from "./standard_db/Configuration/Role/Role";

import Common from "./standard_db/Configuration/Common/CommonMaster";

//STANDARD - Information
import BOM from "./standard_db/Information/BOM/BOM";
import Location from "./standard_db/Information/Location/Location";
import Material from "./standard_db/Information/Material/Material";
import Mold from "./standard_db/Information/Mold/Mold";
import Product from "./standard_db/Information/Product/Product";
import Staff from "./standard_db/Information/Staff/Staff";
import Supplier from "./standard_db/Information/Supplier/Supplier";
import Tray from "./standard_db/Information/Tray/Tray";

//KPI
import Analytics from "./KPI/Analytics/Analytics";
import KPIDashboard from "./KPI/Dashboard/KPIDashboard";

//MMS
import Actual from "./MMS/Actual/Actual";
import Display from "./MMS/Display/Display";
import MMSReport from "./MMS/Report/MMSReport";
import WorkOrder from "./MMS/WO/WorkOrder";

//WMS
//WMS - Material
import IQC from "./WMS/Material/IQC/IQC";
import MaterialPicking from "./WMS/Material/Picking/MaterialPicking";
import MaterialPutAway from "./WMS/Material/PutAway/MaterialPutAway";
import MaterialReceiving from "./WMS/Material/Receiving/MaterialReceiving";
import MaterialReport from "./WMS/Material/Report/MaterialReport";
import MaterialShipping from "./WMS/Material/Shipping/MaterialShipping";
import MaterialSO from "./WMS/Material/ShippingOrder/MaterialSO";
import MaterialStock from "./WMS/Material/Stock/MaterialStock";
//WMS - WIP
import WIPReceiving from "./WMS/WIP/Receiving/WIPReceiving"
import WIPReport from "./WMS/WIP/Report/WIPReport"
import WIPShipping from "./WMS/WIP/Shipping/WIPShipping"
import WIPStock from "./WMS/WIP/Stock/WIPStock"

//PO
import DeliveryOrder from "./PO/DeliveryOrder/DeliveryOrder";
import ForeCastPO from "./PO/ForecastPO/ForeCastPO";

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
  //STANDARD - Configuration
  Menu,
  Permission,
  User,
  Common,
  Role,
  //STANDARD - Information
  BOM,
  Location,
  Material,
  Mold,
  Product,
  Staff,
  Supplier,
  Tray,

  //KPI
  Analytics,
  KPIDashboard,

  //MMS
  Actual,
  Display,
  MMSReport,
  WorkOrder,

  //WMS
  //WMS - Material
  IQC,
  MaterialPicking,
  MaterialPutAway,
  MaterialReceiving,
  MaterialReport,
  MaterialShipping,
  MaterialSO,
  MaterialStock,
  //WMS - WIP
  WIPReceiving,
  WIPReport,
  WIPShipping,
  WIPStock,

  //PO
  DeliveryOrder,
  ForeCastPO,

  //ACCOUNT MANAGER
  UserList,
  RoleList,
};
