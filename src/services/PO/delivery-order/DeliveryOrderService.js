import { axios } from "@utils";

const API = "/api/delivery-order";

export const get = async () => {
  try {
    return await axios.get(`${API}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getPoArr = async () => {
  try {
    return await axios.get(`${API}/get-purchase-orders`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getMaterialArr = async (poId) => {
  try {
    return await axios.get(`${API}/get-products-by-po`, {
      params: { poId: poId },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
