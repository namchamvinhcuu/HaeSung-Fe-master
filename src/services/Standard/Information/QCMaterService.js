import { axios } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils';

const apiQCMaster = '/api/QCMaster';

const getQcMasterList = async (params) => {
  try {
    return await axios.get(`${apiQCMaster}/get-all`, {
      params: {
        ...params,
      },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getMaterialForSelect = async (qcType) => {
  try {
    return await axios.get(`${apiQCMaster}/get-material-active`, { params: qcType });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getQCTypeForSelect = async () => {
  try {
    return await axios.get(`${apiQCMaster}/get-qc-type`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const create = async (params) => {
  try {
    return await axios.post(`${apiQCMaster}/create-qcMaster`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const modify = async (params) => {
  try {
    return await axios.put(`${apiQCMaster}/modify-qcMaster`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const deleteQCMaster = async (params) => {
  try {
    return await axios.delete(`${apiQCMaster}/delete-redo-qcMaster`, { data: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createQCMasterByExcel = async (params) => {
  try {
    return await axios.post(`${apiQCMaster}/create-by-excel`, params);
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

    fetch(`${ConfigConstants.API_URL}QCMaster/download-excel`, options).then((response) => {
      response.blob().then((blob) => {
        let url = URL.createObjectURL(blob);
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'qcsop_master.xlsx';
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
  getQcMasterList,
  getMaterialForSelect,
  getQCTypeForSelect,
  create,
  modify,
  deleteQCMaster,
  createQCMasterByExcel,
  downloadExcel,
};
