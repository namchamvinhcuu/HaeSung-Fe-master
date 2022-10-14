import { axios } from '@utils'
const apiStandardQC = '/api/Standard-QC';
const getStandardQCList = async (params) => {
    try {
        return await axios.get(`${apiStandardQC}/get-all`, {
            params: {
                ...params 
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const create = async (params) => {

    try {
        return await axios.post(`${apiStandardQC}/create-standartQC`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const modify = async (params) => {

    try {
        return await axios.put(`${apiStandardQC}/modify-standartQC`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const deleteStandardQC = async (params) => {
    try {
      return await axios.delete(`${apiStandardQC}/delete-redo-standartQC`, { data: params });
    }
    catch (error) {
      console.log(`ERROR: ${error}`);
    }
  }
  

export {
    getStandardQCList,
    create,
    modify,
    deleteStandardQC
}