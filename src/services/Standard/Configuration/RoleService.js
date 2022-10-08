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
    return await axios.post(`${apiName}/create-role`, { ...params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const updateRole = async (params) => {
  try {
    return await axios.put(`${apiName}/modify-role`, { ...params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const deleteRole = async (roleId) => {

  try {
    return await axios.delete(`${apiName}/delete-role/${roleId}`);
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

const addPermission = async (params) => {
  try {
    return await axios.post(`${apiName}/add-permission`, { ...params });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const addMenu = async (params) => {
  try {
    return await axios.post(`${apiName}/add-menu`, { ...params });
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
  updateRole,
  deleteRole,

  addPermission,
  addMenu,
  deletePermission,
  deleteMenu
}
