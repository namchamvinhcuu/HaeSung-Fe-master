import * as loginService from './Login/LoginService';
import * as menuService from './Standard/Configuration/MenuService';
import * as permissionService from './Standard/Configuration/PermissionService';
import * as userService from './Standard/Configuration/UserService';

import * as commonService from './Standard/Configuration/CommonService';

import * as roleService from './Standard/Configuration/RoleService';
import * as productService from './Standard/Information/ProductService';
import * as supplierService from './Standard/Information/SupplierService';
import * as staffService from './Standard/Information/StaffService';
import * as moldService from './Standard/Information/MoldService';
import * as trayService from './Standard/Information/TrayService';
import * as lineService from './Standard/Information/LineService';
import * as materialService from './Standard/Information/MaterialService';
import * as buyerService from './Standard/Information/BuyerService';
import * as standardQCService from './Standard/Information/StandardQCService';
import * as bomService from './Standard/Information/BomService';
import * as bomDetailService from './Standard/Information/BomDetailService';
import * as qcMasterService from './Standard/Information/QCMaterService';
import * as qcDetailService from './Standard/Information/qcDetailService';
import * as locationService from './Standard/Information/LocationService';
import * as versionAppService from './Standard/Configuration/VersionAppService';
import * as documentService from './Standard/Configuration/DocumentService';

import * as purchaseOrderService from './PO/purchase-order/PurchaseOrderService';
import * as deliveryOrderService from './PO/delivery-order/DeliveryOrderService';
import * as forecastService from './PO/Forecast/ForecastService';
import * as forecastMasterService from './PO/Forecast/ForecastMasterService';

import * as workOrderService from './MMS/work-order/WorkOrderService';
import * as actualService from './MMS/ActualService';
import * as mmsReportService from './MMS/MMSReportService';

import * as fixedPOService from './PO/purchase-order/FixedPOService';
import * as iqcService from './WMS/Material/IQCService';
import * as materialReceivingService from './WMS/Material/MaterialReceivingService';
import * as wipReceivingService from './WMS/WIP/WIPReceivingService';
import * as wmsLayoutService from './WMS/WMSLayout/WMSLayoutService';
import * as materialPutAwayService from './WMS/Material/MaterialPutAwayService';

import * as materialSOService from './WMS/Material/MaterialSOService';
import * as materialReportService from './WMS/Material/MaterialReportService';

import * as eslService from './esl/ESLService';

export {
  loginService,
  menuService,
  permissionService,
  userService,
  commonService,
  roleService,
  productService,
  supplierService,
  staffService,
  moldService,
  trayService,
  lineService,
  materialService,
  buyerService,
  standardQCService,
  bomService,
  bomDetailService,
  qcMasterService,
  qcDetailService,
  locationService,
  versionAppService,
  documentService,
  purchaseOrderService,
  deliveryOrderService,
  forecastService,
  workOrderService,
  forecastMasterService,
  fixedPOService,
  iqcService,
  actualService,
  materialReceivingService,
  wipReceivingService,
  wmsLayoutService,
  materialPutAwayService,
  materialSOService,
  mmsReportService,
  materialReportService,
  eslService,
};
