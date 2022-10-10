import { axios } from '@utils'
const getProductList = async (params) => {
    try {
        return await axios.get('/api/Product/get-all', {
            params: {
                ...params 
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export {
    getProductList
}