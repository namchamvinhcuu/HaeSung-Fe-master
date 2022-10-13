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

// const createStaff = async (params) => {

//     try {
//         return await axios.post(`${apiStaff}/create-staff`, {
//             ...params
//         });
//     } catch (error) {
//         console.log(`ERROR: ${error}`);
//     }
// }

// const modifyStaff = async (params) => {
//     try {
//         return await axios.put(`${apiStaff}/modify-staff`, {
//             ...params
//         });
//     } catch (error) {
//         console.log(`ERROR: ${error}`);
//     }
// }
// const deleteStaff = async (params) => {

//     try {
//         return await axios.put(`${apiStaff}/delete-staff`, {
//             ...params
//         });
//     } catch (error) {
//         console.log(`ERROR: ${error}`);
//     }
// }

export {
    getBuyerList,
    // createStaff,
    // modifyStaff,
    // deleteStaff,
}