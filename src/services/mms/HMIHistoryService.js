import { axios } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils';
import moment from 'moment';

const API = '/api/hmi';
const getMaterialModelTypeRaw = async () => {
  try {
    return await axios.get(`${API}/get-select-material-type-bare`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const get = async (params) => {
  try {
    return await axios.get(`${API}/get-all-master`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
const getDetailList = async (params) => {
  try {
    return await axios.get(`${API}/get-all-detail`, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export { getMaterialModelTypeRaw, get, getDetailList };
