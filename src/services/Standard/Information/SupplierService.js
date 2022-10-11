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
        return await axios.post('/api/supplier/create-supplier', {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const modify = async (params) => {
    try {
        return await axios.put('/api/supplier/modify-supplier', {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export {
    getSuppliers,
    create,
    modify,
}