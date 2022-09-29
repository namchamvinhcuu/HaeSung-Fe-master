import { axios } from '@utils'

const getMenuList = async () => {
    return axios.get('/api/menu/getUserInfo');
}

export {
    getMenuList
}
