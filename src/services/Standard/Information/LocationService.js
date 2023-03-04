import { axios } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils';

const apiName = '/api/Location';

const getLocationList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const GetArea = async () => {
  try {
    return await axios.get(`${apiName}/get-area`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createLocation = async (params) => {
  try {
    return await axios.post(`${apiName}/create-location`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const modifyLocation = async (params) => {
  try {
    return await axios.put(`${apiName}/modify-location`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const deleteLocation = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete-location`, { data: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createLocationByExcel = async (params) => {
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

    fetch(`${ConfigConstants.API_URL}Location/download-excel`, options).then((response) => {
      response.blob().then((blob) => {
        let url = URL.createObjectURL(blob);
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'aisle.xlsx';
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
  getLocationList,
  GetArea,
  createLocation,
  modifyLocation,
  deleteLocation,
  createLocationByExcel,
  downloadExcel,
};
