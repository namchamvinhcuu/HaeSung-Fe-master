import { axios } from '@utils';

const apiName = '/api/Material';

const getMaterialList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getAllMoldCode = async () => {
  try {
    return await axios.get(`${apiName}/get-all-mold-code`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createMaterial = async (params) => {
  try {
    return await axios.post(`${apiName}/create`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createMaterialByExcel = async (params) => {
  try {
    return await axios.post(`${apiName}/create-by-excel`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const modifyMaterial = async (params) => {
  try {
    return await axios.put(`${apiName}/update`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const deleteMaterial = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete`, { data: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getMaterialType = async () => {
  try {
    return await axios.get(`${apiName}/get-material-type`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getUnit = async () => {
  try {
    return await axios.get(`${apiName}/get-unit`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getSupplier = async () => {
  try {
    return await axios.get(`${apiName}/get-supplier`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getSupplierById = async (id) => {
  try {
    return await axios.get(`${apiName}/get-supplier-by-id/${id}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getQCMasterByMaterialType = async (materialTypeId) => {
  try {
    return await axios.get(`${apiName}/get-QCMaster/${materialTypeId}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export {
  getMaterialList,
  createMaterial,
  createMaterialByExcel,
  modifyMaterial,
  deleteMaterial,
  getMaterialType,
  getUnit,
  getSupplier,
  getSupplierById,
  getQCMasterByMaterialType,
  getAllMoldCode,
};
