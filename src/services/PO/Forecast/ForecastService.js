import { axios } from "@utils";
const apiName = "/api/forecast-po";

const getForecastList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getMaterialModel = async () => {
  try {
    return await axios.get(`${apiName}/get-select-material`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getLineModel = async () => {
  try {
    return await axios.get(`${apiName}/get-select-line`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createForecast = async (params) => {
  try {
    return await axios.post(`${apiName}/create-forecast`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const modifyForecast = async (params) => {
  try {
    return await axios.put(`${apiName}/modify-forecast`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const deleteForecast = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete-forecast`, { data: params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getYearModel = async () => {
  try {
    return await axios.get(`${apiName}/get-select-year`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getBuyerModel = async () => {
  try {
    return await axios.get(`${apiName}/get-select-buyer`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getForecastPOReport = async (params) => {
  try {
    return await axios.get(`${apiName}/get-report`, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const downloadReport = async (params) => {
  try {

    const token = GetLocalStorage(ConfigConstants.TOKEN_ACCESS);
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': `Bearer ${token}`
      },
    }

    fetch(`${ConfigConstants.API_URL}forecast-po/download-excel?
    FPoMasterId=${params.FPoMasterId}
    &keyWord=${keyWord.keyWord}
    &keyWordWeekStart=${params.keyWordWeekStart}
    &keywordweekend=${params.keywordweekend}
    &isActived=${params.showDelete}`, options)
      .then(response => {
        response.blob().then(blob => {
          let url = URL.createObjectURL(blob);
          let downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = 'report.xlsx';
          document.body.appendChild(downloadLink);
          downloadLink.click();

          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
        });
      });


  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export {
  getMaterialModel,
  getLineModel,
  createForecast,
  modifyForecast,
  getForecastList,
  deleteForecast,
  getYearModel,
  getBuyerModel,

  getForecastPOReport,
  downloadReport,
};
