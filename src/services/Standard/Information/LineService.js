import { axios } from '@utils'

const get = async (params) => {
    try {
        return await axios.get('/api/line', {
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
        return await axios.get('/api/line/get-active');
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const create = async (params) => {
    try {
        return await axios.post('/api/line/create-line', {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const modify = async (params) => {
    try {
        return await axios.put('/api/line/modify-line', {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const handleDelete = async (params) => {

    try {
        return await axios.put('/api/line/delete-reuse-line', {
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