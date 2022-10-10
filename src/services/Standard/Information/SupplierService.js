import { axios } from '@utils'

const getSuppliers = async (params) => {
    try {
        return await axios.get('/api/supplier', {
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
        return await axios.post('/api/permission/create-permission', {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export {
    getSuppliers
}