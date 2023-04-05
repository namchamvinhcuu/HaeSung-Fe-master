import { axios } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils';

const apiBuyer = '/api/buyer';

const getBuyerList = async (params) => {
  try {
    return await axios.get(`${apiBuyer}/get-all`, {
      params: {
        ...params,
      },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getForSelect = async () => {
  try {
    return await axios.get(`${apiBuyer}/get-for-select`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createBuyer = async (params) => {
  try {
    return await axios.post(`${apiBuyer}/create-buyer`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const modifyBuyer = async (params) => {
  try {
    return await axios.put(`${apiBuyer}/modify-buyer`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
const deleteBuyer = async (params) => {
  try {
    return await axios.put(`${apiBuyer}/delete-buyer`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createBuyerByExcel = async (params) => {
  try {
    return await axios.post(`${apiBuyer}/create-by-excel`, params);
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

    fetch(`${ConfigConstants.API_URL}Buyer/download-excel`, options).then((response) => {
      response.blob().then((blob) => {
        let url = URL.createObjectURL(blob);
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'buyer.xlsx';
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

export { getBuyerList, getForSelect, createBuyer, modifyBuyer, deleteBuyer, createBuyerByExcel, downloadExcel };
