import { axios } from '@utils'

// const getMenuList = async (params) => {
//     let res = await axios.get('/api/menu', {
//         params: {
//             ...params
//         }
//     });

//     return await res;
// }


function getMenuList(params) {
    return axios.get('/api/menu', { params: params })
}

export {
    getMenuList
}
