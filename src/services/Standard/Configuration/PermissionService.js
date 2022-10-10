import { axios } from '@utils'

const getPermissionTypeArr = async () => {
    try {
        return await axios.get('/api/permission/get-permission-type');
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const getPermissionList = async (params) => {
    try {
        return await axios.get('/api/permission', {
            params: {
                ...params
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const createPermission = async (params) => {

    try {
        return await axios.post('/api/permission/create-permission', {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const modify = async (params) => {

    try {
        return await axios.put('/api/permission/modify-permission', {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export {
    getPermissionTypeArr,
    getPermissionList,
    createPermission,
    modify
}