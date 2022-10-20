import { axios } from '@utils'

const apiName = '/api/Bom';

const getBomList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getBomForCopy = async (params) => {
  try {
    return await axios.get(`${apiName}/get-for-copy`, { params: { ...params } });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const createBom = async (params) => {
  try {
    return await axios.post(`${apiName}/create`, params);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const modifyBom = async (params) => {
  try {
    return await axios.put(`${apiName}/update`, params);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const copyBom = async (BomID, Version, data) => {
  try {
    return await axios.post(`${apiName}/copy/${BomID}/${Version}`, data);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const deleteBom = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete`, { data: params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getProduct = async () => {
  try {
    return await axios.get(`${apiName}/get-product`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getMaterial = async (bomlv, BomId) => {
  try {
    return await axios.get(`${apiName}/get-material/${bomlv}`, { params: { BomId: BomId } });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getParent = async (BomId) => {
  try {
    return await axios.get(`${apiName}/get-parent`, { params: { BomId: BomId } });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export {
  getBomList,
  getBomForCopy,
  createBom,
  modifyBom,
  copyBom,
  deleteBom,
  getProduct,
  getMaterial,
  getParent,
}
