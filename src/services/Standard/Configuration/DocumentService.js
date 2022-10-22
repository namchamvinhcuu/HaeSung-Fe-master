import { axios } from '@utils'

const apiName = '/api/Document';

const getDocumentList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const createDocument = async (params) => {
  try {
    return await axios.post(`${apiName}/create`, params);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const modifyDocument = async (params) => {
  try {
    return await axios.put(`${apiName}/update`, params);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const deleteDocument = async (params) => {
  try {
    return await axios.delete(`${apiName}/delete`, { data: params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getMenu = async () => {
  try {
    return await axios.get(`${apiName}/get-menu-component`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export {
  getDocumentList,
  createDocument,
  modifyDocument,
  deleteDocument,
  getMenu,
}
