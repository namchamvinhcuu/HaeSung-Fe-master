import { AuthHeader } from "./authHeader";
import { firstLogin } from "./Authenticate";
import {
  login,
  logout,
  api_get,
  api_download,
  api_post,
  api_post_formdata,
  api_push_notify,
} from "./dataService";
import { GetMenus_LoginUser } from "./permission";
import { SuccessAlert, ErrorAlert, WarningAlert } from "./notifyMessage";
import eventBus from "./EventBus";

import {
  api_post_prevent_doubleclick,
  api_get_prevent_doubleclick,
} from "./callApi_preventDoubleClick";

import { historyApp, historyDashboard } from "./history";
import { calDateAgo, toCamel, dateToTicks, addDays, minusDays } from "./Utils";
import {
  GetLocalStorage,
  SetLocalStorage,
  RemoveLocalStorage,
} from "./LocalStorageUtils";
import UserManager from "./currentUser";
import { instance as axios } from "./AxiosInstance";
import MultiLanguages from "./MultiLanguages";

export {
  firstLogin,
  historyApp,
  historyDashboard,
  api_push_notify,
  AuthHeader,
  login,
  MultiLanguages,
  axios,
  logout,
  api_download,
  api_get,
  api_post,
  api_post_formdata,
  GetMenus_LoginUser,
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  eventBus,
  api_post_prevent_doubleclick,
  api_get_prevent_doubleclick,
  calDateAgo,
  UserManager,
  toCamel,
  dateToTicks,
  addDays,
  minusDays,
  GetLocalStorage,
  SetLocalStorage,
  RemoveLocalStorage,
};
