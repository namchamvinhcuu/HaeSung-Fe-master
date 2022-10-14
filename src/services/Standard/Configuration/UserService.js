import { axios } from '@utils'

const apiName = '/api/user';

const getUserList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getAllRole = async () => {
  try {
    return await axios.get(`${apiName}/get-all-role`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getRoleByUser = async (userId) => {
  try {
    return await axios.get(`${apiName}/get-role/${userId}`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const createUser = async (params) => {
  try {
    return await axios.post(`${apiName}/create-user`, { ...params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const changePassword = async (params) => {
  try {
    return await axios.put(`${apiName}/change-userpassword`, { ...params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const changePasswordByRoot = async (params) => {
  try {
    return await axios.put(`${apiName}/change-userpassword-by-root`, { ...params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const changeRoles = async (params) => {
  try {
    return await axios.put(`${apiName}/set-role-for-user`, { ...params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const deleteUser = async (userId) => {

  try {
    return await axios.delete(`${apiName}/delete-user/${userId}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export {
  getUserList,
  getAllRole,
  getRoleByUser,
  createUser,
  changeRoles,
  changePassword,
  changePasswordByRoot,
  deleteUser,
}
