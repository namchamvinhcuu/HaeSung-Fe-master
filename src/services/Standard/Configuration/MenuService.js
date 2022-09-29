import { axios } from '@utils'

const getMenuList = async (params) => {
    return axios.get('/api/menu', {
        params: {
            ...params
        }
    });
}

export {
    getMenuList
}
