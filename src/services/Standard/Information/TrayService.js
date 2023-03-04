import { axios } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils';

const apiName = '/api/Tray';

const getTrayList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createTray = async (params) => {
  try {
    return await axios.post(`${apiName}/create`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const modifyTray = async (params) => {
  try {
    return await axios.put(`${apiName}/update`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const deleteTray = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete`, { data: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const GetTrayType = async () => {
  try {
    return await axios.get(`${apiName}/get-tray-type`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
const GetListPrintQR = async (params) => {
  try {
    return await axios.post(`${apiName}/get-list-print-qr`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createTrayByExcel = async (params) => {
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

    fetch(`${ConfigConstants.API_URL}Tray/download-excel`, options).then((response) => {
      response.blob().then((blob) => {
        let url = URL.createObjectURL(blob);
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'tray.xlsx';
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
  getTrayList,
  createTray,
  modifyTray,
  deleteTray,
  GetTrayType,
  GetListPrintQR,
  createTrayByExcel,
  downloadExcel,
};
