import { axios } from '@utils'
const getPermissionList = async (params) => {
    try {
        return await axios.get('/api/Permission', {
            params: {
                ...params 
            }
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
    getPermissionList,
    modify
}