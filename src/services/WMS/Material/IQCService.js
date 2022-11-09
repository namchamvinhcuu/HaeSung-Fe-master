import { axios } from "@utils";
const apiName = "/api/iqc";
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils'

const getIQCList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getMaterialModelTypeRaw = async () => {
  try {
    return await axios.get(`${apiName}/get-select-material-type-raw`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
const getSelectQC = async (params) => {
  try {
    return await axios.get(`${apiName}/get-select-qc`,  { params:  params} );
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const createIQC = async (params) => {
  try {
    return await axios.post(`${apiName}/create-lot`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};


const modifyIQC= async (params) => {
  try {
    return await axios.put(`${apiName}/modify-lot`, params);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const deleteIQC = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete-reuse-lot`, { data: params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}


export {
    getIQCList,
    getMaterialModelTypeRaw,
    createIQC,
    modifyIQC,
    deleteIQC,
    getSelectQC,
};