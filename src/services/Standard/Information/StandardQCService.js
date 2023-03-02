import { axios } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils';

const apiStandardQC = '/api/Standard-QC';

const getStandardQCList = async (params) => {
  try {
    return await axios.get(`${apiStandardQC}/get-all`, {
      params: {
        ...params,
      },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const create = async (params) => {
  try {
    return await axios.post(`${apiStandardQC}/create-standardQC`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const modify = async (params) => {
  try {
    return await axios.put(`${apiStandardQC}/modify-standardQC`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const deleteStandardQC = async (params) => {
  try {
    return await axios.delete(`${apiStandardQC}/delete-redo-standardQC`, { data: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createStandardQCByExcel = async (params) => {
  try {
    return await axios.post(`${apiStandardQC}/create-by-excel`, params);
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

    fetch(`${ConfigConstants.API_URL}Standard-QC/download-excel`, options).then((response) => {
      response.blob().then((blob) => {
        let url = URL.createObjectURL(blob);
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'standardQC.xlsx';
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

export { getStandardQCList, create, modify, deleteStandardQC, createStandardQCByExcel, downloadExcel };
