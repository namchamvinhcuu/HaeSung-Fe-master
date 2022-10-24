import { axios } from '@utils'

const API = '/api/fixed-po'

export const get = async () => {
    try {
        return await axios.get(`${API}/get`);
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }

}