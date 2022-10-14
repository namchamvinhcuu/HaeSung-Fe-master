import { axios } from '@utils'
const apiQCMaster = '/api/QCMaster';
const getQcMasterList = async (params) => {
    try {
        return await axios.get(`${apiQCMaster}/get-all`, {
            params: {
                ...params 
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const getProductActive = async () => {
    try {
        return await axios.get(`${apiQCMaster}/get-product-active`);
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const create = async (params) => {

    try {
        return await axios.post(`${apiQCMaster}/create-qcMaster`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const modify = async (params) => {

    try {
        return await axios.put(`${apiQCMaster}/modify-qcMaster`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const deleteQCMaster = async (params) => {
    try {
      return await axios.delete(`${apiQCMaster}/delete-redo-qcMaster`, { data: params });
    }
    catch (error) {
      console.log(`ERROR: ${error}`);
    }
  }
  

export {
    getQcMasterList,
    getProductActive,
    create,
    modify,
    deleteQCMaster
}