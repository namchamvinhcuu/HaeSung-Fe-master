import { axios } from "@utils";
const apiName = "api/material-putaway";

const get = async (params) => {
  try {
    return await axios.get(`${apiName}`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getAilse = async () => {
  try {
    return await axios.get(`${apiName}/get-select-aisle`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getShelf = async (params) => {
  try {
    return await axios.get(`${apiName}/get-select-shelf`, { params: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getBin = async (params) => {
  try {
    return await axios.get(`${apiName}/get-select-bin`, { params: params });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const scanPutAway = async (params) => {
  try {
    return await axios.put(`${apiName}/scan-putaway`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const handleDelete = async (params) => {
  try {
    return await axios.put(`${apiName}/delete`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const getESLData = async (BinCode) => {
  try {
    return await axios.get(`${apiName}/get-els-data?BinCode=${BinCode}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

const getESLDataByBinId = async (BinId) => {
  try {
    return await axios.get(`${apiName}/get-els-data-by-binId?BinId=${BinId}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export { get, getAilse, getShelf, getBin, scanPutAway, handleDelete, getESLData, getESLDataByBinId };
