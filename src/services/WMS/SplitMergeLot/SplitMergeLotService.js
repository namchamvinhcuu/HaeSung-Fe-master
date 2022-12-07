import { axios } from '@utils';

const apiName = 'api/SplitMergeLot';

const getLotById = async (Id) => {
  try {
    return await axios.get(`${apiName}`, {
      params: { lotId: Id },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const splitLot = async (params) => {
  try {
    return await axios.post(`${apiName}/split-lot`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const mergeLot = async (params) => {
  try {
    return await axios.post(`${apiName}/merge-lot`, {
      ...params,
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export { getLotById, splitLot, mergeLot };
