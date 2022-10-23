import i18n from "i18next";
import Backend from "i18next-http-backend";
import { find, propEq } from "ramda";
import * as ConfigConstants from '@constants/ConfigConstants';
// import enLocaleCommon from "../public/locales/en/common.json";
// import enLocaleLangauge from "../public/locales/en/language.json";
// import esLocaleCommon from "../public/locales/es/common.json";
// import esLocaleLangauge from "../public/locales/es/language.json";

// const resources = {
//   en: {
//     common: enLocaleCommon,
//     language: enLocaleLangauge
//   },
//   es: {
//     common: esLocaleCommon,
//     language: esLocaleLangauge
//   }
// };

export const DEFAULT_LOCALES = [
  { name: "English", code: "en" },
  { name: "普通话", code: "zh" },
  { name: "Vietnamese", code: "vi" }
];

const DEFAULT_LANGUAGE = 'en';
export const AVAILABLE_LOCALES =
  window.__AVAILABLE_LOCALES__ || DEFAULT_LOCALES;

const defaultBundle = (locale, ns) =>
  import(`./translations/${locale}/${ns}.json`).then((res) => res.default);

const dynamicBundle = (locale, ns) =>
  fetch(`/locales/${locale}/${ns}.json`).then((res) => res.json());

function loadLocaleBundle(locale, ns) {
  // Load default locale using dynamic imports
  if (find(propEq("code", locale))(DEFAULT_LOCALES)) {
    return defaultBundle(locale, ns).catch((err) => {

      //  console.error(err);
    });
  }

  // else load dynamic localesß using static serve
  return dynamicBundle(locale, ns);
}

const backendOptions = {
  loadPath: "{{lng}}|{{ns}}",
  request: (options, url, payload, callback) => {
    try {
      const [lng, ns] = url.split("|");

      // this mocks the HTTP fetch plugin behavior so it works with the backend AJAX pattern in this XHR library

      loadLocaleBundle(lng, ns).then((data) => {
        callback(null, {
          data: JSON.stringify(data),
          status: 200 // status code is required by XHR plugin to determine success or failure
        });
      });
    } catch (e) {
      console.error(e);
      callback(null, {
        status: 500
      });
    }
  }
};

i18n.use(Backend).init({
  // resources,
  lng: DEFAULT_LANGUAGE,
  defaultNS: "common",
  ns: ["common", "language"],
  fallbackLng: DEFAULT_LANGUAGE,

  interpolation: {
    escapeValue: false
  },
  backend: backendOptions,
  react: {
    // wait: true,
    useSuspense: false
  }
});

window.i18n = i18n;

export default i18n;
