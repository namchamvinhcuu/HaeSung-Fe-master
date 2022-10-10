import { axios } from '@utils'
const apiProduct = '/api/product';
const getProductList = async (params) => {
    try {
        return await axios.get(`${apiProduct}/get-all`, {
            params: {
                ...params 
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const getModels = async (params) => {

    try {
        return await axios.get(`${apiProduct}/get-by-model`, {
            params: {
                ...params 
            }
        });
    } 
    catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export {
    getProductList,
    getModels
   
}