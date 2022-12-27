import DashBoard from './dashBoard';
import NavBar from './dashBoard/navbar';
import ChangeLanguage from './dashBoard/ChangeLanguage';

import Login from './login/Login';
// import Login from "./login";
import LanguageSelect from './login/LanguageSelect';

import ContentBox from './dashBoard/ContentBox';
import SuperAdminDashboard from './dashBoard/SuperAdminDashboard';

import TabListContent from './dashBoard/TabListContent';

//STANDARD
//STANDARD - Configuration
import Menu from './standard_db/Configuration/Menu/Menu';
import Permission from './standard_db/Configuration/Permission/Permission';
import User from './standard_db/Configuration/User/User';
import Role from './standard_db/Configuration/Role/Role';
import Document from './standard_db/Configuration/Document/Document';
import Common from './standard_db/Configuration/Common/CommonMaster';

//STANDARD - Information
import BOM from './standard_db/Information/BOM/BOM';
import Location from './standard_db/Information/Location/Location';
import Material from './standard_db/Information/Material/Material';
import Mold from './standard_db/Information/Mold/Mold';
import Product from './standard_db/Information/Product/Product';
import Staff from './standard_db/Information/Staff/Staff';
import Supplier from './standard_db/Information/Supplier/Supplier';
import Tray from './standard_db/Information/Tray/Tray';
import Buyer from './standard_db/Information/Buyer/Buyer';
import Line from './standard_db/Information/Line/Line';
import StandardQC from './standard_db/Information/StandardQC/StandardQC';
import QCMaster from './standard_db/Information/QCMaster/QCMaster';

//KPI
import Analytics from './KPI/Analytics/Analytics';
import KPIDashboard from './KPI/Dashboard/KPIDashboard';
import KPIProductivity from './KPI/productivity/KPIProductivity';
import KPIInjection from './KPI/Injection/KPIInjection';

//MMS
import Actual from './MMS/Actual/Actual';
import Display from './MMS/Display/Display';
import MMSReport from './MMS/Report/MMSReport';
import WorkOrder from './MMS/WO/WorkOrder';
import MappingTray from './MMS/MappingTray/MappingTray';
import MappingLot from './MMS/MappingLot/MappingLot';
import HMIHistory from './MMS/HMIHistory/HMIHistory';
//WMS
//WMS - Material
import IQC from './WMS/Material/IQC/IQC';
import MaterialPicking from './WMS/Material/Picking/MaterialPicking';
import MaterialPutAway from './WMS/Material/PutAway/MaterialPutAway';
import MaterialReceiving from './WMS/Material/Receiving/MaterialReceiving';
import MaterialReport from './WMS/Material/Report/MaterialReport';
import MaterialShipping from './WMS/Material/Shipping/MaterialShipping';
import MaterialSO from './WMS/Material/ShippingOrder/MaterialSO';
import MaterialStock from './WMS/Material/Stock/MaterialStock';
import MaterialSODetail from './WMS/Material/ShippingOrder/MaterialSODetail';
import MaterialSODialog from './WMS/Material/ShippingOrder/MaterialSODialog';
//WMS - WIP
import WIPReceiving from './WMS/WIP/Receiving/WIPReceiving';
import WIPReport from './WMS/WIP/Report/WIPReport';
import WIPShipping from './WMS/WIP/Shipping/WIPShipping';
import WIPStock from './WMS/WIP/Stock/WIPStock';
//WMS - FG
import FGReceiving from './WMS/FG/Receiving/FGReceiving';
import FGPackingLot from './WMS/FG/PackingLot/FGPackingLot';
import FGStock from './WMS/FG/FGStock/FGStock';
import FGPutAway from './WMS/FG/PutAway/FGPutAway';

//WMS - Layout
import WMSLayout from './WMS/Layout/WMSLayout';
//WMS - Mapping
import MappingBin from './WMS/MappingBin/MappingBin';
//WMS - SplitMergeLot
import SplitLot from './WMS/SplitMergeLot/SplitLot';
import MergeLot from './WMS/SplitMergeLot/MergeLot';
//PO
import DeliveryOrder from './PO/DeliveryOrder/DeliveryOrder';
import ForecastPO from './PO/ForecastPO/ForecastPO';
import FixedPO from './PO/FixedPO/FixedPO';

//account manager
import UserList from './account_manager/User/UserList';
import RoleList from './account_manager/Role/RoleList';

//Apk app
import VersionApp from './standard_db/Configuration/VersionApp/VersionApp';

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
  VersionApp,
  Document,
  //STANDARD - Information
  BOM,
  Location,
  Material,
  Mold,
  Product,
  Staff,
  Supplier,
  Tray,
  Buyer,
  Line,
  StandardQC,
  QCMaster,

  //KPI
  Analytics,
  KPIDashboard,
  KPIProductivity,
  KPIInjection,

  //MMS
  Actual,
  Display,
  MMSReport,
  WorkOrder,
  MappingTray,
  MappingLot,
  HMIHistory,
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
  MaterialSODetail,
  MaterialSODialog,
  //WMS - WIP
  WIPReceiving,
  WIPReport,
  WIPShipping,
  WIPStock,
  //WMS - FG
  FGReceiving,
  FGPackingLot,
  FGStock,
  FGPutAway,
  // WMS - Layout
  WMSLayout,
  MappingBin,
  SplitLot,
  MergeLot,
  //PO
  DeliveryOrder,
  ForecastPO,
  FixedPO,

  //ACCOUNT MANAGER
  UserList,
  RoleList,
};
