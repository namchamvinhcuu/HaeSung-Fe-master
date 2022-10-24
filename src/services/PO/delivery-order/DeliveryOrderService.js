import { axios } from '@utils';

const API = '/api/api/delivery-order';

export const get = async () => {
    try {
        return await axios.get(`${API}`);
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }

}