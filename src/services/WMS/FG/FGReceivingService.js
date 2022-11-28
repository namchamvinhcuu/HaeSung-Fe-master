import { axios } from '@utils';

const apiName = 'api/FG-Receiving';
export const getAll = async (params) => {
  try {
    return await axios.get(`${apiName}`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const scan = async (params) => {
  try {
    return await axios.put(`${apiName}/FG-scan`, {
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
