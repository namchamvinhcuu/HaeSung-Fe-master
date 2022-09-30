import { axios } from '@utils'

const getMenuList = async (params) => {
    return await axios.get('/api/menu', {
        params: {
            ...params
        }
    });

}

export {
    getMenuList
}
