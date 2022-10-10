import { axios } from '@utils'
const apiName = '/api/user';
const getProductList = async (params) => {
    try {
        return await axios.get(`${apiName}/get-all`, {
            params: {
                ...params 
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const getModels = async (menuLevel) => {

    try {
        return await axios.get(`${apiName}/get-by-model`, {
            params: {
                ...params 
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export {
    getProductList,
    getModels
}