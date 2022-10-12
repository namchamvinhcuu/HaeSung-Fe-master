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
const getProductModel = async (params) => {

    try {
        return await axios.get(`${apiProduct}/get-product-model`, {
            params: {
                ...params 
            }
        });
    } 
    catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const getProductType = async (params) => {

    try {
        return await axios.get(`${apiProduct}/get-product-type`, {
            params: {
                ...params 
            }
        });
    } 
    catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const createProduct = async (params) => {

    try {
        return await axios.post(`${apiProduct}/create-product`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const modifyProduct = async (params) => {

    try {
        return await axios.put(`${apiProduct}/modify-product`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const deleteProduct = async (params) => {
    try {
      return await axios.delete(`${apiProduct}/delete-product`, { data: params });
    }
    catch (error) {
      console.log(`ERROR: ${error}`);
    }
  }
  

export {
    getProductList,
    getProductModel,
    getProductType,
    createProduct,
    modifyProduct,
    deleteProduct
}