import { axios } from "@utils";
const API = "api/material-shipping-order";

export const getMsoMasters = async (params) => {
    try {
        return await axios.get(`${API}/get-mso-masters`, {
            params: { ...params },
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};

export const createMsoMaster = async (params) => {
    try {
        return await axios.post(`${API}/create-mso-masters`, { ...params });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};