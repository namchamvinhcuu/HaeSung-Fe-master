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
const getMaterialForSelect = async (qcType) => {
   
    try {
        return await axios.get(`${apiQCMaster}/get-material-active` , {params: qcType });
    }

     catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const getQCTypeForSelect = async () => {
    try {
        return await axios.get(`${apiQCMaster}/get-qc-type`);
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
    getMaterialForSelect ,
    getQCTypeForSelect,
    create,
    modify,
    deleteQCMaster
}