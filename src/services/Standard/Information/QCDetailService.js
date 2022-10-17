import { axios } from '@utils'
const apiQCDetail = '/api/QCDetail';
const getQcDetailList = async (params) => {
    try {
        return await axios.get(`${apiQCDetail}/get-all`, {
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
        return await axios.get(`${apiQCDetail}/get-product-active`);
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const create = async (params) => {

    try {
        return await axios.post(`${apiQCDetail}/create-qcDetail`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const modify = async (params) => {

    try {
        return await axios.put(`${apiQCDetail}/modify-qcDetail`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const deleteQCDetail = async (params) => {
    try {
      return await axios.delete(`${apiQCDetail}/delete-redo-qcDetail`, { data: params });
    }
    catch (error) {
      console.log(`ERROR: ${error}`);
    }
  }
  

export {
    getQcDetailList,
    getProductActive,
    create,
    modify,
    deleteQCDetail
}