import { axios } from '@utils'

const URL = `/api/menu`;

const getMenuList = async (params) => {
    try {
        return await axios.get(URL, {
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
        return await axios.get(`${URL}/get-by-level`, {
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
        return await axios.post(`${URL}/create-menu`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const modifyMenu = async (params) => {

    try {
        return await axios.put(`${URL}/modify-menu`, {
            ...params
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const deleteMenu = async (params) => {

    try {
        return await axios.delete(`${URL}/delete-menu`, {
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
