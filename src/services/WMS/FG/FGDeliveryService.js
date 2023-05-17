import { axios } from '@utils';

const apiName = 'api/fg-delivery';

export const getAll = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const scanFGDelivery = async (params) => {
  console.log("🚀 ~ file: FGDeliveryService.js:14 ~ scanFGDelivery ~ params:", params)

  try {
    return await axios.put(`${apiName}/scan-fg-delivery`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const handleDelete = async (params) => {
  try {
    return await axios.put(`${apiName}/delete`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
