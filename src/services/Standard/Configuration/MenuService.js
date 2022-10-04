import { axios } from '@utils'

const getMenuList = async (params) => {
    try {
        return await axios.get('/api/menu', {
            params: {
                ...params
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const getParentMenus = async (menuLevel) => {

    try {
        return await axios.get('/api/menu/get-by-level', {
            params: {
                menuLevel
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const createMenu = async (params) => {

    try {
        return await axios.post('/api/menu/create-menu', {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const modifyMenu = async (params) => {

    try {
        return await axios.put('/api/menu/modify-menu', {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const deleteMenu = async (params) => {

    try {
        return await axios.delete('/api/menu/delete-menu', {
            data: {
                ...params
            }
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export {
    getMenuList,
    getParentMenus,
    createMenu,
    modifyMenu,
    deleteMenu,
}
