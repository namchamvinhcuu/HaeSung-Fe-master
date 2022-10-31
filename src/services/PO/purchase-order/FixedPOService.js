import { axios } from "@utils";

const API = "/api/fixed-po";

export const get = async (params) => {
    try {
        return await axios.get(`${API}`, {
            params: { ...params },
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};


export const getSearchMaterialArr = async () => {
    try {
        return await axios.get(`${API}/get-material`);
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};

export const modify = async (params) => {
    try {
        return await axios.put(`${API}/modify-forecastPo`, {
            ...params,
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};

export const handleDelete = async (params) => {
    try {
        return await axios.put(`${API}/delete-reuse-wo`, {
            ...params,
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};
