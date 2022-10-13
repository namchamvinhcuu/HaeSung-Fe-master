import { axios } from '@utils'

const apiName = '/api/Tray';

const getTrayList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const createTray = async (params) => {
  try {
    return await axios.post(`${apiName}/create`, params);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const modifyTray = async (params) => {
  try {
    return await axios.put(`${apiName}/update`, params);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const deleteTray = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete`, { data: params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const GetTrayType = async () => {
  try {
    return await axios.get(`${apiName}/get-tray-type`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export {
  getTrayList,
  createTray,
  modifyTray,
  deleteTray,
  GetTrayType
}
