import { axios } from '@utils'

const API = '/api/wms-layout';

export const getAisles = async (commonDetailId) => {
    try {
        return await axios.get(`${API}/get-aisles?commonDetailId=${commonDetailId}`);
    }
    catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export const createShelf = async (params) => {
    try {
        return await axios.post(`${API}/create-shelf`, params);
    }
    catch (error) {
        console.log(`ERROR: ${error}`);
    }
}