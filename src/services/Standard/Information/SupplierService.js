import { axios } from '@utils'

const URL = `/api/supplier`;

const getSuppliers = async (params) => {
    try {
        return await axios.get(URL, {
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
        return await axios.post(`${URL}/create-supplier`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const modify = async (params) => {
    try {
        return await axios.put(`${URL}/modify-supplier`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const handleDelete = async (params) => {

    try {
        return await axios.put(`${URL}/delete-reuse-supplier`, {
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
    handleDelete,
}