import axios from 'axios';
import { axios as axiosInstance } from '@utils';
import _ from 'lodash';

const apiName = 'api/esl';
const initialESLData = { ITEM_NAME: '', LOCATION: '', SHELVE_LEVEL: -32768 };

export const getESLDataByBinId = async (binId) => {
  try {
    return await axiosInstance.get(`${apiName}/get-els-data-by-binId?BinId=${binId}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const updateESLDataByBinId = async (binId) => {
  let dataList = [];

  let res = await getESLDataByBinId(binId);

  if (_.isEqual(res.data, initialESLData)) {
    const response = await axiosInstance.get(`${apiName}/get-bin-by-id?binId=${binId}`);

    if (response && response.Data) {
      res.data.LOCATION = response.Data.BinCode;
      res.data.SHELVE_LEVEL = response.Data.BinLevel;
    } else {
      res.data.LOCATION = '';
      res.data.SHELVE_LEVEL = 0;
    }
  }
  // else {
  //   let item_name = '';

  //   let splitItem = res.data.ITEM_NAME.split(',');
  //   for (let i = 0; i < splitItem.length; i++) {
  //     item_name += splitItem[i].trim() + (' ', 22 + (i - splitItem[i].trim().length))
  //   }

  //   // let str = item_name.join("", res.data.ITEM_NAME.split(',').select(a => a.trim()).select((a, index) => {
  //   //   return a + (' ', 22 + index - a.length);
  //   // }));

  //   res.data.ITEM_NAME = item_name;
  // }

  res.id = res.data.LOCATION;
  dataList.push(res);

  if (dataList.length > 0)
    try {
      await axios.post('http://118.69.130.73:9001/articles', {
        dataList: dataList,
      });
      // console.log(response)
    } catch (error) {
      console.log(error);
    }
};

export const getESLDataByBinCode = async (binCode) => {
  try {
    return await axiosInstance.get(`${apiName}/get-els-data-by-binCode?BinCode=${binCode}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const updateESLDataByBinCode = async (binCode) => {
  let dataList = [];

  let res = await getESLDataByBinCode(binCode);

  if (_.isEqual(res.data, initialESLData)) {
    const response = await axiosInstance.get(`${apiName}/get-bin-by-code?binCode=${binCode}`);

    if (response && response.Data) {
      res.data.LOCATION = response.Data.BinCode;
      res.data.SHELVE_LEVEL = response.Data.BinLevel;
    } else {
      res.data.LOCATION = '';
      res.data.SHELVE_LEVEL = 0;
    }
  }

  res.id = res.data.LOCATION;
  dataList.push(res);

  if (dataList.length > 0)
    try {
      await axios.post('http://118.69.130.73:9001/articles', {
        dataList: dataList,
      });
      // console.log(response)
    } catch (error) {
      console.log(error);
    }
};

export const findBinByBinId = async (binId) => {
  const response = await axiosInstance.get(`${apiName}/get-bin-by-id?binId=${binId}`);

  if (response && response.Data) {
    let ESLCode = response.Data.ESLCode;
    let putArr = [
      {
        color: 'BLUE',
        duration: '10s',
        labelCode: ESLCode,
        patternId: 0,
      },
    ];

    try {
      const res = await axios.put('http://118.69.130.73:9001/labels/contents/led', putArr);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }
};
