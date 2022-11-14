import { axios } from "@utils";
const API = "api/material-shipping-order";

export const get = async (params) => {
    try {
        return await axios.get(`${API}`, {
            params: { ...params },
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};