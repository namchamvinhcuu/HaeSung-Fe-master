import { axios } from '@utils';

const apiName = 'api/SplitMergeLot';

export const getById = async (Id) => {
  try {
    return await axios.get(`${apiName}`, {
      params: { lotId: Id },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
