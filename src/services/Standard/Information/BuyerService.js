import { axios } from '@utils'
const apiBuyer = '/api/buyer';
const getBuyerList = async (params) => {
    try {
        return await axios.get(`${apiBuyer}/get-all`, {
            params: {
                ...params 
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const createBuyer = async (params) => {

    try {
        return await axios.post(`${apiBuyer}/create-buyer`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const modifyBuyer = async (params) => {
    try {
        return await axios.put(`${apiBuyer}/modify-buyer`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const deleteBuyer = async (params) => {

    try {
        return await axios.put(`${apiBuyer}/delete-buyer`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export {
    getBuyerList,
    createBuyer,
    modifyBuyer,
    deleteBuyer
}