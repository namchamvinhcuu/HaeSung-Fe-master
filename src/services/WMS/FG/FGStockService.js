import { axios } from '@utils';
import { GetLocalStorage } from '@utils';
import moment from 'moment';
import * as ConfigConstants from '@constants/ConfigConstants';

const apiName = '/api/fg-stock';

export const getFGStock = async (params) => {
  try {
    return await axios.get(`${apiName}/get-fg-stock`, { params: { ...params } });
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
export const downloadExcel = async (params) => {
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

    fetch(`${ConfigConstants.API_URL}fg-stock/download-excel`, options).then((response) => {
      response.blob().then((blob) => {
        let url = URL.createObjectURL(blob);
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `fgstock-${moment().format('YYYYMMDDhhmmss')}.xlsx`;
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
