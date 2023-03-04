import { axios } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils';

const apiProduct = '/api/product';

const getProductList = async (params) => {
  try {
    return await axios.get(`${apiProduct}/get-all`, {
      params: {
        ...params,
      },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
const getProductModel = async (params) => {
  try {
    return await axios.get(`${apiProduct}/get-product-model`, {
      params: {
        ...params,
      },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
const getProductType = async (params) => {
  try {
    return await axios.get(`${apiProduct}/get-product-type`, {
      params: {
        ...params,
      },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
const createProduct = async (params) => {
  try {
    return await axios.post(`${apiProduct}/create-product`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
const modifyProduct = async (params) => {
  try {
    return await axios.put(`${apiProduct}/modify-product`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
const deleteProduct = async (params) => {
  try {
    return await axios.delete(`${apiProduct}/delete-product`, { data: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createProductByExcel = async (params) => {
  try {
    return await axios.post(`${apiProduct}/create-by-excel`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const GetQCMasterModel = async () => {
  try {
    return await axios.get(`${apiProduct}/get-select-qc-master`);
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

    fetch(`${ConfigConstants.API_URL}Product/download-excel`, options).then((response) => {
      response.blob().then((blob) => {
        let url = URL.createObjectURL(blob);
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'product.xlsx';
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
  getProductList,
  getProductModel,
  getProductType,
  createProduct,
  modifyProduct,
  deleteProduct,
  createProductByExcel,
  GetQCMasterModel,
  downloadExcel,
};
