import { axios } from "@utils";
const API = "api/material-receiving";

export const get = async (params) => {
    try {
        return await axios.get(`${API}`, {
            params: { ...params },
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};

export const receivingLot = async (params) => {
    try {
        return await axios.put(`${API}/receiving-lot`, {
            ...params,
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};