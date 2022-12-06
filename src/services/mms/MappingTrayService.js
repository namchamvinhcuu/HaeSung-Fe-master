import { axios } from '@utils';

const apiName = 'api/MappingTray';

const get = async (params) => {
  try {
    return await axios.get(`${apiName}`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const scanMapping = async (params) => {
  try {
    return await axios.post(`${apiName}/scan-mapping`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const unMapping = async (params) => {
  try {
    return await axios.put(`${apiName}/un-mapping`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export { get, scanMapping, unMapping };
