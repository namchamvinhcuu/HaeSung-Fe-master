import { axios } from "@utils";
const apiName = "/api/forecast-po-master";

const getForecastMasterList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createForecastMaster = async (params) => {
  try {
    return await axios.post(`${apiName}/create-forecast-master`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const modifyForecastMaster = async (params) => {
  try {
    return await axios.put(`${apiName}/modify-forecast-master`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const deleteForecastMaster = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete-forecast-master`, { data: params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export  {
  getForecastMasterList,
  createForecastMaster,
  modifyForecastMaster,
  deleteForecastMaster,
};
