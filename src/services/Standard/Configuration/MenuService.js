import { axios } from '@utils'

const getMenuList = async (params) => {
    return await axios.get('/api/menu', {
        params: {
            ...params
        }
    });

}

const getParentMenus = async (menuLevel) => {
    return await axios.get('/api/menu/get-by-level', {
        params: {
            menuLevel
        }
    });
}

const createMenu = async (params) => {
    return await axios.post('/api/menu/create-menu', {
        ...params
    });
}

const deleteMenu = async (params) => {
    return await axios.delete('/api/menu/delete-menu', {
        data: {
            ...params
        }
    });
}

export {
    getMenuList,
    getParentMenus,
    createMenu,
    deleteMenu,
}
