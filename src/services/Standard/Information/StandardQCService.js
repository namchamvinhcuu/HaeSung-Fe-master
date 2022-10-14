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
        return await axios.post(`${apiStandardQC}/create-standardQC`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const modify = async (params) => {

    try {
        return await axios.put(`${apiStandardQC}/modify-standardQC`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const deleteStandardQC = async (params) => {
    try {
      return await axios.delete(`${apiStandardQC}/delete-redo-standardQC`, { data: params });
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