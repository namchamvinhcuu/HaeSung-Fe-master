import { axios } from '@utils'

const apiName = '/api/Location';

const getLocationList = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}


const GetArea = async () => {
  try {
    return await axios.get(`${apiName}/get-area`);
  }
  catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export {
  getLocationList,
  GetArea
}
