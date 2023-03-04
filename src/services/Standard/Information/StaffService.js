import { axios } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils';

const apiStaff = '/api/staff';

const getStaffList = async (params) => {
  try {
    return await axios.get(`${apiStaff}/get-all`, {
      params: {
        ...params,
      },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createStaff = async (params) => {
  try {
    return await axios.post(`${apiStaff}/create-staff`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const modifyStaff = async (params) => {
  try {
    return await axios.put(`${apiStaff}/modify-staff`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const deleteStaff = async (params) => {
  try {
    return await axios.put(`${apiStaff}/delete-staff`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
const createStaffByExcel = async (params) => {
  try {
    return await axios.post(`${apiStaff}/create-by-excel`, params);
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

    fetch(`${ConfigConstants.API_URL}Staff/download-excel`, options).then((response) => {
      response.blob().then((blob) => {
        let url = URL.createObjectURL(blob);
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'staff.xlsx';
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

export { getStaffList, createStaff, modifyStaff, deleteStaff, createStaffByExcel, downloadExcel };
