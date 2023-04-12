import { axios } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';
const apiName = '/api/material-stock';
import { GetLocalStorage } from '@utils';
import moment from 'moment';

const getMaterialList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getMaterialType = async () => {
  try {
    return await axios.get(`${apiName}/get-material-type`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getUnit = async () => {
  try {
    return await axios.get(`${apiName}/get-unit`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getSupplier = async () => {
  try {
    return await axios.get(`${apiName}/get-supplier`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getLotStock = async (params) => {
  try {
    return await axios.get(`${apiName}/get-lot-stock`, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
const downloadExcel = async (params) => {
  try {
    const token = GetLocalStorage(ConfigConstants.TOKEN_ACCESS);
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: `Bearer ${token}`,
      },
    };

    fetch(`${ConfigConstants.API_URL}material-stock/download-excel`, options).then((response) => {
      response.blob().then((blob) => {
        let url = URL.createObjectURL(blob);
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `materialstock-${moment().format('YYYYMMDDhhmmss')}.xlsx`;
        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      });
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
export { getMaterialList, getMaterialType, getUnit, getSupplier, downloadExcel };
