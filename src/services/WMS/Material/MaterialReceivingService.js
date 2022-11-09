import { axios } from "@utils";
const apiName = "api/material-receiving";

export const receivingLot = async (params) => {
    try {
        return await axios.put(`${apiName}/receiving-lot`, {
            ...params,
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};