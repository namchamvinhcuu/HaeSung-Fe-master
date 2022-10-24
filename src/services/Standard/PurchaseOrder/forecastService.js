import { axios } from '@utils'
const apiName = '/api/forecast-po';

const getMaterialModel = async () => {
    try {
        return await axios.get(`${apiName}/get-material-model`);
    }
    catch (error) {
      console.log(`ERROR: ${error}`);
    }
  }
export {
    getMaterialModel
}
