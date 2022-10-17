import { axios } from '@utils'

const URL = `/api/line`;

const get = async (params) => {
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

const getActive = async () => {
    try {
        return await axios.get(`${URL}/get-active`);
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const create = async (params) => {
    try {
        return await axios.post(`${URL}/create-line`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const modify = async (params) => {
    try {
        return await axios.put(`${URL}/modify-line`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const handleDelete = async (params) => {

    try {
        return await axios.put(`${URL}/delete-reuse-line`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export {
    get,
    getActive,
    create,
    modify,
    handleDelete,
}