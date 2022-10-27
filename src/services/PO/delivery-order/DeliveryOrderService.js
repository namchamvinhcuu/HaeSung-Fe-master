import { axios } from "@utils";

const API = "/api/delivery-order";

export const get = async (params) => {
  try {
    return await axios.get(`${API}`, {
      params: { ...params },
    });
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

export const create = async (params) => {
  try {
    return await axios.post(`${API}/create-do`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const modify = async (params) => {
  try {
    return await axios.put(`${API}/modify-do`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const handleDelete = async (params) => {
  try {
    return await axios.put(`${API}/delete-reuse-do`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
