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

const getDeletedSuppliers = async (params) => {
    try {
        return await axios.get('/api/supplier/get-deleted', {
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

const handleDelete = async (params) => {

    try {
        return await axios.delete('/api/supplier/delete-supplier', {
            data: {
                ...params
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const handleReuse = async (params) => {

    try {
        return await axios.put('/api/supplier/reuse-supplier', {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export {
    getSuppliers,
    getDeletedSuppliers,
    create,
    modify,
    handleDelete,
    handleReuse,
}