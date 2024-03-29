import { axios } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils';

const apiName = '/api/Mold';

const getMoldList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createMold = async (params) => {
  try {
    return await axios.post(`${apiName}/create`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const modifyMold = async (params) => {
  try {
    return await axios.put(`${apiName}/update`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const deleteMold = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete`, { data: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getProductModel = async () => {
  try {
    return await axios.get(`${apiName}/get-product-model`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getProductType = async () => {
  try {
    return await axios.get(`${apiName}/get-product-type`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getMachineType = async () => {
  try {
    return await axios.get(`${apiName}/get-machine-type`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createMoldByExcel = async (params) => {
  try {
    return await axios.post(`${apiName}/create-by-excel`, params);
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

    fetch(`${ConfigConstants.API_URL}Mold/download-excel`, options).then((response) => {
      response.blob().then((blob) => {
        let url = URL.createObjectURL(blob);
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'mold.xlsx';
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

export {
  getMoldList,
  createMold,
  modifyMold,
  deleteMold,
  getProductModel,
  getProductType,
  getMachineType,
  createMoldByExcel,
  downloadExcel,
};
