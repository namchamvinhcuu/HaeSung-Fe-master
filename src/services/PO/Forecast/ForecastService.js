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


export {
  getMaterialModel,
  getLineModel,
  createForecast,
  modifyForecast,
  getForecastList,
  deleteForecast,
  getYearModel
};
