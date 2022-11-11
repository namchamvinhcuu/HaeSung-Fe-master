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