import { axios } from '@utils'
const getCommonMasterList = async (params) => {
    try {
        return await axios.get('/api/CommonMaster/get-all', {
            params: {
                ...params 
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const createCommonMaster = async (params) => {
    try {
        return await axios.post('/api/CommonMaster/create-commonmaster', {
          
                ...params 
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const modifyCommonMaster = async (params) => {

    try {
        return await axios.put('/api/CommonMaster/modify-commonmaster', {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
} 
const deleteCommonMater = async (params) => {

    try {
        return await axios.delete('/api/CommonMaster/delete-commonmaster/', { data: params }, {
         
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const getCommonMasterListDeleted = async (params) => {
    try {
        return await axios.get('/api/CommonMaster/get-all-data-deleted', {
            params: {
                ...params 
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const deleteCommonMaterRedoDeleted = async (params) => {

    try {
        return await axios.delete('/api/CommonMaster/redo-commonmaster/' + params.commonMasterId, {
         
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
//commom detail
const getCommonDetailList = async (params) => {
    try {
       
        return await axios.get('/api/CommonDetail/getall-by-masterId', {
            params: {
                ...params 
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const createCommonDetail = async (params) => {
    try {
        return await axios.post('/api/CommonDetail/create-commondetail', {
          
                ...params 
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const modifyCommonDetail = async (params) => {

    try {
        return await axios.put('/api/CommonDetail/modify-commondetail', {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}
const deleteCommonDetail = async (params) => {

    try {
        return await axios.delete('/api/CommonDetail/delete-commondetail/' + params.commonDetailId, {
         
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export {
    getCommonMasterList,
    createCommonMaster,
    modifyCommonMaster,
    deleteCommonMater,
    getCommonDetailList,
    createCommonDetail,
    modifyCommonDetail,
    deleteCommonDetail,
    getCommonMasterListDeleted,
    deleteCommonMaterRedoDeleted
}