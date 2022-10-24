import { axios } from '@utils'
const apiName = '/api/forecast-po';

const getMaterialModel = async () => {
    try {
        return await axios.get(`${apiName}/get-select-material`);
    }
    catch (error) {
      console.log(`ERROR: ${error}`);
    }
}
const getLineModel = async () => {
  try {
      return await axios.get(`${apiName}/get-select-line`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}
const createForecast = async (params) => {
  try {
    return await axios.post(`${apiName}/create-forecast`, params);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export {
    getMaterialModel,
    getLineModel,
    createForecast
}
