import { axios } from '@utils'

const apiName = '/api/role';

const getRoleList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const GetPermissionByRole = async (roleId, params) => {
  try {
    return await axios.get(`${apiName}/get-permission-by-role/${roleId}`, { params: { ...params } });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const GetMenuByRole = async (roleId, params) => {
  try {
    return await axios.get(`${apiName}/get-menu-by-role/${roleId}`, { params: { ...params } });
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

const getRoleByRole = async (userId) => {
  try {
    return await axios.get(`${apiName}/get-role/${userId}`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const createRole = async (params) => {
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

const changeRoles = async (params) => {
  try {
    return await axios.put(`${apiName}/set-role-for-user`, { ...params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const deleteRole = async (userId) => {

  try {
    return await axios.delete(`${apiName}/delete-user/${userId}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getAllMenu = async () => {
  try {
    return await axios.get(`${apiName}/get-all-menu`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getAllPermission = async () => {
  try {
    return await axios.get(`${apiName}/get-all-permission`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const deletePermission = async (params) => {
  try {
    return await axios.post(`${apiName}/delete-permission`, { ...params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const deleteMenu = async (params) => {
  try {
    return await axios.post(`${apiName}/delete-menu`, { ...params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export {
  getRoleList,
  GetPermissionByRole,
  GetMenuByRole,
  getAllMenu,
  getAllPermission,
  getAllRole,
  getRoleByRole,
  createRole,
  changeRoles,
  changePassword,
  deleteRole,
  deletePermission,
  deleteMenu
}
