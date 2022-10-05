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
    return await axios.get(`${apiName}/get-role`);
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

// const modifyMenu = async (params) => {

//     try {
//         return await axios.put('/api/menu/modify-menu', {
//             ...params
//         });
//     } catch (error) {
//         console.log(`ERROR: ${error}`);
//     }
// }

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
  createUser,
  // modifyMenu,
  deleteUser,
}
